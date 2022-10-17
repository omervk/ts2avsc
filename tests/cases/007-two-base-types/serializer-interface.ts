import avro from 'avsc';
import { Interface7 } from './input';

const exactType = avro.Type.forSchema({"name":"Interface7","fields":[{"name":"num","type":"double"}],"type":"record"});

export default function serialize(value: Interface7): Buffer {
    return exactType.toBuffer({
        num: value.num
    });
}