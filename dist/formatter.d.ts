export interface FormatOptions {
    convertFullWidthToHalfWidth: boolean;
    convertHalfWidthToFullWidth: boolean;
    removePunctuationAfterQuotes: boolean;
    insertSpaceAfterExclamations: boolean;
    ensureEvenPunctuationCount: boolean;
    insertSpaceAtLineStart: boolean;
}
export declare const formatText: (text: string, options: FormatOptions) => string;
//# sourceMappingURL=formatter.d.ts.map