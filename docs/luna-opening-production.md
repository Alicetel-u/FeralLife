# 第二幕「逃げる女」オープニング制作メモ

## 現行版：2026.10.17.14

2カット目から通知後の反応までを新規の完成背景CGへ置換。立ち絵の拡大合成・赤黒の通知グラフィックは撤去。角の路地→顔・肩・胴体を左に揃えて路地をうかがうルナ→手元のスマホ→ルナの反応の順。足音は角で減速して停止。通知音の後にスマホ画面内へ文面を表示し、読む間を確保、4.6秒で画面を消す。通知文字は生成CGと同じカメラに属するため振動・寄りにも追従する。人物動作のアニメーションなし。約35秒、後半の座り姿・募集看板・建物全景と既存会話は維持。通しの画面確認はユーザー担当。

追加素材は内蔵image_genで生成：
- `assets/events/luna-corner-v2.png`：角を曲がった路地。
- `assets/events/luna-watch-v2.png`：路地を警戒するルナを背景と一緒に描いたCG。
- `assets/events/luna-handset-v2.png`：通知を見る手元。文字はHTMLで重ねる。

### 今回の生成プロンプト

### corner

Generate ONE widescreen 16:9 cinematic anime illustration, a complete environment still for a tense visual novel. Reference is environment/style only. Camera at eye level has just ducked around a blind corner in the same wet Japanese residential alley at night. Close dark concrete wall occupies rightmost 22%, with a crisp vertical edge at 78% frame width. To the left of this edge a narrow empty lane recedes diagonally to distant amber lights; strong depth, cold blue shadows, wet reflections and overhead wires. No apartment building from the game, no signage, no people, no text. Restrained polished anime film background, believable perspective, no dutch tilt, clear legible composition. This should feel like sheltering behind the corner and listening, not a generic pretty street.

### watch（初稿・不採用）

Generate ONE finished widescreen 16:9 cinematic anime visual-novel keyframe, not a sprite or collage. Reference1 is CHARACTER DESIGN ONLY: the adult blonde feline woman Luna, same face, ears, long wavy hair, heart hairpin, black ribbons and black-white plaid sleeveless dress. Reference2 is ENVIRONMENT AND PALETTE. Compose character and background together with consistent perspective and illumination. Camera at shoulder height: Luna's head and upper shoulders occupy RIGHTMOST 35% foreground, seen from behind her left shoulder in a natural near-profile, turning her worried eyes LEFT toward the empty narrow alley she escaped through. The LEFT 60% must clearly show that dark lane receding into depth, with no pursuer or silhouette. Face around x78% y36%, ears fully within frame; crop body at upper chest, no cleavage, no hips, no hand touching an invisible wall, no phone. A real corner wall directly behind her on the right provides cover. Cold blue night fill, subtle amber rim light from lane lamp, damp hair wisps, parted lips catching breath, restrained fear, no crying. Strong cinematic negative space on left; polished detailed anime film still with natural anatomy, not a portrait pasted over a backdrop. No text or graphic panels.

### watch（採用方針：顔・肩・胴体が同じ方向を向く横姿へ再生成）

Create a new complete widescreen 16:9 anime cinematic still. Reference1 is CHARACTER IDENTITY ONLY (ignore its pose entirely); reference2 is exact LOCATION/lighting. Luna is adult blonde cat-eared woman with black heart ribbons, heart hairpin, black-and-white plaid sleeveless dress. SCENE: hiding beside the right-hand corner wall in this night alley, checking the empty lane on screen left. COMPOSITION: empty alley fills left 60%, Luna stands on right 40%, waist-up natural STRICT SIDE PROFILE facing SCREEN LEFT. Her nose, sternum, chest and abdomen ALL point LEFT. Her back and long hair point RIGHT, spine neutral upright. The camera sees the SIDE of her torso, NOT her back, NOT an over-shoulder pose. Neck and shoulders relaxed anatomically aligned, no neck twist, no shoulder raised toward chin, both arms hanging down naturally with hands outside bottom crop. Make the front neckline and front plaid bodice visibly face left so her body's front/back are unambiguous; no cleavage emphasis. Face worried, eyes looking left into lane, lips slightly parted catching breath. Head smaller than earlier, both ear tips fully within frame with margin. Beautiful coherent detailed anime illustration matching reference environment: cool blue fill, restrained warm amber rim, wet concrete corner and empty alley. No phone, no text, no pursuers, no collage. Prioritize sound human anatomy and natural profile silhouette over matching reference pose.

### handset

Generate ONE widescreen 16:9 polished cinematic anime close insert for the same rainy Japanese alley, matching the reference environment blue shadows and distant amber bokeh. Point of view looking down toward an adult woman's hands at waist height: the LEFT hand naturally supports a slim black smartphone, seen nearly square-on from above, the RIGHT thumb rests near the side power key without covering the screen. Only wrists/hands and a tiny blurred strand of blonde hair at far edge, no face, torso, breasts or cleavage. Correct natural hands with five fingers each, unobtrusive nails, no jewelry invented. Phone portrait rectangle centered at x50%, screen bounds approximately x40%-60%, y17%-82%, straight vertical edges and near-frontal glass so game can typeset a small message on it. Screen blank uniformly dark navy, no generated text, no icons, no UI, no bloom. Phone occupies 25% frame width, surrounded by generous dark negative space and blurred wet asphalt. Intimate tense grounded shot, subdued light, realistic proportions within anime illustration. No floating phone, no decorative frame, no collage.

