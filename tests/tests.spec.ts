import toAvroSchema from '../src/generator/avsc/converter';
import writeAvsc from '../src/generator/avsc/writer';
import toAvroSerializer from '../src/generator/avsc-lib/serializer';
import { toAst } from '../src/generator/typescript/reflector';
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

export function typeScriptToAvroSchema<T>(reflection: ReflectionClass<T>): Map<string, string> {
  const ast = toAst<T>(reflection);
  const schemas = toAvroSchema(ast);
  return new Map(schemas.map(schema => [`${schema.name}.avsc`, writeAvsc(schema)]));
}

function typeScriptToSerializerTypeScript<T>(reflection: ReflectionClass<T>, relativePathToTypeScript: string) {
  const ast = toAst<T>(reflection);
  const schemas = toAvroSchema(ast);
  return new Map(
    schemas.map(schema => [`${schema.name}.serializer.ts`, toAvroSerializer(relativePathToTypeScript, schema)]),
  );
}

describe('tests', () => {
  describe('empty', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface EmptyInterface {}

    it('avsc', () => {
      const actualSchemaMap = typeScriptToAvroSchema<EmptyInterface>(ReflectionClass.from<EmptyInterface>());
      expect(actualSchemaMap.size).toStrictEqual(1);

      const expectedAvroSchemaForEmptyInterface = {
        name: 'EmptyInterface',
        fields: [],
        type: 'record',
      };
      expect(actualSchemaMap.has('EmptyInterface.avsc')).toStrictEqual(true);
      const actualAvroSchemaForEmptyInterface = JSON.parse(actualSchemaMap.get('EmptyInterface.avsc')!);
      expect(actualAvroSchemaForEmptyInterface).toStrictEqual(expectedAvroSchemaForEmptyInterface);
    });

    it('serializer', () => {
      const actualSerializerMap = typeScriptToSerializerTypeScript(
        ReflectionClass.from<EmptyInterface>(),
        './input.ts',
      );
      expect(actualSerializerMap.size).toStrictEqual(1);

      // Source: tests/cases/000-empty-interface/serializer.ts
      const expectedSerializerForEmptyInterface = `import avro from 'avsc';
import { EmptyInterface } from './input';

const exactType = avro.Type.forSchema({"fields":[],"name":"EmptyInterface","type":"record"});

export default function serialize(value: EmptyInterface): Buffer {
    return exactType.toBuffer({

    });
}`;
      expect(actualSerializerMap.has('EmptyInterface.serializer.ts')).toStrictEqual(true);
      const actualSerializerForEmptyInterface = actualSerializerMap.get('EmptyInterface.serializer.ts')!;
      expect(actualSerializerForEmptyInterface.trim()).toStrictEqual(expectedSerializerForEmptyInterface.trim());
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
      const actualSchemaMap = typeScriptToAvroSchema<Interface>(ReflectionClass.from<Interface>());
      expect(actualSchemaMap.size).toStrictEqual(1);

      const expectedAvroSchemaForEmptyInterface = {
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
      expect(actualSchemaMap.has('Interface.avsc')).toStrictEqual(true);
      const actualAvroSchemaForEmptyInterface = JSON.parse(actualSchemaMap.get('Interface.avsc')!);
      expect(actualAvroSchemaForEmptyInterface).toStrictEqual(expectedAvroSchemaForEmptyInterface);
    });

    it('serializer', () => {
      const actualSerializerMap = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      expect(actualSerializerMap.size).toStrictEqual(1);

      const expectedSerializerForInterface = `import avro from 'avsc';
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
      expect(actualSerializerMap.has('Interface.serializer.ts')).toStrictEqual(true);
      const actualSerializerForEmptyInterface = actualSerializerMap.get('Interface.serializer.ts')!;
      expect(actualSerializerForEmptyInterface.trim()).toStrictEqual(expectedSerializerForInterface.trim());
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
      const reflection = ReflectionClass.from<Interface>();
      const actualSchemaMap = typeScriptToAvroSchema<Interface>(reflection);
      expect(actualSchemaMap.size).toStrictEqual(1);

      const expectedAvroSchemaForEmptyInterface = {
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
      expect(actualSchemaMap.has('Interface.avsc')).toStrictEqual(true);
      const actualAvroSchemaForEmptyInterface = JSON.parse(actualSchemaMap.get('Interface.avsc')!);
      expect(actualAvroSchemaForEmptyInterface).toStrictEqual(expectedAvroSchemaForEmptyInterface);
    });

    it('serializer', () => {
      const actualSerializerMap = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      expect(actualSerializerMap.size).toStrictEqual(1);

      const expectedSerializerForInterface = `import avro from 'avsc';
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
      expect(actualSerializerMap.has('Interface.serializer.ts')).toStrictEqual(true);
      const actualSerializerForEmptyInterface = actualSerializerMap.get('Interface.serializer.ts')!;
      expect(actualSerializerForEmptyInterface.trim()).toStrictEqual(expectedSerializerForInterface.trim());
    });
  });

  describe('documentation', () => {
    interface Interface extends AvroDoc<'Information about the interface'> {
      someField: string & AvroDoc<'Information about the field'>;
    }

    it('avsc', () => {
      const reflection = ReflectionClass.from<Interface>();
      const actualSchemaMap = typeScriptToAvroSchema<Interface>(reflection);
      expect(actualSchemaMap.size).toStrictEqual(1);

      const expectedAvroSchemaForEmptyInterface = {
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
      expect(actualSchemaMap.has('Interface.avsc')).toStrictEqual(true);
      const actualAvroSchemaForEmptyInterface = JSON.parse(actualSchemaMap.get('Interface.avsc')!);
      expect(actualAvroSchemaForEmptyInterface).toStrictEqual(expectedAvroSchemaForEmptyInterface);
    });

    it('serializer', () => {
      const actualSerializerMap = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      expect(actualSerializerMap.size).toStrictEqual(1);

      const expectedSerializerForInterface = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"doc":"Information about the interface","fields":[{"doc":"Information about the field","name":"someField","type":"string"}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        someField: value.someField
    });
}`;
      expect(actualSerializerMap.has('Interface.serializer.ts')).toStrictEqual(true);
      const actualSerializerForEmptyInterface = actualSerializerMap.get('Interface.serializer.ts')!;
      expect(actualSerializerForEmptyInterface.trim()).toStrictEqual(expectedSerializerForInterface.trim());
    });
  });

  describe('literal types', () => {
    interface Interface {
      optionalNull?: null;
      requiredNull: null;

      optionalLitNumber?: 12;
      requiredLitNumber: 34;

      optionalLitString?: 'foo';
      requiredLitString: 'bar';

      optionalLitBoolean?: false;
      requiredLitBoolean: true;
    }

    it('avsc', () => {
      const reflection = ReflectionClass.from<Interface>();
      const actualSchemaMap = typeScriptToAvroSchema<Interface>(reflection);
      expect(actualSchemaMap.size).toStrictEqual(1);

      const expectedAvroSchemaForEmptyInterface = {
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
            type: ['null', 'double'],
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
      expect(actualSchemaMap.has('Interface.avsc')).toStrictEqual(true);
      const actualAvroSchemaForEmptyInterface = JSON.parse(actualSchemaMap.get('Interface.avsc')!);
      expect(actualAvroSchemaForEmptyInterface).toStrictEqual(expectedAvroSchemaForEmptyInterface);
    });

    it('serializer', () => {
      const actualSerializerMap = typeScriptToSerializerTypeScript(ReflectionClass.from<Interface>(), './input.ts');
      expect(actualSerializerMap.size).toStrictEqual(1);

      const expectedSerializerForInterface = `import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"optionalNull","type":"null"},{"name":"requiredNull","type":"null"},{"name":"optionalLitNumber","type":["null","double"]},{"name":"requiredLitNumber","type":"double"},{"name":"optionalLitString","type":["null",{"name":"foo","symbols":["foo"],"type":"enum"}]},{"name":"requiredLitString","type":{"name":"bar","symbols":["bar"],"type":"enum"}},{"name":"optionalLitBoolean","type":["null","boolean"]},{"name":"requiredLitBoolean","type":"boolean"}],"name":"Interface","type":"record"});

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
      expect(actualSerializerMap.has('Interface.serializer.ts')).toStrictEqual(true);
      const actualSerializerForEmptyInterface = actualSerializerMap.get('Interface.serializer.ts')!;
      expect(actualSerializerForEmptyInterface.trim()).toStrictEqual(expectedSerializerForInterface.trim());
    });
  });
});
