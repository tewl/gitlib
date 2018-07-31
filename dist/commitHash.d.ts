export declare class CommitHash {
    static fromString(hash: string): CommitHash | undefined;
    private _hash;
    private constructor();
    toString(): string;
    toShortString(): string;
}