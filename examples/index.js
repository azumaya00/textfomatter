import { formatText } from "../dist/formatter.js"; // formatter.js をインポート

// ボタンが取得できているか確認
const formatButton = document.getElementById("formatButton");
console.log("Format Button:", formatButton);

if (formatButton) {
  formatButton.addEventListener("click", () => {
    console.log("Format button clicked!");

    // 入力テキストを取得
    const inputText = document.getElementById("inputText")?.value;
    console.log("Input Text:", inputText);

    // チェックボックスの状態からオプションを設定
    const options = {
      convertFullWidthToHalfWidth: document.getElementById("convertFullWidthToHalfWidth")?.checked,
      convertHalfWidthToFullWidth: document.getElementById("convertHalfWidthToFullWidth")?.checked,
      removePunctuationAfterQuotes: document.getElementById("removePunctuationAfterQuotes")?.checked,
      insertSpaceAfterExclamations: document.getElementById("insertSpaceAfterExclamations")?.checked,
      ensureEvenPunctuationCount: document.getElementById("ensureEvenPunctuationCount")?.checked,
      insertSpaceAtLineStart: document.getElementById("insertSpaceAtLineStart")?.checked,
    };
    console.log("Options:", options);

    // フォーマットを実行
    try {
      const formattedText = formatText(inputText, options);
      console.log("Formatted Text:", formattedText);

      // 結果を出力テキストエリアに表示
      const outputTextArea = document.getElementById("outputText");
      if (outputTextArea) {
        outputTextArea.value = formattedText;
        console.log("Output updated.");
      } else {
        console.error("Output text area not found.");
      }
    } catch (error) {
      console.error("Error during formatting:", error);
    }
  });
} else {
  console.error("Format button not found.");
}
