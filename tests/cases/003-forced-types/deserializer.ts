import avro from 'avsc';
import { Interface4 } from './input';

const exactType = avro.Type.forSchema({"name":"Interface4","fields":[{"name":"optionalInt","type":["null","int"]},{"name":"requiredInt","type":"int"},{"name":"optionalFloat","type":["null","float"]},{"name":"requiredFloat","type":"float"},{"name":"optionalDouble","type":["null","double"]},{"name":"requiredDouble","type":"double"},{"name":"optionalLong","type":["null","long"]},{"name":"requiredLong","type":"long"},{"name":"optionalDate","type":["null",{"logicalType":"date","type":"int"}]},{"name":"requiredDate","type":{"logicalType":"date","type":"int"}},{"name":"optionalTimeMs","type":["null",{"logicalType":"time-millis","type":"int"}]},{"name":"requiredTimeMs","type":{"logicalType":"time-millis","type":"int"}},{"name":"optionalTimeMicros","type":["null",{"logicalType":"time-micros","type":"long"}]},{"name":"requiredTimeMicros","type":{"logicalType":"time-micros","type":"long"}},{"name":"optionalTimestampMs","type":["null",{"logicalType":"timestamp-millis","type":"long"}]},{"name":"requiredTimestampMs","type":{"logicalType":"timestamp-millis","type":"long"}},{"name":"optionalTimestampMicros","type":["null",{"logicalType":"timestamp-micros","type":"long"}]},{"name":"requiredTimestampMicros","type":{"logicalType":"timestamp-micros","type":"long"}},{"name":"optionalLocalTimestampMs","type":["null",{"logicalType":"local-timestamp-millis","type":"long"}]},{"name":"requiredLocalTimestampMs","type":{"logicalType":"local-timestamp-millis","type":"long"}},{"name":"optionalLocalTimestampMicros","type":["null",{"logicalType":"local-timestamp-micros","type":"long"}]},{"name":"requiredLocalTimestampMicros","type":{"logicalType":"local-timestamp-micros","type":"long"}},{"name":"optionalUuid","type":["null",{"type":"string","logicalType":"uuid"}]},{"name":"requiredUuid","type":{"type":"string","logicalType":"uuid"}}],"type":"record"});

export default function deserialize(value: Buffer): Interface4 {
    const raw = exactType.fromBuffer(value);
    return {
        optionalInt: raw.optionalInt ?? undefined,
        requiredInt: raw.requiredInt,
        optionalFloat: raw.optionalFloat ?? undefined,
        requiredFloat: raw.requiredFloat,
        optionalDouble: raw.optionalDouble ?? undefined,
        requiredDouble: raw.requiredDouble,
        optionalLong: raw.optionalLong ?? undefined,
        requiredLong: raw.requiredLong,
        optionalDate: raw.optionalDate ?? undefined,
        requiredDate: raw.requiredDate,
        optionalTimeMs: raw.optionalTimeMs ?? undefined,
        requiredTimeMs: raw.requiredTimeMs,
        optionalTimeMicros: raw.optionalTimeMicros ?? undefined,
        requiredTimeMicros: raw.requiredTimeMicros,
        optionalTimestampMs: raw.optionalTimestampMs ?? undefined,
        requiredTimestampMs: raw.requiredTimestampMs,
        optionalTimestampMicros: raw.optionalTimestampMicros ?? undefined,
        requiredTimestampMicros: raw.requiredTimestampMicros,
        optionalLocalTimestampMs: raw.optionalLocalTimestampMs ?? undefined,
        requiredLocalTimestampMs: raw.requiredLocalTimestampMs,
        optionalLocalTimestampMicros: raw.optionalLocalTimestampMicros ?? undefined,
        requiredLocalTimestampMicros: raw.requiredLocalTimestampMicros,
        optionalUuid: raw.optionalUuid ?? undefined,
        requiredUuid: raw.requiredUuid
    };
}