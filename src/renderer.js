import { ROOMS, CHARACTERS, ACTIONS, dateAt } from './simulation.js';
import { CHARACTER_ART, SCENE_ART } from './character-art.js';
import { exteriorRoomBounds, sampleJourney, motionLabel } from './movement.js';

export const WORLD_WIDTH = 1920;
export const WORLD_HEIGHT = 1080;
export function roomBounds(room, focusRoom = null) {
  if (focusRoom) return room === focusRoom ? { x: 22, y: 35, w: 1156, h: 598 } : null;
  return { x: 10 + ((room % 100) - 1) * 397, y: room >= 200 ? 27 : 352, w: 386, h: 284 };
}
const rect = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
const noise = (x, y, seed) => { const v = Math.sin(x * 12.9898 + y * 78.233 + seed * 3.11) * 43758.5453; return v - Math.floor(v); };

export function drawSprite(ctx, type, x, y, tick = 0, action = 'idle', scale = 1, direction = 1) {
  const art = CHARACTER_ART[type];
  if (art?.image) {
    const image = art.image;
    const height = art.displayHeight, width = Math.round(image.width * height / image.height);
    const ox = Math.round(art.origin[0] * width / image.width), oy = Math.round(art.origin[1] * height / image.height);
    const bob = action === 'sleep' ? 0 : Math.sin(tick * 2) > .75 ? -1 : 0;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y + bob));
    ctx.scale(scale * direction, scale);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, -ox, -oy, width, height);
    ctx.restore();
    return;
  }
  const c = CHARACTERS[type];
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(scale * direction, scale);
  const p = (x, y, w, h, col) => rect(ctx, x, y, w, h, col);
  const fur = c.color, accent = c.accent, outline = '#33352d';
  const bob = action === 'sleep' ? 0 : Math.sin(tick * 2) > .75 ? -1 : 0;
  ctx.translate(0, bob);
  // Every resident shares a deliberately small pixel grid, with species-specific silhouettes.
  if (type === 'rabbit') { p(-7,-31,4,16,outline);p(-6,-30,2,13,fur);p(-6,-27,1,7,'#c88e8f');p(3,-33,4,18,outline);p(4,-32,2,15,fur);p(4,-29,1,8,'#c88e8f'); }
  else if (type === 'cat' || type === 'fox' || type === 'wolf') { p(-9,-23,6,10,outline);p(3,-23,6,10,outline);p(-8,-22,4,8,fur);p(4,-22,4,8,fur);p(-7,-20,2,3,'#b68f82');p(5,-20,2,3,'#b68f82'); }
  else { p(-11,-20,7,7,outline);p(4,-20,7,7,outline);p(-10,-19,5,5,fur);p(5,-19,5,5,fur);p(-9,-18,3,3,'#c3958b');p(6,-18,3,3,'#c3958b'); }
  if (type === 'fox') { p(8,-10,5,10,fur);p(12,-14,4,12,fur);p(13,-15,3,4,accent); }
  if (type === 'cat') { p(8,-9,3,10,fur);p(10,-6,4,3,fur);p(12,-11,2,7,fur); }
  if (type === 'mouse') { p(8,-2,7,2,'#c79992');p(14,-5,2,4,'#c79992'); }
  if (type === 'tanuki') { p(8,-8,5,8,fur);p(10,-7,4,2,outline);p(10,-3,4,2,outline); }
  const wide = type === 'bear' ? 2 : 0;
  p(-8-wide,-16,16+wide*2,14,outline);p(-7-wide,-15,14+wide*2,12,c.shirt);p(-5,-13,3,10,c.shirt);p(-6,-3,5,4,outline);p(1,-3,5,4,outline);p(-7,0,6,2,'#534c40');p(1,0,6,2,'#534c40');
  p(-9,-20,18,13,outline);p(-8,-19,16,11,fur);p(-6,-20,12,1,fur);
  if (type === 'tanuki') { p(-7,-16,6,4,'#51493f');p(1,-16,6,4,'#51493f'); }
  p(-4,-12,8,4,accent);p(-1,-12,3,2,'#514538');
  if (action === 'sleep') { p(-6,-15,3,1,outline);p(3,-15,3,1,outline); }
  else { p(-5,-16,2,2,outline);p(4,-16,2,2,outline);p(-5,-16,1,1,'#ded1a0');p(4,-16,1,1,'#ded1a0'); }
  p(-9-wide,-13,3,8,fur);p(7+wide,-13,3,8,fur);
  if (action === 'smoke') { p(9,-10,8,2,'#d8cdad');p(16,-10,2,2,'#d97c42');p(8,-11,3,4,fur); }
  if (action === 'drink') { p(9,-9,5,7,'#b6b38d');p(10,-9,3,1,'#dfc99f');p(10,-6,3,3,'#747555'); }
  if (action === 'eat' || action === 'steal') { p(8,-7,7,4,'#e8ce8f');p(9,-8,5,2,'#a66d41'); }
  if (action === 'shop' || action === 'sell') { p(8,-7,8,7,'#b89466');p(10,-9,4,2,'#cfb17e'); }
  if (action === 'stream') { p(-10,-19,2,7,'#393c42');p(8,-19,2,7,'#393c42');p(-8,-21,16,2,'#393c42'); }
  ctx.restore();
}
export function drawPortrait(canvas, type) {
  const ctx = canvas.getContext('2d'); canvas.width = 64; canvas.height = 68;
  ctx.imageSmoothingEnabled = false;
  rect(ctx,0,0,64,68,'#e1ded0');
  rect(ctx,9,52,46,5,'#cdcdbb');
  if (CHARACTER_ART[type]?.portrait) {
    ctx.drawImage(CHARACTER_ART[type].portrait, 8, 4, 48, 60);
    return;
  }
  drawSprite(ctx,type,32,56,0,'idle',1.5);
}

