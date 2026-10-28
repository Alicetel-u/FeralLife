# 橋で二人が倒れる演出（2026-10-29）

ユーザー指定：モクとルナが橋で倒れたことをはっきり伝える、絶望の演出。既存台詞・原因不明の突然の崩落・時計を経たコンビニへの死に戻りを維持する。

## 実装

- `assets/events/chapter3/bridge-collapse-fall.png`：二人の力が抜けて橋の路面へ崩れる直前。
- `assets/events/chapter3/bridge-collapse-after.png`：二人が橋の路面に全身を横たえ、大家だけが立ち尽くす。
- 通常の橋の会話中はCGを出さない。崩落のナレーションに入った瞬間に専用CGへ切り替え、約0.8秒で倒れた後へ接続。短い衝撃と非常に緩い寄りで見せる。
- 立ち絵とマップ用ステッカーは隠す。二人の全身と足先を切らずに見せるため、画像はcontain配置。標準メッセージウィンドウ・名前欄・送り矢印を使う。
- BGMを停止。`syncNormalBgm` が再実行されても崩落中は無音を維持する。新しい台詞・悲鳴・有料音声は追加しない。
- 少なくとも3.2秒間、倒れたことを確認できる間を置く。連打・本文タップ・AUTOでも飛ばせない。その後の「…………え？」と既存の時計へつなぐ。
- メニュー・履歴・UI非表示・タブ非表示の間は時間を進めない。保存形式は変更せず、崩落中に再開した場合は短い演出を再生してから同じ台詞へ戻る。
- 動きを減らす設定では倒れた後の静止画を出し、揺れと寄りを省く。
- `?preview=act-three-map&scene=collapse&silent=1` は通常セーブとは独立した無音確認。開発メニューは4件ずつのページ分けで、橋・倒れる瞬間・コンビニ死に戻りの実シーンへ入れる。

二人に外傷・感染・魔法の境界などの原因は描いていない。悲劇を喜劇の動きにせず、人物の外見・服装は既存のプロローグCGを参照した。

## imagegen の生成指示

内蔵imagegenを使用。最初のCGはプロローグの3人、橋のランドマーク、大家の基準画像を参照。次に、完成した倒れた後のCGを編集し、背景・カメラ・外見を揃えて倒れる直前を作成。

### 倒れた後

> Use case: illustration-story. Create one premium dramatic anime visual-novel EVENT CG, SQUARE composition, fully opaque painted environment, not a sticker. References: image 1 supplies the EXACT three adult character identities and polished anime cinematic painting style ONLY, not its fire/zombie situation. Image 2 supplies the teal weathered Japanese steel truss BRIDGE location ONLY, do not use its white sticker outline. Image 3 supplies the landlord's correct brown sweater and black trousers and black-white hair identity, NOT its chibi proportions. Scene: at blue dusk on the intact bridge deck, BOTH Moku and Luna have suddenly collapsed unconscious for an UNKNOWN reason. CRITICAL: show BOTH women's COMPLETE bodies lying FLAT on the asphalt, full length from heads to shoes, clearly resting on the ground, eyes closed, slack arms, NOT sitting, NOT kneeling, NOT sleeping in beds, NOT leaning against anything. Moku foreground-left: adult female black cat ears, short black bob, white loose short-sleeve T-shirt, black shorts, dark shoes, black tail. Luna foreground-right: adult female golden blonde cat ears, long wavy blonde hair, black ribbon, black-and-white CHECKERED dress, dark shoes, gold accessories. Both lie diagonally in separate readable silhouettes; heads nearer middle, feet nearer lower corners; ordinary modest clothing kept in place, no underwear or sexual posing. Landlord stands upright in the mid-background behind and BETWEEN the two fallen women, rigid and stunned, arms hanging then one hand reaching slightly, eyes wide with disbelief, pale face with tired eye bags, two-tone black and white hair, brown ribbed sweater, black trousers. No other characters. Camera elevated looking downward enough to unmistakably show two bodies flat on the road, with bridge girders providing perspective. Compose all three within CENTRAL 85% of square, leave a little clear margin around both heads and all four feet, make the women the main subject. They are not embracing, separate bodies, no duplicate or missing limbs. Quiet empty bridge, cold teal girders and muted slate asphalt, very distant dusk sky. Psychological despair, sudden silence, warm highlights dying into cool blue shadow, high-detail clean expressive anime art consistent with reference. NO blood, NO wounds, NO gore, NO zombie infection, NO magic, NO glowing barrier, NO ghost effects, NO visible cause, NO attackers, NO extra props, NO weapons, NO text, NO UI, NO captions, NO logos, NO white borders. A heartbreaking readable still immediately after a sudden simultaneous fall; do not add explanations or imply a diagnosed cause.

### 倒れる直前

> Edit this existing square anime bridge CG to create the immediately preceding instant, about half a second earlier. Preserve EXACT camera framing, bridge, dusk lighting, painting style, character identities, hair, clothing, all positions relative to bridge, and landlord's placement. Change ONLY the poses of Moku foreground-left and Luna foreground-right: show BOTH simultaneously LOSING ALL STRENGTH and COLLAPSING DOWNWARD, knees folding beneath them, upper bodies tipping sideways toward the asphalt, eyes suddenly shut, limp arms dropping. They are caught in a clear mid-fall, NOT calmly kneeling, NOT sitting, NOT crawling, NOT standing, NOT flying, no theatrical dance or fighting pose. Their bodies should be near the ground and about to land in the same left/right positions as in the original. Show complete bodies and all feet, same modest white T-shirt and black shorts on Moku, same black-and-white checkered dress and blonde ribbons on Luna. The landlord stays standing behind them in his brown ribbed sweater and black trousers, recoiling with one hand out in shocked disbelief. No premonition, no wounds, no blood, no zombie infection, no magic or energy, no attackers, no new props, no textual sound effects, no UI. Maintain the serious heartbreaking tone, not comedic or sexual. Keep exact square composition so a quick cut back to the supplied aftermath image reads as one continuous sudden collapse. No added motion blur over faces; readable anatomy.
