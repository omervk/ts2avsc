import {
  AvroDate,
  AvroDouble,
  AvroFloat,
  AvroInt,
  AvroLocalTimeMicros,
  AvroLocalTimeMillis,
  AvroLong,
  AvroTimeMicros,
  AvroTimeMillis,
  AvroTimestampMicros,
  AvroTimestampMillis,
  AvroUuid,
} from '../../types/index';
import { decodeSyntaxKind } from './decodeSyntaxKind';
import {
  ArrayType,
  BooleanLiteral,
  FieldDeclaration,
  InterfaceOrType,
  NullLiteral,
  NumberLiteral,
  ReferencedType,
  StringLiteral,
  Type,
  UnionType,
} from './types';
import * as ts from 'typescript';

const findDirectedCycle = require('find-cycle/directed');

export interface ParsedAst {
  readonly types: InterfaceOrType[];
  readonly referenceMap: Map<string, Set<string>>;
}

const builtInTypes = [
  'AvroInt',
  'AvroFloat',
  'AvroDouble',
  'AvroLong',
  'AvroDate',
  'AvroTimeMillis',
  'AvroTimeMicros',
  'AvroTimestampMillis',
  'AvroTimestampMicros',
  'AvroLocalTimeMillis',
  'AvroLocalTimeMicros',
  'AvroUuid',
];