export class WorldRenderer {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.view = 'interior'; this.focus = true; this.focusRoom = 101; this.animTime = 0; this.last = 0; }
  reset() { this.last = 0; }
  draw(state, timestamp, paused, bubbles = []) {
    const ctx = this.ctx;
    this.bubbles = bubbles;
    this.speaking = new Set(bubbles.map(bubble => bubble.speaker));
    const dt = Math.min(.1, Math.max(0, (timestamp - this.last) / 1000)); this.last = timestamp;
    if (!paused) this.animTime += dt;
    const t = this.animTime;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,WORLD_WIDTH,WORLD_HEIGHT);
    ctx.setTransform(WORLD_WIDTH/1200,0,0,WORLD_HEIGHT/675,0,0);ctx.imageSmoothingEnabled = false;
    const h = dateAt(state.hour).hour + state.hour % 1;
    const darkness = h >= 20 || h < 5 ? .57 : h >= 18 ? (h - 18) * .25 : h < 7 ? (7 - h) * .19 : 0;
    const selected = state.residents.find(r => r.room === state.selected);
    const selectedPos = selected ? sampleJourney(selected, state.hour, ACTIONS[selected.action].place) : null;
    this.focusRoom = this.focus ? (selectedPos?.zone === 'room' ? selectedPos.room : state.selected) : null;
    if (this.view === 'exterior') { this.drawExterior(state,selectedPos,t,darkness); this.drawSpeech(state); return; }
    rect(ctx,0,0,1200,675,'#242b24');
    for (const room of ROOMS) {
      const b = roomBounds(room, this.focusRoom); if (!b) continue;
      const base = exteriorRoomBounds(room), r = state.residents.find(r => r.room === room);
      ctx.save(); ctx.beginPath(); ctx.rect(b.x,b.y,b.w,b.h); ctx.clip();
      ctx.translate(b.x,b.y); ctx.scale(b.w/base.w,b.h/base.h); ctx.translate(-base.x,-base.y);
      this.drawRoom(room,r,t,darkness); ctx.restore();
      const current = r ? sampleJourney(r,state.hour,ACTIONS[r.action].place) : null;
      const status = !r ? '空室' : current.zone === 'away' ? '外出中' : current.zone !== 'room' ? '移動中' : ACTIONS[r.action].label;
      rect(ctx,b.x,b.y-23,b.w,23,r?'#48513c':'#353f34');
      ctx.font='12px "Yu Gothic UI",sans-serif';ctx.fillStyle='#f0e7ca';ctx.textAlign='left';
      ctx.fillText(`${room}  ${r ? CHARACTERS[r.type].name : '次の住人を待っている部屋'}`,b.x+12,b.y-7);
      ctx.textAlign='right';ctx.fillStyle='#b7c29e';ctx.fillText(status,b.x+b.w-12,b.y-7);ctx.textAlign='left';
      if(r && current.zone !== 'room') {
        ctx.font=`${this.focus?22:14}px "Yu Gothic UI",sans-serif`;ctx.fillStyle='#e9dfbd';ctx.textAlign='center';
        ctx.fillText(current.zone==='away'?'外出中。帰りを待っている。':'今は部屋の外にいる。',b.x+b.w/2,b.y+b.h*.52);
        ctx.font=`${this.focus?15:11}px "Yu Gothic UI",sans-serif`;ctx.fillStyle='#bbb897';ctx.fillText('外観モードで廊下・階段・道を見られます',b.x+b.w/2,b.y+b.h*.52+27);ctx.textAlign='left';
      }
    }
    if (!this.focus) for (const y of [313,643]) { rect(ctx,8,y,1184,16,'#333d31');rect(ctx,8,y+1,1184,2,'#697258');ctx.fillStyle='#aeb59b';ctx.font='10px "Yu Gothic UI",sans-serif';ctx.fillText('共用廊下',16,y+12);ctx.textAlign='right';ctx.fillText('階段・屋外へ →',1180,y+12);ctx.textAlign='left'; }
    for (const r of state.residents) this.drawInteriorResident(state,r,t);
    this.drawSpeech(state);
  }
  exteriorCamera(selectedPos) {
    const zoom = this.focus ? 1.65 : 1, width = 1000 / zoom, height = 562.5 / zoom;
    const target = selectedPos?.zone === 'away' ? null : selectedPos;
    const cx = this.focus ? Math.max(width / 2, Math.min(1000 - width / 2, target?.x ?? 740)) : 500;
    const cy = this.focus ? Math.max(height / 2, Math.min(562.5 - height / 2, (target?.y ?? 420) - 60)) : 281.25;
    return { zoom, ox: cx - width / 2, oy: cy - height / 2 };
  }
  drawExterior(state,selectedPos,t,darkness) {
    const ctx=this.ctx, cam=this.exteriorCamera(selectedPos);
    ctx.save();ctx.scale(1.2*cam.zoom,1.2*cam.zoom);ctx.translate(-cam.ox,-cam.oy);
    if(SCENE_ART.image)ctx.drawImage(SCENE_ART.image,0,0,1000,562.5);else rect(ctx,0,0,1000,562.5,'#494d42');
    rect(ctx,0,0,1000,562.5,`rgba(16,27,49,${darkness})`);
    if(darkness>.3)for(let i=0;i<36;i++)rect(ctx,noise(i,2,1)*1000,noise(i,3,2)*115,1,1,'#e9dcc277');
    const people=state.residents.map(r=>({r,p:sampleJourney(r,state.hour,ACTIONS[r.action].place)})).sort((a,b)=>a.p.y-b.p.y);
    for(const {r,p} of people) {
      if(p.zone==='room'||p.zone==='away'||p.x<-45||p.x>1045)continue;
      const baseHeight=CHARACTER_ART[r.type]?.image?44:r.type==='rabbit'?34:26;
      const scale=80/baseHeight;
      rect(ctx,p.x-13,p.y+1,26,3,'#17211b66');
      drawSprite(ctx,r.type,p.x,p.y+(p.moving?Math.sin(t*11)*1.1:0),t,'idle',scale,p.direction);
      ctx.font='10px "Yu Gothic UI",sans-serif';ctx.textAlign='center';ctx.fillStyle='#f2e9d2';ctx.shadowColor='#151b18';ctx.shadowBlur=3;ctx.fillText(CHARACTERS[r.type].name.split(' ')[1],p.x,p.y-86);ctx.shadowBlur=0;ctx.textAlign='left';
    }
    ctx.restore();
  }
  drawInteriorResident(state,r,t) {
    const p=sampleJourney(r,state.hour,ACTIONS[r.action].place);
    if(p.zone==='away'||p.zone==='street'||p.zone==='stairs')return;
    const base=exteriorRoomBounds(p.room||r.room), b=roomBounds(p.room||r.room,this.focusRoom);if(!b)return;
    const ctx=this.ctx,x=b.x+(p.x-base.x)/base.w*b.w,y=p.zone==='hall'?b.y+b.h+16:b.y+(p.y-base.y)/base.h*b.h;
    const height=this.focus?300:144,baseHeight=CHARACTER_ART[r.type]?.image?44:r.type==='rabbit'?34:26,scale=height/baseHeight;
    ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h+27);ctx.clip();
    rect(ctx,x-height*.18,y+3,height*.36,5,'#23302255');
    if(r.action==='sleep'&&!p.moving&&p.zone==='room'){ctx.save();ctx.translate(x-12,y-2);ctx.rotate(-Math.PI/2);drawSprite(ctx,r.type,0,0,t,'sleep',scale*.72);ctx.restore();ctx.fillStyle='#ddd9b7';ctx.font=`${this.focus?25:16}px monospace`;ctx.fillText('Z z',x+20,y-height*.42);}
    else drawSprite(ctx,r.type,x,y+(p.moving?Math.sin(t*11)*2:0),t,r.action,scale,p.direction);
    if(r.action==='smoke'&&!p.moving)for(let i=0;i<4;i++){const s=(t*.7+i*.65)%2.6;rect(ctx,x+height*.37*p.direction+Math.sin(s*2)*5,y-height*.64-s*height*.1,Math.max(2,height*.015),Math.max(2,height*.015),`rgba(211,212,220,${.38-s*.13})`);}
    if(['fight','stream','chat','sell','gamble','shop','collect'].includes(r.action)&&!p.moving&&!this.speaking?.has(r.type)){ctx.fillStyle='#efe3c3';ctx.font=`${this.focus?32:20}px monospace`;ctx.fillText(ACTIONS[r.action].icon,x+height*.15,y-height);}
    ctx.restore();
  }
  drawRoom(room,r,t,darkness) {
    const ctx = this.ctx, b = exteriorRoomBounds(room), {x,y,w,h} = b;
    const type = r?.type;
    const awake = r && r.action !== 'sleep';
    const palettes = { cat:['#827452','#a18b5e','#b39e6b'],rabbit:['#987573','#b9957c','#c3a68b'],fox:['#736555','#9b8061','#b59871'],wolf:['#596575','#7a7a77','#9f9279'],bear:['#7e7555','#a18b5f','#b69b6d'],mouse:['#697359','#8c8962','#a3a16e'],tanuki:['#82735e','#9c8062','#b49b75'] };
    const p = palettes[type] || ['#444a42','#62664f','#6f7256'];
    rect(ctx,x-3,y-3,w+6,h+6,'#34372f');rect(ctx,x,y,w,h,p[0]);
    rect(ctx,x+3,y+3,w-6,73,p[1]);
    for(let i=0;i<34;i++){const px=x+4+Math.floor(noise(i,room,1)*(w-10));const py=y+5+Math.floor(noise(i,room,2)*65);rect(ctx,px,py,1,2,p[0]);}
    rect(ctx,x+2,y+3,4,74,'#73684c');rect(ctx,x+w-7,y+3,4,75,'#544f40');
    rect(ctx,x+4,y+73,w-8,3,'#4c4d3c');rect(ctx,x+3,y+76,w-6,h-80,p[2]);
    for(let k=0;k<5;k++){rect(ctx,x+4,y+80+k*7,w-8,1,'#7d735566');for(let j=0;j<5;j++)rect(ctx,x+13+j*37+(k%2)*18,y+76+k*7,1,7,'#7d735544');}
    // Window with a tiny view of the same neighborhood.
    rect(ctx,x+60,y+13,38,38,'#464b43');rect(ctx,x+63,y+16,32,30,darkness>.2?'#41495a':'#b59c81');rect(ctx,x+64,y+33,11,12,'#777c72');rect(ctx,x+81,y+27,13,18,'#697071');rect(ctx,x+77,y+16,2,30,'#504c3d');rect(ctx,x+62,y+46,35,3,'#b1a27b');
    rect(ctx,x+56,y+12,7,39,type==='rabbit'?'#ad7b78':'#858167');rect(ctx,x+95,y+12,6,39,type==='rabbit'?'#ad7b78':'#858167');
    // Bed, mattress and rumpled blanket.
    rect(ctx,x+10,y+76,40,20,'#494d3f');rect(ctx,x+12,y+73,37,16,'#dad0a1');rect(ctx,x+12,y+80,29,11,type==='wolf'?'#686c88':'#76806a');rect(ctx,x+14,y+74,10,6,'#ded5b4');rect(ctx,x+11,y+92,3,6,'#393f35');rect(ctx,x+44,y+92,3,6,'#393f35');
    // Fridge and stickers.
    rect(ctx,x+w-27,y+38,19,42,'#464c42');rect(ctx,x+w-26,y+37,17,39,'#b0b19b');rect(ctx,x+w-25,y+38,14,13,'#c4c1a7');rect(ctx,x+w-25,y+53,14,22,'#b9b9a2');rect(ctx,x+w-23,y+46,2,4,'#535c4a');rect(ctx,x+w-23,y+57,2,6,'#535c4a');rect(ctx,x+w-18,y+60,4,4,'#b78e68');
    // TV stand and screen, flickering while being watched.
    rect(ctx,x+111,y+78,25,14,'#53513e');rect(ctx,x+114,y+56,22,20,'#343b33');rect(ctx,x+116,y+58,18,14,awake&&['tv','stream'].includes(r.action)?(Math.sin(t*3)>0?'#8bb4a4':'#9ca9b0'):'#505b4e');rect(ctx,x+121,y+76,7,2,'#b1a579');rect(ctx,x+116,y+90,2,7,'#3e4336');rect(ctx,x+132,y+90,2,7,'#3e4336');
    if(type==='wolf'){rect(ctx,x+109,y+48,4,6,'#4f515f');rect(ctx,x+135,y+60,2,14,'#343f3b');rect(ctx,x+138,y+58,3,4,'#b38b82');}
    // Low table, can, ashtray and a perpetually unfinished meal.
    rect(ctx,x+66,y+87,33,4,'#c0a477');rect(ctx,x+68,y+91,3,8,'#62533d');rect(ctx,x+94,y+91,3,8,'#62533d');rect(ctx,x+74,y+83,5,4,'#879777');rect(ctx,x+86,y+85,7,2,'#d2c7a1');
    if(type==='cat'){rect(ctx,x+82,y+82,4,3,'#5e6454');rect(ctx,x+84,y+80,3,1,'#d3be93');}
    if(type==='fox'){rect(ctx,x+71,y+80,5,7,'#b782bc');rect(ctx,x+72,y+78,3,2,'#d4b896');rect(ctx,x+92,y+22,15,11,'#c1ac79');rect(ctx,x+94,y+24,11,7,'#7c865b');}
    if(type==='rabbit'){rect(ctx,x+7,y+27,24,27,'#4a483e');rect(ctx,x+9,y+29,20,23,'#b7aca0');rect(ctx,x+12,y+31,12,18,'#8b8382');}
    if(type==='bear'){rect(ctx,x+100,y+86,8,6,'#a2663f');rect(ctx,x+101,y+84,6,3,'#d6b96e');}
    if(r){const count=Math.floor(r.trash/6);for(let i=0;i<count;i++){const gx=x+12+Math.floor(noise(i,room,7)*(w-30));const gy=y+86+Math.floor(noise(i,room,8)*17);const col=['#9d8b63','#787e61','#b29b6d','#b28c76'][i%4];rect(ctx,gx,gy,5+i%4,3+i%3,col);rect(ctx,gx+1,gy-1,3,1,'#c6b38a');}if(type==='mouse'){for(let i=0;i<Math.floor(r.trash/12);i++){rect(ctx,x+5+(i%3)*9,y+66-Math.floor(i/3)*8,9,8,'#927849');rect(ctx,x+9+(i%3)*9,y+66-Math.floor(i/3)*8,1,8,'#b09968');}}}
    // Warm room light, with cooler unoccupied rooms.
    if(awake){const gradient=ctx.createRadialGradient(x+w/2,y+15,0,x+w/2,y+15,130);gradient.addColorStop(0,'#ffe8a320');gradient.addColorStop(1,'#ffb45000');ctx.fillStyle=gradient;ctx.fillRect(x,y,w,h);rect(ctx,x+w/2-10,y+5,20,3,'#f4da91');}
    else rect(ctx,x,y,w,h,r?'rgba(22,35,45,.45)':'rgba(20,29,29,.52)');
    rect(ctx,x,y,w,3,'#b39a6d');rect(ctx,x,y,3,h,'#4b4d3d');rect(ctx,x+w-3,y,3,h,'#4b4d3d');
    if(!r){ctx.font='9px "Yu Gothic UI",sans-serif';ctx.fillStyle='#c4b78c';ctx.textAlign='center';ctx.fillText('空 室',x+w/2,y+69);ctx.textAlign='left';}
  }
  speechAnchor(state, type) {
    const resident = state.residents.find(person => person.type === type);
    if (!resident) return null;
    const selected = state.residents.find(person => person.room === state.selected);
    const selectedPos = selected ? sampleJourney(selected, state.hour, ACTIONS[selected.action].place) : null;
    const p = sampleJourney(resident, state.hour, ACTIONS[resident.action].place);
    const S = WORLD_WIDTH / 1200;
    if (this.view === 'exterior') {
      if (p.zone === 'room' || p.zone === 'away' || p.x < -45 || p.x > 1045) return null;
      const cam = this.exteriorCamera(selectedPos), Z = 1.2 * cam.zoom;
      return { x: (p.x - cam.ox) * Z * S, y: (p.y - 108 - cam.oy) * Z * S };
    }
    if (p.zone === 'away' || p.zone === 'street' || p.zone === 'stairs') return null;
    const b = roomBounds(p.room || resident.room, this.focusRoom);
    if (!b) return null;
    const base = exteriorRoomBounds(p.room || resident.room);
    const x = b.x + (p.x - base.x) / base.w * b.w;
    const feet = p.zone === 'hall' ? b.y + b.h + 16 : b.y + (p.y - base.y) / base.h * b.h;
    const height = this.focus ? 300 : 144;
    return { x: x * S, y: (feet - height * 0.86) * S };
  }
  drawSpeech(state) {
    if (!this.bubbles?.length) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    for (const bubble of this.bubbles) {
      const anchor = this.speechAnchor(state, bubble.speaker);
      drawPixelBubble(ctx, anchor?.x ?? 960, anchor?.y ?? 188, bubble.name, bubble.text, this.focus || !anchor);
    }
    ctx.restore();
  }
}

