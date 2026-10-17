# 第二幕「逃げる女」オープニング制作メモ

## 現行版：2026.10.17.10

本編の第一幕クリア後に `showActTwoOpening()` から再生する約25秒・12カットのオープニング。確認URL `?preview=act-two-opening` と、以前の `?preview=luna-motion` も同じ本編実装へ接続する。

人物のポーズ切り替え、スプライトシート、補間、身体の変形は使用しない。専用の静止画と背景＋透過キャラを使い、カット割り・画面揺れ・急な寄り・黒への切り替え・静止・音で演出する。以前の動作試作はアプリ／単体版ビルド／Pagesの配信対象から外す。

## カット

暗がりと足音0.9秒 → ヒール1.05秒 → 逃走2.5秒 → 振り返りの寄り1.15秒 → 暗転0.35秒 → 息を潜める3.25秒 → 連絡3.4秒 → 座り込んだ後ろ姿1.1秒 → 静止1.35秒 → 建物全景へ5.4秒 → 最後の一言3.8秒 → 暗転0.65秒。

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
