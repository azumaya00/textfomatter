export interface FormatOptions {
  convertFullWidthToHalfWidth: boolean; // 英数字を全角から半角に変換
  convertHalfWidthToFullWidth: boolean; // !?()を半角から全角に変換
  removePunctuationAfterQuotes: boolean; // 「」『』（）()の終わりにある句読点を削除
  insertSpaceAfterExclamations: boolean; // 行末以外の!?の後に全角スペースを挿入
  ensureEvenPunctuationCount: boolean; // …―の連続が奇数個の場合偶数個にする
  insertSpaceAtLineStart: boolean; // 文頭に全角スペースを挿入
}

export const formatText = (text: string, options: FormatOptions): string => {
  let formattedText = text;

  if (options.convertFullWidthToHalfWidth) {
    formattedText = convertFullWidthToHalfWidth(formattedText);
  }
  if (options.convertHalfWidthToFullWidth) {
    formattedText = convertHalfWidthToFullWidth(formattedText);
  }
  if (options.removePunctuationAfterQuotes) {
    formattedText = removePunctuationAfterQuotes(formattedText);
  }
  if (options.insertSpaceAfterExclamations) {
    formattedText = insertSpaceAfterMixedExclamations(formattedText);
  }
  if (options.ensureEvenPunctuationCount) {
    formattedText = ensureEvenPunctuationCount(formattedText);
  }
  if (options.insertSpaceAtLineStart) {
    formattedText = insertSpaceAtLineStart(formattedText);
  }

  return formattedText;
};

// 英数字を全角から半角に変換
const convertFullWidthToHalfWidth = (text: string): string => {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  );
};

// !?()を半角から全角に変換
const convertHalfWidthToFullWidth = (text: string): string => {
  return text.replace(/[!?()]/g, (char) =>
    char === "!" ? "！" : char === "?" ? "？" : char === "(" ? "（" : "）"
  );
};

// 「」『』（）()の終わりにある句読点を削除
const removePunctuationAfterQuotes = (text: string): string => {
  return text.replace(/([「『（\(].*?[」』）\)])/gu, (match) => {
    // 終了記号の前に句読点（、。やピリオド）がある場合、それを削除
    const cleaned = match.replace(
      /([、。\.])([」』）\)])/gu,
      (innerMatch, punctuation, closingBracket) => {
        return closingBracket; // 句読点を削除して終了記号のみ返す
      }
    );
    return cleaned;
  });
};

// 行末以外、!?の後に全角スペースを挿入
const insertSpaceAfterMixedExclamations = (text: string): string => {
  const regex = /([!！\?？]{1,})(?![」』）\)]|$|　)/gu;
  let match: RegExpExecArray | null;

  // 正規表現でマッチする部分を探す
  while ((match = regex.exec(text)) !== null) {

    const nextCharIndex = match.index + match[0].length;
    const nextChar =
      nextCharIndex < text.length ? text[nextCharIndex] : undefined;

    // 次の文字が改行、復帰、閉じ括弧、または閉じ括弧の後であればスペースを追加しない
    if (
      nextChar === "\n" ||
      nextChar === "\r" ||
      nextChar === undefined ||
      ["」", "』", "）", ")"].includes(nextChar) ||
      ["？", "」"].includes(nextChar)
    ) {
      continue;
    }

    // 正常な場合はスペースを挿入
    text = text.slice(0, nextCharIndex) + "　" + text.slice(nextCharIndex);
  }

  return text;
};

// …―の連続が奇数個の場合偶数個にする
const ensureEvenPunctuationCount = (text: string): string => {
  // まず連続する…を処理
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
const insertSpaceAtLineStart = (text: string): string => {
  return text.replace(/^(?![「『（(])./gm, "　$&");
};