function wrapGlyphs(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const glyph of text) {
    const next = line + glyph;
    if (line && ctx.measureText(next).width > maxWidth) { lines.push(line); line = glyph; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}
function drawPixelBubble(ctx, screenX, screenY, name, text, large) {
  const scale = 2, font = large ? 15 : 12, maxText = large ? 196 : 148;
  const scratch = drawPixelBubble.canvas ||= document.createElement('canvas');
  const pen = scratch.getContext('2d');
  pen.font = `${font}px "Yu Gothic UI", Meiryo, sans-serif`;
  const lines = wrapGlyphs(pen, text, maxText);
  pen.font = '11px "Yu Gothic UI", Meiryo, sans-serif';
  const nameWidth = pen.measureText(name).width;
  pen.font = `${font}px "Yu Gothic UI", Meiryo, sans-serif`;
  const textWidth = Math.max(nameWidth, ...lines.map(line => pen.measureText(line).width));
  const padX = 7, nameH = 14, lineH = font + 3;
  const w = Math.ceil(textWidth + padX * 2), h = nameH + lines.length * lineH + 6, tail = 7;
  const destW = (w + 4) * scale, destH = (h + tail + 3) * scale;
  let left = Math.round(screenX - destW / 2), top = Math.round(screenY - destH + 8);
  left = Math.max(8, Math.min(WORLD_WIDTH - destW - 8, left));
  top = Math.max(8, Math.min(WORLD_HEIGHT - destH - 8, top));
  const localTail = Math.max(8, Math.min(w - 16, Math.round((screenX - left) / scale) - 5));
  scratch.width = w + 4; scratch.height = h + tail + 3;
  pen.imageSmoothingEnabled = false;
  pen.clearRect(0, 0, scratch.width, scratch.height);
  pen.fillStyle = '#1c211c'; pen.fillRect(3, 3, w, h);
  pen.fillStyle = '#f4f0e4'; pen.fillRect(0, 0, w, h);
  pen.fillStyle = '#2a2e26';
  pen.fillRect(0, 0, w, 2); pen.fillRect(0, h - 2, w, 2); pen.fillRect(0, 0, 2, h); pen.fillRect(w - 2, 0, 2, h);
  pen.fillStyle = '#3d4a3c'; pen.fillRect(2, 2, w - 4, nameH);
  pen.font = '11px "Yu Gothic UI", Meiryo, sans-serif'; pen.fillStyle = '#f3ead4'; pen.textBaseline = 'middle';
  pen.fillText(name, 6, 2 + nameH / 2);
  pen.font = `${font}px "Yu Gothic UI", Meiryo, sans-serif`; pen.fillStyle = '#242822'; pen.textBaseline = 'top';
  lines.forEach((line, index) => pen.fillText(line, padX, nameH + 4 + index * lineH));
  pen.fillStyle = '#f4f0e4';
  pen.fillRect(localTail, h - 1, 10, 4); pen.fillRect(localTail + 3, h + 2, 5, 3);
  pen.fillStyle = '#2a2e26';
  pen.fillRect(localTail, h, 2, 4); pen.fillRect(localTail + 8, h, 2, 4); pen.fillRect(localTail + 3, h + 3, 2, 3); pen.fillRect(localTail + 6, h + 3, 2, 2);
  ctx.drawImage(scratch, left, top, destW, destH);
}
