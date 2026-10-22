import { MINI_EMOTION_ART, MiniReactionState, miniDailyEmotion, miniEmotionFrameName, drawMiniEmotion } from './mini-emotions.js';
import {managerTarget,managerFrame,advanceManager} from './manager-life.js';
import { speakerColors } from './speaker-colors.js';
import { ROOM_LAYOUTS } from './room-layouts.js';
import { ROOMS, CHARACTERS, ACTIONS, dateAt } from './simulation.js';
import { CHARACTER_ART, ROOM_ART, SCENE_ART } from './character-art.js';
import { exteriorRoomBounds, sampleJourney, sampleCompanion, motionLabel } from './movement.js';
import { drawCharacterEffects, spriteMotion } from './effects.js';
import { drawExteriorForeground, exteriorFeet } from './exterior-occlusion.js';

export const WORLD_WIDTH = 1920;
export const WORLD_HEIGHT = 1080;
export function roomBounds(room, focusRoom = null) {
  if (focusRoom) return room === focusRoom ? { x: 22, y: 35, w: 1156, h: 598 } : null;
  return { x: 10 + ((room % 100) - 1) * 397, y: room >= 200 ? 27 : 352, w: 386, h: 284 };
}
const rect = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
const noise = (x, y, seed) => { const v = Math.sin(x * 12.9898 + y * 78.233 + seed * 3.11) * 43758.5453; return v - Math.floor(v); };

// 行動・移動状態から表示するポーズ名を決める。hour（ゲーム内時刻）で30分ごとにパターンを切り替える。
export function resolvePose(type, action, moving = false, tick = 0, hour = 0) {
  const art = CHARACTER_ART[type];
  if (!art?.poses) return 'base';
  const ready = name => name !== 'base' && art.poses[name]?.image;
  if (moving) { const frame = Math.floor(tick * 4) % 2 ? 'walk_b' : 'walk_a'; return ready(frame) ? frame : 'base'; }
  let pick = art.actionPoses?.[action] ?? 'base';
  if (Array.isArray(pick)) pick = pick[Math.floor(hour * 2) % pick.length];
  return ready(pick) ? pick : 'base';
}
// 色味の重ね塗り用の作業キャンバス（スプライトの不透明部分だけを染める）
const spriteTintCache = new WeakMap();
function tintedImage(image, tint) {
  let cached = spriteTintCache.get(image);
  if (cached?.tint === tint) return cached.canvas;
  const canvas = cached?.canvas || document.createElement('canvas');
  if (canvas.width !== image.width) canvas.width = image.width;
  if (canvas.height !== image.height) canvas.height = image.height;
  const pen = canvas.getContext('2d');
  pen.imageSmoothingEnabled = false;
  pen.globalCompositeOperation = 'source-over'; pen.clearRect(0, 0, canvas.width, canvas.height);
  pen.drawImage(image, 0, 0);
  pen.globalCompositeOperation = 'source-atop'; pen.fillStyle = tint; pen.fillRect(0, 0, canvas.width, canvas.height);
  pen.globalCompositeOperation = 'source-over';
  spriteTintCache.set(image, {tint, canvas});
  return canvas;
}
/**
 * キャラを描画する。opts:
 *  pose   … 差分ポーズ名（'base' または CHARACTER_ART[type].poses のキー）
 *  tint   … スプライトに重ねる色（例：テレビの青い光、酔いの赤み）
 *  sx, sy … 足元を基準にした伸縮（呼吸など）
 *  rotate … 足元を軸にした傾き（ラジアン。千鳥足など）
 */
