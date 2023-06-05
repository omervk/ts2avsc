import { ParsedAst } from './parser';
import * as ts from './types';
import * as ref from '@deepkit/type';
import { typeOf } from '@deepkit/type';

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
const Uint8ArrayType = typeOf<Uint8Array>() as ref.TypeClass;

function toFieldType(type: ref.Type): ts.Type {
  switch (type.kind) {
    case ref.ReflectionKind.number:
      return 'number';
    case ref.ReflectionKind.boolean:
      return 'boolean';
    case ref.ReflectionKind.string:
      return 'string';
    case ref.ReflectionKind.class:
      if (type.classType === Uint8ArrayType.classType) {
        return 'Buffer';
      }

      break;
  }

  throw new Error('Unsupported type'); // TODO: better errors
}

function toField(property: ref.ReflectionProperty): ts.FieldDeclaration {
  let type: ts.Type;

  try {
    type = toFieldType(property.getType());
  } catch {
    type = toRecordType(property.getResolvedReflectionClass());
  }

  return {
    name: property.getNameAsString(),
    optional: property.isActualOptional(),
    type,
    annotations: [], // TODO:
  };
}

function toRecordType<T>(reflection: ref.ReflectionClass<T>): ts.InterfaceOrType {
  return {
    name: reflection.getName(),
    fields: reflection.getProperties().map(property => toField(property)),
  };
}

export function toAst<T>(reflection: ref.ReflectionClass<T>): ParsedAst {
  return {
    types: [toRecordType<T>(reflection)],
    referenceMap: new Map(),
  };
}
