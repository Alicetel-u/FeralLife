# けもの荘・キャラクター素材の基準

2026-10-08：ユーザー提供のタバコ猫を、今後の獣人キャラクターの見た目の基準として採用。

## 基準画像

- 原稿：`assets/characters/cat/reference-original.png`。ユーザー提供の原稿を保持。
- 透過マスター：`assets/characters/cat/cutout-master.png`。組み込みImageGenで白背景を透過した出力。生成編集なので原稿と完全なピクセル一致は保証しない。
- 透過切り出し：`assets/characters/cat/cutout.png`。外側の透明余白を整理した原寸素材。
- ゲーム用：`assets/characters/cat/idle.png`（96×128、RGBA）。足元の基準位置は (48,126)。
- ノート用：`assets/characters/cat/portrait.png`（128×160、RGBA）。

## 他のキャラを作るとき

- 大きめの頭、短めの胴体・脚。約2頭身の人型の獣人。
- 猫のような、人の顔・髪型・日常着に、動物の耳と尻尾を組み合わせる。
- 太い暗色の輪郭、四角いピクセルの陰影。滑らかなベクター線に変えない。
- 彩度を抑えた黒・灰・くすみ色、淡い肌色。細かい陰影は残し、強い光沢を避ける。
- 猫の半目・気だるさを基準に、性格は表情、服、固有の小物で出す。
- 全身、耳、尻尾、小物、煙などが切れない構図。背景は実際のアルファ透過。市松模様を画像に焼き込まない。
- 別種の住人の耳・尻尾・服・小物は、そのキャラの設定に合わせる。タバコや缶を全員に付けない。

新しいキャラのデザインはユーザーの原稿を優先する。まだ原稿がない6種は従来の仮スプライトのまま。

## ゲームへの追加

`src/character-art.js` の `CHARACTER_ART` に画像と足元位置を登録する。表示高さの基準は44（1000×562のゲーム画面内）。読み込みは起動時に完了してからゲームを開始。画像拡縮は最近傍、左右移動は反転と位置補間で表現する。

素材を追加したら `build.mjs` で単体版へも内蔵し、`node build.mjs` を実行する。画像が分割版だけ更新され、`play.html` に反映されない状態を避ける。

## 現時点の動き

猫は基本立ち絵1枚。歩行は上下揺れと左右反転、睡眠は縮小・回転による仮表現。専用の歩行、座り、食事、睡眠、喫煙の差分は未作成。缶とタバコは原稿の一部として立ち絵に含まれる。

## 透過時の指示

実行方法：組み込みImageGen、`transparent_background: true`。入力はユーザーのタバコ猫原稿。

プロンプト：

> Use case: background-extraction. Edit target: the attached adult chibi cat humanoid pixel-art game character. Remove ONLY the white background and produce an actual transparent RGBA PNG cutout. Preserve the exact existing character identity, face, sleepy grey eyes, black bob haircut, large black cat ears with pink and white interiors, pale skin, plain light grey t-shirt, black shorts, dark sandals, fluffy black tail, cigarette in mouth with smoke, and can held in the hand. Preserve the original pose, composition, colors and chunky square pixel edges; do not redesign, add, omit or redraw any features. Keep the cigarette smoke visible with transparent space around and between its curls. Keep pale clothing and skin opaque. No background, no checkerboard baked into the image, no shadow, no text. Entire body, ears, tail, sandals and smoke fully in frame. The task is a clean faithful cutout of this existing art, not a new character.
