import * as avsc from "../avsc/types";
import writeAvsc from "../avsc/writer";
import {RecordField} from "../avsc/types";

function writeFieldInit(field: RecordField, sourceOfValue: string, indents: number): string | undefined {
    function writeInit(type: avsc.Type): string {
        if (type instanceof avsc.Union) {
            if (type.types[0] === 'null') {
                return `${sourceOfValue}.${field.name} === undefined ? null : ${writeInit(type.types[1])}`;
            }
        }

        if (type instanceof avsc.Record) {
            return toMappedSerializer(type, indents + 1, `${sourceOfValue}.${field.name}`);
        }

        return `${sourceOfValue}.${field.name}`;
    }
    
    return `${field.name}: ${writeInit(field.type)}`;
}

function indentOf(indents: number): string {
    return '    '.repeat(indents);
}

function toMappedSerializer(record: avsc.Record, indents: number, sourceOfValue: string): string {
    return `{
${record.fields
        .map(field => writeFieldInit(field, sourceOfValue, indents))
        .filter(f => !!f)
        .map(fieldInit => indentOf(indents + 1) + fieldInit)
        .join(",\n")}
${indentOf(indents)}}`;
}

export default function toAvroSerializer(relativePathToTypeScript: string, schema: avsc.Schema): string {
    if (!relativePathToTypeScript.startsWith('./') && !relativePathToTypeScript.startsWith('../')) {
        throw new Error("relativePathToTypeScript must be a relative path (starting with './' or '../')");
    }
    
    return `import avro from 'avsc';
import { ${schema.name} } from '${relativePathToTypeScript.replace(/\.ts$/i, '')}';

const exactType = avro.Type.forSchema(${writeAvsc(schema)});

export default function serialize(value: ${schema.name}): Buffer {
    return exactType.toBuffer(${(toMappedSerializer(schema, 1, 'value'))});
}`;
}