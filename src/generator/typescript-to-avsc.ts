import toAvroSchema from "./avsc/converter";
import {toAst} from "./typescript/parser";
import {InterfaceOrType} from "./typescript/types";
import writeAvsc from "./avsc/writer";
import {Schema} from "./avsc/types";
import toAvroSerializer from "./avsc-lib/serializer";
import toAvroDeserializer from "./avsc-lib/deserializer";

export function typeScriptToAvroSchema(typeScriptContents: string): string {
    const ast: InterfaceOrType = toAst(typeScriptContents);
    const schema: Schema = toAvroSchema(ast);
    return writeAvsc(schema);
}

export function typeScriptToSerializerTypeScript(typeScriptContents: string, relativePathToTypeScript: string): string {
    const ast: InterfaceOrType = toAst(typeScriptContents);
    const schema: Schema = toAvroSchema(ast);
    return toAvroSerializer(relativePathToTypeScript, schema);
}

export function typeScriptToDeserializerTypeScript(typeScriptContents: string, relativePathToTypeScript: string): string {
    const ast: InterfaceOrType = toAst(typeScriptContents);
    const schema: Schema = toAvroSchema(ast);
    return toAvroDeserializer(relativePathToTypeScript, schema);
}