### 生成後の修正指定

Edit this cinematic still. Preserve Luna's exact character design, alley environment, night lighting, finished anime rendering, and character-on-right / empty-alley-on-left layout. Fix the storytelling gaze and framing: the camera must look OVER HER RIGHT SHOULDER at her face turning toward SCREEN LEFT. Her nose must point left and her eyes must look directly into the visible empty alley on the left, NOT toward the right edge or the viewer. Show a natural left-facing worried profile/three-quarter profile as she checks behind her. She stays behind the right-side wall corner, shoulders and upper chest only, no hands or phone. Make the head slightly smaller so BOTH cat ear tips have clear margin below the top edge. Keep the left half unobstructed with the lane clearly visible. Do not horizontally flip the whole image; change her head/upper-body orientation to match that leftward sightline. No text, no panels.

undefined

## 旧版（2026.10.17.13）

追跡カットは人物なしの路地と足音で表現。振り向きは添付上段右の静止画を胸元で切る構図に変更（1ポーズ512×768のため過度な拡大を避ける）。通知カットでは人物を表示せず、スマホ図形を左・文面を右に分けた黒／白／赤の斜めのグラフィックを使う。通知前は文面を隠し、音の後に表示。人物の動作アニメ・追加画像生成なし。セリフと約35秒の尺は維持。

## 旧版（2026.10.17.12）

約35秒。足元3.6秒 → 添付の後ろ姿と路地4.4秒 → 振り向き4秒 → 通知音・振動・スマホ文面5.2秒 → 警戒2.2秒 → 座った背中3.2秒 → 募集看板4.8秒 → 建物全景と「……ここなら……。」6秒 → 暗転1.4秒。以下の旧版メモより本段落と実装を優先。

添付素材 `assets/events/luna-rear-turn.png` の上段2枚を独立した静止カットで使用。連続ポーズアニメーションは行わない。スマホ文面と募集看板の文字はHTMLで描画。通知文面は通知音の後に表示し、音声の台詞としては扱わない。静かな場面のBGM抑制はシーンのquiet指定と同期。画面での通し確認はユーザー担当とし、テスト・ビルドを実施。

### 追加素材と生成プロンプト（内蔵image_gen）

スマホ手元の生成画像はユーザー判断で不採用。配信対象に含めず、路地＋添付の振り向き姿＋HTML/CSSのスマホ表示を使用。
- `assets/events/luna-rental-insert.png`：既存の建物を参照した募集掲示板。

手元（不採用の生成記録）：

Cinematic anime visual novel insert, widescreen 16:9. At night in a wet Japanese alley, tight closeup of an adult woman's delicate hand holding a black smartphone upright, cropped blonde hair and black-and-white plaid sleeveless dress at far left edge, no face. Phone is front facing, straight vertical rectangle, centered at 55% horizontal 48% vertical, screen occupies about 24% of frame width and 70% height, dark blue blank glass ready for UI compositing. Amber distant streetlight bokeh, cold blue wet pavement, tense intimate framing. Detailed polished illustration, no text, no notifications, no other people.

掲示板（参照：luna-courtyard-plate.png）：

Reference image is the exact apartment exterior and style to match. Create a cinematic anime widescreen 16:9 close insert of its weathered wooden neighborhood bulletin board at the entrance, rain drops, warm fluorescent light, blue night. Camera squarely facing the board, no tilt. A single prominent blank aged cream rectangular rental notice centered, paper edges at x30%-70%, y16%-84%, affixed with four pins. Behind the board blurred hints of matching old exterior, rails and ivy. No people. No text whatsoever on the central blank paper; game will typeset it. Polished dramatic visual novel illustration.

## 旧版の制作記録（2026.10.17.11）

本編の第一幕クリア後に `showActTwoOpening()` から再生する約47秒・8カットのオープニング。確認URL `?preview=act-two-opening` と、以前の `?preview=luna-motion` も同じ本編実装へ接続する。

人物のポーズ切り替え、スプライトシート、補間、身体の変形は使用しない。専用の静止画と背景＋透過キャラを使い、カット割り・画面揺れ・急な寄り・黒への切り替え・静止・音で演出する。以前の動作試作はアプリ／単体版ビルド／Pagesの配信対象から外す。

## カット

細切れのカットと途中の暗転を削除。逃走中にけもの荘が写るCGは使用しない。同じ画像の場面はsrcを再設定せず、開始前に画像をデコードして保持する。再生確認はユーザーが行い、今回ブラウザでの録画・画面確認は省略。新規画像生成なし。

