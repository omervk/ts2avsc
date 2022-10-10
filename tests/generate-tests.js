const {readFileSync, writeFileSync, readdirSync, mkdirSync } = require("fs");

const indentation = '    ';

function indent(s, tabCount) {
    const whitespace = indentation.repeat(tabCount);
    return whitespace + s.replace(/\n/g, '\n' + whitespace)
}

const baseDir = 'tests/cases';
const cases = readdirSync(baseDir);

const allIts = [];

cases.forEach($case => {
    const itName = $case.replace(/-/g, ' ');
    const inputFilePath = `${baseDir}/${$case}/input.ts`;
    const expectedFilePath = `${baseDir}/${$case}/output.avsc`;
    const output = readFileSync(expectedFilePath).toString();
    const input = readFileSync(inputFilePath).toString();
    
    allIts.push(
`
    it('${itName}', () => {
        // Source: ${inputFilePath}
        const inputTypescript = \`
${indent(input, 3)}
        \`;
        // Source: ${expectedFilePath}
        const expectedAvroSchema = 
${indent(JSON.stringify(JSON.parse(output), null, indentation), 3)};
        const actualAvroSchema = JSON.parse(typescriptToAvroSchema(inputTypescript));
        expect(actualAvroSchema).toStrictEqual(expectedAvroSchema);
    });
`);
});

const testFile = `/*
    -------- THIS IS AN AUTO-GENERATED FILE --------
    It will be rewritten the next time tests are run
*/
import typescriptToAvroSchema from "../../src/logic/typescript-to-avsc";

describe('TypeScript to Avro Schema', () => {
${allIts.join('')}
});
`;

try {
    mkdirSync('tests/generated');
} catch (err) {
    if (err.code !== 'EEXIST') {
        throw err;
    }
}
writeFileSync('tests/generated/all-tests.spec.ts', testFile);