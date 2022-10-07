import {
    ArrayType,
    DecimalType,
    FieldDeclaration,
    MapType,
    ProtocolDeclaration,
    RecordDeclaration,
    Type,
    UnionType
} from "./types";

function indent(s: string) {
    return '\t' + s.replace(/\n/g, '\n\t')
}

function writeType(type: Type): string {
    if (type instanceof ArrayType) {
        return `array<${writeType(type.itemType)}>`;
    }

    if (type instanceof MapType) {
        return `map<${writeType(type.itemType)}>`;
    }

    if (type instanceof UnionType) {
        return `union<${type.types.map(t => writeType(t)).join(', ')}>`;
    }

    let output: string = "";

    if (type.type instanceof DecimalType) {
        output = `decimal(${type.type.precision}, ${type.type.scale})`;
    } else {
        output = type.type.toString();
    }

    return type.nullable ? `union { null, ${output} }` : output;
}

function writeField(f: FieldDeclaration) {
    let output: string = `${writeType(f.type)} ${f.name}`;

    if (f.defaultValue !== undefined) {
        // TODO:
    }

    return `${output};`;
}

function writeRecordDecl(r: RecordDeclaration): string {
    let output: string = "";

    if (r.namespace) {
        output += `
@namespace("${r.namespace}")`;
    }

    const fieldOutputs = r.fields.map(field => writeField(field));

    if (fieldOutputs.length > 0) {
        output += `record ${r.name} {
${indent(fieldOutputs.join('\n'))}
}`
    } else {
        output += `record ${r.name} {
}`
    }
    return output;
}

export default function write(p: ProtocolDeclaration): string {
    return `protocol ${p.name} {
${indent(p.declarations.map(d => writeRecordDecl(d)).join('\n\n'))}
}`;
}