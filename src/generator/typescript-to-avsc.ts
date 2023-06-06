import { toRecordType } from './avsc/converter';
import writeAvsc from './avsc/writer';
import toAvroSerializer from './avsc-lib/serializer';
import { ReflectionClass } from '@deepkit/type';

export function typeScriptToAvroSchema<T>(reflection: ReflectionClass<T>): string {
  return writeAvsc(toRecordType<T>(reflection));
}

export function typeScriptToSerializerTypeScript<T>(
  reflection: ReflectionClass<T>,
  relativePathToTypeScript: string,
): string {
  return toAvroSerializer(relativePathToTypeScript, toRecordType<T>(reflection));
}
