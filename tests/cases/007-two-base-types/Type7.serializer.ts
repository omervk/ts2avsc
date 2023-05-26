import avro from 'avsc';
import { Type7 } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"str","type":"string"}],"name":"Type7","type":"record"});

export default function serialize(value: Type7): Buffer {
    return exactType.toBuffer({
        str: value.str
    });
}