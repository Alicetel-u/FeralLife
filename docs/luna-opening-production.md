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

## 2026.10.17.6：動作確認用の短い試作

`?preview=luna-motion` から約10.5秒の動作試作を再生できる。全編のオープニングとは別に公開し、再生ボタンで開始、停止・再生・最初から・第二幕への移動に対応。通常セーブは変更しない。

- 8ポーズを順に描画し、立位→膝折れ→手をつく→座位を1.2秒で見せる。画像全体の移動だけで座り込みを表現しない。
- その後は髪・肩の呼吸による小さな遅れ、人物と建物の別々のカメラ倍率、雨・波紋・着地音を組み合わせる。
- これはフルアニメーション動画ではなく、8枚の作画と描画処理を用いた動作試作。頭を上げる動作の追加作画など、全編への展開は確認後に判断する。
- 音声は未生成。既存voice playerに最後の一言を渡す。長い収録音声が入った場合は終了を待つ。
- 左寄り不具合：aspect-ratioとmax-heightからフレーム幅が縮む際、left:0のままになっていた。幅を明示しleft:50%とtranslate(-50%,-50%)で中央に固定。1900×888と390×844で確認。

### 試作の使用画像と生成プロンプト

内蔵image_genで生成。使用ファイル：

- `assets/events/luna-collapse-sheet.png`：透過の8ポーズ。生成結果の実寸は1774×887、上段と下段の余白が異なるため、ソース矩形・接地位置を個別指定する。
- `assets/events/luna-courtyard-plate.png`：人物を除いた背景。

**Pose sheet**（参照：hostess.png、luna-sanctuary.png）

Use case illustration-story. Production ANIMATION SPRITE SHEET, 4096 x 2048 if possible, exact 4 columns x 2 rows of EIGHT equally sized square cells. No grid lines, no labels, all background genuinely TRANSPARENT. This is not a storyboard: isolated consistent character animation frames to be played sequentially. Reference 1 is exact adult Luna design: blonde wavy long hair, cat ears, fluffy blonde cat tail, black gold-heart hair bows, black white plaid sleeveless short dress, black ankle strap platform heels, black handbag. Reference 2 gives rear camera angle and sophisticated night-lighting anime painting style. SAME fixed camera, FULL REAR VIEW, no face visible, SAME character size and floor baseline in every cell, feet at 94% cell height, centered horizontally. KEEP enough transparent padding, each complete body never touches cell edges. Character initially stands at height 88% cell then lowers naturally into seated height 46%, never resize the seated character to fill cell. Eight consecutive physically coherent in-between drawings of exhausted woman sinking to sit on ground: row1 left to right 1 standing exhausted slight forward lean; 2 knees beginning to buckle; 3 deeper knee bend and torso folding; 4 deep crouch reaching right hand toward floor. row2 left to right 5 right palm touching floor while hips descend; 6 hips near floor knees fold to right; 7 hip touches ground one palm planted hair and tail still slightly lifted; 8 fully seated slumped on ground back facing camera knees naturally folded to right, head bowed, right palm on floor, hair and tail settled. Right hand is on viewer's right. Bag held left hand initially, rests by left hip in final poses. Preserve hair volume, dress pattern, tail, anatomy, body mass and proportions in ALL eight frames. Restrained warm rim light from above and cool blue shadows. Beautiful detailed clean anime film drawing. Nonsexualized acting, ordinary exhausted sitting. Transparent outside character only; do not draw floor or environment. EXACTLY EIGHT frames, 4x2, evenly aligned identical square cells. No text, no contact sheet borders, no decorations.

**Clean background**（参照：luna-sanctuary.png）

Use case precise-object-edit. Edit the reference into a clean animation background plate. REMOVE ONLY the blonde seated woman completely including ALL hair, tail, handbag, arms, legs and character shadow. Reconstruct the wet asphalt seamlessly where she was. Keep the original two-storey six-door Japanese apartment architecture, perspective, Japanese sign けもの荘, right stairs, water tank, green doors and numbers, night sky, moon, houses, street lights, plants, pavement reflections. No people anywhere, no bags. Recompose gently so the apartment is centered horizontally and preserve full building roof and both edges inside frame with 8 percent breathing room. Full 16:9 widescreen detailed cinematic anime painting, wet quiet night, warm corridor lamps, cool navy surroundings. Low angle street-level view, open wet asphalt foreground in bottom 28 percent to composite animated woman later. No typography beyond existing signs. No panels, no captions, no vignette or black bars baked into image. High quality sharp clean plate.
