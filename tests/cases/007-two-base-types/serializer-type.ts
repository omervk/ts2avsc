import avro from 'avsc';
import { Type7 } from './input';

const exactType = avro.Type.forSchema({"name":"Type7","fields":[{"name":"str","type":"string"}],"type":"record"});

export default function serialize(value: Type7): Buffer {
    return exactType.toBuffer({
        str: value.str
    });
}