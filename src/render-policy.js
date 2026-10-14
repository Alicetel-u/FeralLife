// Keep normal play at native refresh rate; freeze only an unchanged paused scene.
export class WorldRenderGate {
  constructor(){this.state=null;this.key='';this.settleUntil=0;}
  shouldDraw(state,now,stopped,cameraKey,bubbles){
    if(!stopped){this.state=null;return true;}
    const key=[stopped,cameraKey,state.hour,state.nextId,...bubbles.map(b=>b.speaker+':'+b.text)].join('|');
    if(this.state!==state||this.key!==key){this.state=state;this.key=key;this.settleUntil=now+200;}
    return !stopped || now<=this.settleUntil;
  }
}
