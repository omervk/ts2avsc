import { toRecordType } from '../src/generator/avsc/converter';
import * as avro from '../src/generator/avsc/types';
import writeAvsc from '../src/generator/avsc/writer';
import toAvroSerializer from '../src/generator/avsc-lib/serializer';
import {
  AvroDate,
  AvroDoc,
  AvroDouble,
  AvroFloat,
  AvroInt,
  AvroLocalTimeMicros,
  AvroLocalTimeMillis,
  AvroLong,
  AvroTimeMicros,
  AvroTimeMillis,
  AvroTimestampMicros,
  AvroTimestampMillis,
  AvroUuid,
} from '../src/types/decorators'; // TODO: Document never using the 'import * as x' style
import { ReflectionClass } from '@deepkit/type';

export function typeScriptToAvroSchema<T>(reflection: ReflectionClass<T>): string {
  return writeAvsc(toRecordType<T>(reflection));
}

function typeScriptToSerializerTypeScript<T>(reflection: ReflectionClass<T>, relativePathToTypeScript: string): string {
  return toAvroSerializer(relativePathToTypeScript, toRecordType<T>(reflection));
}

describe('tests', () => {
  describe('empty', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Interface {}

    it('avsc', () => {
      const actualSchema = JSON.parse(typeScriptToAvroSchema<Interface>(ReflectionClass.from<Interface>()));
      const expectedSchema = {
        name: 'Interface',
        fields: [],
        type: 'record',
      };
      expect(actualSchema).toStrictEqual(expectedSchema);
    });

    it('serializer', () => {
      const actualSerializer = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      const expectedSerializer = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({

    });
}`;
      expect(actualSerializer.trim()).toStrictEqual(expectedSerializer.trim());
    });
  });

  describe('inferred property types', () => {
    interface Interface {
      // TODO: Document no longer requiring "export"
      requiredBool: boolean;
      optionalBool?: boolean;

      requiredBytes: Uint8Array; // TODO: Document it's no longer a Buffer
      optionalBytes?: Uint8Array;

      requiredString: string;
      optionalString?: string;

      optionalDouble?: number;
      requiredDouble: number;
    }

    it('avsc', () => {
      const actualSchema = JSON.parse(typeScriptToAvroSchema<Interface>(ReflectionClass.from<Interface>()));
      const expectedSchema = {
        name: 'Interface',
        fields: [
          {
            name: 'requiredBool',
            type: 'boolean',
          },
          {
            name: 'optionalBool',
            type: ['null', 'boolean'],
          },
          {
            name: 'requiredBytes',
            type: 'bytes',
          },
          {
            name: 'optionalBytes',
            type: ['null', 'bytes'],
          },
          {
            name: 'requiredString',
            type: 'string',
          },
          {
            name: 'optionalString',
            type: ['null', 'string'],
          },
          {
            name: 'optionalDouble',
            type: ['null', 'double'],
          },
          {
            name: 'requiredDouble',
            type: 'double',
          },
        ],
        type: 'record',
      };
      expect(actualSchema).toStrictEqual(expectedSchema);
    });

    it('serializer', () => {
      const actualSerializer = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      const expectedSerializer = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"requiredBool","type":"boolean"},{"name":"optionalBool","type":["null","boolean"]},{"name":"requiredBytes","type":"bytes"},{"name":"optionalBytes","type":["null","bytes"]},{"name":"requiredString","type":"string"},{"name":"optionalString","type":["null","string"]},{"name":"optionalDouble","type":["null","double"]},{"name":"requiredDouble","type":"double"}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        requiredBool: value.requiredBool,
        optionalBool: value.optionalBool === undefined ? null : value.optionalBool,
        requiredBytes: value.requiredBytes,
        optionalBytes: value.optionalBytes === undefined ? null : value.optionalBytes,
        requiredString: value.requiredString,
        optionalString: value.optionalString === undefined ? null : value.optionalString,
        optionalDouble: value.optionalDouble === undefined ? null : value.optionalDouble,
        requiredDouble: value.requiredDouble
    });
}`;
      expect(actualSerializer.trim()).toStrictEqual(expectedSerializer.trim());
    });
  });

  describe('decorated property types', () => {
    interface Interface {
      optionalInt?: AvroInt;
      requiredInt: AvroInt;
      optionalFloat?: AvroFloat;
      requiredFloat: AvroFloat;
      optionalDouble?: AvroDouble;
      requiredDouble: AvroDouble;
      optionalLong?: AvroLong;
      requiredLong: AvroLong;
      optionalDate?: AvroDate;
      requiredDate: AvroDate;
      optionalTimeMs?: AvroTimeMillis;
      requiredTimeMs: AvroTimeMillis;
      optionalTimeMicros?: AvroTimeMicros;
      requiredTimeMicros: AvroTimeMicros;
      optionalTimestampMs?: AvroTimestampMillis;
      requiredTimestampMs: AvroTimestampMillis;
      optionalTimestampMicros?: AvroTimestampMicros;
      requiredTimestampMicros: AvroTimestampMicros;
      optionalLocalTimestampMs?: AvroLocalTimeMillis;
      requiredLocalTimestampMs: AvroLocalTimeMillis;
      optionalLocalTimestampMicros?: AvroLocalTimeMicros;
      requiredLocalTimestampMicros: AvroLocalTimeMicros;
      optionalUuid?: AvroUuid;
      requiredUuid: AvroUuid;
    }

    it('avsc', () => {
      const actualSchema = JSON.parse(typeScriptToAvroSchema<Interface>(ReflectionClass.from<Interface>()));
      const expectedSchema = {
        name: 'Interface',
        type: 'record',
        fields: [
          {
            name: 'optionalInt',
            type: ['null', 'int'],
          },
          {
            name: 'requiredInt',
            type: 'int',
          },
          {
            name: 'optionalFloat',
            type: ['null', 'float'],
          },
          {
            name: 'requiredFloat',
            type: 'float',
          },
          {
            name: 'optionalDouble',
            type: ['null', 'double'],
          },
          {
            name: 'requiredDouble',
            type: 'double',
          },
          {
            name: 'optionalLong',
            type: ['null', 'long'],
          },
          {
            name: 'requiredLong',
            type: 'long',
          },
          {
            name: 'optionalDate',
            type: [
              'null',
              {
                logicalType: 'date',
                type: 'int',
              },
            ],
          },
          {
            name: 'requiredDate',
            type: {
              logicalType: 'date',
              type: 'int',
            },
          },
          {
            name: 'optionalTimeMs',
            type: [
              'null',
              {
                logicalType: 'time-millis',
                type: 'int',
              },
            ],
          },
          {
            name: 'requiredTimeMs',
            type: {
              logicalType: 'time-millis',
              type: 'int',
            },
          },
          {
            name: 'optionalTimeMicros',
            type: [
              'null',
              {
                logicalType: 'time-micros',
                type: 'long',
              },
            ],
          },
          {
            name: 'requiredTimeMicros',
            type: {
              logicalType: 'time-micros',
              type: 'long',
            },
          },
          {
            name: 'optionalTimestampMs',
            type: [
              'null',
              {
                logicalType: 'timestamp-millis',
                type: 'long',
              },
            ],
          },
          {
            name: 'requiredTimestampMs',
            type: {
              logicalType: 'timestamp-millis',
              type: 'long',
            },
          },
          {
            name: 'optionalTimestampMicros',
            type: [
              'null',
              {
                logicalType: 'timestamp-micros',
                type: 'long',
              },
            ],
          },
          {
            name: 'requiredTimestampMicros',
            type: {
              logicalType: 'timestamp-micros',
              type: 'long',
            },
          },
          {
            name: 'optionalLocalTimestampMs',
            type: [
              'null',
              {
                logicalType: 'local-timestamp-millis',
                type: 'long',
              },
            ],
          },
          {
            name: 'requiredLocalTimestampMs',
            type: {
              logicalType: 'local-timestamp-millis',
              type: 'long',
            },
          },
          {
            name: 'optionalLocalTimestampMicros',
            type: [
              'null',
              {
                logicalType: 'local-timestamp-micros',
                type: 'long',
              },
            ],
          },
          {
            name: 'requiredLocalTimestampMicros',
            type: {
              logicalType: 'local-timestamp-micros',
              type: 'long',
            },
          },
          {
            name: 'optionalUuid',
            type: [
              'null',
              {
                logicalType: 'uuid',
                type: 'string',
              },
            ],
          },
          {
            name: 'requiredUuid',
            type: {
              logicalType: 'uuid',
              type: 'string',
            },
          },
        ],
      };
      expect(actualSchema).toStrictEqual(expectedSchema);
    });

    it('serializer', () => {
      const actualSerializer = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      const expectedSerializer = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"optionalInt","type":["null","int"]},{"name":"requiredInt","type":"int"},{"name":"optionalFloat","type":["null","float"]},{"name":"requiredFloat","type":"float"},{"name":"optionalDouble","type":["null","double"]},{"name":"requiredDouble","type":"double"},{"name":"optionalLong","type":["null","long"]},{"name":"requiredLong","type":"long"},{"name":"optionalDate","type":["null",{"logicalType":"date","type":"int"}]},{"name":"requiredDate","type":{"logicalType":"date","type":"int"}},{"name":"optionalTimeMs","type":["null",{"logicalType":"time-millis","type":"int"}]},{"name":"requiredTimeMs","type":{"logicalType":"time-millis","type":"int"}},{"name":"optionalTimeMicros","type":["null",{"logicalType":"time-micros","type":"long"}]},{"name":"requiredTimeMicros","type":{"logicalType":"time-micros","type":"long"}},{"name":"optionalTimestampMs","type":["null",{"logicalType":"timestamp-millis","type":"long"}]},{"name":"requiredTimestampMs","type":{"logicalType":"timestamp-millis","type":"long"}},{"name":"optionalTimestampMicros","type":["null",{"logicalType":"timestamp-micros","type":"long"}]},{"name":"requiredTimestampMicros","type":{"logicalType":"timestamp-micros","type":"long"}},{"name":"optionalLocalTimestampMs","type":["null",{"logicalType":"local-timestamp-millis","type":"long"}]},{"name":"requiredLocalTimestampMs","type":{"logicalType":"local-timestamp-millis","type":"long"}},{"name":"optionalLocalTimestampMicros","type":["null",{"logicalType":"local-timestamp-micros","type":"long"}]},{"name":"requiredLocalTimestampMicros","type":{"logicalType":"local-timestamp-micros","type":"long"}},{"name":"optionalUuid","type":["null",{"logicalType":"uuid","type":"string"}]},{"name":"requiredUuid","type":{"logicalType":"uuid","type":"string"}}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        optionalInt: value.optionalInt === undefined ? null : value.optionalInt,
        requiredInt: value.requiredInt,
        optionalFloat: value.optionalFloat === undefined ? null : value.optionalFloat,
        requiredFloat: value.requiredFloat,
        optionalDouble: value.optionalDouble === undefined ? null : value.optionalDouble,
        requiredDouble: value.requiredDouble,
        optionalLong: value.optionalLong === undefined ? null : value.optionalLong,
        requiredLong: value.requiredLong,
        optionalDate: value.optionalDate === undefined ? null : value.optionalDate,
        requiredDate: value.requiredDate,
        optionalTimeMs: value.optionalTimeMs === undefined ? null : value.optionalTimeMs,
        requiredTimeMs: value.requiredTimeMs,
        optionalTimeMicros: value.optionalTimeMicros === undefined ? null : value.optionalTimeMicros,
        requiredTimeMicros: value.requiredTimeMicros,
        optionalTimestampMs: value.optionalTimestampMs === undefined ? null : value.optionalTimestampMs,
        requiredTimestampMs: value.requiredTimestampMs,
        optionalTimestampMicros: value.optionalTimestampMicros === undefined ? null : value.optionalTimestampMicros,
        requiredTimestampMicros: value.requiredTimestampMicros,
        optionalLocalTimestampMs: value.optionalLocalTimestampMs === undefined ? null : value.optionalLocalTimestampMs,
        requiredLocalTimestampMs: value.requiredLocalTimestampMs,
        optionalLocalTimestampMicros: value.optionalLocalTimestampMicros === undefined ? null : value.optionalLocalTimestampMicros,
        requiredLocalTimestampMicros: value.requiredLocalTimestampMicros,
        optionalUuid: value.optionalUuid === undefined ? null : value.optionalUuid,
        requiredUuid: value.requiredUuid
    });
}`;
      expect(actualSerializer.trim()).toStrictEqual(expectedSerializer.trim());
    });
  });

  describe('documentation', () => {
    interface Interface extends AvroDoc<'Information about the interface'> {
      someField: string & AvroDoc<'Information about the field'>;
    }

    it('avsc', () => {
      const actualSchema = JSON.parse(typeScriptToAvroSchema<Interface>(ReflectionClass.from<Interface>()));
      const expectedSchema = {
        doc: 'Information about the interface',
        fields: [
          {
            doc: 'Information about the field',
            name: 'someField',
            type: 'string',
          },
        ],
        name: 'Interface',
        type: 'record',
      };
      expect(actualSchema).toStrictEqual(expectedSchema);
    });

    it('serializer', () => {
      const actualSerializer = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      const expectedSerializer = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"doc":"Information about the interface","fields":[{"doc":"Information about the field","name":"someField","type":"string"}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        someField: value.someField
    });
}`;
      expect(actualSerializer.trim()).toStrictEqual(expectedSerializer.trim());
    });
  });

  describe('literal types', () => {
    interface Interface {
      optionalNull?: null;
      requiredNull: null;

      optionalLitNumber?: 12;
      requiredLitNumber: 34.5;

      optionalLitString?: 'foo';
      requiredLitString: 'bar';

      optionalLitBoolean?: false;
      requiredLitBoolean: true;
    }

    it('avsc', () => {
      const actualSchema = JSON.parse(typeScriptToAvroSchema<Interface>(ReflectionClass.from<Interface>()));
      const expectedSchema = {
        fields: [
          {
            name: 'optionalNull',
            type: 'null',
          },
          {
            name: 'requiredNull',
            type: 'null',
          },
          {
            name: 'optionalLitNumber',
            type: ['null', 'int'],
          },
          {
            name: 'requiredLitNumber',
            type: 'double',
          },
          {
            name: 'optionalLitString',
            type: [
              'null',
              {
                name: 'foo',
                symbols: ['foo'],
                type: 'enum',
              },
            ],
          },
          {
            name: 'requiredLitString',
            type: {
              name: 'bar',
              symbols: ['bar'],
              type: 'enum',
            },
          },
          {
            name: 'optionalLitBoolean',
            type: ['null', 'boolean'],
          },
          {
            name: 'requiredLitBoolean',
            type: 'boolean',
          },
        ],
        name: 'Interface',
        type: 'record',
      };
      expect(actualSchema).toStrictEqual(expectedSchema);
    });

    it('serializer', () => {
      const actualSerializer = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      const expectedSerializer = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"optionalNull","type":"null"},{"name":"requiredNull","type":"null"},{"name":"optionalLitNumber","type":["null","int"]},{"name":"requiredLitNumber","type":"double"},{"name":"optionalLitString","type":["null",{"name":"foo","symbols":["foo"],"type":"enum"}]},{"name":"requiredLitString","type":{"name":"bar","symbols":["bar"],"type":"enum"}},{"name":"optionalLitBoolean","type":["null","boolean"]},{"name":"requiredLitBoolean","type":"boolean"}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        optionalNull: value.optionalNull === undefined ? null : value.optionalNull,
        requiredNull: value.requiredNull,
        optionalLitNumber: value.optionalLitNumber === undefined ? null : value.optionalLitNumber,
        requiredLitNumber: value.requiredLitNumber,
        optionalLitString: value.optionalLitString === undefined ? null : value.optionalLitString,
        requiredLitString: value.requiredLitString,
        optionalLitBoolean: value.optionalLitBoolean === undefined ? null : value.optionalLitBoolean,
        requiredLitBoolean: value.requiredLitBoolean
    });
}`;
      expect(actualSerializer.trim()).toStrictEqual(expectedSerializer.trim());
    });
  });

  describe('arrays', () => {
    type Referenced = {
      z: string;
    };

    interface Interface {
      a: boolean[];
      a2?: boolean[];
      b: Uint8Array[];
      b2?: Uint8Array[];
      c: string[];
      c2?: string[];
      d: number[];
      d2?: number[];
      e: number[][];
      f: Referenced[];
      f2?: Referenced[];

      h: null[];
      i: 34[];
      i2: 34.5[];
      j: 'foo'[];
      k: true[];

      l: AvroInt[];
      m: AvroFloat[];
      n: AvroDouble[];
      o: AvroLong[];
      p: AvroDate[];
      q: AvroTimeMillis[];
      r: AvroTimeMicros[];
      s: AvroTimestampMillis[];
      t: AvroTimestampMicros[];
      u: AvroLocalTimeMillis[];
      v: AvroLocalTimeMicros[];

      // requiredDecimal: AvroDecimal;
      // requiredDecimal2: AvroDecimal<7, 8>;

      w: AvroUuid[];
    }

    it('avsc', () => {
      const actualSchema = JSON.parse(typeScriptToAvroSchema<Interface>(ReflectionClass.from<Interface>()));
      const expectedSchema = {
        fields: [
          {
            name: 'a',
            type: {
              items: 'boolean',
              type: 'array',
            },
          },
          {
            name: 'a2',
            type: [
              'null',
              {
                items: 'boolean',
                type: 'array',
              },
            ],
          },
          {
            name: 'b',
            type: {
              items: 'bytes',
              type: 'array',
            },
          },
          {
            name: 'b2',
            type: [
              'null',
              {
                items: 'bytes',
                type: 'array',
              },
            ],
          },
          {
            name: 'c',
            type: {
              items: 'string',
              type: 'array',
            },
          },
          {
            name: 'c2',
            type: [
              'null',
              {
                items: 'string',
                type: 'array',
              },
            ],
          },
          {
            name: 'd',
            type: {
              items: 'double',
              type: 'array',
            },
          },
          {
            name: 'd2',
            type: [
              'null',
              {
                items: 'double',
                type: 'array',
              },
            ],
          },
          {
            name: 'e',
            type: {
              items: {
                items: 'double',
                type: 'array',
              },
              type: 'array',
            },
          },
          {
            name: 'f',
            type: {
              items: {
                fields: [
                  {
                    name: 'z',
                    type: 'string',
                  },
                ],
                name: 'Referenced',
                type: 'record',
              },
              type: 'array',
            },
          },
          {
            name: 'f2',
            type: [
              'null',
              {
                items: {
                  fields: [
                    {
                      name: 'z',
                      type: 'string',
                    },
                  ],
                  name: 'Referenced',
                  type: 'record',
                },
                type: 'array',
              },
            ],
          },
          {
            name: 'h',
            type: {
              items: 'null',
              type: 'array',
            },
          },
          {
            name: 'i',
            type: {
              items: 'int',
              type: 'array',
            },
          },
          {
            name: 'i2',
            type: {
              items: 'double',
              type: 'array',
            },
          },
          {
            name: 'j',
            type: {
              items: {
                name: 'foo',
                symbols: ['foo'],
                type: 'enum',
              },
              type: 'array',
            },
          },
          {
            name: 'k',
            type: {
              items: 'boolean',
              type: 'array',
            },
          },
          {
            name: 'l',
            type: {
              items: 'int',
              type: 'array',
            },
          },
          {
            name: 'm',
            type: {
              items: 'float',
              type: 'array',
            },
          },
          {
            name: 'n',
            type: {
              items: 'double',
              type: 'array',
            },
          },
          {
            name: 'o',
            type: {
              items: 'long',
              type: 'array',
            },
          },
          {
            name: 'p',
            type: {
              items: {
                logicalType: 'date',
                type: 'int',
              },
              type: 'array',
            },
          },
          {
            name: 'q',
            type: {
              items: {
                logicalType: 'time-millis',
                type: 'int',
              },
              type: 'array',
            },
          },
          {
            name: 'r',
            type: {
              items: {
                logicalType: 'time-micros',
                type: 'long',
              },
              type: 'array',
            },
          },
          {
            name: 's',
            type: {
              items: {
                logicalType: 'timestamp-millis',
                type: 'long',
              },
              type: 'array',
            },
          },
          {
            name: 't',
            type: {
              items: {
                logicalType: 'timestamp-micros',
                type: 'long',
              },
              type: 'array',
            },
          },
          {
            name: 'u',
            type: {
              items: {
                logicalType: 'local-timestamp-millis',
                type: 'long',
              },
              type: 'array',
            },
          },
          {
            name: 'v',
            type: {
              items: {
                logicalType: 'local-timestamp-micros',
                type: 'long',
              },
              type: 'array',
            },
          },
          {
            name: 'w',
            type: {
              items: {
                logicalType: 'uuid',
                type: 'string',
              },
              type: 'array',
            },
          },
        ],
        name: 'Interface',
        type: 'record',
      };
      expect(actualSchema).toStrictEqual(expectedSchema);
    });

    it('serializer', () => {
      const actualSerializer = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      const expectedSerializer = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"a","type":{"items":"boolean","type":"array"}},{"name":"a2","type":["null",{"items":"boolean","type":"array"}]},{"name":"b","type":{"items":"bytes","type":"array"}},{"name":"b2","type":["null",{"items":"bytes","type":"array"}]},{"name":"c","type":{"items":"string","type":"array"}},{"name":"c2","type":["null",{"items":"string","type":"array"}]},{"name":"d","type":{"items":"double","type":"array"}},{"name":"d2","type":["null",{"items":"double","type":"array"}]},{"name":"e","type":{"items":{"items":"double","type":"array"},"type":"array"}},{"name":"f","type":{"items":{"fields":[{"name":"z","type":"string"}],"name":"Referenced","type":"record"},"type":"array"}},{"name":"f2","type":["null",{"items":{"fields":[{"name":"z","type":"string"}],"name":"Referenced","type":"record"},"type":"array"}]},{"name":"h","type":{"items":"null","type":"array"}},{"name":"i","type":{"items":"int","type":"array"}},{"name":"i2","type":{"items":"double","type":"array"}},{"name":"j","type":{"items":{"name":"foo","symbols":["foo"],"type":"enum"},"type":"array"}},{"name":"k","type":{"items":"boolean","type":"array"}},{"name":"l","type":{"items":"int","type":"array"}},{"name":"m","type":{"items":"float","type":"array"}},{"name":"n","type":{"items":"double","type":"array"}},{"name":"o","type":{"items":"long","type":"array"}},{"name":"p","type":{"items":{"logicalType":"date","type":"int"},"type":"array"}},{"name":"q","type":{"items":{"logicalType":"time-millis","type":"int"},"type":"array"}},{"name":"r","type":{"items":{"logicalType":"time-micros","type":"long"},"type":"array"}},{"name":"s","type":{"items":{"logicalType":"timestamp-millis","type":"long"},"type":"array"}},{"name":"t","type":{"items":{"logicalType":"timestamp-micros","type":"long"},"type":"array"}},{"name":"u","type":{"items":{"logicalType":"local-timestamp-millis","type":"long"},"type":"array"}},{"name":"v","type":{"items":{"logicalType":"local-timestamp-micros","type":"long"},"type":"array"}},{"name":"w","type":{"items":{"logicalType":"uuid","type":"string"},"type":"array"}}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        a: value.a,
        a2: value.a2 === undefined ? null : value.a2,
        b: value.b,
        b2: value.b2 === undefined ? null : value.b2,
        c: value.c,
        c2: value.c2 === undefined ? null : value.c2,
        d: value.d,
        d2: value.d2 === undefined ? null : value.d2,
        e: value.e,
        f: value.f.map(value => ({
            z: value.z
        })),
        f2: value.f2 === undefined ? null : value.f2.map(value => ({
            z: value.z
        })),
        h: value.h,
        i: value.i,
        i2: value.i2,
        j: value.j,
        k: value.k,
        l: value.l,
        m: value.m,
        n: value.n,
        o: value.o,
        p: value.p,
        q: value.q,
        r: value.r,
        s: value.s,
        t: value.t,
        u: value.u,
        v: value.v,
        w: value.w
    });
}`;
      expect(actualSerializer.trim()).toStrictEqual(expectedSerializer.trim());
    });
  });

  describe('native avro enums', () => {
    interface Interface {
      enum: 'a' | 'b' | 'c';
      optionalEnum?: 'a' | 'b' | 'c';
      repeatingOptions: 'a' | 'a' | 'b';
      singleOptionRepeating: 'a' | 'a' | 'a';
    }

    it('avsc', () => {
      const actualSchema = JSON.parse(typeScriptToAvroSchema<Interface>(ReflectionClass.from<Interface>()));
      const expectedSchema = {
        fields: [
          {
            name: 'enum',
            type: {
              name: 'a_or_b_or_c',
              symbols: ['a', 'b', 'c'],
              type: 'enum',
            },
          },
          {
            name: 'optionalEnum',
            type: [
              'null',
              {
                name: 'a_or_b_or_c',
                symbols: ['a', 'b', 'c'],
                type: 'enum',
              },
            ],
          },
          {
            name: 'repeatingOptions',
            type: {
              name: 'a_or_b',
              symbols: ['a', 'b'],
              type: 'enum',
            },
          },
          {
            name: 'singleOptionRepeating',
            type: {
              name: 'a',
              symbols: ['a'],
              type: 'enum',
            },
          },
        ],
        name: 'Interface',
        type: 'record',
      };
      expect(actualSchema).toStrictEqual(expectedSchema);
    });

    it('serializer', () => {
      const actualSerializer = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      const expectedSerializer = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"enum","type":{"name":"a_or_b_or_c","symbols":["a","b","c"],"type":"enum"}},{"name":"optionalEnum","type":["null",{"name":"a_or_b_or_c","symbols":["a","b","c"],"type":"enum"}]},{"name":"repeatingOptions","type":{"name":"a_or_b","symbols":["a","b"],"type":"enum"}},{"name":"singleOptionRepeating","type":{"name":"a","symbols":["a"],"type":"enum"}}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        enum: value.enum,
        optionalEnum: value.optionalEnum === undefined ? null : value.optionalEnum,
        repeatingOptions: value.repeatingOptions,
        singleOptionRepeating: value.singleOptionRepeating
    });
}`;
      expect(actualSerializer.trim()).toStrictEqual(expectedSerializer.trim());
    });
  });

  describe('extends and intersections', () => {
    interface Parent1 {
      left: string;
    }

    interface Parent2 {
      right?: boolean;
    }

    interface Interface extends Parent1, Parent2 {}

    it('avsc', () => {
      const actualSchema = JSON.parse(typeScriptToAvroSchema<Interface>(ReflectionClass.from<Interface>()));
      const expectedSchema = {
        fields: [
          {
            name: 'left',
            type: 'string',
          },
          {
            name: 'right',
            type: ['null', 'boolean'],
          },
        ],
        name: 'Interface',
        type: 'record',
      };
      expect(actualSchema).toStrictEqual(expectedSchema);
    });

    it('serializer', () => {
      const actualSerializer = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      const expectedSerializer = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"left","type":"string"},{"name":"right","type":["null","boolean"]}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        left: value.left,
        right: value.right === undefined ? null : value.right
    });
}`;
      expect(actualSerializer.trim()).toStrictEqual(expectedSerializer.trim());
    });
  });

  describe('pick, omit and friends', () => {
    interface ToPick {
      a: string;
      b: boolean;
    }

    interface ToOmit {
      c: number;
      d: Uint8Array;
    }

    interface ToRequire {
      e?: 'test';
    }

    interface ToPartial {
      f: 123;
    }

    interface Interface extends Pick<ToPick, 'a'>, Omit<ToOmit, 'd'>, Required<ToRequire>, Partial<ToPartial> {}

    it('avsc', () => {
      const actualSchema = JSON.parse(typeScriptToAvroSchema<Interface>(ReflectionClass.from<Interface>()));
      const expectedSchema = {
        fields: [
          {
            name: 'a',
            type: 'string',
          },
          {
            name: 'c',
            type: 'double',
          },
          {
            name: 'e',
            type: {
              name: 'test',
              symbols: ['test'],
              type: 'enum',
            },
          },
          {
            name: 'f',
            type: ['null', 'int'],
          },
        ],
        name: 'Interface',
        type: 'record',
      };
      expect(actualSchema).toStrictEqual(expectedSchema);
    });

    it('serializer', () => {
      const actualSerializer = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      const expectedSerializer = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"a","type":"string"},{"name":"c","type":"double"},{"name":"e","type":{"name":"test","symbols":["test"],"type":"enum"}},{"name":"f","type":["null","int"]}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        a: value.a,
        c: value.c,
        e: value.e,
        f: value.f === undefined ? null : value.f
    });
}`;
      expect(actualSerializer.trim()).toStrictEqual(expectedSerializer.trim());
    });
  });
});