// First evening: Moku walks a few steps, stops to pick up litter, then changes spots.
// Use animation time rather than story time so each gesture keeps moving while dialogue pauses the clock.
function firstEveningCleanup(state,r,position,t){
  if(r.type!=='cat'||r.action!=='clean'||r.lifeBeat!==17||!state.actOne?.started||state.hour>=17.25||position.zone!=='room')return position;
  const phase=((t%9)+9)%9;
  const stops=[{until:1,x:0},{until:2,x:-22},{until:4,x:-22},{until:5.2,x:22},{until:7.2,x:22},{until:8,x:0},{until:9,x:0}];
  let from=0,prev=0;
  for(const stop of stops){
    if(phase<stop.until){
      const walking=stop.x!==from;
      const ratio=walking?(phase-prev)/(stop.until-prev):1;
      const x=from+(stop.x-from)*ratio;
      return {...position,x:position.x+x,y:position.y+(walking?Math.sin(ratio*Math.PI)*1.2:0),moving:walking,direction:walking?(stop.x>from?1:-1):position.direction};
    }
    from=stop.x;prev=stop.until;
  }
  return position;
}
// During the smartphone search, move between nearby floor spots before each discovery.
function phoneSearchWalk(state,r,position,t){
  const scene=state.actOne?.observation?.current;
  if(r.type!=='cat'||scene?.id!=='phone-search'||position.zone!=='room')return position;
  const idx=Math.min(2,scene.index||0);
  const route=[[-18,-8],[38,-4],[0,0]];
  const from=idx===0?[0,0]:route[idx-1],to=route[idx];
  const progress=Math.min(1,Math.max(0,(scene.elapsed||0)/1.1));
  const eased=progress*progress*(3-2*progress),walking=progress<1;
  return {...position,x:273+from[0]+(to[0]-from[0])*eased,y:436+from[1]+(to[1]-from[1])*eased,moving:walking,direction:to[0]>=from[0]?1:-1};
}
export function drawSprite(ctx, type, x, y, tick = 0, action = 'idle', scale = 1, direction = 1, opts = {}) {
  const art = CHARACTER_ART[type];
  const moving=opts.pose?.startsWith('walk')||action==='outing';
  const emotion=opts.emotion||(!art?.image?'relieved':null);
  const allowsEmotion=(!moving||type==='patron')&&action!=='sleep'&&(!['eat','drink','clean','smoke'].includes(action)||opts.emotionActive);
  if(type!=='manager'&&((allowsEmotion&&emotion&&emotion!=='neutral'&&emotion!=='tired')||(!art?.image&&MINI_EMOTION_ART[type]?.image))){
    const fallbackEmotion=(moving&&type!=='patron')||action==='sleep'?'relieved':emotion==='tired'?'sad':emotion&&miniEmotionFrameName(type,emotion)?emotion:'relieved';
    const step=moving&&!opts.reduced?Math.sin(tick*11)*.35*scale:0;
    if(drawMiniEmotion(ctx,type,x,y+step,tick,scale,direction,fallbackEmotion,{moving,baseHeight:art?.image?art.displayHeight:26,reduced:opts.reduced})){
      if(!art?.image&&action!=='sleep')drawMiniActionProp(ctx,x,y+step,scale,direction,action);
      return;
    }
  }
  if (art?.image) {
    const poseName = type==='manager'&&!moving&&opts.emotionActive&&art.poses?.[emotion]?emotion:opts.pose;
    const pose = poseName && poseName !== 'base' ? art.poses?.[poseName] : null;
    const image = pose?.image || art.image, origin = pose?.image ? pose.origin : art.origin;
    // 基本立ち絵と同じ比率で全ポーズを描く。
    const px = art.displayHeight / art.image.height;
    const width = image.width * px, height = image.height * px;
    const ox = origin[0] * px, oy = origin[1] * px;
    const walking = opts.pose?.startsWith('walk');
    const bob = action === 'sleep' || walking ? 0 : Math.sin(tick * 2) > .75 ? -1 : 0;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y + bob));
    if (opts.rotate) ctx.rotate(opts.rotate);
    ctx.scale(scale * direction * (opts.sx || 1), scale * (opts.sy || 1));
    // Smooth the sprite once at the final display resolution; room pixels stay crisp.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(opts.tint ? tintedImage(image, opts.tint) : image, -ox, -oy, width, height);
    ctx.restore();
    return;
  }
  const c = CHARACTERS[type] || { color: '#d9a486', shirt: '#353237', accent: '#8f4b50' };
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(scale * direction, scale);
  const p = (x, y, w, h, col) => rect(ctx, x, y, w, h, col);
  const fur = c.color, accent = c.accent, outline = '#33352d';
  const bob = action === 'sleep' ? 0 : Math.sin(tick * 2) > .75 ? -1 : 0;
  ctx.translate(0, bob);
  // 専用原稿のない住人も、猫の耳と尻尾で表示する。
  if (c.species === '猫') {
    p(-9,-23,6,10,outline);p(3,-23,6,10,outline);p(-8,-22,4,8,fur);p(4,-22,4,8,fur);p(-7,-20,2,3,'#b68f82');p(5,-20,2,3,'#b68f82');
    p(8,-9,3,10,fur);p(10,-6,4,3,fur);p(12,-11,2,7,fur);
  }
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
// Keep the existing small action props for residents whose original art was procedural.
function drawMiniActionProp(ctx,x,y,scale,direction,action){
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale*direction,scale);
  const p=(x,y,w,h,color)=>rect(ctx,x,y,w,h,color);
  if(action==='eat'||action==='steal'){p(5,-9,6,3,'#e8ce8f');p(6,-10,4,2,'#a66d41');}
  if(action==='drink'){p(6,-10,4,6,'#b6b38d');p(7,-10,2,1,'#dfc99f');}
  if(action==='shop'||action==='sell'){p(5,-7,7,6,'#b89466');p(7,-9,3,2,'#cfb17e');}
  if(action==='smoke'){p(6,-12,6,1,'#d8cdad');p(11,-12,1,1,'#d97c42');}
  if(action==='stream'){p(6,-12,2,7,'#393c42');p(5,-12,4,2,'#66758a');}
  if(action==='gamble'){p(5,-8,6,4,'#f5e7c8');p(7,-7,1,1,'#b64b42');}
  ctx.restore();
}
export function drawPortrait(canvas, type) {
  const ctx = canvas.getContext('2d'); canvas.width = 64; canvas.height = 68;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
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
  resizeToDisplay(){
    const box=this.canvas.getBoundingClientRect?.();
    if(!box?.width)return false;
    // Match Retina screens without allowing an unbounded full-screen buffer.
    const width=Math.min(2560,Math.max(WORLD_WIDTH,Math.ceil(box.width*(globalThis.devicePixelRatio||1)/16)*16));
    const height=Math.round(width*WORLD_HEIGHT/WORLD_WIDTH);
    if(this.canvas.width===width&&this.canvas.height===height)return false;
    this.canvas.width=width;this.canvas.height=height;return true;
  }
  reset() { this.last = 0; this.managerPosition=null; this.miniReactions?.reset(); }
  draw(state, timestamp, paused, bubbles = []) {
    const ctx = this.ctx;
    this.bubbles = bubbles;
    const speechKey = bubbles.map(b => `${b.speaker}:${b.text}`).join('|');
    if (speechKey !== this.speechKey) { this.speechKey = speechKey; this.speechStarted = timestamp; }
    this.speechOpacity = Math.min(1, (timestamp - (this.speechStarted || timestamp)) / 180);
    this.speaking = new Set(bubbles.map(bubble => bubble.speaker));
    const dt = Math.min(.1, Math.max(0, (timestamp - this.last) / 1000)); this.last = timestamp;
    if (!paused) this.animTime += dt;
    const t = this.animTime;
    this.miniReactions??=new MiniReactionState();
    this.miniReactions.update(bubbles,t);
    this.reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
    this.managerTarget=managerTarget(state,bubbles);
    const target=this.managerTarget;
    this.managerPosition=advanceManager(this.managerPosition,target,paused?0:dt);
    this.managerMoving=this.managerPosition.moving;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.setTransform(this.canvas.width/1200,0,0,this.canvas.height/675,0,0);ctx.imageSmoothingEnabled = false;
    const h = dateAt(state.hour).hour + state.hour % 1;
    const darkness = h >= 20 || h < 5 ? .57 : h >= 18 ? (h - 18) * .25 : h < 7 ? (7 - h) * .19 : 0;
    const selected = state.residents.find(r => r.room === state.selected);
    const selectedPos = selected ? sampleJourney(selected, state.hour, ACTIONS[selected.action].place) : null;
    this.followCharacterX = null;
    this.focusRoom = this.focus ? (selectedPos?.zone === 'room' ? selectedPos.room : state.selected) : null;
    if (this.view === 'exterior') { this.drawExterior(state,selectedPos,t,darkness); this.drawSpeech(state); return; }
    rect(ctx,0,0,1200,675,'#100d15');
    rect(ctx,4,28,4,610,'#db2946');
    rect(ctx,1192,36,4,594,'#eee0c7');
    for (const room of ROOMS) {
      const b = roomBounds(room, this.focusRoom); if (!b) continue;
      const base = exteriorRoomBounds(room), r = state.residents.find(r => r.room === room);
      ctx.save(); ctx.beginPath(); ctx.rect(b.x,b.y,b.w,b.h); ctx.clip();
      ctx.translate(b.x,b.y); ctx.scale(b.w/base.w,b.h/base.h); ctx.translate(-base.x,-base.y);
      this.drawRoom(room,r,t,darkness); ctx.restore();
      const current = r ? sampleJourney(r,state.hour,ACTIONS[r.action].place) : null;
      const status = !r ? '空室' : current.zone === 'away' ? '外出中' : current.zone !== 'room' ? '移動中' : ACTIONS[r.action].label;
      rect(ctx,b.x,b.y-23,b.w,23,'#17111d');
      rect(ctx,b.x,b.y-23,4,23,r?'#e43250':'#665368');
      ctx.font='12px "Yu Gothic UI",sans-serif';ctx.fillStyle='#f0e7ca';ctx.textAlign='left';
      ctx.fillText(`${room}  ${r ? CHARACTERS[r.type].name : '次の住人を待っている部屋'}`,b.x+12,b.y-7);
      ctx.textAlign='right';ctx.fillStyle='#d4bec9';ctx.fillText(status,b.x+b.w-12,b.y-7);ctx.textAlign='left';
      if(r && current.zone !== 'room') {
        ctx.font=`${this.focus?22:14}px "Yu Gothic UI",sans-serif`;ctx.fillStyle='#e9dfbd';ctx.textAlign='center';
        ctx.fillText(current.zone==='away'?'外出中。帰りを待っている。':'今は部屋の外にいる。',b.x+b.w/2,b.y+b.h*.52);
        ctx.font=`${this.focus?15:11}px "Yu Gothic UI",sans-serif`;ctx.fillStyle='#bbb897';ctx.fillText('外観モードで廊下・階段・道を見られます',b.x+b.w/2,b.y+b.h*.52+27);ctx.textAlign='left';
      }
    }
    if (!this.focus) for (const y of [313,643]) { rect(ctx,8,y,1184,16,'#17111d');rect(ctx,8,y+1,1184,2,'#b32a43');ctx.fillStyle='#e0cbbd';ctx.font='10px "Yu Gothic UI",sans-serif';ctx.fillText('共用廊下',16,y+12);ctx.textAlign='right';ctx.fillText('階段・屋外へ →',1180,y+12);ctx.textAlign='left'; }
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
  miniReaction(type,t,resident={}) {
    if(this.miniPreview?.type===type)return {emotion:this.miniPreview.emotion,emotionActive:true,reduced:this.reducedMotion};
    const active=this.speaking?.has(type)||false;
    return {emotion:this.miniReactions?.emotion(type,t,active)??miniDailyEmotion(resident),emotionActive:active,reduced:this.reducedMotion};
  }
  drawExterior(state,selectedPos,t,darkness) {
    const ctx=this.ctx, cam=this.exteriorCamera(selectedPos);
    ctx.save();ctx.scale(1.2*cam.zoom,1.2*cam.zoom);ctx.translate(-cam.ox,-cam.oy);
    if(SCENE_ART.image)ctx.drawImage(SCENE_ART.image,0,0,1000,562.5);else rect(ctx,0,0,1000,562.5,'#494d42');
    rect(ctx,0,0,1000,562.5,`rgba(16,27,49,${darkness})`);
    if(darkness>.3)for(let i=0;i<36;i++)rect(ctx,noise(i,2,1)*1000,noise(i,3,2)*115,1,1,'#e9dcc277');
    const caretaker=this.managerPosition||{x:650,y:513,zone:'street'},caretakerPose=this.managerPreviewPose||managerFrame(this.managerTarget||managerTarget(state,this.bubbles),t,this.managerMoving);
    const people=state.residents.map(r=>({r,p:exteriorFeet(sampleJourney(r,state.hour,ACTIONS[r.action].place))}));
    people.push({r:null,p:exteriorFeet(caretaker)});
    people.sort((a,b)=>a.p.y-b.p.y);
    for(const {r,p} of people) {
      if(!r){
        if(CHARACTER_ART.manager?.image){
          rect(ctx,p.x-13,p.y+1,26,3,'#17211b66');
          drawSprite(ctx,'manager',p.x,p.y,t,'idle',80/44,this.managerMoving?p.direction:(this.managerTarget?.direction||1),{pose:caretakerPose,...this.miniReaction('manager',t)});
          ctx.save();ctx.beginPath();ctx.rect(p.x-70,p.y-115,140,120);ctx.clip();
          drawExteriorForeground(ctx,SCENE_ART.image,p,darkness);ctx.restore();
        }
        continue;
      }
      if(p.zone==='room'||p.zone==='away'||p.x<-45||p.x>1045)continue;
      const baseHeight=CHARACTER_ART[r.type]?.image?44:26;
      const scale=80/baseHeight;
      rect(ctx,p.x-13,p.y+1,26,3,'#17211b66');
      const action=p.moving?'outing':r.action, pose=resolvePose(r.type,action,p.moving,t,state.hour), motion=spriteMotion(action,p.moving,r.needs,t,pose);
      const fy=p.y+(p.moving?Math.sin(t*11)*1.1:0);
      ctx.save();ctx.translate(p.x+motion.dx,fy);if(motion.rotate)ctx.rotate(motion.rotate);ctx.scale(1,motion.sy);
      drawSprite(ctx,r.type,0,0,t,action,scale,p.direction,{pose,tint:motion.tint,...this.miniReaction(r.type,t,r)});ctx.restore();
      drawCharacterEffects(ctx,{type:r.type,x:p.x,y:fy,u:80/128,dir:p.direction,t,action,pose,moving:p.moving,needs:r.needs,trash:0,seed:r.room%7,speaking:this.speaking?.has(r.type),tip:CHARACTER_ART[r.type]?.smokeTip?.[pose]});
      // Repaint foreground through its actual silhouette after the sprite and effects.
      // Limit restoration to this person's footprint so it cannot erase another resident.
      ctx.save();ctx.beginPath();ctx.rect(p.x-70,fy-115,140,120);ctx.clip();
      drawExteriorForeground(ctx,SCENE_ART.image,p,darkness);ctx.restore();
      const companion = sampleCompanion(r, state.hour);
      if (companion) {
        rect(ctx,companion.x-15,companion.y+1,30,3,'#17211b66');
        drawSprite(ctx,'patron',companion.x,companion.y+Math.sin(t*11+1)*1.1,t,'outing',80/44,companion.direction,{...this.miniReaction('patron',t),emotion:this.miniReactions?.emotion('patron',t)||'happy'});
      }
    }
    ctx.restore();
  }
  interiorResidentPosition(state,r,t=this.animTime||0) {
    return phoneSearchWalk(state,r,firstEveningCleanup(state,r,sampleJourney(r,state.hour,ACTIONS[r.action].place),t),t);
  }
  drawInteriorResident(state,r,t) {
    const p=this.interiorResidentPosition(state,r,t);
    if(p.zone==='away'||p.zone==='street'||p.zone==='stairs')return;
    const base=exteriorRoomBounds(p.room||r.room), b=roomBounds(p.room||r.room,this.focusRoom);if(!b)return;
    const ctx=this.ctx,x=b.x+(p.x-base.x)/base.w*b.w,y=p.zone==='hall'?b.y+b.h+16:b.y+(p.y-base.y)/base.h*b.h;
    if(this.focus && p.zone==='room' && r.room===state.selected)this.followCharacterX=x;
    const height=this.focus?300:144,baseHeight=CHARACTER_ART[r.type]?.image?44:26,scale=height/baseHeight;
    const u=height/128, sleeping=r.action==='sleep'&&!p.moving&&p.zone==='room';
    const action=p.moving?'outing':r.action;
    const pose=resolvePose(r.type,action,p.moving,t,state.hour), motion=spriteMotion(action,p.moving,r.needs,t,pose);
    const fy=y+(p.moving?Math.sin(t*11)*2:0);
    ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h+27);ctx.clip();
    rect(ctx,x-height*(pose==='sleep'?.26:.18),y+3,height*(pose==='sleep'?.52:.36),5,'#23302255');
    if(sleeping&&pose!=='sleep'){
      // 寝姿の差分がないキャラは、従来どおり立ち絵を倒して表現
      ctx.save();ctx.translate(x-12,y-2);ctx.rotate(-Math.PI/2);ctx.scale(motion.sy,1);drawSprite(ctx,r.type,0,0,t,'sleep',scale*.72);ctx.restore();
    } else {
      ctx.save();ctx.translate(x+motion.dx*u,fy);if(motion.rotate)ctx.rotate(motion.rotate);ctx.scale(1,motion.sy);
      drawSprite(ctx,r.type,0,0,t,action,scale,p.direction,{pose,tint:motion.tint,...this.miniReaction(r.type,t,r)});ctx.restore();
    }
    const tip=CHARACTER_ART[r.type]?.image?CHARACTER_ART[r.type].smokeTip?.[pose]:[72,-50];
    drawCharacterEffects(ctx,{type:r.type,x,y:fy,u,dir:p.direction,t,action,pose,moving:p.moving,needs:r.needs,trash:p.zone==='room'?r.trash:0,seed:r.room%7,speaking:this.speaking?.has(r.type),tip});
    if(['stream','sell','gamble','shop','collect'].includes(r.action)&&!p.moving&&!this.speaking?.has(r.type)){ctx.fillStyle='#efe3c3';ctx.font=`${this.focus?32:20}px monospace`;ctx.fillText(ACTIONS[r.action].icon,x+height*.15,y-height);}
    ctx.restore();
  }
  drawRoom(room,r,t,darkness) {
    const ctx = this.ctx, b = exteriorRoomBounds(room), {x,y,w,h} = b;
    const type = r?.type;
    const awake = r && r.action !== 'sleep';
    if (ROOM_ART[type]?.image) {
      ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.drawImage(ROOM_ART[type].image, x, y, w, h);ctx.restore();
      // The painted screen stays dark until this resident is actually watching.
      if (awake && ['tv', 'stream'].includes(r.action)) {
        const [sx,sy,sw,sh]=ROOM_LAYOUTS[type]?.screen||[114,54,22,18];
        rect(ctx,x+sx,y+sy,sw,sh,Math.sin(t*3)>0?'#a5b9b8':'#596a79');
      }
      const count = Math.floor(Math.max(0,r.trash-(type==='hostess'?30:0))/6);
      for (let i = 0; i < count; i++) {
        const gx = x+12+Math.floor(noise(i, room, 7)*(w-30));
        const gy = y+105+Math.floor(noise(i, room, 8)*3);
        ctx.fillStyle=['#c5b9a3','#c0b5a4','#d2c4b1','#bbaa94'][i%4];
        ctx.beginPath();ctx.moveTo(gx,gy+1);ctx.quadraticCurveTo(gx+1,gy-1,gx+3,gy);ctx.lineTo(gx+5,gy-1);ctx.quadraticCurveTo(gx+7,gy+2,gx+5,gy+3);ctx.lineTo(gx+2,gy+4);ctx.closePath();ctx.fill();
      }
      if (!awake) rect(ctx, x, y, w, h, 'rgba(22,35,45,.45)');
      else if (darkness > 0) rect(ctx, x, y, w, h, `rgba(16,27,49,${darkness})`);
      else {
        const gradient = ctx.createRadialGradient(x+w/2, y+15, 0, x+w/2, y+15, 130);
        gradient.addColorStop(0, '#ffe8a320'); gradient.addColorStop(1, '#ffb45000');
        ctx.fillStyle = gradient; ctx.fillRect(x, y, w, h);
      }
      rect(ctx, x, y, w, 2, '#e6d6bd'); rect(ctx, x, y, 2, h, '#19111e'); rect(ctx, x+w-2, y, 2, h, '#19111e');
      return;
    }
    const palettes = { cat:['#827452','#a18b5e','#b39e6b'],rabbit:['#987573','#b9957c','#c3a68b'],fox:['#736555','#9b8061','#b59871'],wolf:['#596575','#7a7a77','#9f9279'],bear:['#7e7555','#a18b5f','#b69b6d'],mouse:['#697359','#8c8962','#a3a16e'],tanuki:['#82735e','#9c8062','#b49b75'] };
    const p = palettes[type] || ['#444a42','#62664f','#6f7256'];
    rect(ctx,x-3,y-3,w+6,h+6,'#17111d');rect(ctx,x,y,w,h,p[0]);
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
    if(type==='fox'){rect(ctx,x+74,y+76,5,9,'#2c3034');rect(ctx,x+75,y+77,3,2,'#d6b15a');rect(ctx,x+82,y+78,5,8,'#3a342f');rect(ctx,x+83,y+79,3,1,'#c9a15a');}
    if(type==='rabbit'){rect(ctx,x+7,y+27,24,27,'#4a483e');rect(ctx,x+9,y+29,20,23,'#b7aca0');rect(ctx,x+12,y+31,12,18,'#8b8382');}
    if(type==='bear'){rect(ctx,x+100,y+86,8,6,'#a2663f');rect(ctx,x+101,y+84,6,3,'#d6b96e');}
    if(r){const count=Math.floor(r.trash/6);for(let i=0;i<count;i++){const gx=x+12+Math.floor(noise(i,room,7)*(w-30));const gy=y+86+Math.floor(noise(i,room,8)*17);const col=['#9d8b63','#787e61','#b29b6d','#b28c76'][i%4];rect(ctx,gx,gy,5+i%4,3+i%3,col);rect(ctx,gx+1,gy-1,3,1,'#c6b38a');}if(type==='mouse'){for(let i=0;i<Math.floor(r.trash/12);i++){rect(ctx,x+5+(i%3)*9,y+66-Math.floor(i/3)*8,9,8,'#927849');rect(ctx,x+9+(i%3)*9,y+66-Math.floor(i/3)*8,1,8,'#b09968');}}}
    // Warm room light, with cooler unoccupied rooms.
    if(awake){const gradient=ctx.createRadialGradient(x+w/2,y+15,0,x+w/2,y+15,130);gradient.addColorStop(0,'#ffe8a320');gradient.addColorStop(1,'#ffb45000');ctx.fillStyle=gradient;ctx.fillRect(x,y,w,h);rect(ctx,x+w/2-10,y+5,20,3,'#f4da91');}
    else rect(ctx,x,y,w,h,r?'rgba(22,35,45,.45)':'rgba(20,29,29,.52)');
    rect(ctx,x,y,w,3,'#b39a6d');rect(ctx,x,y,3,h,'#4b4d3d');rect(ctx,x+w-3,y,3,h,'#4b4d3d');
    if(!r){ctx.font='9px "Yu Gothic UI",sans-serif';ctx.fillStyle='#c4b78c';ctx.textAlign='center';ctx.fillText('空 室',x+w/2,y+69);ctx.textAlign='left';}
  }
  projectExterior(x, y, selectedPos) {
    const cam = this.exteriorCamera(selectedPos), Z = 1.2 * cam.zoom, S = WORLD_WIDTH / 1200;
    return { x: (x - cam.ox) * Z * S, y: (y - cam.oy) * Z * S };
  }
  // 外観スプライトの身長は80。吹き出しは内装と同じく、その86%上（頭）へ付ける。
  speechAnchor(state, type) {
    const resident = state.residents.find(person => person.type === type);
    if (!resident) {
      if(type!=='manager'||this.view!=='exterior'||!this.managerPosition)return null;
      const selected=state.residents.find(r=>r.room===state.selected),p=selected?sampleJourney(selected,state.hour,ACTIONS[selected.action].place):null;
      return {...this.projectExterior(this.managerPosition.x,exteriorFeet(this.managerPosition).y-80*.86,p),tail:true,source:''};
    }
    const selected = state.residents.find(person => person.room === state.selected);
    const selectedPos = selected ? sampleJourney(selected, state.hour, ACTIONS[selected.action].place) : null;
    const p = this.view==='interior'?this.interiorResidentPosition(state,resident):sampleJourney(resident, state.hour, ACTIONS[resident.action].place);
    const S = WORLD_WIDTH / 1200;
    const absent = p.zone === 'away' || p.zone === 'street' || p.zone === 'stairs';
    if (this.view === 'exterior') {
      if (p.zone === 'room') {
        const room = p.room || resident.room;
        const b = exteriorRoomBounds(room);
        const at = this.projectExterior(b.x + 113, (room >= 200 ? 300 : 440) - 28, selectedPos);
        const visible = at.x >= 0 && at.x <= WORLD_WIDTH && at.y >= 0 && at.y <= WORLD_HEIGHT;
        return { ...at, tail: true, source: visible ? '' : `${resident.room}号室の声` };
      }
      if (p.zone === 'away' || p.x < -45 || p.x > 1045) {
        const side = p.x < 500 ? -1 : 1;
        const at = this.projectExterior(side < 0 ? 0 : 1000, p.y - 80 * 0.86, selectedPos);
        return { x: side < 0 ? 72 : WORLD_WIDTH - 72, y: at.y, tail: true, source: '外出中の声' };
      }
      return { ...this.projectExterior(p.x, exteriorFeet(p).y - 80 * ((CHARACTER_ART[type]?.displayHeight||44)/44) * 0.86, selectedPos), tail: true, source: '' };
    }
    if (!absent) {
      const b = roomBounds(p.room || resident.room, this.focusRoom);
      if (!b) return { x: 1510, y: 230, tail: false, source: p.zone === 'hall' ? '廊下の声' : `${resident.room}号室の声` };
      const base = exteriorRoomBounds(p.room || resident.room);
      const x = b.x + (p.x - base.x) / base.w * b.w;
      const feet = p.zone === 'hall' ? b.y + b.h + 16 : b.y + (p.y - base.y) / base.h * b.h;
      const height = (this.focus ? 300 : 144) * ((CHARACTER_ART[type]?.displayHeight||44)/44);
      return { x: x * S, y: (feet - height * 0.86) * S, tail: true, source: '' };
    }
    const source = p.zone === 'stairs' ? '階段の声' : p.zone === 'street' ? '道の声' : '外出中の声';
    const b = roomBounds(resident.room, this.focusRoom);
    if (!b) return { x: 1510, y: 230, tail: false, source };
    return { x: (b.x + b.w * 0.5) * S, y: (b.y + b.h * 0.4) * S, tail: false, source };
  }
  drawSpeech(state) {
    if (!this.bubbles?.length) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(this.canvas.width/WORLD_WIDTH, 0, 0, this.canvas.height/WORLD_HEIGHT, 0, 0);
    ctx.imageSmoothingEnabled = true;
    const canvasBox=this.canvas.getBoundingClientRect?.();
    const speechBounds=canvasBox?.width ? {left:Math.max(0,-canvasBox.left*WORLD_WIDTH/canvasBox.width),right:Math.min(WORLD_WIDTH,((globalThis.innerWidth||canvasBox.right)-canvasBox.left)*WORLD_WIDTH/canvasBox.width),top:Math.max(0,-canvasBox.top*WORLD_HEIGHT/canvasBox.height),bottom:Math.min(WORLD_HEIGHT,((globalThis.innerHeight||canvasBox.bottom)-canvasBox.top)*WORLD_HEIGHT/canvasBox.height)} : {left:0,right:WORLD_WIDTH};
    for (const bubble of this.bubbles) {
      const resident = state.residents.find(r => r.type === bubble.speaker);
      const nearby = bubble.speaker==='manager'&&state.actOne?.chapter!==2 ? this.speechAnchor(state,'cat') : null;
      const place = this.speechAnchor(state, bubble.speaker) || (nearby ? {x:Math.max(160,nearby.x-280),y:nearby.y,tail:false,source:'近くにいる大家'} : null) || {
        x: 1510, y: 230, tail: false, source: resident ? `${resident.room}号室の声` : 'けもの荘の声'
      };
      drawSpeechBubble(ctx, place.x, place.y, bubble.name, bubble.text, {
        bounds:speechBounds, large: this.focus, accent: speakerColors(bubble)[1], ink: speakerColors(bubble)[1],
        source: place.source, tail: place.tail, opacity: this.speechOpacity,
        pixelScale:canvasBox?.width/WORLD_WIDTH,
        animate:!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      });
    }
    ctx.restore();
  }
}

