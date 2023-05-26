import { ParsedAst } from '../typescript/parser';
import * as ts from '../typescript/types';
import { FieldDeclaration, StringLiteral } from '../typescript/types';
import * as avsc from './types';
import { RecordField } from './types';

function chooseNumberAnnotation(annotationsOnType: string[]): string {
  const numberAnnotations: string[] = [
    'float',
    'double',
    'int',
    'long',
    'date',
    'time-millis',
    'time-micros',
    'timestamp-millis',
    'timestamp-micros',
    'local-timestamp-millis',
    'local-timestamp-micros',
  ];
  const validAnnotations = numberAnnotations.filter(annotation => annotationsOnType.includes(annotation));

  if (validAnnotations.length > 2) {
    throw new Error(
      `Unable to translate a number with multiple valid annotations: [${validAnnotations.join(
        ', ',
      )}]. Please use only one.`,
    );
  }

  return validAnnotations?.[0] || 'double';
}

function asValidEnumIdentifier(node: ts.Type): string | undefined {
  if (node instanceof StringLiteral && !!node.literal.match(/^[A-Za-z_][A-Za-z0-9_]*$/)) {
    return node.literal;
  }
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
          throw new Error(
            `Type ${type.name} was referenced but not found. This should have been caught during parsing.`,
          );
      }
    }

    return toRecordType(interfaceOrType, ast);
  }

  if (type instanceof ts.ArrayType) {
    return new avsc.Array(toBaseType(type.itemType, annotationsOnType, ast));
  }

  if (type instanceof ts.UnionType) {
    // We support only native unions for now: All strings, unique, must match the regular expression
    const enumValues = [type.head, ...type.tail].map(node => asValidEnumIdentifier(node));

    if (enumValues.every(value => value !== undefined)) {
      // We've asserted this "cast" in the condition above
      const uniqueEnumValues = (enumValues as string[]).filter((value, index) => enumValues.indexOf(value) === index);

      return new avsc.Enum(uniqueEnumValues.join('_or_'), uniqueEnumValues);
    }

    throw new Error(`Unable to translate TypeScript unions that can not directly map to an Avro enum.`);
  }

  // Optimization: If we see a string literal that qualifies as an enum value, translate it to an enum.
  const enumIdentifier = asValidEnumIdentifier(type);

  if (enumIdentifier !== undefined) {
    return new avsc.Enum(enumIdentifier, [enumIdentifier]);
  }

  const isLiteralType = (t: any & ts.Type): t is ts.Literal => {
    return !!t.kind;
  };

  const typeName: string = isLiteralType(type) ? type.kind : type;

  switch (typeName) {
    case 'string':
      if (annotationsOnType.includes('uuid')) {
        return new avsc.Uuid();
      }

      return 'string';

    case 'boolean':
      return 'boolean';

    case 'Buffer':
      return 'bytes';

    case 'null':
      return 'null';

    case 'number':
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

  throw new Error(
    `Unable to translate type ${type} with annotations [${annotationsOnType.join(
      ', ',
    )}]. Please make sure it's a valid combination.`,
  );
}

function toType(type: ts.Type, optional: boolean, annotationsOnType: string[], ast: ParsedAst): avsc.Type {
  const baseType: avsc.Type = toBaseType(type, annotationsOnType, ast);

  if (optional) {
    if (baseType instanceof avsc.Union) {
      // If the base type is a union, flatten it with the null option
      return new avsc.Union('null', ...baseType.types);
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
  return new avsc.Record(t.name, toFields(t.fields, ast), { doc: t.jsDoc });
}

export default function toAvroSchema(ast: ParsedAst): avsc.Schema[] {
  const rootTypes: Set<string> = resolveRootTypes(ast);

  return ast.types.filter(t => rootTypes.has(t.name)).map(t => toRecordType(t, ast));
}
