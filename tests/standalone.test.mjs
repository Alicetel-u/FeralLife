import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

test('standalone game embeds its artwork, styles and syntactically valid script',async()=>{
  const html=await readFile(new URL('../play.html',import.meta.url),'utf8');
  assert.ok(html.includes('data:image/png;base64,'));
  assert.ok(html.includes('<style>'));assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/<link[^>]+stylesheet/.test(html));
  const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  assert.ok(!/^import /m.test(script));
  assert.ok(!script.includes('assets/characters/cat/idle.png'));
  assert.ok(!script.includes('assets/characters/cat/portrait.png'));
  assert.ok(!script.includes('assets/apartments.png'));
  assert.ok(html.includes('width="1920" height="1080"'));
  assert.ok(script.includes('requestFullscreen()'));
  assert.ok(script.includes('createOuting'));
  assert.ok(script.includes('await loadCharacterArt()'));
  execFileSync(process.execPath,['--input-type=module','--check'],{input:script,encoding:'utf8'});
});