export function wrapSpeechText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  const noStart = '、。，．！？!?：；)]）】』」〉》…ー';
  const noEnd = '([（【『「〈《';
  for (const glyph of text) {
    if (glyph === '\n') { lines.push(line); line = ''; continue; }
    const next = line + glyph;
    if (line && ctx.measureText(next).width > maxWidth && !noStart.includes(glyph)) {
      const last = Array.from(line).at(-1);
      if (noEnd.includes(last) && line.length > 1) { lines.push(line.slice(0, -last.length)); line = last + glyph; }
      else { lines.push(line); line = glyph; }
    }
    else line = next;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}
function drawSpeechBubble(ctx, screenX, screenY, name, text, opts) {
  const scale=opts.pixelScale||1;
  const font=Math.max(opts.large?37:30,17/scale),pad=26,lineH=font*1.42;
  const bounds=opts.bounds||{left:0,right:WORLD_WIDTH};
  const margin=18,available=Math.max(80,bounds.right-bounds.left-margin*2);
  const maxWidth=Math.min(opts.large?590:440,available);
  ctx.save();
  const progress=Math.max(0,Math.min(1,opts.opacity??1));
  ctx.globalAlpha=opts.animate===false?1:progress;
  const ink=opts.ink||'#302732',accent=opts.accent||'#863651';
  const header=opts.source?`${name} · ${opts.source}`:name;
  const nameFont=Math.max(23,12/scale);
  ctx.font=`700 ${nameFont}px "Yu Gothic UI", Meiryo, sans-serif`;
  const headers=header?wrapSpeechText(ctx,header,Math.max(24,maxWidth-pad*2-18)):[];
  const headerWidth=Math.max(0,...headers.map(line=>ctx.measureText(line).width+18));
  ctx.font=`600 ${font}px "Yu Gothic UI", Meiryo, sans-serif`;
  const lines=wrapSpeechText(ctx,text,Math.max(24,maxWidth-pad*2));
  const w=Math.min(maxWidth,Math.ceil(Math.max(140,headerWidth,...lines.map(line=>ctx.measureText(line).width))+pad*2));
  const textTop=headers.length?24+headers.length*nameFont*1.3+12:24;
  const h=Math.ceil(textTop+lines.length*lineH+18);
  const left=Math.max(bounds.left+margin,Math.min(bounds.right-w-margin,screenX-w/2));
  const minTop=(bounds.top||0)+margin,maxBottom=(bounds.bottom||WORLD_HEIGHT)-margin;
  const top=Math.max(minTop,Math.min(maxBottom-h,screenY-h-36));
  const below=opts.tail&&screenY<top+h/2;
  const tailX=Math.max(left+42,Math.min(left+w-42,screenX));
  const tipX=Math.max(bounds.left+margin,Math.min(bounds.right-margin,screenX));
  const tipY=below?Math.max(minTop,Math.min(top-12,screenY+12)):Math.min(maxBottom,Math.max(top+h+12,screenY-12));
  const r=28,paper='#fff8e9';
  // A single outline keeps the rounded body and tail seamless.
  const shape=()=>{
    ctx.beginPath();ctx.moveTo(left+r,top);
    if(opts.tail&&below){ctx.lineTo(tailX-14,top);ctx.quadraticCurveTo(tailX-12,top-8,tipX,tipY);ctx.lineTo(tailX+16,top);}
    ctx.lineTo(left+w-r,top);ctx.quadraticCurveTo(left+w,top,left+w,top+r);
    ctx.lineTo(left+w,top+h-r);ctx.quadraticCurveTo(left+w,top+h,left+w-r,top+h);
    if(opts.tail&&!below){ctx.lineTo(tailX+16,top+h);ctx.quadraticCurveTo(tailX+10,top+h+12,tipX,tipY);ctx.lineTo(tailX-14,top+h);}
    ctx.lineTo(left+r,top+h);ctx.quadraticCurveTo(left,top+h,left,top+h-r);
    ctx.lineTo(left,top+r);ctx.quadraticCurveTo(left,top,left+r,top);ctx.closePath();
  };
  // One small entrance bounce, never a continuous wobble.
  if(opts.animate!==false)ctx.translate(0,-Math.sin(progress*Math.PI)*9);
  ctx.shadowColor='#24172538';ctx.shadowBlur=8;ctx.shadowOffsetX=3;ctx.shadowOffsetY=6;
  shape();ctx.fillStyle=paper;ctx.fill();
  ctx.shadowColor='transparent';ctx.strokeStyle='#352b36';ctx.lineWidth=3;ctx.stroke();
  if(headers.length){
    ctx.fillStyle=accent;ctx.beginPath();ctx.arc(left+pad+4,top+24+nameFont*.5,4,0,Math.PI*2);ctx.fill();
    ctx.font=`700 ${nameFont}px "Yu Gothic UI", Meiryo, sans-serif`;ctx.textBaseline='top';ctx.fillStyle=ink;
    headers.forEach((line,i)=>ctx.fillText(line,left+pad+18,top+24+i*nameFont*1.3));
  }
  ctx.font=`600 ${font}px "Yu Gothic UI", Meiryo, sans-serif`;ctx.fillStyle=ink;ctx.textBaseline='top';
  lines.forEach((line,i)=>ctx.fillText(line,left+pad,top+textTop+i*lineH));
  ctx.restore();
}
