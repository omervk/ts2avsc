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
    const expectedAvscPath = `${baseDir}/${$case}/output.avsc`;
    const expectedSerializerPath = `${baseDir}/${$case}/serializer.ts`;
    const expectedDeserializerPath = `${baseDir}/${$case}/deserializer.ts`;
    const input = readFileSync(inputFilePath).toString();
    const expectedAvsc = readFileSync(expectedAvscPath).toString();
    const expectedSerializer = readFileSync(expectedSerializerPath).toString();
    const expectedDeserializer = readFileSync(expectedDeserializerPath).toString();

    allIts.push(
`
    describe('${itName}', () => {
        // Source: ${inputFilePath}
        const inputTypescript = \`
${indent(input, 3)}
        \`;

        it('avsc', () => {
            // Source: ${expectedAvscPath}
            const expectedAvroSchema = 
${indent(JSON.stringify(JSON.parse(expectedAvsc), null, indentation), 4)};
            const actualAvroSchema = JSON.parse(typeScriptToAvroSchema(inputTypescript));
            expect(actualAvroSchema).toStrictEqual(expectedAvroSchema);
        });
        
        it('serializer', () => {
            // Source: ${expectedSerializerPath}
            const expectedSerializer = \`${expectedSerializer}\`;

            const actualSerializer = typeScriptToSerializerTypeScript(inputTypescript, './input.ts');
            expect(actualSerializer).toStrictEqual(expectedSerializer);
        });
        
        it('deserializer', () => {
            // Source: ${expectedDeserializerPath}
            const expectedDeserializer = \`${expectedDeserializer}\`;

            const actualSerializer = typeScriptToDeserializerTypeScript(inputTypescript, './input.ts');
            expect(actualSerializer).toStrictEqual(expectedDeserializer);
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
    typeScriptToDeserializerTypeScript,
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