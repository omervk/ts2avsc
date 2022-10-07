const {readFileSync, writeFileSync, readdirSync} = require("fs");

const baseDir = 'tests/cases';
const cases = readdirSync(baseDir);

const allIts = [];

cases.forEach($case => {
    const itName = $case.replace(/-/g, ' ');
    const inputFilePath = `${baseDir}/${$case}/input.ts`;
    const output = readFileSync(`${baseDir}/${$case}/output.avdl`).toString();
    
    allIts.push(
`
    it('${itName}', () => {
        const inputFilePath = '${inputFilePath}';
        const outputAvdl = \`${output}\`;
        expect(toAvroIdl(inputFilePath)).toStrictEqual(outputAvdl);
    });
`);
});

const testFile = `/*
    -------- THIS IS AN AUTO-GENERATED FILE --------
    It will be rewritten the next time tests are run
*/
import {toAvroIdl} from "../src/logic/converter";

describe('TypeScript to Avro IDL', () => {
${allIts.join('')}
});
`;

writeFileSync('tests/all-tests.spec.ts', testFile);