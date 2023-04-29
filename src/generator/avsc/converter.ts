import * as avsc from "./types";
import * as ts from "../typescript/types";
import {ParsedAst} from "../typescript/parser";
import {RecordField} from "./types";
import {FieldDeclaration} from "../typescript/types";

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

function toBaseType(type: ts.Type, annotationsOnType: string[], ast: ParsedAst): avsc.Type {
    // TODO: Type check annotations (during parsing?)
    // TODO: Warn when some annotations are dropped

    if (type instanceof ts.ReferencedType) {
        const interfaceOrType: ts.InterfaceOrType | undefined = ast.types.find(t => t.name === type.name);

        if (!interfaceOrType) {
            switch (type.name) {
                case 'AvroInt':
                    return 'int';
                case 'AvroFloat':
                    return 'float';
                case 'AvroDouble':
                    return 'double';
                case 'AvroLong':
                    return 'long';
                case 'AvroDate':
                    return new avsc.Date();
                case 'AvroTimeMillis':
                    return new avsc.TimeMillis();
                case 'AvroTimeMicros':
                    return new avsc.TimeMicros();
                case 'AvroTimestampMillis':
                    return new avsc.TimestampMillis();
                case 'AvroTimestampMicros':
                    return new avsc.TimestampMicros();
                case 'AvroLocalTimeMillis':
                    return new avsc.LocalTimestampMillis();
                case 'AvroLocalTimeMicros':
                    return new avsc.LocalTimestampMicros();
                case 'AvroUuid':
                    return new avsc.Uuid();
                default:
                    throw new Error(`Type ${type.name} was referenced but not found. This should have been caught during parsing.`);
            }
        }

        return toRecordType(interfaceOrType, ast);
    }

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

function toType(type: ts.Type, optional: boolean, annotationsOnType: string[], ast: ParsedAst): avsc.Type {
    const baseType: avsc.Type = toBaseType(type, annotationsOnType, ast);

    if (optional) {
        if (baseType instanceof avsc.Union) {
            // If the base type is a union, flatten it with the null option
            return new avsc.Union('null', ...baseType.types)
        }

        return new avsc.Union('null', baseType);
    }

    return baseType;
}

function toField(field: FieldDeclaration, ast: ParsedAst): RecordField {
    return {
        name: field.name,
        type: toType(field.type, field.optional, field.annotations, ast),
        doc: field.jsDoc,
    };
}

function toFields(fields: FieldDeclaration[], ast: ParsedAst): RecordField[] {
    return fields.map(f => toField(f, ast));
}

function resolveRootTypes(ast: ParsedAst): Set<string> {
    // A root type is a type that is never referenced by other types
    return new Set(ast.types.filter(t => !ast.referenceMap.has(t.name)).map(t => t.name));
}

function toRecordType(t: ts.InterfaceOrType, ast: ParsedAst): avsc.Schema {
    return new avsc.Record(t.name, toFields(t.fields, ast), {doc: t.jsDoc});
}

export default function toAvroSchema(ast: ParsedAst): avsc.Schema[] {
    const rootTypes: Set<string> = resolveRootTypes(ast);

    return ast.types
        .filter(t => rootTypes.has(t.name))
        .map(t => toRecordType(t, ast));
}
