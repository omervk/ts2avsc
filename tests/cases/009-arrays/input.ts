import {
    AvroDate,
    AvroDouble,
    AvroFloat,
    AvroInt, AvroLocalTimeMicros, AvroLocalTimeMillis,
    AvroLong,
    AvroTimeMicros,
    AvroTimeMillis, AvroTimestampMicros, AvroTimestampMillis, AvroUuid
} from "../../../src/types/index";

export type Referenced = {
    z: string;
}

export interface Interface {
    a: boolean[];
    a2?: boolean[];
    b: Buffer[];
    b2?: Buffer[];
    c: string[];
    c2?: string[];
    d: number[];
    d2?: number[];
    e: number[][];
    f: Referenced[];
    f2?: Referenced[];

    // @avro local-timestamp-micros
    g: number[];

    // @avro local-timestamp-micros
    g2?: number[];

    h: null[];
    i: 34[];
    j: 'foo'[];
    k: true[];

    l: AvroInt[];
    m: AvroFloat[];
    n: AvroDouble[];
    o: AvroLong[];
    p: AvroDate[];
    q: AvroTimeMillis[];
    r: AvroTimeMicros[];
    s: AvroTimestampMillis[];
    t: AvroTimestampMicros[];
    u: AvroLocalTimeMillis[];
    v: AvroLocalTimeMicros[];

    // requiredDecimal: AvroDecimal;
    // requiredDecimal2: AvroDecimal<7, 8>;

    w: AvroUuid[];
}
