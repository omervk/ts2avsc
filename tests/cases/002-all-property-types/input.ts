export interface Interface3 {
    requiredBool: boolean;
    optionalBool?: boolean;
    
    requiredBytes: Buffer;
    optionalBytes?: Buffer;
    
    requiredString: string;
    optionalString?: string;
    
    optionalDouble?: number;
    requiredDouble: number;
}
