import * as avsc from "../avsc/types";
import {RecordField} from "../avsc/types";
import writeAvsc from "../avsc/writer";

function writeFieldInit(field: RecordField): string | undefined {
    if (field.type instanceof avsc.Union) {
        if (field.type.types[0] === 'null') {
            return `${field.name}: value.${field.name} ?? null`;
        }
    }

    return `${field.name}: value.${field.name}`;
}

export default function toAvroSerializer(relativePathToTypeScript: string, schema: avsc.Schema): string {
    if (!relativePathToTypeScript.startsWith('./') && !relativePathToTypeScript.startsWith('../')) {
        throw new Error("relativePathToTypeScript must be a relative path (starting with './' or '../')");
    }
    
    return `import avro from 'avsc';
import { ${schema.name} } from '${relativePathToTypeScript.replace(/\.ts$/i, '')}';

const exactType = avro.Type.forSchema(${writeAvsc(schema)});

export default function serialize(value: ${schema.name}): Buffer {
    return exactType.toBuffer({
${schema.fields.map(field => writeFieldInit(field)).filter(f => !!f).map(fieldInit => '        ' + fieldInit).join(",\n")}
    });
}`;
}