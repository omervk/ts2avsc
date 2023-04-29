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
    const baseCaseDir = `${baseDir}/${$case}`;
    const inputFilePath = `${baseCaseDir}/input.ts`;
    const input = readFileSync(inputFilePath).toString();

    const expectedOutputs = JSON.parse(readFileSync(`${baseCaseDir}/expected.json`).toString());

    allIts.push(
`
    describe('${itName}', () => {
        // Source: ${inputFilePath}
        const inputTypescript = \`
${indent(input, 3)}
        \`;

        it('avsc', () => {
            const actualSchemaMap = typeScriptToAvroSchema(inputTypescript);
            expect(actualSchemaMap.size).toStrictEqual(${expectedOutputs.length});
${expectedOutputs.map(({ name, avsc }) => {
    const expectedAvscPath = `${baseCaseDir}/${avsc}`;
    const expectedAvsc = readFileSync(expectedAvscPath).toString();

    return `
            // Source: ${expectedAvscPath}
            const expectedAvroSchemaFor${name} = 
${indent(JSON.stringify(JSON.parse(expectedAvsc), null, indentation), 4)};
            expect(actualSchemaMap.has("${name}.avsc")).toStrictEqual(true);
            const actualAvroSchemaFor${name} = JSON.parse(actualSchemaMap.get("${name}.avsc")!);
            expect(actualAvroSchemaFor${name}).toStrictEqual(expectedAvroSchemaFor${name});
`;
}).join('')}
        });
        
        it('serializer', () => {
            const actualSerializerMap = typeScriptToSerializerTypeScript(inputTypescript, './input.ts');
            expect(actualSerializerMap.size).toStrictEqual(${expectedOutputs.length});
${expectedOutputs.map(({ name, serializer }) => {
    const expectedSerializerPath = `${baseCaseDir}/${serializer}`;
    const expectedSerializer = readFileSync(expectedSerializerPath).toString();

    return `
            // Source: ${expectedSerializerPath}
            const expectedSerializerFor${name} = \`${expectedSerializer}\`;
            expect(actualSerializerMap.has("${name}.serializer.ts")).toStrictEqual(true);
            const actualSerializerFor${name} = actualSerializerMap.get("${name}.serializer.ts")!;
            expect(actualSerializerFor${name}.trim()).toStrictEqual(expectedSerializerFor${name}.trim());
`;
}).join('')}
        });
    });
`);
});

const testFile = `/*
    -------- THIS IS AN AUTO-GENERATED FILE --------
    It will be rewritten the next time tests are run
*/
import {
    typeScriptToAvroSchema,
    typeScriptToSerializerTypeScript,
} from "../../src/generator/typescript-to-avsc";

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
