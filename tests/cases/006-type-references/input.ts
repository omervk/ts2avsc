export interface Interface6 {
    optionalInterface?: RefInterface6;
    requiredType: RefType6;
}

export interface RefInterface6 {
    required: boolean;
}

export type RefType6 = {
    optional?: boolean;
}