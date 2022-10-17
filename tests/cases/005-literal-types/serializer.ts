import avro from 'avsc';
import { Interface5 } from './input';

const exactType = avro.Type.forSchema({"name":"Interface5","fields":[{"name":"optionalNull","type":"null"},{"name":"requiredNull","type":"null"},{"name":"optionalLitNumber","type":["null","double"]},{"name":"requiredLitNumber","type":"double"},{"name":"optionalLitString","type":["null","string"]},{"name":"requiredLitString","type":"string"},{"name":"optionalLitBoolean","type":["null","boolean"]},{"name":"requiredLitBoolean","type":"boolean"}],"type":"record"});

export default function serialize(value: Interface5): Buffer {
    return exactType.toBuffer({
        optionalNull: value.optionalNull === undefined ? null : value.optionalNull,
        requiredNull: value.requiredNull,
        optionalLitNumber: value.optionalLitNumber === undefined ? null : value.optionalLitNumber,
        requiredLitNumber: value.requiredLitNumber,
        optionalLitString: value.optionalLitString === undefined ? null : value.optionalLitString,
        requiredLitString: value.requiredLitString,
        optionalLitBoolean: value.optionalLitBoolean === undefined ? null : value.optionalLitBoolean,
        requiredLitBoolean: value.requiredLitBoolean
    });
}