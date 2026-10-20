# 第二幕エピローグ用素材

生成方法: 組み込み ImageGen。元のアパート・102号室の構図と画風を参照し、既存素材を上書きせず追加。

| ファイル | 用途 | 参照 |
|---|---|---|
| `assets/events/epilogue/morning-v1.png` | 5日目の朝の玄関 | `assets/apartments.png` |
| `assets/events/epilogue/night-v1.png` | 夜、102号室だけに灯る明かり | `assets/apartments.png` |
| `assets/events/epilogue/room-night-v1.png` | 夜の鏡台 | `assets/rooms/hostess/interior-illustrated-v1.png` |
| `assets/events/epilogue/ledger-v1.png` | 黒塗りの名簿 | 新規生成 |
| `assets/events/epilogue/ledger-blank-v1.png` | 最後の白紙ページ | `ledger-v1.png` |

## 生成プロンプト

### 朝

Use case: lighting-weather. Edit target: attached existing apartment game background. Create a new full-resolution landscape background for the epilogue of the same Japanese visual novel. Preserve the exact same building, all six doors, balconies, sign, stairs, camera angle, framing, surroundings, and detailed hand-painted anime linework. Change ONLY the time of day from orange sunset to a peaceful clear early morning: blue sky, small white clouds, soft clean sunlight, outdoor lamps and nearby building windows off. No fire, no smoke, no characters, no overlays, no new objects, no extra writing. Preserve the existing sign and door labels. This is the morning after a resolved incident; everything intact.

### 夜の外観

Use case: lighting-weather. Edit target: existing apartment game background. Make a new landscape night version of this exact same hand-painted Japanese visual-novel background. Keep the identical architecture, all six doors and numbers, sign, stairs, balconies, rooftop tank, framing and camera angle. Quiet deep blue night with a few stars, no sunset orange. All interior windows dark except a very faint warm light leaking around the door of ground-floor room 102 in the middle. Corridor fluorescent lamps off. The sign unlit. No characters, no fire, no new objects or captions. High detail, gentle suspense.

### 102号室

Use case: lighting-weather. Edit target: the existing pink Japanese apartment bedroom background. Create a new landscape background for a quiet night scene. Keep the same room, pink curtains, furniture, vanity mirror and closed drawers, bed, table, television, refrigerator, and the same framing and hand-painted anime style. Change daylight outside the window to deep blue night. Turn the ceiling fluorescent lamp off. The vanity area has a small warm pool of light, the rest of the room dim purple and blue. No people, no silhouettes or reflections of people, no visible contents of any drawers, no new readable text, no added objects. Subtle suspense, detailed and beautiful, not horror.

### 名簿

Use case: illustration-story. Asset type: a full-screen memory insert for a Japanese visual novel, landscape 16:9 composition. Primary request: an old Japanese apartment tenant register lies open in a featureless overexposed white void. A close three-quarter overhead view of the entire open ledger, centered with roomy white space around it, paper slightly yellowed, dark faded cloth cover and worn binding. Across BOTH open pages, thin ruled rows with short handwritten Japanese name-like strokes ALL completely obscured by thick rough black censor ink bars. No decipherable names, no legible headings or numbers, no identities, no logos. The notebook is the sole object, no desk, no hands, no people, no flames. Match a refined hand-painted 2D anime visual-novel background with natural paper texture and soft warm shadow. The white void must remain plain near image edges so it can blend into a white flashback screen.

### 白紙の最終ページ

Use case: precise-object-edit. Edit target: this open old tenant ledger in a white void. Create the identical shot after a page has turned to the final page. Change ONLY the RIGHT-HAND PAGE: it is completely blank aged cream paper, with absolutely no ink, no redaction bars, no rules, no text, and no markings. Keep all ink bars and lines on the LEFT PAGE completely unchanged. Preserve the exact camera angle, framing, white void, binding, page shapes, paper texture, cover, overall image dimensions, shadows and illustration style. No flame, no hands, no extra objects.
