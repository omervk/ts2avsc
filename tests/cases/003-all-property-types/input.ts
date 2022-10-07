interface Interface {
    requiredBool: boolean;
    optionalBool?: boolean;
    
    requiredBytes: Uint8Array;
    optionalBytes?: Uint8Array;
    
    // @avro int
    optionalInt?: number;

    // @avro int
    requiredInt: number;

    requiredString: string;
    optionalString?: string;
    
    // @avro float
    optionalFloat?: number;

    // @avro float
    requiredFloat: number;
    
    // @avro double
    optionalDouble?: number;

    // @avro double
    requiredDouble: number;

    // @avro long
    optionalLong?: number;

    // @avro long
    requiredLong: number;

    optionalNull?: null;
    requiredNull: null;

    // @avro date
    optionalDate?: number;

    // @avro date
    requiredDate: number;

    // @avro time_ms
    optionalTimeMs?: number;

    // @avro time_ms
    requiredTimeMs: number;

    // @avro timestamp_ms
    optionalTimestampMs?: number;

    // @avro timestamp_ms
    requiredTimestampMs: number;
    
    // @avro local_timestamp_ms
    optionalLocalTimestampMs?: number;

    // @avro local_timestamp_ms
    requiredLocalTimestampMs: number;
    
    // TODO: Decimal
    
    // @avro uuid
    optionalUuid?: string;

    // @avro uuid
    requiredUuid: string;
}

type Type = {
    requiredBool: boolean;
    optionalBool?: boolean;

    requiredBytes: Uint8Array;
    optionalBytes?: Uint8Array;

    // @avro int
    optionalInt?: number;

    // @avro int
    requiredInt: number;

    requiredString: string;
    optionalString?: string;

    // @avro float
    optionalFloat?: number;

    // @avro float
    requiredFloat: number;

    // @avro double
    optionalDouble?: number;

    // @avro double
    requiredDouble: number;

    // @avro long
    optionalLong?: number;

    // @avro long
    requiredLong: number;

    optionalNull?: null;
    requiredNull: null;

    // @avro date
    optionalDate?: number;

    // @avro date
    requiredDate: number;

    // @avro time_ms
    optionalTimeMs?: number;

    // @avro time_ms
    requiredTimeMs: number;

    // @avro timestamp_ms
    optionalTimestampMs?: number;

    // @avro timestamp_ms
    requiredTimestampMs: number;

    // @avro local_timestamp_ms
    optionalLocalTimestampMs?: number;

    // @avro local_timestamp_ms
    requiredLocalTimestampMs: number;

    // TODO: Decimal

    // @avro uuid
    optionalUuid?: string;

    // @avro uuid
    requiredUuid: string;
}