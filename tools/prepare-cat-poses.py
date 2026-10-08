# 生成AIの白背景JPG（assets/characters/cat/poses/raw/*.jpg）を、ゲーム用の透過PNGへ整える。
# 実行：python tools/prepare-cat-poses.py
# - 全ポーズを同じ倍率で縮小（基本立ち絵 idle.png と1ドットの大きさを合わせる）
# - 外周から繋がった白背景を透過。腕と体の間など閉じた背景も「ほぼ純白の塊」として透過
# - 立ち・座りは 96×128（足元 48,126）、寝姿は 160×112（下端中央 80,108）に配置
from collections import deque
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'assets/characters/cat/poses/raw'
OUT = ROOT / 'assets/characters/cat/poses'
POSES = ['walk_a', 'walk_b', 'sit', 'sleep', 'eat', 'drink', 'clean', 'angry', 'chat']
CHAR_HEIGHT = 111     # 基本立ち絵での「耳の先〜サンダル」の高さ（ドット）
REFERENCE = 'walk_a'  # 倍率の基準にする立ちポーズ


def is_bg(p, strict=False):
    """白背景らしい色か。strict は閉じた領域用（シャツの淡い灰色を消さないため厳しめ）。"""
    r, g, b = p[:3]
    lo, hi = min(r, g, b), max(r, g, b)
    return (lo >= 247 and hi - lo <= 6) if strict else (lo >= 222 and hi - lo <= 22)


def content_bbox(img):
    w, h = img.size
    px = img.load()
    xs, ys = [], []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if not is_bg(px[x, y]):
                xs.append(x); ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)


def components(img, mask_fn):
    """mask_fn を満たす画素の連結成分を返す（4近傍）。"""
    w, h = img.size
    px = img.load()
    seen = [[False] * w for _ in range(h)]
    out = []
    for sy in range(h):
        for sx in range(w):
            if seen[sy][sx] or not mask_fn(px[sx, sy]):
                continue
            q, comp = deque([(sx, sy)]), []
            seen[sy][sx] = True
            while q:
                x, y = q.popleft(); comp.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and mask_fn(px[nx, ny]):
                        seen[ny][nx] = True; q.append((nx, ny))
            out.append(comp)
    return out


def cutout(img):
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()
    for comp in components(img, is_bg):
        touches_edge = any(x in (0, w - 1) or y in (0, h - 1) for x, y in comp)
        strict_white = sum(is_bg(px[x, y], True) for x, y in comp) / len(comp) > .85
        # 外周に繋がる背景、または閉じた純白の塊（一定以上の大きさ）を透過
        if touches_edge or (strict_white and len(comp) >= 4):
            for x, y in comp:
                px[x, y] = (0, 0, 0, 0)
    # 輪郭の外側に残った白いフチを削る（シャツ等は暗い輪郭の内側なので透明部分とは接しない）
    for _ in range(2):
        fringe = []
        for y in range(h):
            for x in range(w):
                p = px[x, y]
                if p[3] and min(p[:3]) >= 185 and any(
                        0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0
                        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1))):
                    fringe.append((x, y))
        for x, y in fringe:
            px[x, y] = (0, 0, 0, 0)
    return img


def main():
    ref = Image.open(RAW / f'{REFERENCE}.jpg').convert('RGB')
    l, t, r, b = content_bbox(ref)
    scale = CHAR_HEIGHT / (b - t)
    print(f'scale={scale:.4f} (reference bbox height {b - t}px)')
    manifest = {}
    for name in POSES:
        src = Image.open(RAW / f'{name}.jpg').convert('RGB')
        l, t, r, b = content_bbox(src)
        pad = 12
        crop = src.crop((max(0, l - pad), max(0, t - pad), min(src.width, r + pad), min(src.height, b + pad)))
        small = crop.resize((max(1, round(crop.width * scale)), max(1, round(crop.height * scale))), Image.NEAREST)
        sprite = cutout(small)
        sprite = sprite.crop(sprite.getbbox())
        if name == 'sleep':
            fw, fh, origin = 160, 112, (80, 108)
        else:
            fw, fh, origin = 96, 128, (48, 126)
        frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
        # 足元（画像の下端）を基準点に、横方向は中央へ
        left = origin[0] - sprite.width // 2
        top = origin[1] + 1 - sprite.height
        frame.alpha_composite(sprite, (max(0, left), max(0, top)))
        frame.save(OUT / f'{name}.png')
        manifest[name] = {'size': sprite.size, 'origin': origin}
        print(f'{name}: sprite {sprite.size} -> frame {fw}x{fh}')
    # 確認用のプレビュー（暗い背景に4倍表示）
    tiles = [Image.open(OUT / f'{n}.png') for n in POSES] + [Image.open(ROOT / 'assets/characters/cat/idle.png')]
    sheet = Image.new('RGBA', (sum(t.width for t in tiles) + 8 * len(tiles), 136), (40, 48, 40, 255))
    x = 4
    for tile in tiles:
        sheet.alpha_composite(tile, (x, 136 - tile.height - 4)); x += tile.width + 8
    sheet = sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST)
    sheet.save(OUT / 'raw' / 'preview.png')


if __name__ == '__main__':
    main()
