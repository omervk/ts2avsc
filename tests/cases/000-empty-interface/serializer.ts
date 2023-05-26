import avro from 'avsc';
import { EmptyInterface } from './input';

const exactType = avro.Type.forSchema({"fields":[],"name":"EmptyInterface","type":"record"});

export default function serialize(value: EmptyInterface): Buffer {
    return exactType.toBuffer({

    });
}