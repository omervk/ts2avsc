import avro from 'avsc';
import { Interface3 } from './input';

const exactType = avro.Type.forSchema({"name":"Interface3","fields":[{"name":"requiredBool","type":"boolean"},{"name":"optionalBool","type":["null","boolean"]},{"name":"requiredBytes","type":"bytes"},{"name":"optionalBytes","type":["null","bytes"]},{"name":"requiredString","type":"string"},{"name":"optionalString","type":["null","string"]},{"name":"optionalDouble","type":["null","double"]},{"name":"requiredDouble","type":"double"},{"name":"optionalNull","type":"null"},{"name":"requiredNull","type":"null"}],"type":"record"});

export default function deserialize(value: Buffer): Interface3 {
    const raw = exactType.fromBuffer(value);
    return {
        requiredBool: raw.requiredBool,
        optionalBool: raw.optionalBool ?? undefined,
        requiredBytes: raw.requiredBytes,
        optionalBytes: raw.optionalBytes ?? undefined,
        requiredString: raw.requiredString,
        optionalString: raw.optionalString ?? undefined,
        optionalDouble: raw.optionalDouble ?? undefined,
        requiredDouble: raw.requiredDouble,
        optionalNull: raw.optionalNull ?? undefined,
        requiredNull: raw.requiredNull
    };
}