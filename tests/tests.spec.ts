import * as fs from "fs";
import {readFileSync} from "fs";
import * as ts from "typescript";
import {toAvroIdl} from "../src/logic/converter";

describe("TypeScript to Avro IDL", () => {
    const baseDir = 'tests/cases';
    const cases = fs.readdirSync(baseDir);
    
    cases.forEach($case => {
        it($case.replace('-', ' '), () => {
            const inputFilePath = `${baseDir}/${$case}/input.ts`;
            const input = readFileSync(inputFilePath).toString();
            const outputFilePath = `${baseDir}/${$case}/output.avdl`;
            const output = readFileSync(outputFilePath).toString();
            const sourceFile = ts.createSourceFile(inputFilePath, input, ts.ScriptTarget.ES5);
            expect(toAvroIdl(sourceFile)).toStrictEqual(output);
        });
    });
});