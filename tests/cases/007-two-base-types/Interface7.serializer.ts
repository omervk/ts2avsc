import avro from 'avsc';
import { Interface7 } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"num","type":"double"}],"name":"Interface7","type":"record"});

export default function serialize(value: Interface7): Buffer {
    return exactType.toBuffer({
        num: value.num
    });
}