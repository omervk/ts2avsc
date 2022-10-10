# TypeScript to Avro Schema

When producing data, developers often want to use the language they're fluent in to define how their data looks. Asking a developer to create a schema in the language of the protocol is friction they're rather not face.

In our case, developers building in TypeScript who want to produce Avro can define their schemas with TypeScript `type`s and `interface`s. This tool lets them generate an Avro Schema (`avsc`) out of their TypeScript file.

## Usage:

Don't.

## // TODO:
1. Validate this works with an actual library that serializes to Avro.
2. Validate this makes sense for readers (e.g. ask Yehonatan how he would create an interface / type for a schema).
3. Add language features:
   1. long types
   2. decimal
   3. duration
   4. docs
   5. aliases
   6. default values
   7. order (fields)
   8. enums
   9. arrays
   10. maps
   11. unions (ts -> avro)
   12. fixed
   13. type references
4. Proper docs