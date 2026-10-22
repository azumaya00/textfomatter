import { formatText } from "../dist/esm/index.js";

const text = document.getElementById("text");
const status = document.getElementById("status");
const optionIds = [
  "convertFullWidthToHalfWidth",
  "convertHalfWidthToFullWidth",
  "removePunctuationAfterQuotes",
  "insertSpaceAfterExclamations",
  "ensureEvenPunctuationCount",
  "insertSpaceAtLineStart",
];

document.getElementById("formatButton").addEventListener("click", () => {
  const options = Object.fromEntries(
    optionIds.map((id) => [id, document.getElementById(id).checked]),
  );
  text.value = formatText(text.value, options);
  status.textContent = "整形しました";
});

document.getElementById("copyButton").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(text.value);
    status.textContent = "コピーしました";
  } catch {
    status.textContent = "コピーできませんでした。文章を選択してコピーしてください。";
  }
});

document.getElementById("clearButton").addEventListener("click", () => {
  text.value = "";
  status.textContent = "文章を空にしました";
  text.focus();
});
