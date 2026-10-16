# 初回バッドエンドのカット演出

初回の灰皿事件で唯一の選択肢を選んだ後から、既存の火災映像へ移るまでの専用演出。既存の初回悲劇シナリオの流れ、話者、選択結果を維持する。ユーザーの指摘を受け、引き伸ばした叫びだけを「モク……頼む、返事をしてくれ。」へ変更した。二周目以降、第二幕、通常の観察画面・会話画面には適用しない。セーブ形式も変更しない。

## カットの進行

- 信用：101号室と既存のモクの立ち絵。落ち着いた色と控えめな字幕。
- 退出：大家視点の廊下。モクの立ち絵を消し、音楽を止める。
- 煙：屋外へ切り替え、101号室に視線を寄せる。ここから火災BGM。
- 発火：一度だけ赤い斜線を挟み、炎と煙を重ねる。モクは室内からの声として表示。
- 接近・阻止：廊下へ急接近するカット。黒煙と炎で入口への接近が遮られる。
- 崩落：画面を強く落とし、モクの姿を出さない。
- 呼びかけ：大家が声を絞り出す。大文字・斜め文字・赤い影は使わず、止まった屋外の遠景と控えめな字幕で表示。崩落から音楽を止め、救助できなかった実感を受け止める間を作る。
- 無応答：燃える建物の遠景を残し、BGMを止める。次の操作で同じ遠景を使う初回悲劇用火災映像へ接続する。室内カットへ逆戻りしない。完全な暗転はその後の意識喪失と心音まで使用しない。悲嘆、心音、巻き戻しは既存の演出を使用。

進行は既存のクリック・Enter・AUTO・音声・ページ送りと共通。戻る操作でも台詞からカットを再現する。火災の背景には生成した静止画を使い、追加のCanvas炎アニメーションは使用しない。動きを減らす設定ではカメラ移動・煙・斜線のアニメーションを止める。

## 素材

`assets/events/first-fire-corridor.png` は内蔵ImageGenで生成。元の `assets/apartments.png` を建築・画風の参照として使用。参照建物の開放廊下から街へ出る大家視点で、茶色のセーターの袖だけを画面端へ入れる。大家の立ち絵・顔は表示しない。

生成プロンプト：

> Use case: stylized-concept. Asset: widescreen 16:9 dramatic visual novel cinematic environment background, no text. Reference image establishes the EXACT weathered Japanese apartment building, open-air access corridor and visual style. New camera angle: first-person adult eye-level on the FIRST FLOOR external access corridor, stepping away from room 101 toward the outside street at night around 23:00. The corridor is OPEN-AIR, rusty dark railings on the left, aged ochre plaster wall and green metal apartment doors on the right, warm fluorescent fixtures, scuffed concrete, plants. Perspective leads diagonally from lower right toward the street and stairs exit at left distance. A narrow sliver of a brown knitted sweater sleeve at bottom right suggests the landlord POV, no face, no body, no other people. NO fire or smoke yet: this same background will get animated smoke overlays later. Match the reference's richly detailed pixel-edged hand painted anime game background, somber deep indigo night and pale amber lights, cinematic chiaroscuro, restrained dark red reflected accents, stylish Japanese graphic adventure mood. Strong readable depth, clear real exit path, environmental storytelling, no logos, lettering, captions or watermarks.

`?preview=first-fire&line=8` で退出、`line=18` で入口を塞がれる場面、`line=23` で静かな呼びかけを確認できる。プレビューは通常のセーブを読み書きしない。

追加素材も内蔵ImageGenで生成した。

### `assets/events/first-fire-exterior.png`

参照：`assets/apartments.png`。使用プロンプト：

> Use case: precise-object-edit. Edit target: existing Japanese apartment game background. Preserve exact apartment architecture, window/door layout, rusty external railings, stair at right, plants, streetscape, original detailed hand-painted pixel-edged anime game visual style and wide framing. Change time to deep night at 23:00, desaturated indigo and charcoal. Serious tragic cinematic shot, a motionless witness looking back from the street. Fire is pouring from room 101 on the LOWER LEFT floor, spreading along the lower-floor eaves, heavy opaque black smoke rises and obscures upper left building. Warm pale orange firelight lights the railing and ground in front of 101, restrained embers, real dense smoke, frightening heat. Other doors stay dark and silent. The foreground street is empty. NO people, bodies, silhouettes, gore, chibi sprites, text overlays, dramatic typography, comic symbols or watermarks. Not an explosion, not an action poster. A quiet devastating long shot of the same home becoming unreachable. Keep room 101 location recognizable and leave dark foreground negative space for game subtitles. High-quality cinematic environmental illustration, restrained palette, realistic fire and smoke integrated into the original artwork.

### `assets/events/first-fire-entrance.png`

参照：`assets/events/first-fire-corridor.png`。使用プロンプト：

> Use case: precise-object-edit. Edit this exact first-person open-air Japanese apartment corridor at night for a serious visual novel tragedy scene. Preserve the entire architecture, perspective, rusty railing, green nearest apartment door, scuffed concrete, plants, deep-night streetscape, and barely visible brown sweater sleeve at bottom right. The viewer is the landlord trying to return to the nearest room but unable to approach. Thick opaque black smoke pours violently from the nearest doorway, spreading under the low ceiling and into the corridor. Deep realistic orange firelight and turbulent flame tongues are partially visible inside the door, enough to make heat and danger unmistakable. The escape path remains to the left rear, the burning room to right front. Dense smoke and blinding heat block the doorway without hiding the whole image; retain visible railing, lower floor, and door edge. Art style matches the detailed pixel-edged hand-painted anime environment, rich atmospheric lighting, devastatingly serious cinematic chiaroscuro. No additional people, bodies, faces, chibi characters, text, comic symbols, explosion, typography or watermarks. Wide cinematic frame, dark lower-left negative space for captions. Real integrated smoke and fire, not flat triangular graphic flames.
