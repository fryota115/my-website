# タスク管理

HTML・CSS・JavaScriptで動くタスク管理サイトです。ビルドやサーバー処理は不要です。

## ファイル構成

このフォルダをGitHubリポジトリの直下に配置してください。

```text
/
├── index.html
├── style.css
├── script.js
├── manifest.webmanifest
├── service-worker.js
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
├── .nojekyll
└── README.md
```

`index.html`が公開ページです。CSS・JavaScriptは同じ階層から相対パスで読み込みます。アイコンは`icons`フォルダにあります。
`.nojekyll`はJekyllによる処理を省略し、静的ファイルをそのまま配信するためのファイルです。

## GitHub Pagesで公開する手順

1. GitHubでリポジトリを作成し、上記ファイルをリポジトリ直下にアップロードして、`main`ブランチにコミットします。`.nojekyll`も含めてください。
2. リポジトリの **Settings → Pages** を開きます。
3. **Build and deployment** の **Source** で **Deploy from a branch** を選択します。
4. **Branch** を `main`、公開フォルダを `/(root)` に設定し、**Save** を押します。
5. デプロイ完了後、Pages画面に表示されたURLを開きます。反映まで数分かかる場合があります。

公開先は `https://fryota115.github.io/my-website/` です。
GitHubの `fryota115/my-website` リポジトリで **Add file → Upload files** を選び、上記のファイルと`icons`フォルダをアップロードしてください。`task`フォルダ自体で囲まず、`index.html`をリポジトリ直下に配置します。既存ファイルも今回の版で更新してコミットします。

PWAの開始URL・スコープ・アイコン・Service Workerはすべて `/my-website/` 配下に設定しています。公開フォルダは `/(root)` を使用してください。

## スマートフォンへのインストール

### iPhone

1. Safariで公開URLを開き、読み込みが完了するまで待ちます。
2. 共有メニューから **ホーム画面に追加** を選びます。
3. **Webアプリとして開く** が表示される場合は有効にし、**追加** を押します。
4. ホーム画面の「タスク管理」を開きます。

### Android

1. Chromeで公開URLを開き、読み込みが完了するまで待ちます。
2. メニューから **ホーム画面に追加** または **アプリをインストール** を選びます。
3. 表示された確認画面でインストールします。表記はOSやChromeのバージョンによって異なります。

## オフラインと更新

初回はインターネット接続が必要です。Service Workerの登録と必要ファイルの保存が完了すると、次回以降はオフラインでも起動・タスク操作・localStorageへの保存ができます。インストールしたアプリもオンラインで一度開き、その後、機内モードで閉じて開き直して確認してください。

キャッシュには画面とアイコンを保存します。タスクは従来どおりlocalStorageに保存します。
ブラウザのデータ削除やOSによる保存領域の消去で、オフライン用キャッシュやタスクが失われる場合があります。
ホーム画面版とブラウザ版の保存領域の共有はOS・ブラウザの挙動によるため、インストール後に保存タスクを確認してください。

サイトを更新するときは `service-worker.js` の `CACHE_NAME` の `v1` を `v2` などに変更し、変更ファイルと一緒にアップロードしてください。オンラインで開くと新しい一式を準備します。旧版の画面をすべて閉じて開き直すと、新版が有効になります。

開発者ツールの **Application** で、Manifestの開始URLとアイコン、Service Workersの登録範囲 `/my-website/`、Cache Storageのファイルを確認できます。

公開後に、タスクの追加・編集・完了切替・削除・絞り込み・並び替えと、再読み込み後の保存を確認してください。スマートフォンではフォームと一覧が縦に並びます。

## 保存データ

タスクは利用者のブラウザのlocalStorageに保存されます。端末やブラウザ間では同期されません。
ローカルファイルで使用していたデータは、公開先URLには自動で移行されません。
同じGitHub Pagesドメイン上のサイトはlocalStorageを共有するため、このアプリを複数設置すると保存キーが共通になります。

## ローカルで開く

`index.html`をブラウザで開くと通常のタスク画面を使用できます。PWAの登録とオフライン機能は、HTTPSの公開URLで確認してください。

GitHub公式の公開設定手順は以下を参照してください。

https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
