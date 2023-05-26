import toAvroSchema from './avsc/converter';
import { Schema } from './avsc/types';
import writeAvsc from './avsc/writer';
import toAvroSerializer from './avsc-lib/serializer';
import { ParsedAst, toAst } from './typescript/parser';

export function typeScriptToAvroSchema(typeScriptContents: string): Map<string, string> {
  const ast: ParsedAst = toAst(typeScriptContents);
  const schemas: Schema[] = toAvroSchema(ast);
  return new Map(schemas.map(schema => [`${schema.name}.avsc`, writeAvsc(schema)]));
}

export function typeScriptToSerializerTypeScript(
  typeScriptContents: string,
  relativePathToTypeScript: string,
): Map<string, string> {
  const ast: ParsedAst = toAst(typeScriptContents);
  const schemas: Schema[] = toAvroSchema(ast);
  return new Map(
    schemas.map(schema => [`${schema.name}.serializer.ts`, toAvroSerializer(relativePathToTypeScript, schema)]),
  );
}
