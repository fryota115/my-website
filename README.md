# タスク管理

HTML・CSS・JavaScriptで動くタスク管理サイトです。ビルドやサーバー処理は不要です。

## ファイル構成

このフォルダをGitHubリポジトリの直下に配置してください。

```text
/
├── index.html
├── style.css
├── script.js
├── .nojekyll
└── README.md
```

`index.html`が公開ページです。CSS・JavaScriptは同じ階層から相対パスで読み込みます。画像ファイルは使用していません。
`.nojekyll`はJekyllによる処理を省略し、静的ファイルをそのまま配信するためのファイルです。

## GitHub Pagesで公開する手順

1. GitHubでリポジトリを作成し、上記ファイルをリポジトリ直下にアップロードして、`main`ブランチにコミットします。`.nojekyll`も含めてください。
2. リポジトリの **Settings → Pages** を開きます。
3. **Build and deployment** の **Source** で **Deploy from a branch** を選択します。
4. **Branch** を `main`、公開フォルダを `/(root)` に設定し、**Save** を押します。
5. デプロイ完了後、Pages画面に表示されたURLを開きます。反映まで数分かかる場合があります。

通常のプロジェクト用リポジトリでは `https://ユーザー名.github.io/リポジトリ名/` で公開されます。
`ユーザー名.github.io` という名前のリポジトリでは `https://ユーザー名.github.io/` になります。

公開後に、タスクの追加・編集・完了切替・削除・絞り込み・並び替えと、再読み込み後の保存を確認してください。スマートフォンではフォームと一覧が縦に並びます。

## 保存データ

タスクは利用者のブラウザのlocalStorageに保存されます。端末やブラウザ間では同期されません。
ローカルファイルで使用していたデータは、公開先URLには自動で移行されません。
同じGitHub Pagesドメイン上のサイトはlocalStorageを共有するため、このアプリを複数設置すると保存キーが共通になります。

## ローカルで開く

`index.html`をブラウザで開いてください。GitHub PagesはHTTPSで配信されます。

GitHub公式の公開設定手順は以下を参照してください。

https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
