# TypeScript to Avro Schema

When producing data, developers often want to use the language they're fluent in to define how their data looks. Asking
a developer to create a schema in the language of the protocol is friction they're rather not face.

In our case, developers building in TypeScript who want to produce Avro can define their schemas with TypeScript `type`s
and `interface`s. This tool lets them generate an Avro Schema (`avsc`) out of their TypeScript file.

## Usage:

Don't.

## Operations

### 1. Convert TypeScript interface or type to Avro Schema

Use this to get a schema you can share (via a schema registry or directly with your consumers).

_input.ts_

```typescript
export interface MyInterface {
    optionalBool?: boolean;
    requiredBytes: Buffer;
    optionalString?: string;
    requiredDouble: number;
}
```

Note that the interface is `export`ed, which is a requirement.

_output.avsc_

```avro schema
{
    "name": "MyInterface",
    "fields": [
        {
            "name": "optionalBool",
            "type": [
                "null",
                "boolean"
            ]
        },
        {
            "name": "requiredBytes",
            "type": "bytes"
        },
        {
            "name": "optionalString",
            "type": [
                "null",
                "string"
            ]
        },
        {
            "name": "requiredDouble",
            "type": "double"
        }
    ],
    "type": "record"
}
```

### 2. Convert TypeScript type to serializer

Use this when you want to **produce** Avro using a TypeScript interface. \
Generates a typed serializer using
the [avsc](https://github.com/mtth/avsc) library.

_input.ts_

```typescript
export interface MyInterface {
    someField?: string;
}
```

_serializer.ts_

```typescript
import avro from 'avsc';
import {MyInterface} from './input';

const exactType = avro.Type.forSchema({"name": "MyInterface","fields": [{"name": "someField", "type": "string"}],"type": "record"});

export default function serialize(value: MyInterface): Buffer {
    return exactType.toBuffer({
        someField: value.someField ?? null
    });
}
```

### 3. Convert TypeScript type to deserializer

Use this when you want to **consume** Avro using a TypeScript interface. \
Should be used only when you're both the producer and the consumer in different parts of the same codebase, otherwise please use a tool to generate the interface from the schema provided by the producer. \
Generates a typed deserializer using
the [avsc](https://github.com/mtth/avsc) library.

_input.ts_

```typescript
export interface MyInterface {
    someField?: string;
}
```

_deserializer.ts_

```typescript
import avro from 'avsc';
import {MyInterface} from './input';

const exactType = avro.Type.forSchema({"name": "MyInterface","fields": [{"name": "someField", "type": "string"}],"type": "record"});

export default function deserialize(value: Buffer): MyInterface {
    const raw = exactType.fromBuffer(value);
    return {
        someField: raw.someField ?? undefined
    };
}
```

### Why do the serializer and deserializer use null coalescing (??)?

In TypeScript, the idiomatic way to denote optionality is using the `?` modifier.
When an optional field is empty, it is 'set' to `undefined`.
However, in Avro emptiness of optional fields is always denoted using `null`.
The "manual" conversions are a type-safe way of converting between these two idioms.

## // TODO:

1. Test errors and make sure coverage is decent
2. Document type narrowing using comment annotations 
3. Add language features:
   1. companion types library
   2. long types
   3. decimal
   4. duration
   5. docs
   6. aliases
   7. default values
   8. order (fields)
   9. enums
   10. arrays
   11. maps
   12. unions (ts -> avro)
   13. fixed
   14. type references
   15. not just the interface in the same file
   16. run tests on the serializer/deserializer to make sure they do what they're supposed to

