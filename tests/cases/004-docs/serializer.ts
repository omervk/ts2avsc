import avro from 'avsc';
import { Interface4 } from './input';

const exactType = avro.Type.forSchema({"name":"Interface4","fields":[{"name":"someField","type":"string","doc":"Information about the field"}],"type":"record","doc":"Information about the interface"});

export default function serialize(value: Interface4): Buffer {
    return exactType.toBuffer({
        someField: value.someField
    });
}