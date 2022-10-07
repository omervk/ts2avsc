# TypeScript to Avro IDL

When producing data, developers often want to use the language they're fluent in to define how their data looks. Asking a developer to create a schema in the language of the protocol is friction they're rather not face.

In our case, developers building in TypeScript who want to produce Avro can define their schemas with TypeScript `type`s and `interface`s. This tool lets them generate an Avro IDL protocol out of each TypeScript definitions file.

## // TODO:
1. Validate this works with an actual library that serializes to Avro.
2. Validate this makes sense for readers (e.g. ask Yehonatan how he would create an interface / type for a schema).
3. Add language features:
   1. Enums
   2. Fixed
   3. Decimal
   4. References
   5. Imports
   6. Default values
   7. Comments
   8. Complex types (map, array, union)
   9. Escape reserved identifiers
   10. Sort order @order
   11. Aliases