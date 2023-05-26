import avro from 'avsc';
import { Interface3 } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"optionalInt","type":["null","int"]},{"name":"requiredInt","type":"int"},{"name":"optionalFloat","type":["null","float"]},{"name":"requiredFloat","type":"float"},{"name":"optionalDouble","type":["null","double"]},{"name":"requiredDouble","type":"double"},{"name":"optionalLong","type":["null","long"]},{"name":"requiredLong","type":"long"},{"name":"optionalDate","type":["null",{"logicalType":"date","type":"int"}]},{"name":"requiredDate","type":{"logicalType":"date","type":"int"}},{"name":"optionalTimeMs","type":["null",{"logicalType":"time-millis","type":"int"}]},{"name":"requiredTimeMs","type":{"logicalType":"time-millis","type":"int"}},{"name":"optionalTimeMicros","type":["null",{"logicalType":"time-micros","type":"long"}]},{"name":"requiredTimeMicros","type":{"logicalType":"time-micros","type":"long"}},{"name":"optionalTimestampMs","type":["null",{"logicalType":"timestamp-millis","type":"long"}]},{"name":"requiredTimestampMs","type":{"logicalType":"timestamp-millis","type":"long"}},{"name":"optionalTimestampMicros","type":["null",{"logicalType":"timestamp-micros","type":"long"}]},{"name":"requiredTimestampMicros","type":{"logicalType":"timestamp-micros","type":"long"}},{"name":"optionalLocalTimestampMs","type":["null",{"logicalType":"local-timestamp-millis","type":"long"}]},{"name":"requiredLocalTimestampMs","type":{"logicalType":"local-timestamp-millis","type":"long"}},{"name":"optionalLocalTimestampMicros","type":["null",{"logicalType":"local-timestamp-micros","type":"long"}]},{"name":"requiredLocalTimestampMicros","type":{"logicalType":"local-timestamp-micros","type":"long"}},{"name":"optionalUuid","type":["null",{"logicalType":"uuid","type":"string"}]},{"name":"requiredUuid","type":{"logicalType":"uuid","type":"string"}}],"name":"Interface3","type":"record"});

export default function serialize(value: Interface3): Buffer {
    return exactType.toBuffer({
        optionalInt: value.optionalInt === undefined ? null : value.optionalInt,
        requiredInt: value.requiredInt,
        optionalFloat: value.optionalFloat === undefined ? null : value.optionalFloat,
        requiredFloat: value.requiredFloat,
        optionalDouble: value.optionalDouble === undefined ? null : value.optionalDouble,
        requiredDouble: value.requiredDouble,
        optionalLong: value.optionalLong === undefined ? null : value.optionalLong,
        requiredLong: value.requiredLong,
        optionalDate: value.optionalDate === undefined ? null : value.optionalDate,
        requiredDate: value.requiredDate,
        optionalTimeMs: value.optionalTimeMs === undefined ? null : value.optionalTimeMs,
        requiredTimeMs: value.requiredTimeMs,
        optionalTimeMicros: value.optionalTimeMicros === undefined ? null : value.optionalTimeMicros,
        requiredTimeMicros: value.requiredTimeMicros,
        optionalTimestampMs: value.optionalTimestampMs === undefined ? null : value.optionalTimestampMs,
        requiredTimestampMs: value.requiredTimestampMs,
        optionalTimestampMicros: value.optionalTimestampMicros === undefined ? null : value.optionalTimestampMicros,
        requiredTimestampMicros: value.requiredTimestampMicros,
        optionalLocalTimestampMs: value.optionalLocalTimestampMs === undefined ? null : value.optionalLocalTimestampMs,
        requiredLocalTimestampMs: value.requiredLocalTimestampMs,
        optionalLocalTimestampMicros: value.optionalLocalTimestampMicros === undefined ? null : value.optionalLocalTimestampMicros,
        requiredLocalTimestampMicros: value.requiredLocalTimestampMicros,
        optionalUuid: value.optionalUuid === undefined ? null : value.optionalUuid,
        requiredUuid: value.requiredUuid
    });
}