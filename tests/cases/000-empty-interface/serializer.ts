import avro from 'avsc';
import { EmptyInterface } from './input';

const exactType = avro.Type.forSchema({"name":"EmptyInterface","fields":[],"type":"record"});

export default function serialize(value: EmptyInterface): Buffer {
    return exactType.toBuffer({

    });
}