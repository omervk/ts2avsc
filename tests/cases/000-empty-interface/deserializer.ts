import avro from 'avsc';
import { EmptyInterface } from './input';

const exactType = avro.Type.forSchema({"name":"EmptyInterface","fields":[],"type":"record"});

export default function deserialize(value: Buffer): EmptyInterface {
    const raw = exactType.fromBuffer(value);
    return {

    };
}