export interface Interface2 {
    requiredBool: boolean;
    optionalBool?: boolean;
    
    requiredBytes: Buffer;
    optionalBytes?: Buffer;
    
    requiredString: string;
    optionalString?: string;
    
    optionalDouble?: number;
    requiredDouble: number;
}
