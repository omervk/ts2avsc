import * as avsc from './types';
import stringify from 'safe-stable-stringify';

function replacer(key: string, value: unknown) {
  if (value instanceof avsc.Union) {
    return value.types.length > 1 ? value.types : value.types[0];
  }

  return value;
}

export default function writeAvsc(schema: avsc.Schema): string {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return stringify(schema, replacer)!;
}
