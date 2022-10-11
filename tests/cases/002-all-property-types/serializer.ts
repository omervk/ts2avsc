import avro from 'avsc';
import { Interface3 } from './input';

const exactType = avro.Type.forSchema({"name":"Interface3","fields":[{"name":"requiredBool","type":"boolean"},{"name":"optionalBool","type":["null","boolean"]},{"name":"requiredBytes","type":"bytes"},{"name":"optionalBytes","type":["null","bytes"]},{"name":"requiredString","type":"string"},{"name":"optionalString","type":["null","string"]},{"name":"optionalDouble","type":["null","double"]},{"name":"requiredDouble","type":"double"},{"name":"optionalNull","type":"null"},{"name":"requiredNull","type":"null"}],"type":"record"});

export default function serialize(value: Interface3): Buffer {
    return exactType.toBuffer({
        requiredBool: value.requiredBool,
        optionalBool: value.optionalBool ?? null,
        requiredBytes: value.requiredBytes,
        optionalBytes: value.optionalBytes ?? null,
        requiredString: value.requiredString,
        optionalString: value.optionalString ?? null,
        optionalDouble: value.optionalDouble ?? null,
        requiredDouble: value.requiredDouble,
        optionalNull: value.optionalNull ?? null,
        requiredNull: value.requiredNull
    });
}