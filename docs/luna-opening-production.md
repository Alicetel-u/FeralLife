# 第二幕「逃げる女」映像制作メモ

2026-10-17。メッセージウィンドウを使わない、自動再生の約36秒の導入。

## 構成

逃走5.4秒 → 振り返り4.8秒 → 連絡5.2秒 → 座り込む背中5.6秒 → 建物全景への引き8.8秒 → 最後の一言6.4秒。
「collapse」の最終カメラ座標と「reveal」の開始座標は一致させる。
Spaceで一時停止、Enter／右矢印で次のカット。画面下に操作ボタン。タブを隠すと時計と効果音を止める。
`?preview=act-two-opening` で直接確認できる。通常のセーブとは別の保存領域を使う。

## 音声追加

`src/act-two-opening.js` の `ACT_TWO_OPENING_SCENES[].cues` に安定したID、開始秒、字幕終了秒、speaker、emotion、textを保持。
音声抽出のact2スコープに `act2/film/…` として含まれる。既存のvoice manifest/playerを使い、再生中は次のカットへ自動遷移しない。
今回、音声の新規生成は行っていない。足音・振動は短いWeb Audio効果音。BGMには既存のuneasyを使用。

## 画像

内蔵image_genを使用。参照：`assets/events/hostess.png`（ルナのデザイン）、`assets/apartments.png`（建物）。出力をプロジェクト内へコピー。

- `assets/events/luna-flight.png`：逃走、振り返り。
- `assets/events/luna-phone.png`：スマートフォンの連絡。
- `assets/events/luna-sanctuary.png`：座り込んだ後ろ姿と建物のローアングル全景。同一画でカメラを引く。

## 使用プロンプト

### Flight

Use case: illustration-story. Create a premium widescreen 16:9 anime game cinematic keyframe, full bleed, no panels or text. Reference 1 is the EXACT adult character Luna: long voluminous wavy blonde hair, feline ears, large fluffy blonde tail, black ribbons with gold hearts, sleeveless black white plaid short dress, black platform ankle strap heels, black handbag. Reference 2 is the exact apartment building architecture, for setting and painted background style. Shot: late night wet Japanese residential back alley, Luna running urgently away from camera in three-quarter back view, looking anxiously over her shoulder. Dynamic low tracking-camera composition, legs mid-stride, hair and tail trailing naturally. Dark midnight blue shadow, tiny warm practical lamps, wet asphalt glints, tense restrained cinematic lighting, finely painted atmospheric anime background. One woman only, no pursuer, no injury. Character is visibly frightened and exhausted not smiling. Keep outfit and adult proportions consistent with reference. Very high quality cinematic illustration; no typography, no watermark, no framing UI. Create single image only.

### Sanctuary

Use case illustration-story. Single premium 16:9 widescreen anime game cinematic illustration. Reference 1 exact adult Luna character identity and clothing; Reference 2 exact two-storey Japanese apartment architecture and painted background art style. CRITICAL COMPOSITION: camera at wet pavement height behind Luna. Luna has just collapsed exhausted into a seated position on pavement foreground bottom center-left, back to camera, shoulders slumped, one palm bracing on pavement, knees naturally bent to one side, long wavy blonde hair with black gold-heart ribbons, feline ears and fluffy blonde tail, exact sleeveless black and white plaid short dress and platform ankle-strap heels, small black handbag dropped beside her. Not sexualized, respectful cinematic view from behind. Behind and ABOVE her, the ENTIRE familiar old two-storey six-door apartment looms in dramatic LOW ANGLE wide lens perspective. Preserve six green doors 101 102 103 downstairs 201 202 203 upstairs, external right staircase, aged cream walls, balconies and tall illuminated vertical sign けもの荘 on left; roof water tank, pipes, nearby residences. Deep late-night navy sky, sparse warm corridor fluorescents, moonlit wet asphalt, cinematic contrast, very detailed painted Japanese anime background. Foreground Luna occupies lower 35%, full building upper 75%, generous image margins for slow camera tilt upward and dolly pullback. Emotion: exhausted sanctuary, uneasy silence after escape. No other people. No captions, no panels, no watermarks. Single coherent shot, exceptional film still quality.

### Phone

Use case illustration-story. Single widescreen 16:9 film still for tense anime visual novel. Same adult blonde cat woman Luna as reference 1, exact black white plaid sleeveless dress, black gold-heart hair ribbons. Match detailed cinematic painted anime style and midnight blue wet-street amber lighting of reference 2. Extreme close-up over shoulder of her hand clutching a vibrating smartphone at waist, phone tilted slightly, lit screen blank dark blue-grey for later text compositing, her fingers visibly tense, edge of blonde hair and dress catching phone light. Her other hand braced against a rough concrete wall in anonymous dark Japanese alley. No apartment visible, no other people, no readable text or symbols on screen, no panels, no UI frame, no captions, no watermark. Focus is hand and phone, quiet threatening negative space right side, beautiful restrained chiaroscuro.
