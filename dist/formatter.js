export const formatText = (text, options) => {
    let formattedText = text;
    // 必要なオプションをオンにして処理をまとめる
    const operations = [];
    if (options.convertFullWidthToHalfWidth) {
        operations.push(convertFullWidthToHalfWidth);
    }
    if (options.convertHalfWidthToFullWidth) {
        operations.push(convertHalfWidthToFullWidth);
    }
    if (options.removePunctuationAfterQuotes) {
        operations.push(removePunctuationAfterQuotes);
    }
    if (options.insertSpaceAfterExclamations) {
        operations.push(insertSpaceAfterMixedExclamations);
    }
    if (options.ensureEvenPunctuationCount) {
        operations.push(ensureEvenPunctuationCount);
    }
    if (options.insertSpaceAtLineStart) {
        operations.push(insertSpaceAtLineStart);
    }
    // 各フォーマットを一度に処理する
    for (const operation of operations) {
        formattedText = operation(formattedText);
    }
    return formattedText;
};
// 全角英数字を半角に変換
const convertFullWidthToHalfWidth = (text) => {
    return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
};
// 半角!?()を全角に変換
const convertHalfWidthToFullWidth = (text) => {
    return text.replace(/[!?()]/g, (char) => char === "!" ? "！" : char === "?" ? "？" : char === "(" ? "（" : "）");
};
// 「」『』（）()の終わりにある句読点を削除
const removePunctuationAfterQuotes = (text) => {
    return text.replace(/([「『（\(].*?[」』）\)])/gu, (match) => {
        return match.replace(/([、。\.])([」』）\)])/gu, (innerMatch, punctuation, closingBracket) => {
            return closingBracket; // 句読点を削除して終了記号のみ返す
        });
    });
};
// 行末以外、!?の後に全角スペースを挿入
const insertSpaceAfterMixedExclamations = (text) => {
    return text.replace(/([!！\?？]{1,})(?=\S(?![」』）\)]|$))/gu, (match, p1, offset, string) => {
        const nextCharIndex = offset + p1.length;
        const nextChar = string[nextCharIndex];
        // 行末や閉じ括弧の後にはスペースを挿入しない
        if (nextChar === "\n" ||
            nextChar === "\r" ||
            nextChar === undefined ||
            ["」", "』", "）", ")"].includes(nextChar)) {
            return match;
        }
        return match + "　"; // スペースを挿入
    });
};
// …―の連続が奇数個の場合偶数個にする
const ensureEvenPunctuationCount = (text) => {
    // 連続する…を処理
    text = text.replace(/[…]+/g, (match) => {
        if (match.length % 2 !== 0) {
            return match + "…";
        }
        return match;
    });
    // 次に連続する―を処理
    text = text.replace(/[―]+/g, (match) => {
        if (match.length % 2 !== 0) {
            return match + "―";
        }
        return match;
    });
    return text;
};
// 文頭に全角スペースを挿入（ただし「」『』（）()の文頭は除外）
const insertSpaceAtLineStart = (text) => {
    return text.replace(/^(?![「『（(])./gm, "　$&");
};
