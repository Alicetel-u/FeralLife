# FeralLife 共同開発ルール

まず README.md、PROJECT.md、docs/collaboration.md を読む。既存のゲーム仕様、画像、セーブ互換を守る。

- 作業開始時に `git status --short --branch`、`git fetch origin` を確認する。他人の未コミット変更を上書きしない。
- main は統合専用。最新 origin/main から `codex/<GitHubユーザー名>/<作業名>` を作り、1作業1ブランチ・1PRにする。同じブランチを2人で使わない。
- 同じPCで複数のCodex作業を同時実行する場合は別worktreeを使う。別PC間の同期はGitHubを通す。
- 変更前にIssueまたはPRに担当ファイルを記載する。同じファイル、画像、共通設定の同時編集を避ける。担当外の変更が必要なら先に調整する。
- mainへの直接Push、すべての強制Push、`reset --hard`、`clean -fd`、他人の変更の削除は禁止。公開範囲・Collaborators・権限はユーザーの事前承認なしで変更しない。
- Pushは `git push -u origin HEAD`。コミット対象は具体的に指定し、秘密情報・セーブデータ・個人設定を含めない。
- PR前に最新mainをmergeし、`npm run build`、`npm test` を実行する。play.htmlは生成物なので直接編集しない。競合時は他人のソースを保存し、ソースの競合解決後に再生成する。画像の競合は担当者と相談する。
- PRには変更目的、担当範囲、検証結果、見た目の変更を記載。相手がレビューし、CI成功・未解決会話なし・承認1件を満たしてSquash mergeする。自分のPRの自己承認や保護回避をしない。
- ゲーム変更時は必要に応じて `npm start` でブラウザ確認し、PROJECT.mdも更新する。テストのためだけの仕様変更やデバッグフラグを残さない。
- 終了時にブランチ名、PR URL、検証結果、残作業を日本語で報告する。
