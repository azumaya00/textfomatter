# jp-novel-formatter

`jp-novel-formatter` は、日本語の小説を横書き形式に合わせてフォーマットするライブラリです。日本語の文章を一般的な整形ルールに基づいて整形し、読みやすくすることができます。

## インストール

npm からインストールできます。

```
npm install jp-novel-formatter
```

## 使い方

インポートして使用します。

```typescript
import { formatText } from 'jp-novel-formatter';

const text = 'これは「例え話」です。どうぞよろしくお願いします。';
const options = {
  convertFullWidthToHalfWidth: true,
  convertHalfWidthToFullWidth: false,
  removePunctuationAfterQuotes: true,
  insertSpaceAfterExclamations: true,
  ensureEvenPunctuationCount: true,
  insertSpaceAtLineStart: true
};

const formattedText = formatText(text, options);
console.log(formattedText);
```

### オプションの詳細

- `convertFullWidthToHalfWidth`: 英数字を全角から半角に変換します。
- `convertHalfWidthToFullWidth`: 特定の記号 (`!?()`) を半角から全角に変換します。
- `removePunctuationAfterQuotes`: 引用符（「」、『』、（））の直前にある句読点を削除します。
- `insertSpaceAfterExclamations`: 行末及び引用符の直前以外で、`!` や `?` の後に全角スペースを挿入します。
- `ensureEvenPunctuationCount`: `…` や `―` の連続が奇数個の場合、偶数個に揃えます。
- `insertSpaceAtLineStart`: 引用符（「」、『』、（））以外で始まる文頭に全角スペースを挿入します。

## ライセンス

MITライセンスで公開されています。