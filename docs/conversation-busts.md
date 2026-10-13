# 会話用バストアップ

2026-10-13。通常・喜び・怒り・落ち込み／不安・驚き・照れ・脱力の7感情を6人分用意する。元の全身立ち絵はキャラクターの顔、髪、耳、衣装、画風の参考に使い、各素材は上半身の新しいポーズとして描き起こす。

## 配置と切り替え

素材は `assets/events/busts/`、登録は `src/character-art.js` の `EVENT_EXPRESSIONS`。会話画面は顔・肩・手を大きく表示し、下端は台詞ウィンドウの後ろに配置する。全身立ち絵の拡大切り抜きには依存しない。

`line.emotion` を指定するとその感情を優先する。24件の相談は `src/event-stage.js` の `EVENT_CASE_EMOTIONS` で台詞単位の演出を指定する。普通の日誌や旧セーブには台詞の語句から感情を選ぶ。話していない住人は自分の直前の感情を保持する。

`会話表情一覧.html` はダブルクリックで開ける素材一覧。キャラを選ぶか全員を表示して、7種類のポーズを比較できる。会話プレビューはローカルサーバー起動後、`index.html?preview=events&case=cigarette` で確認できる。

## 生成方式と最終プロンプト仕様

組み込み ImageGen を使用。各画像につき個別の生成を行う。参照は同じキャラの `assets/events/<type>.png`。初回の表情だけを変更した全身差分は採用しない。

共通指示：`Use case: illustration-story. Create a NEW production visual novel BUST-UP character sprite from scratch. Reference is IDENTITY/COSTUME/ART STYLE only, never reuse its standing pose. Preserve exact hair color/style, eye color, ear species and outfit design, opaque original clothing, detailed painterly anime linework and shading. Dynamic asymmetrical shoulders, expressive natural five-finger hands, clear distinct silhouette and believable anatomy. Tight BUST-UP framing ONLY: all ears and hair top, large face, shoulders, chest, arms and gesture hands; lower edge at ribs just beneath chest. NO waist/hips/thighs/legs/full body. Face approximately 30 percent canvas height, shoulders span 80 percent width; full hands inside canvas, 4 percent transparent headroom. Square 1024x1024 composition. Genuine transparent alpha background, no background/chair/UI/text/balloons. Face viewer or slightly toward viewer. Do not merely change face; redraw torso, head angle and both hand gestures.`

各キャラ・各感情の具体的なポーズは同フォルダの `conversation-bust-prompts.json` に記録する。
