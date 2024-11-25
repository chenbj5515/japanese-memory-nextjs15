NextJS App Router/Prisma/RSC/Server Actionsを使用して構築されたAIアプリです。

# ローカルで実行する

## Vercelでプロジェクトを作成する
このプロジェクトをフォークして、Vercelプラットフォームで新しいプロジェクト対して作成する。

その後、StorageでDBを作成する。

## 環境変数設定
ルートディレクトリで.env.localファイルを作成して、以下の環境変数を追加する
```
// AuthJS

AUTH_GITHUB_ID=[GITHUB開発者設定画面](https://github.com/settings/developers)で生成する
AUTH_GITHUB_SECRET=[GITHUB開発者設定画面](https://github.com/settings/developers)で生成する
GOOGLE_CLIENT_ID=Google Cloud Platformで生成する
GOOGLE_CLIENT_SECRET=Google Cloud Platformで生成する
AUTH_SECRET=node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"っていうコマンドで生成する

// vercel Postgres Database

POSTGRES_DATABASE=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_PRISMA_URL=
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_URL_NO_SSL=
POSTGRES_USER=
全てVercelプラットフォームのStorageのQuickstartの.env.localからコピーする

// Microsoft TTS

NEXT_PUBLIC_SUBSCRIPTION_KEY=Microsoft TTSから
NEXT_PUBLIC_REGION=Microsoft TTSから

// OPENAI

OPENAI_API_KEY=OPENAIから
```

## DBのテーブルを作成する
1. `npm i`
2. `npm install -g dotenv-cli`
3. `dotenv -e .env.local -- npx prisma db push`
4. `npx prisma generate`

## 実行する
`npm run dev`

# プロジェクト紹介
Zennで見ましょう：https://zenn.dev/chenbj/articles/555a42958b5a3e#prisma