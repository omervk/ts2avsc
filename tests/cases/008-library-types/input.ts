import {
    AvroDate,
    AvroDouble,
    AvroFloat,
    AvroInt, AvroLocalTimeMicros, AvroLocalTimeMillis,
    AvroLong,
    AvroTimeMicros,
    AvroTimeMillis, AvroTimestampMicros,
    AvroTimestampMillis, AvroUuid
} from "../../../src/types";

export interface Interface {
    optionalInt?: AvroInt;
    requiredInt: AvroInt;
    optionalFloat?: AvroFloat;
    requiredFloat: AvroFloat;
    optionalDouble?: AvroDouble;
    requiredDouble: AvroDouble;
    optionalLong?: AvroLong;
    requiredLong: AvroLong;
    optionalDate?: AvroDate;
    requiredDate: AvroDate;
    optionalTimeMs?: AvroTimeMillis;
    requiredTimeMs: AvroTimeMillis;
    optionalTimeMicros?: AvroTimeMicros;
    requiredTimeMicros: AvroTimeMicros;
    optionalTimestampMs?: AvroTimestampMillis;
    requiredTimestampMs: AvroTimestampMillis;
    optionalTimestampMicros?: AvroTimestampMicros;
    requiredTimestampMicros: AvroTimestampMicros;
    optionalLocalTimestampMs?: AvroLocalTimeMillis;
    requiredLocalTimestampMs: AvroLocalTimeMillis;
    optionalLocalTimestampMicros?: AvroLocalTimeMicros;
    requiredLocalTimestampMicros: AvroLocalTimeMicros;

    // optionalDecimal?: AvroDecimal;
    // requiredDecimal: AvroDecimal;
    // optionalDecimal2?: AvroDecimal<5, 6>;
    // requiredDecimal2: AvroDecimal<7, 8>;

    optionalUuid?: AvroUuid;
    requiredUuid: AvroUuid;
}
