# 第三幕マップ用ライフル持ち大家（2026-10-29）

内蔵imagegenで制作。matched-v3/idle.png と new-poses/emotions/neutral.png を参照し、顔・渦巻き目・白黒の髪・茶色のセーター・黒いズボン・頭身を維持して、アサルトライフルを両手で持つ差分を追加。

保存先は `assets/characters/manager/matched-v3/map-rifle.png` と `map-rifle-walk_a.png`、`map-rifle-walk_pass_a.png`、`map-rifle-walk_b.png`、`map-rifle-walk_pass_b.png`。512×512、原点(256,492)、立ち姿455px。`map-rifle.json` に登録記録。全歩行コマは共通縮尺。`tools/prepare-manager-map-art.py <立ち原稿> --walk <歩行原稿>` で再配置する。画像内容を塗り替える処理や実行時のポーズ別倍率は使用しない。

第三幕の街マップだけに使用し、通常の観察用大家の素材は変更しない。帰路は既存の隊列反転に従い、大家が先頭を保つ。歩行は実際の移動距離20pxごとに4コマを進め、停止・非表示中には足運びも停止する。動きを減らす設定では立ち姿を使用する。新しい発砲イベントや台詞は追加しない。

## 立ち姿の生成指示

Use case: precise-object-edit. Asset: one game-ready full-body transparent chibi landlord sprite for the Act III street map. EDIT TARGET Image 1 is the APPROVED matched-v3 idle frame, 512x512, foot pivot (256,492), standing character height 455. Image 2 is the same approved FACE DESIGN MASTER. Preserve EXACT face identity, spiral eyes, eye bags, white-and-black swept hair, eyebrow shape, tired but focused expression, brown ribbed sweater, black trousers and black shoes, head-to-body proportions, head size, camera angle, linework, coloring, pose scale and foot placement of image 1. Change ONLY the hands/forearms out of pockets and add ONE recognizable dark modern ASSAULT RIFLE held naturally across the LOWER CHEST and WAIST in BOTH HANDS, barrel angled gently toward lower screen right, not aimed at the viewer. The rifle should be readable as a compact assault rifle, dark metal with a stock and magazine, no logos or writing, and remain fully within the transparent canvas. Keep the ENTIRE FACE AND HAIR unobstructed and identical, no helmet, no armor, no uniform, no added belt or holster or other equipment. The body stays standing, same stable feet, not attacking, not firing, no muzzle flash, no smoke, no bullets, no wounds, no blood, no extra people, no new expression. Do not make him heroic, realistic adult-proportioned or more muscular. Draw just this same chibi landlord with the rifle. Actual alpha transparency, no floor or shadow, no white sticker border, no text. Keep the same SQUARE framing and clear margins of image 1, full hair and both shoes visible.

## 歩行

既存の4コマ歩行周期へ、立ち姿と同じライフルを持たせた差分を合わせた。フレームは `map-rifle-walk_a.png`、`map-rifle-walk_pass_a.png`、`map-rifle-walk_b.png`、`map-rifle-walk_pass_b.png`。頭と胴体の位置は歩行周期に合わせ、画像の塗り替えや実行時のポーズ別倍率は使わない。

