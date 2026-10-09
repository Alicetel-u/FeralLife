# GitHub設定調査（2026-10-09）

GitHub API、GitHub連携、GitHub CLIで確認。

| 項目 | FeralLife（変更前） | REC-OFF-AIR |
| --- | --- | --- |
| 公開範囲 | public | public |
| 既定ブランチ | main | master |
| 所有者 | Alicetel-u / admin | Alicetel-u / admin |
| 共同開発者 | 所有者のみ | occhi03102002-wq / write |
| 未承諾招待 | なし | なし |
| ブランチ保護・Rulesets | なし | なし |
| Merge方式 | merge / squash / rebase | merge / squash / rebase |
| 自動Merge | 無効 | 無効 |
| Actions | 有効 | 有効 |
| CI | 未設定 | PR・master Pushの検証、master更新時にPages公開 |
| ローカルチェック | 未設定 | tools/setup-hooks.sh、pre-commit、post-merge |
| AIルール | 未設定 | CLAUDE.md |
| 属性 | 未設定 | *.meshlibにGit LFS |

FeralLifeはNode.jsのブラウザゲームなので、参照先のGodot専用チェック・キャッシュ除外・meshlib用LFSはコピーしない。参照先のローカルチェック＋CI＋AIルールの考え方を採用し、PRレビューとmain保護を追加する。

既存のPagesはmainのルートから公開されるlegacy方式。公開範囲・Pages・ゲームソース・素材・既定ブランチは維持する。共同開発者のWrite招待はユーザーの明示承認後に送信した。承諾は相手本人が行う。

このPCのAlicetel-uのGitHub CLI認証とHTTPS読み取りは正常。制限された実行環境では通信失敗が認証失敗として表示されたが、ネットワークを許可した実行で正常と確認した。相手のPCの認証・Clone・Pushは遠隔実行できないため、docs/collaboration.mdで本人が検証する。

## 適用済み設定

- main保護: 承認1件、追加Pushで承認破棄、validate成功、最新mainとの一致、会話解決、管理者にも適用、force push・削除禁止。
- Squash mergeのみ有効。自動Merge無効。PRのUpdate branch有効。
- occhi03102002-wqへWrite招待を送信（招待ID: 336863056）。本人の承諾待ち。
- ローカル: pull.ff=only、fetch.prune=true、push.default=simple、core.hooksPath=.githooks。
- npm run buildと既存テスト15件が成功。ゲームの生成物に差分なし。

共同開発ファイルは codex/collaboration-setup のPRで提供する。保護設定を回避してmainへ統合せず、相手の招待承諾とPR承認を待つ。
