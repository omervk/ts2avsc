import { ParsedAst } from './parser';
import * as ts from './types';
import * as ref from '@deepkit/type';
import { TypeAnnotations } from '@deepkit/type/src/reflection/type';

/*
    TypeNever
    | TypeAny
    | TypeUnknown
    | TypeVoid
    | TypeObject
    | TypeString
    | TypeNumber
    | TypeBoolean
    | TypeBigInt
    | TypeSymbol
    | TypeNull
    | TypeUndefined
    | TypeLiteral
    | TypeTemplateLiteral
    | TypeParameter
    | TypeFunction
    | TypeMethod
    | TypeProperty
    | TypePromise
    | TypeClass
    | TypeEnum
    | TypeEnumMember
    | TypeUnion
    | TypeIntersection
    | TypeArray
    | TypeObjectLiteral
    | TypeIndexSignature
    | TypePropertySignature
    | TypeMethodSignature
    | TypeTypeParameter
    | TypeInfer
    | TypeTuple
    | TypeTupleMember
    | TypeRest
    | TypeRegexp
    | TypeCallSignature

 */
const Uint8ArrayType = ref.typeOf<Uint8Array>() as ref.TypeClass;

function getDocs(hasAnnotations: TypeAnnotations): string | undefined {
  const decorators = hasAnnotations.decorators || [];
  const typeAnnotation: ref.Type | undefined = decorators.filter(value => value.typeName === 'AvroDoc')?.[0];

  if (typeAnnotation) {
    const typeArgument = typeAnnotation.typeArguments?.[0];

    if (typeArgument && typeArgument.kind === ref.ReflectionKind.literal && typeof typeArgument.literal === 'string') {
      return typeArgument.literal;
    }
  }
}

function getAnnotations(hasAnnotations: TypeAnnotations): string[] {
  const decorators = hasAnnotations.decorators || [];
  const typeAnnotation: ref.Type | undefined = decorators.filter(value => value.typeName === 'Type')?.[0];

  if (typeAnnotation) {
    const typeArgument = typeAnnotation.typeArguments?.[0];

    if (typeArgument && typeArgument.kind === ref.ReflectionKind.literal && typeof typeArgument.literal === 'string') {
      const annotation = typeArgument.literal;
      return [annotation];
    }
  }

  const logicalTypeAnnotation: ref.Type | undefined = decorators.filter(value => value.typeName === 'LogicalType')?.[0];

  if (logicalTypeAnnotation) {
    const typeArgument = logicalTypeAnnotation.typeArguments?.[0];

    if (typeArgument && typeArgument.kind === ref.ReflectionKind.literal && typeof typeArgument.literal === 'string') {
      const annotation = typeArgument.literal;
      return [annotation];
    }
  }

  return [];
}

function toType(type: ref.Type): [ts.Type, string[]] {
  switch (type.kind) {
    case ref.ReflectionKind.number:
      // TODO: Work smarter with logical types that have a base type
      return ['number', getAnnotations(type as ref.TypeAnnotations)];

    case ref.ReflectionKind.boolean:
      return ['boolean', getAnnotations(type as ref.TypeAnnotations)];

    case ref.ReflectionKind.string:
      return ['string', getAnnotations(type as ref.TypeAnnotations)];

    case ref.ReflectionKind.class:
      if (type.classType === Uint8ArrayType.classType) {
        return ['Buffer', getAnnotations(type as ref.TypeAnnotations)];
      }

      return [toRecordType(ref.resolveClassType(type)), []];

    case ref.ReflectionKind.objectLiteral:
      return [toRecordType(ref.resolveClassType(type)), []];

    case ref.ReflectionKind.literal:
      if (type.literal instanceof Symbol && type.literal.description !== undefined) {
        return [new ts.StringLiteral(type.literal.description), []];
      }

      if (typeof type.literal === 'string') {
        return [new ts.StringLiteral(type.literal), []];
      }

      if (typeof type.literal === 'number') {
        return [new ts.NumberLiteral(type.literal), []];
      }

      if (typeof type.literal === 'boolean') {
        return [new ts.BooleanLiteral(type.literal), []];
      }

      break;

    case ref.ReflectionKind.null:
      return [new ts.NullLiteral(), []];

    case ref.ReflectionKind.array: {
      const [itemType, annotations] = toType(type.type);
      return [new ts.ArrayType(itemType), annotations];
    }
  }

  throw new Error(`Unsupported type ${type.kind}`); // TODO: better errors
}

function toField(property: ref.ReflectionProperty): ts.FieldDeclaration {
  const [type, annotations]: [ts.Type, string[]] = toType(property.getType());

  return new ts.FieldDeclaration(
    property.getNameAsString(),
    property.isActualOptional(),
    type,
    annotations,
    getDocs(property.getType()),
  );
}

function toRecordType<T>(reflection: ref.ReflectionClass<T>): ts.InterfaceOrType {
  return new ts.InterfaceOrType(
    reflection.getName(),
    reflection.getProperties().map(property => toField(property)),
    getDocs(reflection.type),
  );
}

export function toAst<T>(reflection: ref.ReflectionClass<T>): ParsedAst {
  return {
    types: [toRecordType<T>(reflection)],
    referenceMap: new Map(),
  };
}
