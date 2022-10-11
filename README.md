# TypeScript to Avro Schema

When producing data, developers often want to use the language they're fluent in to define how their data looks. Asking a developer to create a schema in the language of the protocol is friction they're rather not face.

In our case, developers building in TypeScript who want to produce Avro can define their schemas with TypeScript `type`s and `interface`s. This tool lets them generate an Avro Schema (`avsc`) out of their TypeScript file.

## Usage:

Don't.

## // TODO:
1. Validate this makes sense for readers (e.g. ask Yehonatan how he would create an interface / type for a schema).
2. Test errors and make sure coverage is decent
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

## // TODO: Docs
1. Interface / type. Please make it exported.
2. Create `.avsc` file
3. Create serializer for the producer, deserializer for the consumer
4. Type narrowing using comment annotations