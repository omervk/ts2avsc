// TODO: imports --> avdl imports
// TODO: Logical types
// TODO: Make sure we're in the right context (e.g. property inside interface)
// TODO: Preserve comments
// TODO: Decimal

import * as ts from "typescript";
import write from "./avdl/writer";
import {FieldDeclaration, PrimitiveType, ProtocolDeclaration, RecordDeclaration, Type} from "./avdl/types";
import {readFileSync} from "fs";
import path from "path";
import {decodeSyntaxKind} from "./decodeSyntaxKind";

export function toProtocolDeclaration(sourceFile: ts.SourceFile): ProtocolDeclaration {
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

    function traverseDecl(decl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration): RecordDeclaration {
        const fields: FieldDeclaration[] = [];

        ts.forEachChild(decl, child => {
            switch (child.kind) {
                case ts.SyntaxKind.Identifier:
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

    function toType(type: ts.Node, nullable: boolean, annotations: string[], propertyName: string): Type {
        switch (type.kind) {
            case ts.SyntaxKind.StringKeyword:
                if (annotations.includes('uuid')) {
                    return {nullable, type: "uuid"}
                }

                return {nullable, type: "string"};

            case ts.SyntaxKind.BooleanKeyword:
                return {nullable, type: 'boolean'};

            case ts.SyntaxKind.NumberKeyword:
                const possibleTypes: (PrimitiveType & string)[] = [
                    'int', 'long', 'float', 'double', 'date', 'time_ms', 'timestamp_ms', 'local_timestamp_ms'
                ];
                const numberType = possibleTypes.find(type => annotations.includes(type));

                if (numberType === undefined) {
                    throw conversionError(type, `${propertyName} has no specialized type. Please prefix it with // @avro {type}, with the type being one of ${possibleTypes.join(', ')}`);
                }

                return {nullable, type: numberType as PrimitiveType};
            case ts.SyntaxKind.TypeReference:
                const {typeName} = type as ts.TypeReferenceNode;

                if (typeName.kind === ts.SyntaxKind.Identifier) {
                    if (typeName.text === Uint8Array.name) {
                        return {nullable, type: "bytes"};
                    }

                    throw conversionError(type, `Using a custom type like ${typeName.text} is not supported.`);
                }

                throw conversionError(type, "We don't yet support QualifiedName as a TypeReference for a property.")

            case ts.SyntaxKind.LiteralType:
                const {literal} = type as ts.LiteralTypeNode;

                if (literal.kind === ts.SyntaxKind.NullKeyword) {
                    return {nullable: false, type: "null"}
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

        const propertyName = prop.name.text;

        if (!prop.type) {
            throw conversionError(prop, "Property has no type?");
        }

        const type: Type = toType(prop.type, !!prop.questionToken, getAvroAnnotationsBefore(prop), propertyName);

        return {
            name: propertyName,
            type,
            defaultValue: undefined,
        };
    }

    function traverseSourceFile(node: ts.SourceFile): ProtocolDeclaration {
        const declarations: (RecordDeclaration)[] = [];

        ts.forEachChild(node, child => {
            switch (child.kind) {
                case ts.SyntaxKind.InterfaceDeclaration:
                    declarations.push(traverseDecl(child as ts.InterfaceDeclaration));
                    break;
                case ts.SyntaxKind.TypeAliasDeclaration:
                    declarations.push(traverseDecl(child as ts.TypeAliasDeclaration));
                    break;
                case ts.SyntaxKind.EndOfFileToken:
                    break;
                default:
                    throw conversionError(child, `Unknown element type ${decodeSyntaxKind(child.kind)} in the context of a SourceFile.`);
            }
        });

        const fileName = path.basename(path.basename(sourceFile.fileName), path.extname(sourceFile.fileName));

        return {
            name: fileName[0].toUpperCase() + fileName.substring(1),
            declarations
        };
    }
}

export function toAvroIdl(fileName: string): string {
    const contents = readFileSync(fileName).toString();
    const sourceFile = ts.createSourceFile(fileName, contents, ts.ScriptTarget.ES5);
    const protocol: ProtocolDeclaration = toProtocolDeclaration(sourceFile);
    return `// Autogenerated from ${fileName}.\n${write(protocol).replace(/^\t+$/mg, '')}`;
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
