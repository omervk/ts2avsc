export interface Interface4 {
    // @avro int
    optionalInt?: number;

    // @avro int
    requiredInt: number;
    
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

    // @avro date
    optionalDate?: number;

    // @avro date
    requiredDate: number;

    // @avro time-millis
    optionalTimeMs?: number;

    // @avro time-millis
    requiredTimeMs: number;

    // @avro time-micros
    optionalTimeMicros?: number;

    // @avro time-micros
    requiredTimeMicros: number;

    // @avro timestamp-millis
    optionalTimestampMs?: number;

    // @avro timestamp-millis
    requiredTimestampMs: number;
    
    // @avro timestamp-micros
    optionalTimestampMicros?: number;

    // @avro timestamp-micros
    requiredTimestampMicros: number;
    
    // @avro local-timestamp-millis
    optionalLocalTimestampMs?: number;

    // @avro local-timestamp-millis
    requiredLocalTimestampMs: number;

    // @avro local-timestamp-micros
    optionalLocalTimestampMicros?: number;

    // @avro local-timestamp-micros
    requiredLocalTimestampMicros: number;

    // // @avro decimal(1, 2)
    // optionalDecimal?: string;
    //
    // // @avro decimal(3,4)
    // requiredDecimal: string;
    //
    // // @avro decimal( 5, 6)
    // optionalDecimal2?: number;
    //
    // // @avro decimal(7,8 )
    // requiredDecimal2: number;
    
    // @avro uuid
    optionalUuid?: string;

    // @avro uuid
    requiredUuid: string;
}
