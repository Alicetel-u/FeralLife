// Asset normalization only: preserves the ImageGen cutout's artwork and alpha.
// Run with the bundled sharp package, or a normal local sharp installation.
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(process.env.FERAL_ASSET_MODULE_ROOT ? join(process.env.FERAL_ASSET_MODULE_ROOT, 'package.json') : import.meta.url);
const sharp = require('sharp');
const dir = join(root, 'assets/characters/cat');
const input = join(dir, 'cutout-master.png');
// Omit only the transparent outer canvas; retain all visible tail and smoke.
const cropped = await sharp(input).extract({ left: 262, top: 94, width: 807, height: 1089 }).png().toBuffer();
await sharp(cropped).toFile(join(dir, 'cutout.png'));
const sprite = await sharp(cropped).resize(82, 112, { fit: 'inside', kernel: 'nearest' }).png().toBuffer();
const portrait = await sharp(cropped).resize(100, 136, { fit: 'inside', kernel: 'nearest' }).png().toBuffer();
await sharp({ create: { width: 96, height: 128, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: sprite, left: 12, top: 15 }]).png().toFile(join(dir, 'idle.png'));
await sharp({ create: { width: 128, height: 160, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: portrait, left: 14, top: 12 }]).png().toFile(join(dir, 'portrait.png'));
await writeFile(join(dir, 'asset.json'), JSON.stringify({
  character: 'cat', source: 'reference-original.png', method: 'Built-in ImageGen background-extraction; nearest-neighbor normalization',
  cutout: 'cutout.png', sprite: 'idle.png', portrait: 'portrait.png',
  frame: { width: 96, height: 128, origin: [48, 126] },
  portraitFrame: { width: 128, height: 160 },
  displayHeight: 44, supportedPoses: ['base-standing'],
  note: '基本立ち絵。移動は位置補間・上下揺れ・左右反転、睡眠は簡略回転。専用の行動差分は未作成。'
}, null, 2) + '\n', 'utf8');
console.log('Prepared cat: transparent cutout, 96×128 sprite, 128×160 portrait');
