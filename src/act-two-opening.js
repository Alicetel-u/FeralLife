// 第二幕・入居前の短編オープニング。物語の真相はここでは確定させない。
export const ACT_TWO_OPENING_SCENES = [
  {id:'chase',caption:'午前二時過ぎ。繁華街の裏路地。',line:'……っ、はぁ……っ！',cue:'遠ざかる足音。雨上がりの路面に、ヒールの音だけが響く。'},
  {id:'breath',caption:'何度も背後を確かめる。もう追っ手の姿は見えない。',line:'……まいた、よね……？',cue:'スマートフォンが震える。「話はまだ終わってない」――差出人は映らない。'},
  {id:'notice',caption:'ふと、建物の前の古びた貼り紙が目に留まった。',line:'……入居者、募集……？',cue:'けもの荘。偶然通りかかった場所に、空室の知らせがあった。'},
  {id:'look',caption:'バッグをぎゅっと胸に抱え、ルナは建物を見上げた。',line:'……ここなら、しばらく隠れられるかな',cue:'何から隠れるのか。その答えを、まだ誰も知らない。'}
];
export function actTwoOpeningHTML(portrait){
  return `<section class="act-screen act2-cinema" aria-label="第二幕オープニング・逃げる女" data-act2-opening>
    <style>
      .act2-cinema{position:relative;overflow:hidden;isolation:isolate;min-height:min(82vh,850px);height:100%;background:#080912;color:#fff;font-family:inherit}
      .act2-cinema *{box-sizing:border-box}
      .act2-cinema .a2-night{position:absolute;inset:0;background:radial-gradient(ellipse at 84% 14%,#633043 0%,transparent 37%),linear-gradient(115deg,#080a15 0%,#192239 49%,#090a14 100%);transition:filter 1.6s}
      .act2-cinema .a2-neon{position:absolute;top:-12%;left:9%;height:74%;width:10px;transform:rotate(16deg);background:#f96ab6;box-shadow:0 0 32px 13px #b02772,0 0 160px 60px #7f204a;opacity:.75}
      .act2-cinema .a2-street{position:absolute;inset:40% -20% -20%;background:repeating-linear-gradient(107deg,transparent 0 14%,#34334777 14.3% 14.7%),linear-gradient(180deg,#131729,#05060d);transform:perspective(550px) rotateX(58deg);box-shadow:0 -2px 80px #151a2e}
      .act2-cinema .a2-rain{position:absolute;inset:0;opacity:.28;background:repeating-linear-gradient(108deg,transparent 0 46px,#a4adce4d 47px 48px,transparent 50px 72px);animation:a2drift 8s linear infinite}
      .act2-cinema .a2-shadow{position:absolute;left:4%;bottom:19%;width:26%;height:56%;background:#090a0e;filter:blur(11px);clip-path:polygon(46% 0,58% 0,72% 25%,79% 100%,15% 100%,25% 25%);opacity:.65;transform:translateX(-100%);transition:transform 2.4s ease,opacity 1s}
      .act2-cinema .a2-luna{position:absolute;bottom:12%;right:10%;height:72%;max-width:62%;object-fit:contain;object-position:bottom;filter:brightness(.12) saturate(.4) drop-shadow(0 5px 22px #060711);transform:translateX(42%) rotate(-6deg);opacity:0;transition:transform 1.1s ease,opacity 1s,filter 1.7s}
      .act2-cinema .a2-apartment{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:0;filter:brightness(.18) saturate(.45) contrast(1.3);transform:scale(1.19) translateY(5%);transition:opacity 2s,transform 7s ease,filter 2s}
      .act2-cinema .a2-bag{position:absolute;right:18%;bottom:33%;width:12%;height:15%;border-radius:20% 20% 32% 32%;background:linear-gradient(145deg,#20141a,#090a10);border:2px solid #39262c;box-shadow:0 12px 25px #0009;opacity:0;transform:translateX(45%);transition:opacity 1s,transform 1s}.act2-cinema .a2-bag:before{content:"";position:absolute;width:55%;height:44%;left:20%;top:-36%;border:6px solid #261a20;border-bottom:0;border-radius:50% 50% 0 0}.act2-cinema[data-scene="breath"] .a2-bag,.act2-cinema[data-scene="look"] .a2-bag{opacity:1;transform:translateX(0)}.act2-cinema[data-scene="look"] .a2-bag{right:36%;bottom:32%;width:10%;height:12%}.act2-cinema .a2-poster{position:absolute;top:27%;left:14%;width:180px;max-width:40vw;padding:16px 9px;background:#e2d7b8;color:#26232a;box-shadow:2px 4px 30px #000d;transform:rotate(-5deg) scale(.72);opacity:0;transition:opacity .9s,transform 1.6s; text-align:center;border:6px solid #a5a092}
      .act2-cinema .a2-poster b{display:block;font-size:clamp(16px,3vw,31px);letter-spacing:.16em;line-height:1.5}
      .act2-cinema .a2-poster small{display:block;margin-top:7px;font-size:13px}
      .act2-cinema .a2-caption{position:absolute;top:7%;left:7%;right:7%;font-size:clamp(13px,1.6vw,19px);letter-spacing:.12em;color:#bfc3cd;text-shadow:0 2px 8px #000;max-width:600px;line-height:1.9}
      .act2-cinema .a2-dialogue{position:absolute;bottom:10%;left:5%;right:5%;padding:24px 28px;background:linear-gradient(90deg,#090d19ee,#12101cda);border-left:3px solid #d6a4b9;box-shadow:0 6px 50px #0009}
      .act2-cinema .a2-dialogue strong{display:block;font-size:13px;color:#f1bcd4;letter-spacing:.14em;margin-bottom:8px}
      .act2-cinema .a2-line{font-size:clamp(18px,2.7vw,29px);font-weight:600;text-shadow:0 2px 10px #000;line-height:1.5}
      .act2-cinema .a2-cue{margin:9px 0 0;color:#a7aaba;font-size:clamp(11px,1.3vw,15px);line-height:1.6}
      .act2-cinema .a2-controls{position:absolute;right:5%;top:5%;z-index:4;display:flex;gap:10px}
      .act2-cinema .a2-controls button{cursor:pointer;border:1px solid #ffffff55;border-radius:4px;padding:10px 17px;background:#101525de;color:white;font:inherit}
      .act2-cinema .a2-controls button:focus-visible{outline:3px solid white;outline-offset:3px}
      .act2-cinema[data-scene="chase"] .a2-luna,.act2-cinema[data-scene="breath"] .a2-luna{opacity:.95;transform:translateX(0) rotate(0)}
      .act2-cinema[data-scene="chase"] .a2-shadow{transform:translateX(0);opacity:.5}
      .act2-cinema[data-scene="breath"] .a2-shadow{opacity:0}
      .act2-cinema[data-scene="notice"] .a2-apartment,.act2-cinema[data-scene="look"] .a2-apartment{opacity:1}
      .act2-cinema[data-scene="notice"] .a2-poster{opacity:1;transform:rotate(-5deg) scale(1)}
      .act2-cinema[data-scene="look"] .a2-apartment{transform:scale(1) translateY(0);filter:brightness(.3) saturate(.55)}
      .act2-cinema[data-scene="look"] .a2-luna{opacity:1;right:auto;left:35%;height:42%;bottom:20%;transform:rotate(0) scale(.92);filter:brightness(.03) drop-shadow(0 0 15px #0b0d11)}
      .act2-cinema[data-scene="look"] .a2-poster{opacity:.65;transform:rotate(-5deg) scale(.7);left:5%;top:15%}
      .act2-cinema[data-scene="notice"] .a2-luna{opacity:.25;transform:translateX(0)}
      @keyframes a2drift{to{transform:translate(-60px,50px)}}
      @media(max-width:600px){.act2-cinema{min-height:70vh}.act2-cinema .a2-dialogue{bottom:7%;padding:18px}.act2-cinema .a2-luna{height:60%;right:0}.act2-cinema .a2-poster{left:6%}}
      @media(prefers-reduced-motion:reduce){.act2-cinema *{animation:none!important;transition:none!important}}
    </style>
    <div class="a2-night"></div><div class="a2-neon"></div><div class="a2-street"></div>
    <img class="a2-apartment" src="assets/apartments.png" alt="夜のけもの荘の全景">
    <div class="a2-rain" aria-hidden="true"></div><div class="a2-bag" aria-hidden="true"></div><div class="a2-shadow" aria-hidden="true"></div>
    <img class="a2-luna" src="${portrait}" alt="暗い路地のルナの影">
    <div class="a2-poster"><b>入居者募集</b><small>けもの荘<br>空室あり</small></div>
    <p class="a2-caption" data-act2-caption></p>
    <div class="a2-dialogue" aria-live="polite"><strong>？？？</strong><div class="a2-line" data-act2-line></div><p class="a2-cue" data-act2-cue></p></div>
    <div class="a2-controls"><button type="button" data-act2-opening-next>次のカット →</button><button type="button" data-act2-opening-skip>スキップ</button></div>
  </section>`;
}
export function startActTwoOpening(root,onDone){
  const screen=root.querySelector('[data-act2-opening]');
  if(!screen)return ()=>{};
  let index=0,done=false,timer;
  const render=()=>{
    const s=ACT_TWO_OPENING_SCENES[index];
    screen.dataset.scene=s.id;
    screen.querySelector('[data-act2-caption]').textContent=s.caption;
    screen.querySelector('[data-act2-line]').textContent=s.line;
    screen.querySelector('[data-act2-cue]').textContent=s.cue;
    screen.querySelector('[data-act2-opening-next]').textContent=index===ACT_TWO_OPENING_SCENES.length-1?'第二幕へ →':'次のカット →';
  };
  const finish=()=>{if(done)return;done=true;clearTimeout(timer);screen.removeEventListener('click',click);onDone();};
  const next=()=>{clearTimeout(timer);if(index===ACT_TWO_OPENING_SCENES.length-1){finish();return;}index++;render();};
  const click=e=>{if(e.target.closest('[data-act2-opening-skip]'))finish();else if(e.target.closest('[data-act2-opening-next]'))next();};
  screen.addEventListener('click',click);render();
  return ()=>{done=true;clearTimeout(timer);screen.removeEventListener('click',click);};
}
