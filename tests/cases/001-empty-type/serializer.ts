import avro from 'avsc';
import { EmptyType } from './input';

const exactType = avro.Type.forSchema({"fields":[],"name":"EmptyType","type":"record"});

export default function serialize(value: EmptyType): Buffer {
    return exactType.toBuffer({

    });
}