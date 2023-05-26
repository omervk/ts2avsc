import avro from 'avsc';
import { Interface2 } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"requiredBool","type":"boolean"},{"name":"optionalBool","type":["null","boolean"]},{"name":"requiredBytes","type":"bytes"},{"name":"optionalBytes","type":["null","bytes"]},{"name":"requiredString","type":"string"},{"name":"optionalString","type":["null","string"]},{"name":"optionalDouble","type":["null","double"]},{"name":"requiredDouble","type":"double"}],"name":"Interface2","type":"record"});

export default function serialize(value: Interface2): Buffer {
    return exactType.toBuffer({
        requiredBool: value.requiredBool,
        optionalBool: value.optionalBool === undefined ? null : value.optionalBool,
        requiredBytes: value.requiredBytes,
        optionalBytes: value.optionalBytes === undefined ? null : value.optionalBytes,
        requiredString: value.requiredString,
        optionalString: value.optionalString === undefined ? null : value.optionalString,
        optionalDouble: value.optionalDouble === undefined ? null : value.optionalDouble,
        requiredDouble: value.requiredDouble
    });
}