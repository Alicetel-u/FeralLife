# 第3幕・V4のキャラクター性調整テスト

2026-10-29。ユーザーの「モクと大家のけだるさ、ルナの小悪魔的な可愛さを戻す」「ミミを子供っぽい声に変え、全員分のテスト」依頼に対応。

公開ページ: `assets/voice-tests/act3-v4-cast/index.html`。各4人に普段・緊迫の2本、合計8本の調整案と、同一台詞の現在の本編音声を比較できる。自動再生・一括読み込みなし。キャラクターのタブで切り替え、同時再生を止める。

- 大家: 採用済みHaru。気だるい間、乾いたツッコミ、緊急時は明瞭な指示。
- モク: 採用済みYoko Honda。けだるい軽口と少し引く語尾、驚いても固有の話し方を指定。
- ルナ: 採用済みTsuyuri。小悪魔的な笑みを含んだ可愛さ。緊急時はからかいを抑える。
- ミミ: NaoからHina – cute and friendly（`lhTvHflPVOqgSWyuWQry`）への変更候補。幼さ・無邪気さを指定し、囁きにしない。

Eleven v4、stability=0.5、similarity_boost=0.85。具体的な台詞・演技タグは `config/voice-cast-test.json`。声量とキャラクター性を混同せず、ぼそぼそ声・囁きのタグは使用しない。生成後は目標-18 LUFS / true peak -5 dBTP、末尾0.2秒の余白を加え、デコードと長さを検査。

本編のVoice ID設定・マニフェスト・レビュー判定を変更していない。今回の音源は比較用であり、試聴合格や本編採用とは扱わない。採用後に本編を修正するときは対象を絞り、`repairReview: true` と具体的な `repairComment` を付ける。

生成: `node tools/voice-cast-test.mjs` で計画。`--generate --approve=<planId> --build` で生成・整音・比較ページ作成。共有の排他ロックと送信前ジャーナルを使い、失敗の自動再送はしない。原音・API履歴・キーは `.local/` のみ、公開するのは比較HTMLと整音済み8本。

公式ガイドの演技タグ・声の選定・安定度の説明を参考にした調整案。指定した演技の再現は確率的で、音の好みや演技の最終判定はユーザーの試聴で行う。
https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices
