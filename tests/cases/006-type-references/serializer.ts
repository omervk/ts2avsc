import avro from 'avsc';
import { Interface6 } from './input';

const exactType = avro.Type.forSchema({"name":"Interface6","fields":[{"name":"optionalInterface","type":["null",{"name":"RefInterface6","fields":[{"name":"required","type":"boolean"}],"type":"record"}]},{"name":"requiredType","type":{"name":"RefType6","fields":[{"name":"optional","type":["null","boolean"]}],"type":"record"}}],"type":"record"});

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