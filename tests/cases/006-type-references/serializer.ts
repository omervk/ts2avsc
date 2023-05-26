import avro from 'avsc';
import { Interface6 } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"optionalInterface","type":["null",{"fields":[{"name":"required","type":"boolean"}],"name":"RefInterface6","type":"record"}]},{"name":"requiredType","type":{"fields":[{"name":"optional","type":["null","boolean"]}],"name":"RefType6","type":"record"}}],"name":"Interface6","type":"record"});

export default function serialize(value: Interface6): Buffer {
    return exactType.toBuffer({
        optionalInterface: value.optionalInterface === undefined ? null : {
            required: value.optionalInterface.required
        },
        requiredType: {
            optional: value.requiredType.optional === undefined ? null : value.requiredType.optional
        }
    });
}