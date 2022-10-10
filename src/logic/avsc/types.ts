export type Schema = Record;

export type Type = PrimitiveTypes | Union | LogicalTypes; // | Enum | Array | Map | Union | Fixed;
export type PrimitiveTypes = 'null' | 'boolean' | 'int' | 'long' | 'float' | 'double' | 'bytes' | 'string';

export type LogicalTypes = 
    Uuid
    // | Decimal
    | Date
    | TimeMillis
    | TimeMicros
    | TimestampMillis
    | TimestampMicros
    | LocalTimestampMillis
    | LocalTimestampMicros
    // | Duration;


export type Record = {
    name: string;
    namespace?: string;
    doc?: string;
    aliases?: string[];
    fields: RecordField[];
    type: 'record'
}

export type RecordField = {
    name: string;
    doc?: string;
    type: Type;
    default?: any;
    order?: 'ascending' | 'descending' | 'ignore';
    aliases?: string[];
}

export class Union {
    readonly types: Exclude<Type, Union>[];

    constructor(head: Exclude<Type, Union>, ...tail: Exclude<Type, Union>[]) {
        this.types = [head, ...tail]
            // dedup unions
            .filter((value, index, self) => self.indexOf(value) === index);
    }
}

interface LogicalType {
    readonly type: string;
    readonly logicalType: string;
}

export class Uuid implements LogicalType {
    readonly type: string = 'string';
    readonly logicalType: string = 'uuid';
}

export class Date implements LogicalType {
    readonly logicalType: string = 'date';
    readonly type: string = 'int';
}

export class TimeMillis implements LogicalType {
    readonly logicalType: string = 'time-millis';
    readonly type: string = 'int';
}

export class TimeMicros implements LogicalType {
    readonly logicalType: string = 'time-micros';
    readonly type: string = 'long';
}

export class TimestampMillis implements LogicalType {
    readonly logicalType: string = 'timestamp-millis';
    readonly type: string = 'long';
}

export class TimestampMicros implements LogicalType {
    readonly logicalType: string = 'timestamp-micros';
    readonly type: string = 'long';
}

export class LocalTimestampMillis implements LogicalType {
    readonly logicalType: string = 'local-timestamp-millis';
    readonly type: string = 'long';
}

export class LocalTimestampMicros implements LogicalType {
    readonly logicalType: string = 'local-timestamp-micros';
    readonly type: string = 'long';
}

