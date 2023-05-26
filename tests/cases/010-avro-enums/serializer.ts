import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"enum","type":{"name":"a_or_b_or_c","symbols":["a","b","c"],"type":"enum"}},{"name":"optionalEnum","type":["null",{"name":"a_or_b_or_c","symbols":["a","b","c"],"type":"enum"}]},{"name":"repeatingOptions","type":{"name":"a_or_b","symbols":["a","b"],"type":"enum"}},{"name":"singleOptionRepeating","type":{"name":"a","symbols":["a"],"type":"enum"}}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        enum: value.enum,
        optionalEnum: value.optionalEnum === undefined ? null : value.optionalEnum,
        repeatingOptions: value.repeatingOptions,
        singleOptionRepeating: value.singleOptionRepeating
    });
}