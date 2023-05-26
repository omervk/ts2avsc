import avro from 'avsc';
import { Interface5 } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"optionalNull","type":"null"},{"name":"requiredNull","type":"null"},{"name":"optionalLitNumber","type":["null","double"]},{"name":"requiredLitNumber","type":"double"},{"name":"optionalLitString","type":["null",{"name":"foo","symbols":["foo"],"type":"enum"}]},{"name":"requiredLitString","type":{"name":"bar","symbols":["bar"],"type":"enum"}},{"name":"optionalLitBoolean","type":["null","boolean"]},{"name":"requiredLitBoolean","type":"boolean"}],"name":"Interface5","type":"record"});

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