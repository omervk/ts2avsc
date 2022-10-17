import toAvroSchema from "./avsc/converter";
import {ParsedAst, toAst} from "./typescript/parser";
import writeAvsc from "./avsc/writer";
import {Schema} from "./avsc/types";
import toAvroSerializer from "./avsc-lib/serializer";

export function typeScriptToAvroSchema(typeScriptContents: string): Map<string, string> {
    const ast: ParsedAst = toAst(typeScriptContents);
    const schemas: Schema[] = toAvroSchema(ast);
    return new Map(schemas.map(schema => [schema.name, writeAvsc(schema)]));
}

export function typeScriptToSerializerTypeScript(typeScriptContents: string, relativePathToTypeScript: string): Map<string, string> {
    const ast: ParsedAst = toAst(typeScriptContents);
    const schemas: Schema[] = toAvroSchema(ast);
    return new Map(schemas.map(schema => [schema.name, toAvroSerializer(relativePathToTypeScript, schema)]));
}
