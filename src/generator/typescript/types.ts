export class InterfaceOrType {
  constructor(readonly name: string, readonly fields: FieldDeclaration[], readonly jsDoc?: string) {}
}

export class FieldDeclaration {
  constructor(
    readonly name: string,
    readonly optional: boolean,
    readonly type: Type,
    readonly annotations: string[],
    readonly jsDoc?: string,
  ) {}
}

export type Type =
  | PrimitiveType
  | LiteralType
  | StandardType
  | ReferencedType
  | ArrayType
  | UnionType
  | InterfaceOrType;
export type PrimitiveType = 'number' | 'string' | 'boolean';
export type LiteralType = NullLiteral | BooleanLiteral | StringLiteral | NumberLiteral;
export type StandardType = 'Buffer'; // TODO: Find a better name

export interface Literal<T> {
  readonly kind: string;
  readonly literal: T;
}

export class NullLiteral implements Literal<null> {
  public readonly kind: string = 'null';
  public readonly literal: null = null;
}

export class BooleanLiteral implements Literal<boolean> {
  public readonly kind: string = 'boolean';

  constructor(public readonly literal: boolean) {}
}

export class StringLiteral implements Literal<string> {
  public readonly kind: string = 'string';

  constructor(public readonly literal: string) {}
}

export class NumberLiteral implements Literal<number> {
  public readonly kind: string = 'number';

  constructor(public readonly literal: number) {}
}

export class ReferencedType {
  constructor(public readonly name: string) {}
}

export class ArrayType {
  constructor(public readonly itemType: Type) {}
}

export class UnionType {
  constructor(public readonly head: Type, public readonly tail: Type[]) {}
}
