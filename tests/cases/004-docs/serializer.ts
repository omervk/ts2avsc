import avro from 'avsc';
import { Interface4 } from './input';

const exactType = avro.Type.forSchema({"doc":"Information about the interface","fields":[{"doc":"Information about the field","name":"someField","type":"string"}],"name":"Interface4","type":"record"});

export default function serialize(value: Interface4): Buffer {
    return exactType.toBuffer({
        someField: value.someField
    });
}