import { formatText } from "../src/formatter";

interface FormatOptions {
  convertFullWidthToHalfWidth: boolean;
  convertHalfWidthToFullWidth: boolean;
  removePunctuationAfterQuotes: boolean;
  insertSpaceAfterExclamations: boolean;
  ensureEvenPunctuationCount: boolean;
  insertSpaceAtLineStart: boolean;
}

// デフォルトオプション
const defaultOptions: FormatOptions = {
  convertFullWidthToHalfWidth: false,
  convertHalfWidthToFullWidth: false,
  removePunctuationAfterQuotes: false,
  insertSpaceAfterExclamations: false,
  ensureEvenPunctuationCount: false,
  insertSpaceAtLineStart: false,
};

// ヘルパー関数でオプションを簡単にカスタマイズ
const createOptions = (
  overrides: Partial<FormatOptions> = {}
): FormatOptions => ({
  ...defaultOptions,
  ...overrides,
});

describe("formatText - 単体テスト", () => {
  it("convertFullWidthToHalfWidth: 全角英数字を半角に変換する", () => {
    const input = "ＡＢＣ１２３";
    const options = createOptions({ convertFullWidthToHalfWidth: true });
    expect(formatText(input, options)).toBe("ABC123");
  });

  it("convertHalfWidthToFullWidth: 半角!?()を全角に変換する", () => {
    const input = "Hello!? (World)";
    const options = createOptions({ convertHalfWidthToFullWidth: true });
    expect(formatText(input, options)).toBe("Hello！？ （World）");
  });

  it("convertHalfWidthToFullWidth: 複数の!?()が正しく変換される", () => {
    const input = "!?!?()!?";
    const options = createOptions({ convertHalfWidthToFullWidth: true });
    expect(formatText(input, options)).toBe("！？！？（）！？");
  });

  it("removePunctuationAfterQuotes: 「」の後の句読点を削除する", () => {
    const input = "「こんにちは。」";
    const options = createOptions({ removePunctuationAfterQuotes: true });
    expect(formatText(input, options)).toBe("「こんにちは」");
  });

  it("removePunctuationAfterQuotes: 『』の後の句読点を削除する", () => {
    const input = "『ありがとう、世界。』";
    const options = createOptions({ removePunctuationAfterQuotes: true });
    expect(formatText(input, options)).toBe("『ありがとう、世界』");
  });

  it("removePunctuationAfterQuotes: （）の後の句読点を削除する", () => {
    const input = "（よろしくお願いします。）";
    const options = createOptions({ removePunctuationAfterQuotes: true });
    expect(formatText(input, options)).toBe("（よろしくお願いします）");
  });

  it("removePunctuationAfterQuotes: ()の後の句読点を削除する", () => {
    const input = "(Please check this out.)";
    const options = createOptions({ removePunctuationAfterQuotes: true });
    expect(formatText(input, options)).toBe("(Please check this out)");
  });

  it("removePunctuationAfterQuotes: 全ての対象記号に対応している", () => {
    const input = "「こんにちは、」『ありがとう。』（よろしく。）(Check this.)";
    const options = createOptions({ removePunctuationAfterQuotes: true });
    expect(formatText(input, options)).toBe(
      "「こんにちは」『ありがとう』（よろしく）(Check this)"
    );
  });

  it("insertSpaceAfterExclamations: 行末以外の半角!や?の後に全角スペースを挿入する", () => {
    const input = "Hello!How are you?";
    const options = createOptions({ insertSpaceAfterExclamations: true });
    expect(formatText(input, options)).toBe("Hello!　How are you?");
  });

  it("insertSpaceAfterExclamations: 連続する半角!や?に正しくスペースを挿入する", () => {
    const input = "Hello!!??Wow!";
    const options = createOptions({ insertSpaceAfterExclamations: true });
    expect(formatText(input, options)).toBe("Hello!!??　Wow!");
  });

  it("insertSpaceAfterExclamations: 連続する全角!や?に正しくスペースを挿入する", () => {
    const input = "こんにちは！！？？さようなら！";
    const options = createOptions({ insertSpaceAfterExclamations: true });
    expect(formatText(input, options)).toBe("こんにちは！！？？　さようなら！");
  });

  it("insertSpaceAfterExclamations: 半角と全角が混在する場合も正しくスペースを挿入する", () => {
    const input = "Hello!！?？Wow!";
    const options = createOptions({ insertSpaceAfterExclamations: true });
    expect(formatText(input, options)).toBe("Hello!！?？　Wow!");
  });

  it("insertSpaceAfterExclamations: 閉じ括弧とその他が混在している場合を処理する", () => {
    const input = "「こんにちは！？」！！さようなら！";
    const options = createOptions({ insertSpaceAfterExclamations: true });
    expect(formatText(input, options)).toBe(
      "「こんにちは！？」！！　さようなら！"
    );
  });

  it("insertSpaceAfterExclamations: 全角記号のみの場合", () => {
    const input = "こんにちは！ありがとう？さようなら！";
    const options = createOptions({ insertSpaceAfterExclamations: true });
    expect(formatText(input, options)).toBe(
      "こんにちは！　ありがとう？　さようなら！"
    );
  });

  it("insertSpaceAfterExclamations: 半角記号のみの場合", () => {
    const input = "Hello!How?Wow!";
    const options = createOptions({ insertSpaceAfterExclamations: true });
    expect(formatText(input, options)).toBe("Hello!　How?　Wow!");
  });

  it("ensureEvenPunctuationCount: 奇数個の…や―を偶数個に揃える", () => {
    const input = "……―………";
    const options = createOptions({ ensureEvenPunctuationCount: true });
    expect(formatText(input, options)).toBe("……――…………");
  });

  it("ensureEvenPunctuationCount: 偶数個の場合は変更しない", () => {
    const input = "……――……";
    const options = createOptions({ ensureEvenPunctuationCount: true });
    expect(formatText(input, options)).toBe("……――……");
  });

  it("ensureEvenPunctuationCount: 単独の…や―も正しく処理する", () => {
    const input = "…―";
    const options = createOptions({ ensureEvenPunctuationCount: true });
    expect(formatText(input, options)).toBe("……――");
  });

  it("insertSpaceAtLineStart: 文頭に全角スペースを挿入する", () => {
    const input = "こんにちは\n世界";
    const options = createOptions({ insertSpaceAtLineStart: true });
    expect(formatText(input, options)).toBe("　こんにちは\n　世界");
  });

  it("insertSpaceAtLineStart: 引用符や括弧の文頭にはスペースを挿入しない", () => {
    const input = "「こんにちは」\n『ありがとう』\n（よろしく）\n(Check this)";
    const options = createOptions({ insertSpaceAtLineStart: true });
    expect(formatText(input, options)).toBe(
      "「こんにちは」\n『ありがとう』\n（よろしく）\n(Check this)"
    );
  });

  it("insertSpaceAtLineStart: 全ての行が対象になる", () => {
    const input = "行1\n行2\n行3";
    const options = createOptions({ insertSpaceAtLineStart: true });
    expect(formatText(input, options)).toBe("　行1\n　行2\n　行3");
  });

  it("異常系: 空文字を処理する", () => {
    const input = "";
    const options = createOptions();
    expect(formatText(input, options)).toBe("");
  });

  it("異常系: 整形不要な文字列をそのまま返す", () => {
    const input = "Hello World";
    const options = createOptions();
    expect(formatText(input, options)).toBe("Hello World");
  });

  it("異常系: 整形対象がない場合もエラーにならない", () => {
    const input = "純粋なテキスト";
    const options = createOptions({ removePunctuationAfterQuotes: true });
    expect(formatText(input, options)).toBe("純粋なテキスト");
  });
});
