# TypeScript to Avro Schema

## WARNING: This is a WIP, ill-advised project. Use at your own peril.

When producing data, developers often want to use the language they're fluent in to define how their data looks.
Asking a developer to create a schema in the language of the protocol is friction they'd rather not face.

In our case, developers building in TypeScript who want to produce Avro can define their schemas with TypeScript `type`s
and `interface`s.
This tool lets them generate an Avro Schema (`avsc`) out of their TypeScript file.

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

### Why does the serializer use null coalescing (??)?

In TypeScript, the idiomatic way to denote optionality is using the `?` modifier.
When an optional field is empty, it is 'set' to `undefined`.
However, in Avro emptiness of optional fields is always denoted using `null`.
The "manual" conversions are a type-safe way of converting between these two idioms.

# Contributing

## Bootstrapping

1. Clone the repository
2. Make sure to use the Node version in the `.nvmrc` file (I recommend using `nvm install`).
3. Run `npm run bootstrap`.
4. Run `npm run test` to make sure it all worked.
5. Turn back.

## Design

The design is compositional, which can be seen by reading `src/generator/typescript-to-avsc.ts`:

### `typeScriptToAvroSchema`

Translates an input TypeScript interface into an Avro schema

```mermaid
graph LR;
    interface.ts-- toAst -->ts.InterfaceOrType
    ts.InterfaceOrType-- toAvroSchema -->avsc.Schema
    avsc.Schema-- writeAvsc -->schema.avsc
```

### `typeScriptToSerializerTypeScript`

Translates an input TypeScript interface into a typed Avro serializer

```mermaid
graph LR;
    interface.ts-- toAst -->ts.InterfaceOrType
    ts.InterfaceOrType-- toAvroSchema -->avsc.Schema
    avsc.Schema-- toAvroSerializer -->serializer.ts
```

### Composed Parts

1. Files in `src/generator/typescript` are responsible for parsing the input to an intermediate model.
2. Files in `src/generator/avsc` are responsible for converting the above model to a model of the Avro schema and serializing it.
3. Files in `src/generator/avsc-lib` are responsible for using the above model of the Avro schema and creating a typed serializer for each supported library.

## // TODO:

1. Test errors and make sure coverage is decent
2. Document type narrowing using comment annotations 
3. Add language features:
   1. companion types library
   2. long types
   3. decimal
   4. duration
   5. aliases
   6. default values
   7. order (fields)
   8. enums
   9. arrays
   10. maps
   11. unions (ts -> avro)
   12. fixed
   13. type references
   14. not just the interface in the same file
   15. run tests on the serializer/deserializer to make sure they do what they're supposed to

Copyright 2022 Omer van Kloeten

(I'll remove the copyright once this is no longer a WIP project)