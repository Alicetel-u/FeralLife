# 2人のWindows・Codex共同開発マニュアル

## アカウントと初回準備

GitHub所有者は Alicetel-u、共同開発者は occhi03102002-wq（Write）。招待された人は https://github.com/Alicetel-u/FeralLife/invitations で招待を承諾する。各自のGitHubアカウントを使い、トークンやパスワードを共有しない。CodexのログインとGitHubの認証はそれぞれ行う。

各PCにGit for Windows、GitHub CLI、Node.js 24 LTS、Codexをインストールする。PowerShellを開き、次を実行する。wingetで入れた直後はPowerShellを開き直す。

```powershell
winget install --id Git.Git -e
winget install --id GitHub.cli -e
winget install --id OpenJS.NodeJS.LTS -e
gh auth login --hostname github.com --git-protocol https --web
gh auth status
gh api user --jq .login
gh auth setup-git
```

ブラウザでは自分のアカウントで認証する。複数アカウント登録済みなら `gh auth switch --user 自分のGitHub名` を使い、`gh api user --jq .login` で再確認する。認証トークンをCodexへのプロンプトやファイルに貼らない。

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\source" | Out-Null
Set-Location "$env:USERPROFILE\source"
git clone https://github.com/Alicetel-u/FeralLife.git
Set-Location FeralLife
git config --local user.name "自分のGitHub名"
git config --local user.email "GitHubのSettings > Emailsに表示される自分のnoreplyメール"
powershell -NoProfile -ExecutionPolicy Bypass -File tools/setup-collaboration.ps1
node --version
npm test
```

既にClone済みの場合は再Cloneせず、そのフォルダーで `git status` を確認し、変更がない状態でmainを `git pull --ff-only origin main` してセットアップする。Node 24で揃える。依存パッケージは現在ないためnpm installは不要。

Codexで各PCのFeralLifeフォルダーをプロジェクトとして開く。新しいチャットの最初に「AGENTS.mdとdocs/collaboration.mdを読んで、私のGitHub名は○○、担当は○○。最新mainから専用ブランチを作り、PRまで進めて」と伝える。AGENTS.mdの公式説明: https://learn.chatgpt.com/docs/agent-configuration/agents-md

## 毎回の作業

1. IssueまたはDraft PRに目的と担当ファイルを書く。例: Alicetel-uはsimulationとテスト、相手はキャラクター画像と台詞。これは固定担当ではなく作業ごとに合意する。
2. 変更のないmainを更新し、自分専用のブランチを作る。

```powershell
git status --short --branch
git switch main
git pull --ff-only origin main
git switch -c codex/自分のGitHub名/短い作業名
```

3. Codexで編集する。別PCで同じブランチを共同編集しない。同一PCの並行作業には別worktreeを使う。
4. PR前に最新mainを取り込む。共有済みブランチはrebaseせずmergeする。

```powershell
git fetch origin
git merge origin/main
npm run build
npm test
git diff --check
git status --short
git add src/変更したファイル.js tests/変更したテスト.test.mjs play.html
git commit -m "変更の目的"
git push -u origin HEAD
gh pr create --base main --draft
```

`git add` の例は実際の変更ファイルに置き換える。全ファイルを無確認で追加しない。PR作成画面で目的・担当・検証結果を記入し、相手にURLを共有する。準備完了後にDraftを解除し、相手をReviewerに指定する。

5. 相手が差分と動作を確認してApproveする。CIのvalidate成功、最新mainへの追従、会話の解決、承認1件が必要。新しいコミットを追加すると承認は取り消される。作者自身は承認できない。
6. GitHubのSquash and mergeで統合する。mainの直接Push・強制Push・管理者による回避は禁止。main更新は既存GitHub Pagesにも反映されるため、ゲーム変更は表示を確認する。
7. 両PCで作業ツリーがきれいな状態で `git switch main`、`git pull --ff-only origin main`。次の作業は新しいブランチから始める。設定変更後はセットアップスクリプトを再実行できる。

## 衝突したとき

`git merge origin/main` が競合したら `git status` で対象を確認する。ソースは双方の意図を相談して統合する。PNGなどの画像はGitで自動統合できないため担当者に確認する。play.htmlは直接競合を編集せず、ソースの競合を先に解決して `npm run build` で再生成し `git add play.html` する。すべての競合が解決したら `npm test`、`git add 対象ファイル`、`git commit`、通常Pushする。

中止するときは `git merge --abort`。開始前に未コミット作業があるなら、先に専用ブランチへコミットして保存する。`reset --hard`、`clean -fd`、force pushで解決しない。pullのfast-forward失敗は、別ブランチへ既存作業を保存して履歴を調査する。

## 別PCでの接続検証

招待承諾後、mainから `codex/自分のGitHub名/connection-check` を作成し、`docs/connection-check-自分のGitHub名.md` にGitHub名と検証日だけを書く。コミットし、通常PushしてDraft PRを作成する。これで相手の書込権限を確認できる。もう一方のPCで `git fetch origin`、`git show origin/codex/相手のGitHub名/connection-check:docs/connection-check-相手のGitHub名.md` を実行して読み取れることを確認する。テスト用PRは確認後Closeし、mainには不要なテストファイルを統合しない。

接続だけ確認する場合は `git ls-remote origin HEAD`。mainのPullは `git pull --ff-only origin main`。403の場合は招待承諾とアクティブアカウントを再確認する。Codexの制限内で通信だけ失敗する場合は、Windowsの通常PowerShellで同じコマンドを試す。

## 管理者向け設定

mainの保護: PR必須、承認1件、追加Pushで承認破棄、会話解決、validate必須、最新mainとの一致、管理者にも適用、force push禁止、削除禁止。Squash mergeのみを有効にし、自動マージは無効。ローカルフックもmainへのPushを拒否するが、最終防壁はGitHubの保護設定。

CODEOWNERSによる固定レビュー担当は、2人が互いにレビューできるよう現時点では設定しない。main保護が全ファイルに適用される。権限・公開範囲の変更は事前承認が必要。セットアップスクリプトは各Cloneのローカル設定だけを変更し、Gitのグローバル設定や認証情報は変更しない。
