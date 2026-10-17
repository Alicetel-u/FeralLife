import {startOpeningPrologue} from './opening-prologue.js';

// 第二幕は第一幕のシネマティック・プロローグと同じ操作・文字送りを使う。
// 未承認の架空キャラクター画像やCSS製の鞄を描画しない。
export const ACT_TWO_OPENING_SCENES = [
 {shot:'chase',image:'assets/prologue/door.png',speaker:'けもの荘の記録',text:'深夜。繁華街から離れた、人気のない裏道。\n濡れた地面に、駆ける足音だけが響く。'},
 {shot:'pursuit',image:'assets/events/hostess.png',speaker:'ルナ',text:'……はぁ、はぁ……っ。\n……もう、追ってこない……？'},
 {shot:'call',image:'assets/events/hostess.png',speaker:'けもの荘の記録',text:'握りしめたスマートフォンが、また震える。\n「まだ話は終わっていない」\n差出人の名前は、暗がりに隠れたまま。'},
 {shot:'poster',image:null,speaker:'けもの荘の記録',text:'ふと目を上げたルナは、建物の入口に貼られた紙に気づく。\n「入居者募集　けもの荘」'},
 {shot:'look',image:'assets/events/hostess.png',speaker:'ルナ',text:'……ここなら、しばらく隠れられるかな'}
];
export function actTwoOpeningHTML(){
 return `<section class="act-screen opening-letter cinematic-prologue ink-prologue luna-prologue" aria-label="第二幕オープニング・逃げる女" data-act2-opening>
   <style>
    .luna-prologue{--ink-red:#af3567;background:#0a1019}
    .luna-prologue .ink-establishing{filter:brightness(.28) saturate(.55) hue-rotate(16deg);animation:ink-establish 2.5s ease-out both}
    .luna-prologue .ink-vignette{background:linear-gradient(0deg,#0b0a10 0%,#0b0a10cc 25%,transparent 76%),linear-gradient(100deg,#090d16ee,transparent 78%)}
    .luna-prologue .ink-location{background:#e8dde0;color:#21131d}
    .luna-prologue[data-cut=chase] .ink-establishing,.luna-prologue[data-cut=pursuit] .ink-establishing,.luna-prologue[data-cut=call] .ink-establishing{filter:brightness(.12) saturate(.35) hue-rotate(36deg)}
    .luna-prologue[data-cut=chase] .ink-insert{right:11%;top:5%;width:46%;height:63%;transform:rotate(2deg)}
    .luna-prologue[data-cut=chase] .ink-insert img{filter:brightness(.4) saturate(.45) contrast(1.15)}
    .luna-prologue[data-cut=pursuit] .ink-insert,.luna-prologue[data-cut=call] .ink-insert{right:11%;top:4%;width:37%;height:68%;transform:rotate(2deg);filter:drop-shadow(15px 20px 0 #000a)}
    .luna-prologue[data-cut=pursuit] .ink-insert-border,.luna-prologue[data-cut=call] .ink-insert-border,.luna-prologue[data-cut=look] .ink-insert-border{background:#e6dbe1}
    .luna-prologue[data-cut=pursuit] .ink-insert img,.luna-prologue[data-cut=call] .ink-insert img{object-fit:contain;object-position:bottom;filter:brightness(.82)}
    .luna-prologue[data-cut=poster] .luna-notice{opacity:1;transform:rotate(-4deg) translateY(0)}
    .luna-prologue .luna-notice{position:absolute;right:13%;top:19%;width:min(350px,41vw);padding:19px 12px;text-align:center;background:#eee7d7;border:7px solid #b1a69c;color:#221b1d;box-shadow:18px 23px 0 #090a0dc4;transform:rotate(-4deg) translateY(25px);opacity:0;transition:.36s;pointer-events:none;z-index:2}
    .luna-notice strong{font-size:clamp(20px,3.5vw,38px);letter-spacing:.2em;display:block}
    .luna-notice span{font-size:clamp(12px,2vw,23px);display:block;border-top:2px solid #a9a09b;margin-top:12px;padding-top:8px}
    .luna-prologue[data-cut=look] .ink-establishing{filter:brightness(.48) saturate(.55);object-position:center}
    .luna-prologue[data-cut=look] .ink-insert{right:11%;top:4%;width:31%;height:60%;transform:rotate(-3deg)}
    .luna-prologue[data-cut=look] .ink-insert img{object-fit:contain;object-position:center bottom;filter:brightness(.65)}
    .luna-prologue .ink-dialogue{border-left:5px solid #a8326d}
    .luna-prologue[data-cut=look] .ink-dialogue{background:#101016ed}
    @media(max-width:650px){.luna-prologue .luna-notice{right:8%;top:18%;width:52vw}.luna-prologue[data-cut=pursuit] .ink-insert,.luna-prologue[data-cut=call] .ink-insert,.luna-prologue[data-cut=look] .ink-insert{right:5%;width:53%;height:51%}}
    @media(prefers-reduced-motion:reduce){.luna-prologue .luna-notice{transition:none}}
   </style>
   <img class="ink-establishing" src="assets/apartments.png" alt="夜のけもの荘を見上げる">
   <div class="ink-vignette" aria-hidden="true"></div><div class="ink-slash slash-one" aria-hidden="true"></div><div class="ink-slash slash-two" aria-hidden="true"></div>
   <h2 id="modal-title" class="visually-hidden">第二幕・逃げる女</h2>
   <span class="ink-location">第二幕 / 逃げる女</span>
   <div class="luna-notice" aria-hidden="true"><strong>入居者募集</strong><span>けもの荘　空室あり</span></div>
   <div class="ink-cut-content"></div>
   <nav class="ink-controls" aria-label="第二幕の操作"><span class="ink-progress"></span><button type="button" class="ink-skip" data-prologue-skip>スキップ</button><button type="button" class="ink-next" data-prologue-next>次へ <span aria-hidden="true">▶</span></button></nav>
 </section>`;
}
export function startActTwoOpening(root,onDone,voice){
 const section=root.querySelector('[data-act2-opening]');
 if(!section)return ()=>{};
 return startOpeningPrologue(section,onDone,voice,ACT_TWO_OPENING_SCENES);
}
