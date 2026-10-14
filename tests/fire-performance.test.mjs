import test from 'node:test';import assert from 'node:assert/strict';
import {createFirePainter,startFireEnding} from '../src/fire-ending.js';
function fixture(){
 const counts={linear:0,radial:0,smoke:0,curves:0};const ctx={globalAlpha:1,transform:[],setTransform(...v){this.transform=v;},createLinearGradient(){counts.linear++;return {addColorStop(){}};},createRadialGradient(){counts.radial++;return {addColorStop(){}};},clearRect(){},fillRect(){},drawImage(){counts.smoke++;},beginPath(){},moveTo(){},bezierCurveTo(){counts.curves++;},closePath(){},fill(){},lineTo(){}};
 const canvas={width:960,height:540,getContext:()=>ctx,ownerDocument:{createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})}};
 return {canvas,ctx,counts};
}
test('building flames retain 38 smoke puffs and 108 three-layer tongues while gradients are reused',()=>{
 const {canvas,ctx,counts}=fixture(),draw=createFirePainter(canvas);draw(8,'building');const gradients=counts.linear;
 assert.equal(counts.smoke,38);assert.equal(counts.curves,108*3*2);assert.equal(gradients,4);
 for(let n=1;n<=20;n++)draw(8+n/60,'building');
 assert.equal(counts.linear,gradients);assert.equal(counts.radial,0);assert.equal(counts.smoke,21*38);assert.equal(ctx.globalAlpha,1);assert.deepEqual(ctx.transform,[1,0,0,1,0,0]);
});
test('reduced motion paints an unchanged phase once, and cleanup cancels its animation callback',()=>{
 const {canvas,counts}=fixture(),callbacks=new Map();let nextId=0;const old={requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame,matchMedia:globalThis.matchMedia,document:globalThis.document};
 globalThis.requestAnimationFrame=fn=>{callbacks.set(++nextId,fn);return nextId;};globalThis.cancelAnimationFrame=id=>callbacks.delete(id);globalThis.matchMedia=()=>({matches:true});globalThis.document={hidden:false};
 const camera={style:{}},narration={textContent:''};const root={isConnected:true,dataset:{},querySelector:s=>s==='.fire-canvas'?canvas:s==='.fire-camera'?camera:narration};
 try{
  const stop=startFireEnding(root,'ash-trash',()=>{throw Error('must not finish early');});let now=performance.now();
  for(let i=0;i<20;i++){const [id,callback]=callbacks.entries().next().value;callbacks.delete(id);now+=100;callback(now);}
  assert.equal(counts.smoke,38);assert.equal(root.dataset.firePhase,'room');assert.equal(camera.style.transform,'scale(1.025)');assert.equal(callbacks.size,1);stop();assert.equal(callbacks.size,0);
 }finally{for(const [key,value]of Object.entries(old)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
