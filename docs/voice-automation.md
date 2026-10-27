# ChatGPTからの音声修正

音声の修正内容をChatGPTがJSONにまとめ、GitHub Actionsが既存のElevenLabs音声生成・対象限定の音量調整・ビルド・全テスト・本番公開を実行する。PCのローカル環境は不要。

## 最初に使える方法

通常のChatGPTに、音声デバッグの出力とこの文書を渡して修正JSONを作ってもらう。そのJSONを以下の「Run workflow」の `request_json` に貼る。

https://github.com/Alicetel-u/FeralLife/actions/workflows/voice-review-automation.yml

`mode=validate` は計画の検証だけで、有料の生成APIを呼ばない。実際に音声を修正・公開する場合は `mode=repair` を選ぶ。最初に実行したユーザーはリポジトリ所有者本人である必要がある。

生成用のキーはリポジトリのActions secret `ELEVENLABS_API_KEY1`、未設定なら `ELEVENLABS_API_KEY` を利用する。ChatGPTへキーを貼る必要はない。

## ChatGPTから直接実行する初回設定

専用GPTに [voice-automation-action.json](voice-automation-action.json) のOpenAPI定義を設定する。認証はAPI KeyのBearer形式で、対象を `Alicetel-u/FeralLife` だけに限定し、ActionsのRead and write権限を持つGitHub fine-grained tokenを設定する。トークンはGPTの認証設定へ入力し、会話・JSON・Gitには書かない。

これは実行用のGPT Actionを追加する方法であり、標準のGitHub接続を追加しただけでこのActionが自動登録されるわけではない。GPTの初回作成・認証設定は利用者側で必要。

公式説明: https://developers.openai.com/api/docs/actions/getting-started

GPTのInstructionsには次の内容を設定する。

> けもの荘の音声修正を補助する。まずリポジトリのdocs/voice-automation.mdとAGENTS.mdを読み、現在の音声デバッグ出力を受け取る。表示台詞・進行・声IDを変えず、NGの現行音声だけに読み・演技の修正を提案する。廃止された台詞への修正指定は作らない。発音補正は必要な語だけに絞り、文全体をかなにしてカタコトにしない。悲劇ではコミカルにせず、焦りと怒りを区別する。原文のreportを改変せず、現行NGごとにcorrectionsを1件ずつ作る。予算指定がなければmaxCredits=500を用い、超える場合は実行前に利用者へ予算を確認する。userが修正を依頼したときだけmode=repairを実行する。単なる確認はmode=validateにする。APIキーやGitHubトークンを会話へ要求しない。操作の受付だけで成功と言わず、該当の生成ワークフローと続くPagesデプロイのsuccessを確認して本番URLを返す。途中失敗・startedのままの実行記録があるときは、requestIdを変えて再試行せず、音声とジャーナルの確認を依頼する。生成済みで未公開の音声は再生成しない。未確認の読み・演技が直ったと断言せず、本番の「修正後の確認」での試聴を案内する。

## 修正JSONの形式

```json
{
  "requestId": "voice-20261027-unique01",
  "maxCredits": 500,
  "report": {"application": "kemono-voice-review", "schema": 2, "records": []},
  "corrections": [
    {
      "id": "音声デバッグの16桁のID",
      "spokenText": "実際に発声させる、読みを補正した台詞",
      "tags": ["panicked", "pleading"],
      "settings": {"stability": 0.5, "similarity_boost": 0.75, "speed": 1.03},
      "comment": "どの読み・演技を変更したかを記した短い事実説明"
    }
  ]
}
```

上のJSONは構造説明であり、そのままは実行できない。`report` は利用者の出力にある取り込み用JSON全体を入れ、`corrections` はその中の現行NGと一致させる。IDは短いIDか完全な識別キー。廃止済みNGは無視され、現行NGには過不足なく修正指定が必要。OKだけの出力は空のcorrectionsで判定反映ができる。

requestIdは8〜64文字の英数字・ハイフン・アンダースコアで、依頼ごとに一度だけ使う。同じ依頼を新しいIDに変えて再試行しない。maxCreditsは生成前の保守的な見積もり上限で0〜5000。1回最大30録音。既存の声ID、モデルと再生キーを維持する。

`tags` は角括弧なしで指定する。使用可能: animated, conversational, lighthearted, excited, exasperated, surprised, confused, thoughtful, worried, panicked, pleading, shouting, confident, sad, crying, strained, serious, warmly, upbeat, playful。囁き・ASMR・mumblingを指定しない。

## 実行と失敗時

生成の前に `config/voice-automation-runs.json` へstartedの実行記録をコミットする。同じID・同じ生成計画の重複実行は拒否し、成功済みの同じ依頼は再生成しない。途中失敗では未完了扱いで停止する。GitHub Actionsの復旧artifactに音声原音と生成ジャーナルを保存する。生の修正依頼・メモ・認証キーはartifactにもコミットにも含めない。

完成後は音声・判定だけを許可リストでコミットし、Pagesを明示的に起動する。GITHUB_TOKENによるpushだけでは別ワークフローが起動しないため、公開成功は別途確認する。

本番: https://alicetel-u.github.io/FeralLife/