export function parseAst(sourceFile: ts.SourceFile): ParsedAst {
  // Referenced type -> Referencing types
  const referenceMap: Map<string, Set<string>> = new Map<string, Set<string>>();
  const existingTypes: Map<string, InterfaceOrType> = new Map<string, InterfaceOrType>();

  traverseSourceFile(sourceFile);

  // Check that there were interfaces to convert
  if (existingTypes.size === 0) {
    throw new Error('No interfaces or types found that could be converted');
  }

  // Check that there are no unresolved references and take built-in types into account
  const unknownReferencedTypes = Array.of(...referenceMap.keys()).filter(
    referencedType => !existingTypes.has(referencedType) && !builtInTypes.some(v => v === referencedType),
  );

  if (unknownReferencedTypes.length > 0) {
    throw new Error(
      `Unable to find referenced types: ${unknownReferencedTypes.map(
        t => `${t} referenced by ${Array.of(...(referenceMap.get(t) || new Set()).values()).join(', ')}`,
      )}`,
    );
  }

  // Check that there are no cyclical references
  // TODO: Test this
  existingTypes.forEach(t => {
    // @ts-ignore
    const cycle: string[] | undefined = findDirectedCycle(new Set([t]), (refType: string) => referenceMap.get(refType));

    if (cycle) {
      throw new Error(`Found a cyclical reference along the path ${cycle.reverse().join('->')}`);
    }
  });

  return {
    types: Array.of(...existingTypes.values()),
    referenceMap,
  };

  function conversionError(node: ts.ReadonlyTextRange, message: string): ConversionError {
    return new ConversionError(message, sourceFile.getLineAndCharacterOfPosition(node.pos));
  }

  function traverseTypeLiteral(node: ts.TypeLiteralNode, containerTypeName: string): FieldDeclaration[] {
    const fields: FieldDeclaration[] = [];

    ts.forEachChild(node, child => {
      switch (child.kind) {
        case ts.SyntaxKind.PropertySignature:
          fields.push(traversePropertySignature(child as ts.PropertySignature, containerTypeName));
          break;
        default:
          throw conversionError(
            child,
            `Unknown element type ${decodeSyntaxKind(child.kind)} in the context of ${decodeSyntaxKind(node.kind)}`,
          );
      }
    });

    return fields;
  }

  function getJsDoc(node: ts.Node): undefined | string {
    const jsDocs: string[] = node
      .getChildren(sourceFile)
      .filter(child => child.kind === ts.SyntaxKind.JSDoc)
      .map(child => {
        const comment = (child as ts.JSDoc).comment;

        if (comment === undefined) {
          return '';
        }

        if (typeof comment === 'string') {
          return comment;
        }

        return comment
          .filter(c => c.kind === ts.SyntaxKind.JSDocText)
          .map(c => (c as ts.JSDocText).text)
          .join('\n');
      });

    return jsDocs.length === 0 ? undefined : jsDocs.join('\n').trim();
  }

  function traverseDecl(decl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration): InterfaceOrType {
    if (!decl.modifiers?.find(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      throw conversionError(
        decl,
        `Unable to find an 'export' modifier on ${decl.name.text}. Please add it and try again.`,
      );
    }

    const fields: FieldDeclaration[] = [];

    ts.forEachChild(decl, child => {
      switch (child.kind) {
        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.ExportKeyword:
          break;
        case ts.SyntaxKind.PropertySignature:
          fields.push(traversePropertySignature(child as ts.PropertySignature, decl.name.text));
          break;
        case ts.SyntaxKind.TypeLiteral:
          fields.push(...traverseTypeLiteral(child as ts.TypeLiteralNode, decl.name.text));
          break;
        default:
          console.log(
            `Unknown element type ${decodeSyntaxKind(child.kind)} in the context of ${decodeSyntaxKind(decl.kind)}`,
          );
      }
    });

    return {
      name: decl.name.text,
      fields,
      jsDoc: getJsDoc(decl),
    };
  }

  // TODO: Make the return value typed
  function commentToAvroAnnotation(range: ts.CommentRange): string | undefined {
    const commentText = sourceFile.getFullText().slice(range.pos, range.end);

    if (commentText.startsWith('// @avro ')) {
      return commentText.substring('// @avro '.length);
    }

    return;
  }

  function toType(type: ts.Node, referencingType: string): Type {
    switch (type.kind) {
      case ts.SyntaxKind.StringKeyword:
        // if (annotations.includes('uuid')) {
        //     return "uuid";
        // }

        return 'string';

      case ts.SyntaxKind.BooleanKeyword:
        return 'boolean';

      case ts.SyntaxKind.NumberKeyword:
        return 'number';

      case ts.SyntaxKind.TypeReference:
        const { typeName } = type as ts.TypeReferenceNode;

        if (typeName.kind === ts.SyntaxKind.Identifier) {
          if (typeName.text === Buffer.name) {
            return 'Buffer';
          }

          referenceMap.set(
            typeName.text,
            new Set([referencingType, ...(referenceMap.get(typeName.text) || new Set())]),
          );

          return new ReferencedType(typeName.text);
        }

        throw conversionError(type, "We don't yet support QualifiedName as a TypeReference for a property.");

      case ts.SyntaxKind.LiteralType:
        const { literal } = type as ts.LiteralTypeNode;

        if (literal.kind === ts.SyntaxKind.NullKeyword) {
          return new NullLiteral();
        }

        // TODO: BigIntLiteral
        if (literal.kind === ts.SyntaxKind.StringLiteral) {
          return new StringLiteral(literal.text);
        }

        if (literal.kind === ts.SyntaxKind.NumericLiteral) {
          return new NumberLiteral(parseFloat(literal.text));
        }

        if (literal.kind === ts.SyntaxKind.TrueKeyword) {
          return new BooleanLiteral(true);
        }

        if (literal.kind === ts.SyntaxKind.FalseKeyword) {
          return new BooleanLiteral(false);
        }

        break;

      case ts.SyntaxKind.ArrayType:
        const arrayNode = type as ts.ArrayTypeNode;
        return new ArrayType(toType(arrayNode.elementType, referencingType));

      case ts.SyntaxKind.UnionType:
        const unionNode = type as ts.UnionTypeNode;
        const types = unionNode.types
          .map(type => toType(type, referencingType))
          .flatMap(type => (type instanceof UnionType ? [type.head, ...type.tail] : [type]));

        if (types.length === 1) {
          return types[0];
        }

        return new UnionType(types[0], types.slice(1));
    }

    throw conversionError(type, `Unsupported type kind ${decodeSyntaxKind(type.kind)}`);
  }

  function getAvroAnnotationsBefore(hasPosition: ts.ReadonlyTextRange): string[] {
    return (ts.getLeadingCommentRanges(sourceFile.getFullText(), hasPosition.pos) || [])
      .map(cr => commentToAvroAnnotation(cr))
      .filter((s): s is string => true);
  }

  function traversePropertySignature(prop: ts.PropertySignature, containerTypeName: string): FieldDeclaration {
    if (!('escapedText' in prop.name)) {
      throw conversionError(prop, 'Property has no name?');
    }

    if (!prop.type) {
      throw conversionError(prop, 'Property has no type?');
    }

    return {
      name: prop.name.text,
      type: toType(prop.type, containerTypeName),
      optional: !!prop.questionToken,
      annotations: getAvroAnnotationsBefore(prop),
      jsDoc: getJsDoc(prop),
    };
  }

  function traverseSourceFile(node: ts.SourceFile): void {
    function addDeclaration(decl: InterfaceOrType, child: ts.Node) {
      if (existingTypes.has(decl.name)) {
        throw conversionError(child, `Multiple definitions of the same name ${decl.name}`);
      }

      existingTypes.set(decl.name, decl);
    }

    ts.forEachChild(node, child => {
      switch (child.kind) {
        case ts.SyntaxKind.InterfaceDeclaration:
          addDeclaration(traverseDecl(child as ts.InterfaceDeclaration), child);
          break;

        case ts.SyntaxKind.TypeAliasDeclaration:
          addDeclaration(traverseDecl(child as ts.TypeAliasDeclaration), child);
          break;
      }
    });
  }
}

export function toAst(typeScriptContents: string): ParsedAst {
  const sourceFile = ts.createSourceFile('dummy.ts', typeScriptContents, ts.ScriptTarget.ES5);
  return parseAst(sourceFile);
}

export class ConversionError extends Error {
  readonly line: number;
  readonly character: number;
  readonly rawMessage: string;

  constructor(message: string, lineAndChar: ts.LineAndCharacter) {
    super(`At (${lineAndChar.line}:${lineAndChar.character}): ${message}`);

    this.line = lineAndChar.line;
    this.character = lineAndChar.character;
    this.rawMessage = message;
  }
}
