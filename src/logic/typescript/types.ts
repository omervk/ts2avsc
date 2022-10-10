export type InterfaceOrType = {
    name: string;
    fields: FieldDeclaration[];
}

export type FieldDeclaration = {
    name: string;
    optional: boolean;
    type: Type;
    annotations: string[];
}

export type Type = 'null' | 'number' | 'string' | 'boolean' | 'Buffer';