import * as ts from "typescript";
import {decodeSyntaxKind} from "./decodeSyntaxKind";
import {
    BooleanLiteral,
    FieldDeclaration,
    InterfaceOrType,
    NullLiteral,
    NumberLiteral,
    StringLiteral,
    Type
} from "./types";

export function parseAst(sourceFile: ts.SourceFile): InterfaceOrType {
    return traverseSourceFile(sourceFile);

    function conversionError(node: ts.ReadonlyTextRange, message: string): ConversionError {
        return new ConversionError(message, sourceFile.getLineAndCharacterOfPosition(node.pos));
    }
    
    function traverseTypeLiteral(node: ts.TypeLiteralNode): FieldDeclaration[] {
        const fields: FieldDeclaration[] = [];

        ts.forEachChild(node, child => {
            switch (child.kind) {
                case ts.SyntaxKind.PropertySignature:
                    fields.push(traversePropertySignature(child as ts.PropertySignature));
                    break;
                default:
                    throw conversionError(child,`Unknown element type ${decodeSyntaxKind(child.kind)} in the context of ${decodeSyntaxKind(node.kind)}`);
            }
        });

        return fields;
    }

    function getJsDoc(node: ts.Node): undefined | string {
        const jsDocs: string[] = node.getChildren(sourceFile)
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
            throw conversionError(decl, `Unable to find an 'export' modifier on ${decl.name.text}. Please add it and try again.`)
        }
        
        const fields: FieldDeclaration[] = [];

        ts.forEachChild(decl, child => {
            switch (child.kind) {
                case ts.SyntaxKind.Identifier: case ts.SyntaxKind.ExportKeyword:
                    break;
                case ts.SyntaxKind.PropertySignature:
                    fields.push(traversePropertySignature(child as ts.PropertySignature));
                    break;
                case ts.SyntaxKind.TypeLiteral:
                    fields.push(...traverseTypeLiteral(child as ts.TypeLiteralNode))
                    break;
                default:
                    console.log(`Unknown element type ${decodeSyntaxKind(child.kind)} in the context of ${decodeSyntaxKind(decl.kind)}`);
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

    function toType(type: ts.Node): Type {
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
                const {typeName} = type as ts.TypeReferenceNode;

                if (typeName.kind === ts.SyntaxKind.Identifier) {
                    if (typeName.text === Buffer.name) {
                        return 'Buffer';
                    }

                    throw conversionError(type, `Using a custom type like ${typeName.text} is not supported.`);
                }

                throw conversionError(type, "We don't yet support QualifiedName as a TypeReference for a property.")

            case ts.SyntaxKind.LiteralType:
                const {literal} = type as ts.LiteralTypeNode;

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
        }

        throw conversionError(type, `Unsupported type kind ${decodeSyntaxKind(type.kind)}`);
    }

    function getAvroAnnotationsBefore(hasPosition: ts.ReadonlyTextRange): string[] {
        return (ts.getLeadingCommentRanges(sourceFile.getFullText(), hasPosition.pos) || [])
            .map(cr => commentToAvroAnnotation(cr))
            .filter((s): s is string => true);
    }

    function traversePropertySignature(prop: ts.PropertySignature): FieldDeclaration {
        if (!('escapedText' in prop.name)) {
            throw conversionError(prop, "Property has no name?");
        }

        if (!prop.type) {
            throw conversionError(prop, "Property has no type?");
        }

        return {
            name: prop.name.text,
            type: toType(prop.type),
            optional: !!prop.questionToken,
            annotations: getAvroAnnotationsBefore(prop),
            jsDoc: getJsDoc(prop),
        };
    }

    function traverseSourceFile(node: ts.SourceFile): InterfaceOrType {
        let interfaceOrType: InterfaceOrType | undefined;

        ts.forEachChild(node, child => {
            if (interfaceOrType !== undefined) {
                return;
            }

            switch (child.kind) {
                case ts.SyntaxKind.InterfaceDeclaration:
                    interfaceOrType = traverseDecl(child as ts.InterfaceDeclaration);
                    break;

                case ts.SyntaxKind.TypeAliasDeclaration:
                    interfaceOrType = traverseDecl(child as ts.TypeAliasDeclaration);
                    break;

                default:
                    throw conversionError(child, `Unknown element type ${decodeSyntaxKind(child.kind)} in the context of a SourceFile.`);
            }
        });

        if (interfaceOrType === undefined) {
            throw conversionError(node, 'No interface found to convert.');
        }

        return interfaceOrType;
    }
}

export function toAst(typeScriptContents: string): InterfaceOrType {
    const sourceFile = ts.createSourceFile("dummy.ts", typeScriptContents, ts.ScriptTarget.ES5);
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
