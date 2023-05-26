export type InterfaceOrType = {
    name: string;
    fields: FieldDeclaration[];
    jsDoc?: string;
}

export type FieldDeclaration = {
    name: string;
    optional: boolean;
    type: Type;
    annotations: string[];
    jsDoc?: string;
}

export type Type = PrimitiveType | LiteralType | StandardType | ReferencedType | ArrayType | UnionType;
export type PrimitiveType = 'number' | 'string' | 'boolean'
export type LiteralType = NullLiteral | BooleanLiteral | StringLiteral | NumberLiteral;
export type StandardType = 'Buffer'; // TODO: Find a better name

export interface Literal {
    readonly kind: string;
}

export class NullLiteral {
    public readonly kind: string = 'null';
}

export class BooleanLiteral {
    public readonly kind: string = 'boolean';

    constructor(public readonly literal: boolean) {
    }
}

export class StringLiteral {
    public readonly kind: string = 'string';

    constructor(public readonly literal: string) {
    }
}

export class NumberLiteral {
    public readonly kind: string = 'number';

    constructor(public readonly literal: number) {
    }
}

export class ReferencedType {
    constructor(public readonly name: string) {
    }
}

export class ArrayType {
    constructor(public readonly itemType: Type) {
    }
}

export class UnionType {
    constructor(public readonly head: Type, public readonly tail: Type[]) {
    }
}