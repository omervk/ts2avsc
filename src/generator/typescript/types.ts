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

export type Type = 'null' | 'number' | 'string' | 'boolean' | 'Buffer';