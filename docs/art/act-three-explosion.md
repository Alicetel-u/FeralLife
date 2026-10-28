# 第三幕・交差点と裏道の演出修正（2026-10-29）

ユーザー指定により、交差点の「交差点にゾンビが現れ、群れが道路を横切っていく。」では立ち絵を表示せず、既存のゾンビ画像6体を横断移動させる。台詞・標準メッセージウィンドウ・現在のL字の移動経路は変更しない。後続のモクとルナの反応には通常の立ち絵を使う。

裏道のCSS製トラック（荷台・運転席・車輪）と丸いグラデーション爆発を削除。爆発のナレーションでは立ち絵を出さず、`assets/events/chapter3/map-explosion-v1.png` を一枚表示する。太い白フチの描き起こし画像を約0.85秒だけ拡大・揺らし、弱い暖色の閃光を重ねる。その後は落ち着いた静止状態にする。煙のナレーションでも立ち絵を外すが、会話の反応には通常どおり立ち絵を使う。

PNG一枚（約2.1MB）と少数のDOM要素で構成し、動画・大量の粒子・毎フレームの画像生成は使わない。ゾンビの移動はtransform、煙はtransformとopacityのみを動かす。メニュー・履歴・UI非表示・一時停止・タブ非表示では演出を停止。動きを減らす設定では横断を静止配置へ切り替え、揺れと閃光を省く。台詞位置の保存形式と録音は変更しない。

## imagegen の生成指示

内蔵 imagegen を使用。`assets/events/chapter3/map-crossing.png` は白フチ・描線・塗りの参照のみ。出力は背景透過PNG。

> Use case: stylized-concept. Create ONE premium hand-painted anime comic EXPLOSION die-cut sticker for a Japanese visual-novel map. Reference image is STYLE ONLY: match bold thick white cutline, crisp dark ink, tactile cel-painted detail and playful substantial shapes; do not draw the intersection. Truly transparent background, isolated centered single connected silhouette with generous transparent margin. A powerful compact fiery explosion at its peak: brilliant ivory core at lower center, layered golden yellow and orange flame tongues pushing outward, deep red-orange shadowed folds, handsome sculpted billowing charcoal smoke curling above, a few large stylized debris flecks ATTACHED inside the same outer contour. Wide mushroom-shaped composition, readable at 350px wide, slightly exaggerated but impressive and high-quality, not a flat starburst icon or cheap radial-gradient ball. White outer sticker border very thick, clean and unbroken, slight dark offset shadow. No truck, no vehicle, no people, no scenery, no letters, no text, no panel, no frame. Fire and smoke fully painted, not photographic. Portraits will be absent so this should be a strong main visual on a red cream and charcoal game screen. Single still asset, no animation frames.
