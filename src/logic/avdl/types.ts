export type ProtocolDeclaration = {
    name: string;
    declarations: (RecordDeclaration)[];
}

export type RecordDeclaration = {
    namespace?: string;
    name: string;
    fields: FieldDeclaration[];
}

export type FieldDeclaration = {
    type: Type;
    name: string;
    defaultValue: undefined | any;
}

export type Type = ArrayType | MapType | UnionType | NullableType;

export class ArrayType {
    readonly itemType: Type;
    
    constructor(itemType: Type) {
        this.itemType = itemType;
    }
}

export class MapType {
    readonly itemType: Type;

    constructor(itemType: Type) {
        this.itemType = itemType;
    }
}

export class UnionType {
    readonly types: Type[];
    
    constructor(head: Type, ...rest: Type[]) {
        this.types = [head, ...rest];
    }
}

export type NullableType = {
    nullable: boolean;
    type: PrimitiveType/* TODO: | ReferenceType */;
}

export type PrimitiveType = 'boolean' | 'bytes' | 'int' | 'string' | 'float' | 'double' | 'long' | 'null' | 'date' |
    'time_ms' | 'timestamp_ms'| 'local_timestamp_ms' | DecimalType | 'uuid';

export class DecimalType {
    readonly precision: number;
    readonly scale: number;
    
    constructor(precision: number, scale: number) {
        this.precision = precision;
        this.scale = scale;
    }
}
