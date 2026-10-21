# リリース手順

npm に新しいバージョンを公開する手順です。すべてリポジトリ直下で実行します。

シェルで `npm` が pnpm の別名になっている場合は、`npm` の代わりに `command npm` と打ちます。以下は `command npm` で書いています。

## 1. 準備

main ブランチが最新で、未コミットの変更がないことを確認します。

```bash
git status
```

npm にログインしているか確認します。

```bash
command npm whoami
```

ユーザー名が表示されればログイン済みです。`401 Unauthorized` が出たらトークンが切れているので、ログインし直します。

```bash
command npm login
```

## 2. バージョンを上げる

変更の種類に合わせて、どれか 1 つを実行します。

| 変更の種類 | コマンド | 例 |
| --- | --- | --- |
| 不具合修正 | `command npm version patch` | 1.0.3 → 1.0.4 |
| 機能追加 (互換性あり) | `command npm version minor` | 1.0.3 → 1.1.0 |
| 互換性のない変更 | `command npm version major` | 1.0.3 → 2.0.0 |

package.json の書き換え、コミット、`v1.0.4` などのタグ作成までまとめて行われます。

## 3. 公開内容を確認する

```bash
command npm publish --dry-run
```

ビルドとテストが自動で走ります (`prepublishOnly`)。最後に出る一覧が `README.md`、`package.json`、`dist/` 配下だけなら問題ありません。

`repository.url was normalized` という警告は無害です。

## 4. 公開する

```bash
command npm publish
```

途中で認証用の URL が表示されたら、Enter でブラウザを開いて認証します。`+ jp-novel-formatter@x.y.z` と出れば公開完了です。

## 5. GitHub に反映する

バージョン更新のコミットとタグを push します。

```bash
git push --follow-tags
```

## 6. 確認

数分後に公開されたバージョンを確認します。

```bash
command npm view jp-novel-formatter version
```

## うまくいかないとき

| 症状 | 原因と対処 |
| --- | --- |
| `ENOENT ... package.json` | リポジトリ直下にいない。`cd` で移動してから実行する |
| `401 Unauthorized` | ログイン切れ。`command npm login` |
| `403 ... cannot publish over the previously published version` | 同じバージョンは再公開できない。手順 2 からやり直す |
| テストが失敗して止まる | 公開はされていない。修正してコミットしてから手順 3 へ |
