#!/usr/bin/env node

import {Command} from "commander";
import * as fs from "fs";
import {typeScriptToAvroSchema, typeScriptToSerializerTypeScript} from "./generator/typescript-to-avsc";
import path from "path";
const { version } = require('../package.json');
import stringify from "safe-stable-stringify";

const program = new Command();

program
    .name('ts2avsc')
    .description('Convert a TypeScript file to a set of Avro Schemas and/or Serializers')
    .version(version)
    .argument('<source.ts>', 'The typescript file containing the type definitions')
    .argument('[target-directory]', 'The directory in which to place the output files', '.')
    .option('--no-schemas', 'Generate schemas')
    .option('--pretty', 'Pretty print Schema files')
    .option('--serializers', 'Generate serializers');

program.parse(process.argv);

const options = program.opts();
const [sourceTs, targetDir] = program.processedArgs;

if (!sourceTs.toLowerCase().endsWith('.ts')) {
    console.error(`Source ${sourceTs} is not a TypeScript file. Please use a file with the .ts suffix.`);
    process.exit(1);
}

let typeScriptContents: string;

try {
    typeScriptContents = fs.readFileSync(sourceTs).toString();
} catch (e: any) {
    console.error(`Unable to read from file at ${sourceTs}: ${e.toString()}`);
    process.exit(2);
}

if (options.schemas) {
    console.log('- Writing schemas...');
    typeScriptToAvroSchema(typeScriptContents).forEach((contents, schemaFileName) => {
        const prettyContents = options.pretty ? stringify(JSON.parse(contents), undefined, 2)! : contents;
        console.log(`  + Writing ${schemaFileName}...`);
        fs.writeFileSync(path.join(targetDir, schemaFileName), prettyContents);
    });
}

if (options.serializers) {
    console.log('- Writing serializers...');
    const relativePathToTypeScript = path.relative(targetDir, sourceTs);
    typeScriptToSerializerTypeScript(typeScriptContents, relativePathToTypeScript).forEach((contents, tsFileName) => {
        console.log(`  + Writing ${tsFileName}...`);
        fs.writeFileSync(path.join(targetDir, tsFileName), contents);
    });
}

console.log('All done!');