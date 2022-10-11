import avro from 'avsc';
import { Interface4 } from './input';

const exactType = avro.Type.forSchema({"name":"Interface4","fields":[{"name":"optionalInt","type":["null","int"]},{"name":"requiredInt","type":"int"},{"name":"optionalFloat","type":["null","float"]},{"name":"requiredFloat","type":"float"},{"name":"optionalDouble","type":["null","double"]},{"name":"requiredDouble","type":"double"},{"name":"optionalLong","type":["null","long"]},{"name":"requiredLong","type":"long"},{"name":"optionalDate","type":["null",{"logicalType":"date","type":"int"}]},{"name":"requiredDate","type":{"logicalType":"date","type":"int"}},{"name":"optionalTimeMs","type":["null",{"logicalType":"time-millis","type":"int"}]},{"name":"requiredTimeMs","type":{"logicalType":"time-millis","type":"int"}},{"name":"optionalTimeMicros","type":["null",{"logicalType":"time-micros","type":"long"}]},{"name":"requiredTimeMicros","type":{"logicalType":"time-micros","type":"long"}},{"name":"optionalTimestampMs","type":["null",{"logicalType":"timestamp-millis","type":"long"}]},{"name":"requiredTimestampMs","type":{"logicalType":"timestamp-millis","type":"long"}},{"name":"optionalTimestampMicros","type":["null",{"logicalType":"timestamp-micros","type":"long"}]},{"name":"requiredTimestampMicros","type":{"logicalType":"timestamp-micros","type":"long"}},{"name":"optionalLocalTimestampMs","type":["null",{"logicalType":"local-timestamp-millis","type":"long"}]},{"name":"requiredLocalTimestampMs","type":{"logicalType":"local-timestamp-millis","type":"long"}},{"name":"optionalLocalTimestampMicros","type":["null",{"logicalType":"local-timestamp-micros","type":"long"}]},{"name":"requiredLocalTimestampMicros","type":{"logicalType":"local-timestamp-micros","type":"long"}},{"name":"optionalUuid","type":["null",{"type":"string","logicalType":"uuid"}]},{"name":"requiredUuid","type":{"type":"string","logicalType":"uuid"}}],"type":"record"});

export default function serialize(value: Interface4): Buffer {
    return exactType.toBuffer({
        optionalInt: value.optionalInt ?? null,
        requiredInt: value.requiredInt,
        optionalFloat: value.optionalFloat ?? null,
        requiredFloat: value.requiredFloat,
        optionalDouble: value.optionalDouble ?? null,
        requiredDouble: value.requiredDouble,
        optionalLong: value.optionalLong ?? null,
        requiredLong: value.requiredLong,
        optionalDate: value.optionalDate ?? null,
        requiredDate: value.requiredDate,
        optionalTimeMs: value.optionalTimeMs ?? null,
        requiredTimeMs: value.requiredTimeMs,
        optionalTimeMicros: value.optionalTimeMicros ?? null,
        requiredTimeMicros: value.requiredTimeMicros,
        optionalTimestampMs: value.optionalTimestampMs ?? null,
        requiredTimestampMs: value.requiredTimestampMs,
        optionalTimestampMicros: value.optionalTimestampMicros ?? null,
        requiredTimestampMicros: value.requiredTimestampMicros,
        optionalLocalTimestampMs: value.optionalLocalTimestampMs ?? null,
        requiredLocalTimestampMs: value.requiredLocalTimestampMs,
        optionalLocalTimestampMicros: value.optionalLocalTimestampMicros ?? null,
        requiredLocalTimestampMicros: value.requiredLocalTimestampMicros,
        optionalUuid: value.optionalUuid ?? null,
        requiredUuid: value.requiredUuid
    });
}