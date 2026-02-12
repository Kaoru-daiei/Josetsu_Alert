# 除雪アラート（Josetsu Alert）

道路除雪において、過去に同じ場所で起きた事故の内容を、スマホから音声で注意喚起するWebアプリです。

## 機能

- **現在地監視**: GPSで現在地を取得し、登録された事故地点に近づくとお知らせ
- **音声読み上げ**: 該当地点の事故内容をブラウザの音声合成で読み上げ（ON/OFF可能）
- **事故一覧**: 登録された事故を距離順で表示
- **設定**: 通知する距離（50m / 100m / 200m）を変更可能

## 開発

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開き、位置情報を許可すると動作します。

### スマホで試す

1. **PCで開発サーバーを起動**
   ```bash
   npm run dev
   ```
   起動時に **Network** に表示されるURL（例: `http://192.168.1.10:5173`）を控える。

2. **スマホをPCと同じWi-Fiに接続**する。

3. **スマホのブラウザ**で、控えたURL（例: `http://192.168.1.10:5173`）を開く。

4. 位置情報の許可を求められたら**許可**する。

**注意**: 一部のブラウザでは、`http://` のページでは位置情報が使えない場合があります。そのときは次のいずれかで試してください。
- **ビルドしてプレビュー**: `npm run build` のあと `npm run preview -- --host` で起動し、表示された Network のURLをスマホで開く（挙動は同じ場合あり）。
- **HTTPSで公開**: [ngrok](https://ngrok.com/) でトンネルするか、Vercel / Netlify などにデプロイして、`https://` のURLをスマホで開く。

### モバイル回線でフィールドテストする（同じWi-Fi不要）

屋外でスマホの回線（4G/5G）だけを使って試すには、アプリを **インターネットから開けるURL** で公開する必要があります。

#### 方法A: トンネルで一時公開（すぐ試したいとき）

1. [ngrok](https://ngrok.com/) をインストール（未登録でも短時間なら利用可）。
2. PCでアプリを起動した状態で、**別ターミナル**で:
   ```bash
   npm run dev
   ```
   ```bash
   ngrok http 5173
   ```
3. ngrok が表示する **https のURL**（例: `https://xxxx.ngrok-free.app`）をスマホのブラウザで開く。スマホはWi-Fiをオフにしてモバイル回線だけでOK。
4. 位置情報を許可すれば、現場でそのまま動作確認できる。

※ 無料の ngrok はURLが毎回変わる・セッション制限あり。恒常的に使うなら方法Bが向いている。

#### 方法B: Vercel / Netlify にデプロイ（恒常URL・おすすめ）

- **Vercel**: [vercel.com](https://vercel.com) で GitHub と連携 → リポジトリをインポート → デプロイ。`https://あなたのプロジェクト.vercel.app` のようなURLが発行され、スマホのブラウザで開ける。
- **Netlify**: [netlify.com](https://www.netlify.com) で同様にリポジトリを連携し、ビルドコマンド `npm run build`、公開ディレクトリ `dist` でデプロイ。

どちらも HTTPS になるため、位置情報がモバイル回線でも利用しやすく、フィールドテストに適しています。リポジトリをプッシュするたびに自動でデプロイされるようにしておくと便利です。

- リポジトリには **Vercel 用** `vercel.json`（SPAのルーティング用）と **Netlify 用** `public/_redirects` を同梱しています。そのままデプロイすれば動作します。

### Vercel でデプロイする（GitHub 連携）

GitHub と Vercel の無料アカウントがある場合、次の手順でモバイル回線から開ける URL を用意できます。

1. **GitHub にリポジトリを作成**
   - [github.com](https://github.com) で「New repository」→ 名前は例: `Josetsu_Alert`、Public、README は追加しなくてOK（既にローカルにあるため）。
   - 作成後、表示される「…or push an existing repository from the command line」のコマンドを控える。

2. **ローカルからプッシュ**
   ```bash
   cd /Users/kaoru/Project/Josetsu_Alert
   git remote add origin https://github.com/<あなたのユーザー名>/Josetsu_Alert.git
   git push -u origin main
   ```
   （すでに `origin` がある場合は `git remote set-url origin ...` でURLを合わせてから `git push -u origin main`）

3. **Vercel でデプロイ**
   - [vercel.com](https://vercel.com) にログイン → **Add New…** → **Project**。
   - **Import Git Repository** で GitHub を選び、`Josetsu_Alert` を選択。
   - Framework Preset は **Vite** のまま（自動検出）、**Deploy** をクリック。

4. **完了後**
   - 表示される **https://josetsu-alert-xxx.vercel.app** のようなURLをスマホのブラウザで開く。モバイル回線のみで位置情報を許可すればフィールドテストできます。
   - 以降、`main` にプッシュするたびに Vercel が自動で再デプロイします。

## ビルド

```bash
npm run build
npm run preview   # ビルド結果のプレビュー
```

## 事故データ

`public/data/accidents.json` に事故データを配置してください。形式は以下のとおりです。

```json
[
  {
    "id": "一意のID",
    "latitude": 緯度,
    "longitude": 経度,
    "description": "音声で読み上げる説明文",
    "occurred_at": "YYYY-MM または YYYY-MM-DD",
    "category": "転落・接触・巻き込み など"
  }
]
```

サンプルとして2件のデータが含まれています（新潟県上越市付近の座標）。実際の運用では自治体のデータや手動登録に差し替えてください。

## 構成

- **コア層** (`src/core/`): 距離計算・近隣判定・読み上げ文生成（プラットフォーム非依存）
- **アダプター** (`src/adapters/`): 位置取得・音声再生の抽象化（現在はブラウザ実装）
- **UI** (`src/components/`): メイン・一覧・設定画面

将来のスマホアプリ化時は、コアとアダプターを流用し、UI層の差し替えや Capacitor によるラップで対応できます。

## PWA

`public/manifest.webmanifest` を設置済みです。対応ブラウザでは「ホーム画面に追加」でアプリのように利用できます。Service Worker によるオフライン対応は未実装です。
