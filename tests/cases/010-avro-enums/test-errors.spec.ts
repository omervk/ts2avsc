import {typeScriptToAvroSchema} from "../../../src/generator/typescript-to-avsc";

describe('error tests', () => {
    it('010 - invalid characters', () => {
        expect(() => typeScriptToAvroSchema(`
        export interface Foo {
            enum: 'test' | '***';
        }
        `)).toThrow(/Unable to translate TypeScript unions that can not directly map to an Avro enum/);
    });

    it('010 - not all strings', () => {
        expect(() => typeScriptToAvroSchema(`
        export interface Foo {
            enum: 'test' | 12;
        }
        `)).toThrow(/Unable to translate TypeScript unions that can not directly map to an Avro enum/);
    });
});