import * as ts from "typescript";
import {readFileSync} from "fs";
import {toAvroIdl} from "./logic/converter";

// const fileName = "src/example.ts";
// const contents = readFileSync(fileName).toString();
// const sourceFile = ts.createSourceFile(fileName, contents, ts.ScriptTarget.ES5);
// console.log(toAvroIdl(sourceFile));