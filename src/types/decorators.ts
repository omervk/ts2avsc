import * as dk from '@deepkit/type';

type Type<Name extends 'boolean' | 'string' | 'bytes' | 'int' | 'float' | 'double' | 'long'> = {
  __meta?: ['avroType', never & Name];
};

type LogicalType<Name extends string, BaseType extends Type<any>> = {
  __meta?: ['avroLogicalType', never & Name, never & BaseType];
};

export type AvroBoolean = boolean & Type<'boolean'>;
export type AvroString = string & Type<'string'>;
export type AvroBytes = Uint8Array & Type<'bytes'>;

export type AvroInt = number & Type<'int'>;
export type AvroFloat = number & Type<'float'>;
export type AvroDouble = number & Type<'double'>;
export type AvroLong = number & Type<'long'>;

export type AvroDate = number & LogicalType<'date', AvroInt>;
export type AvroTimeMillis = number & LogicalType<'time-millis', AvroInt>;
export type AvroTimeMicros = number & LogicalType<'time-micros', AvroLong>;
export type AvroTimestampMillis = number & LogicalType<'timestamp-millis', AvroLong>;
export type AvroTimestampMicros = number & LogicalType<'timestamp-micros', AvroLong>;
export type AvroLocalTimeMillis = number & LogicalType<'local-timestamp-millis', AvroLong>;
export type AvroLocalTimeMicros = number & LogicalType<'local-timestamp-micros', AvroLong>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type AvroUuid = string & LogicalType<'uuid', AvroString>;

// TODO: Decimals

export type AvroDoc<DocString extends string> = {
  __meta?: ['avroDoc', never & DocString];
};
