import * as avsc from "./types";
import * as ts from "../typescript/types";
import {BooleanLiteral, NullLiteral, NumberLiteral, PrimitiveType, StringLiteral} from "../typescript/types";

function chooseNumberAnnotation(annotationsOnType: string[]): string {
    const numberAnnotations: string[] = [
        'float', 'double', 'int', 'long', 'date',
        'time-millis', 'time-micros', 'timestamp-millis', 'timestamp-micros', 'local-timestamp-millis', 'local-timestamp-micros'
    ];
    const validAnnotations = numberAnnotations.filter(annotation => annotationsOnType.includes(annotation));

    if (validAnnotations.length > 2) {
        throw new Error(`Unable to translate a number with multiple valid annotations: [${validAnnotations.join(', ')}]. Please use only one.`);
    }

    return validAnnotations?.[0] || 'double';
}

function toBaseType(type: ts.Type, annotationsOnType: string[]): avsc.Type {
    // TODO: Type check annotations (during parsing?)
    // TODO: Warn when some annotations are dropped
    
    const isLiteralType = (t: any & ts.Type): t is ts.Literal => {
        return !!t.kind;
    }
    
    const typeName: string = isLiteralType(type) ? type.kind : type;
    
    switch (typeName) {
        case "string":
            if (annotationsOnType.includes('uuid')) {
                return new avsc.Uuid();
            }

            return 'string';

        case "boolean":
            return 'boolean';

        case "Buffer":
            return 'bytes';

        case "null":
            return 'null';

        case "number":
            const numberAnnotation = chooseNumberAnnotation(annotationsOnType);
            switch (numberAnnotation) {
                case 'float':
                case 'double':
                case 'int':
                case 'long':
                    return numberAnnotation;
                case 'date':
                    return new avsc.Date();
                case 'time-millis':
                    return new avsc.TimeMillis();
                case 'time-micros':
                    return new avsc.TimeMicros();
                case 'timestamp-millis':
                    return new avsc.TimestampMillis();
                case 'timestamp-micros':
                    return new avsc.TimestampMicros();
                case 'local-timestamp-millis':
                    return new avsc.LocalTimestampMillis();
                case 'local-timestamp-micros':
                    return new avsc.LocalTimestampMicros();
            }
    }

    throw new Error(`Unable to translate type ${type} with annotations [${annotationsOnType.join(', ')}]. Please make sure it's a valid combination.`);
}

function toType(type: ts.Type, optional: boolean, annotationsOnType: string[]): avsc.Type {
    const baseType = toBaseType(type, annotationsOnType);

    if (optional) {
        if (baseType instanceof avsc.Union) {
            // If the base type is a union, flatten it with the null option
            return new avsc.Union('null', ...baseType.types)
        }

        return new avsc.Union('null', baseType);
    }

    return baseType;
}

function toField(field: ts.FieldDeclaration): avsc.RecordField {
    return {
        name: field.name,
        type: toType(field.type, field.optional, field.annotations),
        doc: field.jsDoc,
    };
}

function toFields(fields: ts.FieldDeclaration[]): avsc.RecordField[] {
    return fields.map(f => toField(f));
}

export default function toAvroSchema(ast: ts.InterfaceOrType): avsc.Schema {
    return {
        name: ast.name,
        fields: toFields(ast.fields),
        type: "record",
        doc: ast.jsDoc
    }
}
