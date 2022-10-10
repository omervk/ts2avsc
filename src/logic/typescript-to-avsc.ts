import toAvroSchema from "./avsc/converter";
import {toAst} from "./typescript/parser";
import {InterfaceOrType} from "./typescript/types";
import writeAvsc from "./avsc/writer";
import {Schema} from "./avsc/types";

export default function typescriptToAvroSchema(typeScriptContents: string): string {
    const ast: InterfaceOrType = toAst(typeScriptContents);
    const schema: Schema = toAvroSchema(ast);
    return writeAvsc(schema);
}
