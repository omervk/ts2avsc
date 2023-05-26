import * as avsc from "./types";
import stringify from "safe-stable-stringify";

function replacer(key: string, value: any) {
    if (value instanceof avsc.Union) {
        return value.types.length > 1 ? value.types : value.types[0];
    }

    return value;
}

export default function writeAvsc(schema: avsc.Schema): string {
    return stringify(schema, replacer)!;
}