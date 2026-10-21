# セキュリティ監査報告 jp-novel-formatter 1.0.2

監査日: 2026-10-21
対象: `main` ブランチ (5ecf63e) と作業ツリー

## 1. ライブラリの概要

| 項目 | 内容 |
| --- | --- |
| 用途 | 日本語小説テキストを横書き向けに整形する純粋な文字列変換 |
| 公開 API | `formatText(text: string, options: FormatOptions): string` と型 `FormatOptions` のみ (`src/index.ts` → `src/formatter.ts`) |
| 実行時依存 | なし (`dependencies` 未定義) |
| 開発依存 | typescript, jest, ts-jest, @types/*, live-server, npm-run-all |
| 配布方法 | npm レジストリ (`npm install jp-novel-formatter`)。CI/CD なし、手動 publish |
| 利用環境 | ブラウザ (examples) と Node.js。ビルドは ESM (`module: ESNext`) |
| 想定利用者 | 小説投稿・編集ツール、Web フォーム、サーバー側テキスト整形処理 |

`formatText` は入力文字列に正規表現置換を順に適用して返すだけで、ファイル・ネットワーク・プロセス・`eval`・動的コード実行・HTML 生成・認証認可・秘密情報の扱いは一切ない。

### 監査対象外 (実装に存在しない機能)

- 認証・認可処理 (観点 3)
- ファイル・ネットワーク操作 (観点 4)。ただし開発用スクリプト `live-server` は 5.5 で扱う
- SQL / コマンド / テンプレート等のインジェクション経路 (観点 2)。出力先がない

## 2. 責任分界

| 区分 | ライブラリが保証すべきこと | 呼び出し側が責任を持つこと |
| --- | --- | --- |
| 計算量 | 入力長に対して実用的な時間で終わること (ReDoS を起こさない) | 入力サイズの上限設定、タイムアウト、ワーカー分離 |
| 入力型 | 型定義どおりの入力で例外を出さないこと | JS から呼ぶ場合に string と全キーを持つ options を渡すこと |
| 出力の安全性 | 入力にない危険な文字列を生成しないこと (挿入するのは全角スペース・全角記号・`…` `―` `—` のみ) | 出力を HTML / SQL 等へ埋め込む際のエスケープ。本ライブラリはサニタイザではない |
| 配布物 | 公開パッケージに不要・機密なファイルを含めないこと | 依存バージョンの固定と更新 |

## 3. 指摘事項一覧

| ID | 深刻度 | 概要 | 場所 |
| --- | --- | --- | --- |
| F-1 | 中 (サーバー利用時) / 低 (ブラウザ利用時) | `removePunctuationAfterQuotes` の正規表現が二乗時間になる (ReDoS) | `src/formatter.ts:59` |
| F-2 | 低 | 公開パッケージにテスト・デバッグスクリプト・examples 等が含まれる。publish 前のビルド・テストが強制されない | `package.json`, `.gitignore:5` |
| F-3 | 低 | 入力型の検証がなく、JS 呼び出しで型外の値を渡すと例外または型外の値がそのまま返る | `src/formatter.ts:10-41` |
| F-4 | 情報 | 出力はエスケープされない (仕様どおり。呼び出し側責任の明記を推奨) | `README.md` |
| F-5 | 情報 | 開発用 `live-server` が既定で 0.0.0.0 にバインドし LAN へ公開される | `package.json` scripts.serve |
| F-6 | 情報 (機能不具合) | ビルド成果物が Node.js でそのまま読み込めない可能性 | `tsconfig.json`, `dist/index.js` |

## 4. 詳細

### F-1 `removePunctuationAfterQuotes` の二乗時間正規表現

- 該当: `src/formatter.ts:59`
  ```ts
  text.replace(/([「『（\(].*?[」』）\)])/gu, ...)
  ```
- 内容と根拠: 開き括弧ごとに `.*?` が行末まで閉じ括弧を探す。閉じ括弧のない開き括弧が 1 行に n 個並ぶと、各位置で O(n) 走査が起き全体で O(n²) になる。`.` は改行にマッチしないため、1 行の長さが効く。
- 実測 (Node 22, ローカル):

  | 入力 (`「` の繰り返し、改行なし) | 処理時間 |
  | --- | --- |
  | 5,000 文字 | 49 ms |
  | 10,000 文字 | 284 ms |
  | 20,000 文字 | 797 ms |

  二乗で外挿すると 20 万文字で 80 秒前後。同じ長さの通常テキスト (テストの Performance Test) では問題にならない。
- 悪用可能となる条件: `removePunctuationAfterQuotes: true` で、攻撃者が制御できる長い 1 行テキストを入力上限なしにサーバー側 (Node.js のメインスレッド) で処理している場合。
- 影響を受ける利用方法: 投稿 API・Web フォームのバックエンドでの整形。イベントループが塞がり、他リクエストも止まる (DoS)。ブラウザで利用者自身の入力を整形する用途では、自分のタブが固まるだけで影響は小さい。
- 推奨修正: 正規表現のバックトラックをやめ、行単位の線形走査に置き換える。「直前 (同じ行内) に未対応の開き括弧があるとき、閉じ括弧の直前の `、` `。` `.` を削除する」という現行の意味を保ったまま O(n) にできる。
- 互換性への影響: なし (出力は現行と同一を目標とする。既存テストで確認)。
- 回帰テスト: 必要。既存の `removePunctuationAfterQuotes` テストの維持に加え、`"「".repeat(100000)` などが一定時間 (例: 1 秒) 内に終わるテストを追加する。
- 呼び出し側の対策 (修正までの暫定): 入力長の上限設定、Worker での実行。

### F-2 公開パッケージの内容と publish 手順

- 該当: `package.json` (`files` 未定義、`prepublishOnly` なし)、`.gitignore:5` (`/dist` を無視)
- 内容と根拠: `npm pack --dry-run` の結果、以下が公開物に含まれる。
  - 必要: `dist/*`, `package.json`, `README.md`
  - 不要: `__tests__/formatter.test.ts`, `debugRegex.ts`, `examples/*`, `src/*`, `tsconfig.json`

  秘密情報は含まれていない (git 履歴にもトークン・鍵の痕跡なし)。ただし `files` がないため、将来 `.env` やメモ類を作業ディレクトリに置いたまま publish すると混入する。また `dist/formatter.*` は `.gitignore` 対象なのに git 管理下にあり、`dist/index.*` は管理外という不整合がある。publish 前にビルドとテストを走らせる仕組みもなく、`src` と食い違う古い `dist` を公開する恐れがある。
- 悪用可能となる条件: 作業ディレクトリに機密ファイルがある状態で手動 publish した場合。
- 影響を受ける利用方法: npm 利用者全員 (配布物の汚染・肥大)。
- 推奨修正:
  - `package.json` に `"files": ["dist"]` を追加 (README と package.json は自動で含まれる)
  - `"prepublishOnly": "npm run build && npm test"` を追加
  - `dist/` を git 管理から外す (`git rm --cached`) か、`.gitignore` 側を整理して方針を統一
  - npm アカウントの 2FA (publish 時必須) を確認
- 互換性への影響: なし (`dist` 以外を import している利用者は想定されない)。
- 回帰テスト: 不要。修正後に `npm pack --dry-run` で同梱物を確認する。

### F-3 入力型の検証なし

- 該当: `src/formatter.ts:10-41`
- 内容と根拠: TypeScript の型以外に検証がない。JS から呼ぶと以下になる。
  - `text` が非文字列で何らかのオプションが true → `text.replace is not a function` の TypeError
  - `text` が非文字列で全オプション false → 非文字列がそのまま返る (戻り値の型が崩れる)
  - `options` が `null` / `undefined` → TypeError
  - 例外メッセージに入力内容や内部情報は含まれず、情報漏洩はない (観点 9)
- 悪用可能となる条件: 呼び出し側が `req.body.text` などを型確認せずに渡し、例外を処理していない場合にリクエスト単位のエラーになる。セキュリティ上の影響は小さい。
- 影響を受ける利用方法: JS からの利用、JSON 由来の値をそのまま渡す利用。
- 推奨修正: 呼び出し側責任として README に明記する。ライブラリ側で対処するなら、先頭で `typeof text !== "string"` のとき `TypeError` を投げる。
- 互換性への影響: 型検証を入れると「全オプション false で非文字列がそのまま返る」挙動が変わる。型定義上は不正な使い方なので実質的な破壊はないが、マイナーバージョンでの告知を推奨。
- 回帰テスト: 型検証を入れる場合は必要。

### F-4 出力のエスケープ

- 内容: `formatText` は入力に含まれる `<script>` 等をそのまま返す。追加する文字は全角スペースと特定記号のみで、新たな危険文字列は生成しない。
- 評価: ライブラリの欠陥ではない。`examples/index.js:34` は `textarea.value` に代入しており安全。
- 推奨: README に「HTML に埋め込む場合は呼び出し側でエスケープすること」を一文追加。互換性影響なし、テスト不要。

### F-5 開発サーバーのバインド先

- 該当: `package.json` scripts `serve` (`live-server --open=examples`)
- 内容: `node_modules/live-server/index.js:134` で既定ホストが `0.0.0.0`。`npm run dev` 中はリポジトリルート全体 (node_modules を含む) が同一ネットワークから閲覧できる。
- 影響: 開発者環境のみ。公開パッケージ利用者には影響しない。
- 推奨: `live-server --host=127.0.0.1 --open=examples`。互換性影響なし。

### F-6 ビルド成果物の形式 (参考)

- 内容: `tsconfig.json` が `module: ESNext` で、`dist/index.js` は `export * from './formatter'` (拡張子なし)。`package.json` に `"type": "module"` がないため、Node.js からは `require` でも `import` でもそのまま読み込めない可能性が高い。バンドラ経由やブラウザ直読みでは動く。
- 評価: セキュリティ問題ではないが、観点 7 (ビルド成果物) の確認で見つかったため記録する。修正は配布形式の変更を伴うので別途判断が必要。

## 5. 依存パッケージ

### 5.1 実行時依存

なし。利用者のアプリに推移的依存は入らない。

### 5.2 開発依存

| パッケージ | 利用経路 | 評価 |
| --- | --- | --- |
| typescript 5.7.2 | `npm run build` | 公開物は tsc の出力のみ |
| jest 29.7.0 / ts-jest 29.2.5 | `npm test` | ローカル実行のみ |
| live-server 1.2.2 | `npm run serve` / `dev` | 2019 年以降更新がなく、推移的依存に古いパッケージを含む。F-5 のとおり LAN 公開される |
| npm-run-all 4.1.5 | `npm run dev` | 保守停止。2018 年に `flatmap-stream` 事件の経路になった前例がある (現行版は該当しない) |

いずれも開発時のみ使われ、公開パッケージには含まれない。成立条件は「開発者のマシンで dev スクリプトを動かすこと」に限られる。

### 5.3 npm audit 結果 (2026-10-21 実行)

51 件 (critical 2 / high 37 / moderate 10 / low 2)。すべて開発依存の推移的依存で、公開パッケージには含まれない。

| 経路 | 主な該当 | 実際の利用経路と成立条件 | 評価 |
| --- | --- | --- | --- |
| live-server → faye-websocket → websocket-driver | critical: 圧縮メッセージによる資源制限回避、長さヘッダ悪用 | `npm run serve` 中のライブリロード用 WebSocket に、外部から接続できる場合に成立する。既定の 0.0.0.0 バインドでは同じ LAN の第三者が開発サーバーを停止させられた | F-5 の修正で接続元が自マシンに限られ、成立条件はほぼなくなった |
| live-server → morgan / on-headers / http-auth / uuid | moderate: ログ偽装、ヘッダ操作 | live-server の HTTP 層。上と同じく外部からの接続が前提 | F-5 で緩和 |
| live-server → chokidar 2 → micromatch / braces / anymatch / readdirp | high: ReDoS | ファイル監視のパターンは live-server 内部の固定値で、外部入力は入らない | 実害なし |
| npm-run-all → shell-quote | critical: `quote()` の改行未エスケープ、`parse()` の二乗時間 | 引数は package.json の `watch serve` という固定値で、攻撃者は入力できない | 実害なし |
| jest / ts-jest / @types/jest → micromatch, picomatch, minimatch, brace-expansion, js-yaml, babel 等 | high: ReDoS、プロトタイプ汚染、sourceMappingURL 経由のファイル読み取り | テスト実行時のみ動く。glob パターンと設定は開発者が書いたもの。読み込むのは自リポジトリのファイルだけ | 実害なし |

推奨対応 (本計画の範囲外。依存更新のため別途承認が必要):

- `npm audit fix` (メジャー更新なし) で多くは解消する。package-lock.json は .gitignore の対象なので、各開発者の環境で実行する必要がある
- jest 29 → 30 の更新は破壊的変更を含む
- live-server は保守が止まっているため、`npx serve` や Vite のプレビューサーバーなど、保守されているものへの置き換えを検討する
- npm-run-all は保守されている後継の `npm-run-all2` へ置き換える

## 6. 秘密情報の管理

- リポジトリ内・git 履歴にトークン、鍵、パスワードの痕跡はない。
- コミット者メールアドレス (`riekubocchi@gmail.com`) が `package.json` の `author` と git 履歴に含まれる。意図した公開であれば問題なし。
- publish 用トークンはホームディレクトリの `~/.npmrc` にあり、リポジトリ外のため公開物には含まれない (内容は確認していない)。

## 7. 修正計画 (承認待ち)

既存の公開 API (`formatText` のシグネチャ、`FormatOptions`) と出力仕様は変更しない。破壊的変更は不要。

| 順 | 対象 | 内容 | 互換性 | テスト |
| --- | --- | --- | --- | --- |
| 1 | F-1 | `removePunctuationAfterQuotes` を線形アルゴリズムに置換 | 出力同一 | 既存テスト + 長大入力の時間制限テスト |
| 2 | F-2 | `files` と `prepublishOnly` を追加、`dist` の git 管理方針を統一 | 影響なし | `npm pack --dry-run` で確認 |
| 3 | F-4, F-3 | README に呼び出し側責任 (エスケープ、入力型、入力長上限) を追記 | 影響なし | 不要 |
| 4 | F-5 | `serve` スクリプトに `--host=127.0.0.1` | 影響なし | 不要 |
| 5 | 5.3 | 承認後に `npm audit` を実行し追記 | - | - |

任意: F-3 の型検証 (TypeError を投げる) は挙動が変わるため、採否を判断してから実施する。F-6 は配布形式の変更になるため本計画から外す。

## 8. 対応状況 (2026-10-21)

| 順 | 状況 |
| --- | --- |
| 1 (F-1) | 完了。`removePunctuationAfterQuotes` を、正規表現を使わず 1 回の走査で処理する実装に置き換えた。回帰テスト 3 件 (20 万文字の処理時間、行をまたぐ括弧、開き括弧なし) を追加した。旧実装とランダム入力 20 万件で比較し、出力はすべて一致した。閉じ括弧のない「 100 万文字は 26 ms で終わる |
| 2 (F-2) | 完了。`files: ["dist"]` と `prepublishOnly` を追加し、`dist/` を git 管理から外した (`git rm --cached`)。`npm pack --dry-run` で、同梱物が README.md、package.json、dist/* だけになったことを確認した |
| 3 (F-3, F-4) | 完了。README に「利用上の注意」を追加した |
| 4 (F-5) | 完了。`serve` スクリプトに `--host=127.0.0.1` を追加した |
| 5 | 完了。5.3 に追記した |

補足: `tsconfig.json` が git 管理外 (未追跡) になっている。`prepublishOnly` のビルドはローカルにあるファイルで動くが、クローンした環境ではビルドできないため、コミットへの追加を推奨する。
