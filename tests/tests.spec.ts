import toAvroSchema from '../src/generator/avsc/converter';
import writeAvsc from '../src/generator/avsc/writer';
import toAvroSerializer from '../src/generator/avsc-lib/serializer';
import { toAst } from '../src/generator/typescript/reflector';
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

  describe('all property types', () => {
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
});
