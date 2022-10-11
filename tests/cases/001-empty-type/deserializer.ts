import avro from 'avsc';
import { EmptyType } from './input';

const exactType = avro.Type.forSchema({"name":"EmptyType","fields":[],"type":"record"});

export default function deserialize(value: Buffer): EmptyType {
    const raw = exactType.fromBuffer(value);
    return {

    };
}