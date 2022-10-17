# TypeScript to Avro Schema

## WARNING: This is a WIP, ill-advised project. Use at your own peril.

When producing data, developers often want to use the language they're fluent in to define how their data looks.
Asking a developer to create a schema in the language of the protocol is friction they'd rather not face.

In our case, developers building in TypeScript who want to produce Avro can define their schemas with TypeScript `type`s
and `interface`s.
This tool lets them generate an Avro Schema (`avsc`) out of their TypeScript file.

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

_MyInterface.avsc_

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

_MyInterface.serializer.ts_

```typescript
import avro from 'avsc';
import {MyInterface} from './input';

const exactType = avro.Type.forSchema({"name": "MyInterface","fields": [{"name": "someField", "type": "string"}],"type": "record"});

export default function serialize(value: MyInterface): Buffer {
    return exactType.toBuffer({
        someField: value.someField === undefined ? null : value.someField
    });
}
```

### Why does the serializer manually convert `undefined`s to `null`s?

In TypeScript, the idiomatic way to denote optionality is using the `?` modifier.
When an optional field is empty, it is 'set' to `undefined`.
However, in Avro emptiness of optional fields is always denoted using `null`.
The "manual" conversions are a type-safe way of converting between these two idioms.

## Usage

Don't... but if you have to:

## Bootstrapping

1. Clone the repository
2. Make sure to use the Node version in the `.nvmrc` file (I recommend using `nvm install`).
3. Run `npm run bootstrap`.
4. Run `npm run test` to make sure it all worked.
5. Turn back.

## Running the damned thing

First you'll need to install the command line utility: `npm install -g .`.

Run `ts2avsc --help` to see the following:
```
Usage: ts2avsc [options] <source.ts> [target-directory]

Convert a TypeScript file to a set of Avro Schemas and/or Serializers

Arguments:
source.ts         The typescript file containing the type definitions
target-directory  The directory in which to place the output files (default: ".")

Options:
-V, --version     output the version number
--no-schemas      Generate schemas
--pretty          Pretty print Schema files
--serializers     Generate serializers
-h, --help        display help for command
```

Example usage:

```
🦆 ts2avsc --serializers --pretty tests/cases/007-two-base-types/input.ts ./tests/cases/007-two-base-types

- Writing schemas...
  + Writing Interface7.avsc...
  + Writing Type7.avsc...
- Writing serializers...
  + Writing Interface7.serializer.ts...
  + Writing Type7.serializer.ts...
All done!
```

You can see the input and outputs for this call in [./tests/cases/007-two-base-types](./tests/cases/007-two-base-types).

When you've come to regret your decision, you can get rid of the command line utility with `npm uninstall -g .`.

## Contributing

### Design

The design is compositional, which can be seen by reading `src/generator/typescript-to-avsc.ts`:

#### `typeScriptToAvroSchema`

Translates an input TypeScript interface into an Avro schema

```mermaid
graph LR;
    interface.ts-- toAst -->ParsedAst
    ParsedAst-- toAvroSchema -->Schemas
    Schemas-- writeAvsc -->schema.avsc
```

#### `typeScriptToSerializerTypeScript`

Translates an input TypeScript interface into a typed Avro serializer

```mermaid
graph LR;
    interface.ts-- toAst -->ParsedAst
    ParsedAst-- toAvroSchema -->Schemas
    Schemas-- toAvroSerializer -->serializer.ts
```

#### Composed Parts

1. Files in `src/generator/typescript` are responsible for parsing the input to an intermediate model.
2. Files in `src/generator/avsc` are responsible for converting the above model to a model of the Avro schemas and serializing each one.
3. Files in `src/generator/avsc-lib` are responsible for using the above model of the Avro schema and creating a typed serializer for each supported library.

## // TODO:

1. Test errors and make sure coverage is decent
2. Document type narrowing using comment annotations
3. Add language features:
   1. companion types library - be modular to existing libraries, don't reinvent them
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
   13. type references outside the file's scope
   14. not just the interface in the same file
   15. run tests on the serializer/deserializer to make sure they do what they're supposed to
4. Document multiple root types (schema and serializer outputs)

Copyright 2022 Omer van Kloeten

(I'll remove the copyright once this is no longer a WIP project)