import avro from 'avsc';
import { Interface4 } from './input';

const exactType = avro.Type.forSchema({"name":"Interface4","fields":[{"name":"someField","type":"string","doc":"Information about the field"}],"type":"record","doc":"Information about the interface"});

export default function deserialize(value: Buffer): Interface4 {
    const raw = exactType.fromBuffer(value);
    return {
        someField: raw.someField
    };
}