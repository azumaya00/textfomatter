# jp-novel-formatter

`jp-novel-formatter` は、日本語の小説を横書き形式に合わせてフォーマットするライブラリです。日本語の文章を一般的な整形ルールに基づいて整形し、読みやすくすることができます。

## デモ

[ブラウザで文章を整形する](https://azumaya00.github.io/jp-novel-formatter/)

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

第2引数を省略すると、6項目すべてがオンになります。一部だけ変更したい場合は、その項目だけ指定できます。

```typescript
import { defaultFormatOptions, formatText } from 'jp-novel-formatter';

const text = 'これは「例え話」です。どうぞよろしくお願いします。';
const formattedText = formatText(text, { insertSpaceAtLineStart: false });
console.log(defaultFormatOptions); // 6項目すべて true の初期値
```

`defaultFormatOptions` は読み取り専用です。省略した項目や `undefined` を指定した項目には、この初期値が使われます。

CommonJS から使う場合は `require` で読み込めます。

```javascript
const { formatText } = require('jp-novel-formatter');

const formattedText = formatText('ＡＢＣ１２３', {
  convertFullWidthToHalfWidth: true,
  convertHalfWidthToFullWidth: false,
  removePunctuationAfterQuotes: false,
  insertSpaceAfterExclamations: false,
  ensureEvenPunctuationCount: false,
  insertSpaceAtLineStart: false
});
console.log(formattedText); // ABC123
```

### オプションの詳細

- `convertFullWidthToHalfWidth`: 英数字を全角から半角に変換します。
- `convertHalfWidthToFullWidth`: 特定の記号 (`!?()`) を半角から全角に変換します。
- `removePunctuationAfterQuotes`: 引用符（「」、『』、（））の直前にある句読点を削除します。
- `insertSpaceAfterExclamations`: 行末及び引用符の直前以外で、`!` や `?` の後に全角スペースを挿入します。
- `ensureEvenPunctuationCount`: `…` や `―` の連続が奇数個の場合、偶数個に揃えます。
- `insertSpaceAtLineStart`: 引用符（「」、『』、（））以外で始まる文頭に全角スペースを挿入します。

### 利用上の注意

- `formatText` はテキストを整形するだけで、HTML などのエスケープやサニタイズは行いません。結果を HTML に埋め込む場合は、呼び出し側でエスケープしてください。
- 入力の型は検証しません。JavaScript から呼び出す場合は、`text` に文字列を、`options` を指定するなら対象のキーに真偽値を渡してください。
- 利用者が入力したテキストをサーバー側で整形する場合は、入力の長さに上限を設けてください。

## 1.1.0 での変更点

- Node.js の ESM (`import`) と CommonJS (`require`) の両方に対応しました。
- `formatText` の第2引数を省略できるようになりました。省略した項目はオンになります。
- JavaScript から一部の項目だけを渡していた場合、省略した項目は従来のオフ扱いからオン扱いに変わります。

## ライセンス

MITライセンスで公開されています。
