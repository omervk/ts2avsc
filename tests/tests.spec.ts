import * as fs from "fs";
import {readFileSync} from "fs";
import * as ts from "typescript";
import {toAvroIdl} from "../src/logic/converter";

describe("TypeScript to Avro IDL", () => {
    const baseDir = 'tests/cases';
    const cases = fs.readdirSync(baseDir);
    
    cases.forEach($case => {
        it($case.replace(/-/g, ' '), () => {
            const inputFilePath = `${baseDir}/${$case}/input.ts`;
            const outputFilePath = `${baseDir}/${$case}/output.avdl`;
            const output = readFileSync(outputFilePath).toString();
            expect(toAvroIdl(inputFilePath)).toStrictEqual(output);
        });
    });
});