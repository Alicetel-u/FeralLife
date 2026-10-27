# ChatGPT音声修正ブリッジ（通常チャット対応）

通常チャットのGitHubプラグインに `workflow_dispatch` がなくても、**GitHub Issueを作成する機能**だけで既存の音声修正ワークフローを起動する。専用GPT・追加サーバー・GitHub PATは不要。

## 初回設定（リポジトリ所有者）
1. [Actions secrets](https://github.com/Alicetel-u/FeralLife/settings/secrets/actions) で新しいRepository secret `VOICE_BRIDGE_PRIVATE_KEY` を登録する。
2. 内容は対応するRSA秘密鍵（PEM形式）全文。秘密鍵をIssue、チャット、コミットに貼らない。公開鍵は `docs/voice-bridge-public.pem`。
3. Actionsの設定でワークフローの書き込み権限を許可する必要がある。通常のリポジトリ `GITHUB_TOKEN` の `actions: write` を利用するため、外部PATは不要。

**注意**: この仕組みはIssueの作成者がGitHubリポジトリ所有者（`Alicetel-u`）のときだけ反応する。GitHubプラグインがIssueを別のbot名義で作る場合は起動しない。これは意図した認証制限であり、確認せずに外してはいけない。

## 通常チャットからの実行
1. `docs/voice-automation.md` の仕様で、現在の音声デバッグ出力から元の `report` を保った修正JSONを作成する。発話・声ID・進行は変えず、現行NGのみを対象にする。
2. `docs/voice-bridge-public.pem` でそのJSONを暗号化する。スクリプト実行可能なら `node tools/voice-bridge.mjs encrypt request.json` でIssue本文の暗号文を出力できる。チャット側でも公開鍵で同じRSA-OAEP-SHA256 + AES-256-GCM形式を作れる。
3. GitHubの `create_issue` ツールでリポジトリ `Alicetel-u/FeralLife` にIssueを作る。タイトルは厳密に `[Voice Bridge] validate` または `[Voice Bridge] repair`。本文には暗号化出力 **だけ** を入れる。
4. `.github/workflows/chatgpt-voice-bridge.yml` が所有者を確認し、GitHub Secretで復号、既存 `voice-review-automation.yml` を `workflow_dispatch` で起動する。
5. 音声修正のActionsと続くPagesデプロイの両方の成功を確認する。Issue受理だけでは成功ではない。

## 秘密保持・失敗処理
Issueは公開リポジトリ上で公開されるため、生の音声デバッグ情報・台詞・修正メモ・APIキーは本文に書かない。本文には暗号文だけを置く。秘密鍵はActions Secretだけに保管する。公開鍵では暗号文を復号できない。

修正JSONの `requestId` は依頼ごとに固定し、開始済み・途中失敗の生成をID変更でやり直さない。 `validate` は有料APIを呼ばない。 `repair` はElevenLabsの消費と本番公開を伴うため、利用者の修正指示があるときだけ実行する。

復号鍵未設定時はブリッジが失敗して停止する。Issueの本文を更新しても再実行されないため、設定後に新しいIssueを作る前に既存実行状態を確認する。

既存手順: [voice-automation.md](voice-automation.md)
