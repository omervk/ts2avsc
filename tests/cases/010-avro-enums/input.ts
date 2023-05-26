export interface Interface {
    enum: 'a' | 'b' | 'c';
    optionalEnum?: 'a' | 'b' | 'c';
    repeatingOptions: 'a' | 'a' | 'b';
    singleOptionRepeating: 'a' | 'a' | 'a';
}