足元と足音5秒 → 路地での逃走と減速8秒 → 背後を警戒7秒 → スマホ6秒 → 座り込んだ後の静止5秒 → 建物全景へ9秒 → 最後の一言5秒 → 暗転1.5秒。

足音・着地・スマホの振動と画面の揺れは同じイベント時刻を参照する。息を潜める場面と座り込んだ後の静止では揺れを止め、BGMも止める。建物を見せる場面は同じ静止画を保持し、背景と手前の人物でカメラ倍率を変えて奥行きを出す。

画像読み込み後に開始。一時停止、次カット、スキップ、読み込み失敗時の再試行に対応。非表示タブでは時計・効果音・音声を止める。Spaceで停止／再生、Enter／右矢印で次カット。通常会話のメッセージUI、章進行、チェックポイントは維持する。

## 後から音声を付ける場合

`src/act-two-opening.js` の `ACT_TWO_OPENING_SCENES[].cues` に開始秒、字幕終了秒、speaker、emotion、text、安定したIDを保存。voice-scriptのact2スコープから抽出できる。音声と効果音は別トラック。台詞再生中はカット末尾手前で待ち、読み終わるまで次へ自動遷移しない。今回、台詞音声の新規生成は行っていない。

## 画像ファイル

内蔵image_genで生成した静止画をプロジェクト内へ保存。

- `assets/events/luna-alley.png`：人物のいない夜の裏道。
- `assets/events/luna-heel.png`：濡れた路面を蹴るヒールのインサート。
- `assets/events/luna-seated-rear.png`：座り込んだルナの透過の一枚絵。
- 既存の `luna-flight.png`、`luna-phone.png`、`luna-courtyard-plate.png` も使用。

## 最終使用プロンプト

### 裏道（参照：luna-flight.png）

Use case illustration-story. Clean cinematic animation BACKGROUND PLATE, widescreen 16:9. Match the sophisticated detailed painted anime film style, wet asphalt, deep midnight blue and practical amber lighting of reference. Anonymous narrow Japanese residential BACK ALLEY at night, NOT the apartment in reference. NO people anywhere. Side-on low tracking-camera composition: wet asphalt roadway fills bottom third, weathered concrete wall and pipes occupy middle third, ordinary dim residential windows and overhead power cables upper third. Left to right street continuity, no major vanishing point in center, suitable for lateral tracking of a running character composited later. At far right edge a shadowy corner wall indicates a turn into another lane. Tiny sparse warm wall lamps and cold night ambient fill, reflective wet curb, restrained cinematic chiaroscuro, tense deserted atmosphere. Foreground pavement stays clear, no trash hiding character feet. No recognizable けもの荘 building, no dramatic neon or fantasy architecture. No human figures, no text, no labels, no borders, no baked vignette, no rain streaks baked into picture (rain animated separately). Premium painterly anime background, sharp yet atmospheric.

注：このプロンプトの「animation」は制作背景素材の用途名。現行実装では静止背景として使用し、人物の走行や雨のアニメーションを作らない。

### 足元（参照：luna-flight.png）

Use case illustration-story. One SINGLE cinematic widescreen 16:9 still insert illustration, no animation, no panels. Match Luna and the painterly anime style of the reference. Extreme LOW ANGLE CLOSE-UP of adult Luna's black platform ankle-strap heel striking wet asphalt mid-escape, lower leg visible only from mid-calf down, tiny water splash caught in the instant, other shoe a blurred hint farther behind. Shoe design must match reference exactly. Camera almost touching pavement, strongest focus at heel and water contact, pavement reflections stretch away into anonymous dark Japanese alley; no apartment building visible. Deep midnight navy, warm amber glints, shallow depth of field, tense urgent dramatic diagonal composition. Clear high-quality detailed anime film insert, visually beautiful real water droplets. No face, no extra feet, no text, no speed-line graphics, no borders or watermark.

### 座り込んだ後ろ姿（参照：hostess.png、luna-sanctuary.png）

Use case identity-preserve. ONE SINGLE still character illustration on a genuinely TRANSPARENT background. This is NOT an animation, NOT sprite sheet, no extra frames. Adult Luna from reference1, seated collapsed exhausted, FULL BACK VIEW with her back toward camera, head and body centered, full body from ears to feet and tail included with transparent margin. Match reference2 cinematic painterly anime shading and pose, but body viewed more directly from behind, knees folded to right naturally, right palm on ground at her side, long wavy blonde hair falling down back, blonde feline ears, large fluffy blonde tail resting to left, black ribbons with gold heart ornaments. Exact black-white plaid sleeveless short dress, black ankle-strap platform heels, black handbag resting at right hip. Exhaustion and relief in shoulders, head slightly lowered. Keep hair/body proportions consistent with reference1. Warm rim from corridor lamps, cool midnight fill, subtly darker than daytime portrait. Respectful nonsexualized rear view, skirt covers body naturally. CRITICAL: alpha background must be truly empty and transparent everywhere outside character, no black matte, no glow halo, no shadow plane, no floor, no gradient, no scenery. No text, no labels, no grid, no frame. Beautiful polished high-resolution still asset for compositing over a night apartment background.
