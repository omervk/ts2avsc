import avro from 'avsc';
import { Interface5 } from './input';

const exactType = avro.Type.forSchema({"name":"Interface5","fields":[{"name":"optionalNull","type":"null"},{"name":"requiredNull","type":"null"},{"name":"optionalLitNumber","type":["null","double"]},{"name":"requiredLitNumber","type":"double"},{"name":"optionalLitString","type":["null","string"]},{"name":"requiredLitString","type":"string"},{"name":"optionalLitBoolean","type":["null","boolean"]},{"name":"requiredLitBoolean","type":"boolean"}],"type":"record"});

export default function serialize(value: Interface5): Buffer {
    return exactType.toBuffer({
        optionalNull: value.optionalNull ?? null,
        requiredNull: value.requiredNull,
        optionalLitNumber: value.optionalLitNumber ?? null,
        requiredLitNumber: value.requiredLitNumber,
        optionalLitString: value.optionalLitString ?? null,
        requiredLitString: value.requiredLitString,
        optionalLitBoolean: value.optionalLitBoolean ?? null,
        requiredLitBoolean: value.requiredLitBoolean
    });
}