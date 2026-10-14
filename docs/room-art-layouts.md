# モク・ルナの部屋（生成版 v2）

画像生成は組み込み image_gen を使用。2026-10-15に生成したドット調の2D背景。写実的な試作は採用していない。

- モク：assets/rooms/cat/interior-v2.png
- ルナ：assets/rooms/hostess/interior.png
- 旧モク素材 assets/rooms/cat/interior.png は保管。旧ペイントスクリプトは新画像を上書きしない。
- ROOM_ARTは部屋番号ではなく入居者typeで選ぶため、入居時に自動適用。
- 窓は同じ位置。家具と歩行の基準面は173×113。画像ピクセル数とは独立。

## 行動の足元（両室共通）

| 場所 | x | y | 用途 |
|---|---:|---:|---|
| bed |48|92|布団／ローベッドで眠る|
| table |82|104|食事・飲酒|
| tv |105|104|テレビを見る|
| window |65|94|窓辺で喫煙|
| fridge |137|98|冷蔵庫前・食事準備|
| center |55|105|片づけ|
| hall |113|108|出入口側|

src/room-layouts.jsに家具の矩形、テレビ画面、窓と足元を記録。src/movement.jsのhomeSpotも同じROOM_SPOTSを参照。将来、住人別に配置を変えるときは、画像とこの座標定義・経路の双方を更新する。
テレビの発光はscreen矩形を使用。選択肢の背景も第一幕はモク、第二幕はルナの部屋。火災と巻き戻しの室内絵も新モク素材に揃える。

## 生成プロンプトの仕様

共通：ONE empty room, no people, no characters, no UI, no readable text, no brands. Original 2D pixel-art Japanese chibi apartment-life game background. Straight-on cutaway view, ratio173:113, floor starts around67%. Chunky square pixel clusters, crisp stepped outlines, limited palette, simple2–3 tone shading. No realistic textures, photographic surfaces, dramatic perspective, glossy3D, depth of field. Same window and furniture placement as reference. Full-bleed room.

モク：既存assets/rooms/cat/interior.pngを参照。ニコチンで黄ばんだベージュ壁、くすんだオリーブの布団、木の床、灰皿・吸い殻・空き缶・カップ麺・端に寄せたゴミ袋・左の洗濯物。散らかっているが行動位置は見える。特定作品のキャラや部屋は再現しない。

ルナ：生成したモクのドット調画像を構図とタッチの参照に使用。同じ窓・テレビ・冷蔵庫・テーブルの配置。左のローベッドにダスティピンクの寝具。化粧台と鏡、化粧品・香水・ブラシ、仕事着のドレスとローブ、ヒール、バッグ、買い物袋、文字のないレシート、スマホとお茶。クリーム・ローズ・くすんだ紫・控えめな金。華やかな身支度と安い賃貸の生活感を両立。
