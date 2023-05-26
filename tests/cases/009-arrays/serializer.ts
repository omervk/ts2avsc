import avro from 'avsc';
import { Interface } from './input';

const exactType = avro.Type.forSchema({"fields":[{"name":"a","type":{"items":"boolean","type":"array"}},{"name":"a2","type":["null",{"items":"boolean","type":"array"}]},{"name":"b","type":{"items":"bytes","type":"array"}},{"name":"b2","type":["null",{"items":"bytes","type":"array"}]},{"name":"c","type":{"items":"string","type":"array"}},{"name":"c2","type":["null",{"items":"string","type":"array"}]},{"name":"d","type":{"items":"double","type":"array"}},{"name":"d2","type":["null",{"items":"double","type":"array"}]},{"name":"e","type":{"items":{"items":"double","type":"array"},"type":"array"}},{"name":"f","type":{"items":{"fields":[{"name":"z","type":"string"}],"name":"Referenced","type":"record"},"type":"array"}},{"name":"f2","type":["null",{"items":{"fields":[{"name":"z","type":"string"}],"name":"Referenced","type":"record"},"type":"array"}]},{"name":"g","type":{"items":{"logicalType":"local-timestamp-micros","type":"long"},"type":"array"}},{"name":"g2","type":["null",{"items":{"logicalType":"local-timestamp-micros","type":"long"},"type":"array"}]},{"name":"h","type":{"items":"null","type":"array"}},{"name":"i","type":{"items":"double","type":"array"}},{"name":"j","type":{"items":"string","type":"array"}},{"name":"k","type":{"items":"boolean","type":"array"}},{"name":"l","type":{"items":"int","type":"array"}},{"name":"m","type":{"items":"float","type":"array"}},{"name":"n","type":{"items":"double","type":"array"}},{"name":"o","type":{"items":"long","type":"array"}},{"name":"p","type":{"items":{"logicalType":"date","type":"int"},"type":"array"}},{"name":"q","type":{"items":{"logicalType":"time-millis","type":"int"},"type":"array"}},{"name":"r","type":{"items":{"logicalType":"time-micros","type":"long"},"type":"array"}},{"name":"s","type":{"items":{"logicalType":"timestamp-millis","type":"long"},"type":"array"}},{"name":"t","type":{"items":{"logicalType":"timestamp-micros","type":"long"},"type":"array"}},{"name":"u","type":{"items":{"logicalType":"local-timestamp-millis","type":"long"},"type":"array"}},{"name":"v","type":{"items":{"logicalType":"local-timestamp-micros","type":"long"},"type":"array"}},{"name":"w","type":{"items":{"logicalType":"uuid","type":"string"},"type":"array"}}],"name":"Interface","type":"record"});

export default function serialize(value: Interface): Buffer {
    return exactType.toBuffer({
        a: value.a,
        a2: value.a2 === undefined ? null : value.a2,
        b: value.b,
        b2: value.b2 === undefined ? null : value.b2,
        c: value.c,
        c2: value.c2 === undefined ? null : value.c2,
        d: value.d,
        d2: value.d2 === undefined ? null : value.d2,
        e: value.e,
        f: value.f.map(value => ({
            z: value.z
        })),
        f2: value.f2 === undefined ? null : value.f2.map(value => ({
            z: value.z
        })),
        g: value.g,
        g2: value.g2 === undefined ? null : value.g2,
        h: value.h,
        i: value.i,
        j: value.j,
        k: value.k,
        l: value.l,
        m: value.m,
        n: value.n,
        o: value.o,
        p: value.p,
        q: value.q,
        r: value.r,
        s: value.s,
        t: value.t,
        u: value.u,
        v: value.v,
        w: value.w
    });
}