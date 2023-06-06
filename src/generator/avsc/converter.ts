import * as avsc from './types';
import * as ref from '@deepkit/type';
import { TypeLiteral } from '@deepkit/type/src/reflection/type';

const Uint8ArrayType = ref.typeOf<Uint8Array>() as ref.TypeClass;

function getDocs(hasAnnotations: ref.TypeAnnotations): string | undefined {
  const decorators = hasAnnotations.decorators || [];
  const typeAnnotation: ref.Type | undefined = decorators.filter(value => value.typeName === 'AvroDoc')?.[0];

  if (typeAnnotation) {
    const typeArgument = typeAnnotation.typeArguments?.[0];

    if (typeArgument && typeArgument.kind === ref.ReflectionKind.literal && typeof typeArgument.literal === 'string') {
      return typeArgument.literal;
    }
  }
}

function getSpecializedTypeByAnnotations(
  hasAnnotations: ref.TypeAnnotations,
): avsc.PrimitiveTypes | avsc.LogicalTypes | undefined {
  const decorators = hasAnnotations.decorators || [];
  const typeAnnotation: ref.Type | undefined = decorators.filter(value => value.typeName === 'Type')?.[0];

  if (typeAnnotation) {
    const primitiveTypeName = typeAnnotation.typeArguments?.[0] as TypeLiteral | undefined;

    if (primitiveTypeName && typeof primitiveTypeName.literal === 'string') {
      return primitiveTypeName.literal as avsc.PrimitiveTypes;
    }
  }

  const logicalTypeAnnotation: ref.Type | undefined = decorators.filter(value => value.typeName === 'LogicalType')?.[0];

  if (logicalTypeAnnotation) {
    const logicalTypeName = logicalTypeAnnotation.typeArguments?.[0] as TypeLiteral | undefined;
    const primitiveTypeName = logicalTypeAnnotation.typeArguments?.[1] as TypeLiteral | undefined;

    if (
      logicalTypeName &&
      typeof logicalTypeName.literal === 'string' &&
      primitiveTypeName &&
      typeof primitiveTypeName.literal === 'string'
    ) {
      return {
        logicalType: logicalTypeName.literal,
        type: primitiveTypeName.literal,
      } as avsc.LogicalTypes;
    }
  }
}

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

function asValidEnumIdentifier(node: ref.Type): string | undefined {
  if (
    node.kind === ref.ReflectionKind.literal &&
    typeof node.literal === 'string' &&
    !!node.literal.match(/^[A-Za-z_][A-Za-z0-9_]*$/)
  ) {
    return node.literal;
  }
}

function toBaseType(type: ref.Type): avsc.Type {
  switch (type.kind) {
    case ref.ReflectionKind.number:
      return getSpecializedTypeByAnnotations(type as ref.TypeAnnotations) || 'double';

    case ref.ReflectionKind.boolean:
      return getSpecializedTypeByAnnotations(type as ref.TypeAnnotations) || 'boolean';

    case ref.ReflectionKind.string:
      return getSpecializedTypeByAnnotations(type as ref.TypeAnnotations) || 'string';

    case ref.ReflectionKind.class:
      if (type.classType === Uint8ArrayType.classType) {
        return getSpecializedTypeByAnnotations(type as ref.TypeAnnotations) || 'bytes';
      }

      return toRecordType(ref.resolveClassType(type));

    case ref.ReflectionKind.objectLiteral:
      return toRecordType(ref.resolveClassType(type));

    case ref.ReflectionKind.literal:
      // TODO: Use defaults?
      if (
        (type.literal instanceof Symbol && type.literal.description !== undefined) ||
        typeof type.literal === 'string'
      ) {
        // Optimization: If we see a string literal that qualifies as an enum value, translate it to an enum.
        const enumIdentifier = asValidEnumIdentifier(type);

        if (enumIdentifier !== undefined) {
          return new avsc.Enum(enumIdentifier, [enumIdentifier]);
        }

        return 'string';
      }

      if (typeof type.literal === 'number') {
        if (Number.isInteger(type.literal)) {
          return 'int';
        }

        return 'double';
      }

      if (typeof type.literal === 'boolean') {
        return 'boolean';
      }

      break;

    case ref.ReflectionKind.null:
      return 'null';

    case ref.ReflectionKind.array: {
      return new avsc.Array(toBaseType(type.type));
    }

    case ref.ReflectionKind.union: {
      // We support only native unions for now: All strings, unique, must match the regular expression
      const enumValues = type.types.map(itemType => asValidEnumIdentifier(itemType));

      if (enumValues.every(value => value !== undefined)) {
        // We've asserted this "cast" in the condition above
        const uniqueEnumValues = (enumValues as string[]).filter((value, index) => enumValues.indexOf(value) === index);

        return new avsc.Enum(uniqueEnumValues.join('_or_'), uniqueEnumValues);
      }

      throw new Error(`Unable to translate TypeScript unions that can not directly map to an Avro enum.`);
    }
  }

  throw new Error(`Unsupported type ${type.kind}`); // TODO: better errors
}

function toType(type: ref.Type, optional = false): avsc.Type {
  const baseType: avsc.Type = toBaseType(type);

  if (optional) {
    if (baseType instanceof avsc.Union) {
      // If the base type is a union, flatten it with the null option
      return new avsc.Union('null', ...baseType.types);
    }

    return new avsc.Union('null', baseType);
  }

  return baseType;
}

function toField(property: ref.ReflectionProperty): avsc.RecordField {
  return {
    name: property.getNameAsString(),
    type: toType(property.getType(), property.isActualOptional()),
    doc: getDocs(property.getType()),
  };
}

export function toRecordType<T>(reflection: ref.ReflectionClass<T>): avsc.Schema {
  return new avsc.Record(
    reflection.getName(),
    reflection.getProperties().map(property => toField(property)),
    { doc: getDocs(reflection.type) },
  );
}
