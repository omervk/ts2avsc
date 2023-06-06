type Type<Name extends 'boolean' | 'string' | 'bytes' | 'int' | 'float' | 'double' | 'long'> = {
  __meta?: ['avroType', never & Name];
};

type LogicalType<Name extends string, BaseType extends string> = {
  __meta?: ['avroLogicalType', never & Name, never & BaseType];
};

export type AvroBoolean = boolean & Type<'boolean'>;
export type AvroString = string & Type<'string'>;
export type AvroBytes = Uint8Array & Type<'bytes'>;

export type AvroInt = number & Type<'int'>;
export type AvroFloat = number & Type<'float'>;
export type AvroDouble = number & Type<'double'>;
export type AvroLong = number & Type<'long'>;

export type AvroDate = number & LogicalType<'date', 'int'>;
export type AvroTimeMillis = number & LogicalType<'time-millis', 'int'>;
export type AvroTimeMicros = number & LogicalType<'time-micros', 'long'>;
export type AvroTimestampMillis = number & LogicalType<'timestamp-millis', 'long'>;
export type AvroTimestampMicros = number & LogicalType<'timestamp-micros', 'long'>;
export type AvroLocalTimeMillis = number & LogicalType<'local-timestamp-millis', 'long'>;
export type AvroLocalTimeMicros = number & LogicalType<'local-timestamp-micros', 'long'>;
export type AvroUuid = string & LogicalType<'uuid', 'string'>;

// TODO: Decimals

export type AvroDoc<DocString extends string> = {
  __meta?: ['avroDoc', never & DocString];
};
