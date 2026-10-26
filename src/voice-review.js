import {VOICE_REVIEW_CATALOG} from './voice-review-catalog.js';
import {VOICE_REVIEW_KEY,VOICE_REVIEW_ISSUES,VOICE_REVIEW_SPEAKERS,voiceReviewSyncCatalog,voiceReviewOpenPending,voiceReviewNeedsInitial,voiceReviewNeedsRecheck,voiceReviewRows,voiceReviewHasRepair,voiceReviewLoad,voiceReviewStatus,voiceReviewMark,voiceReviewImport,voiceReviewBackup,voiceReviewFilter,voiceReviewExport} from './voice-review-store.js';
import {createVoicePlayer} from './voice-player.js';
import {VOICE_REVIEW_PUBLISHED} from './voice-review-published.js';
import {voiceReviewApplyPublished,voiceReviewHandoff} from './voice-review-release.js';
let voiceReviewChapter=1;
const voiceReviewPlayer=createVoicePlayer({chapter:()=>voiceReviewChapter,storage:{getItem(){try{return localStorage.getItem('kemono-voice-review-audio');}catch{return null;}},setItem(key,value){try{localStorage.setItem('kemono-voice-review-audio',value);}catch{}}}});
const voiceReviewEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountVoiceReview(root,{onBack,storage,catalog=VOICE_REVIEW_CATALOG,player=voiceReviewPlayer,published=VOICE_REVIEW_PUBLISHED}={}){
 try{storage ||= globalThis.localStorage;}catch{}
 const loaded=voiceReviewLoad(storage),state=loaded.state;voiceReviewApplyPublished(state,published,catalog);voiceReviewOpenPending(state);voiceReviewSyncCatalog(state,catalog);
 let warning=loaded.warning,screen='review',queue=voiceReviewFilter(catalog,state),index=Math.max(0,queue.findIndex(r=>r.id===state.cursorId)),page=0,auto=false,playing=false,nonce=0,handled=false,disposed=false,advanceTimer=null;
 const current=()=>queue[index];
 const report=()=>voiceReviewExport(state,catalog)+voiceReviewHandoff(state);
 const decision=row=>row&&state.records[row.id]?.version===row.version?state.records[row.id]:null;
 const save=()=>{try{if(!storage)throw Error('storage');const old=storage.getItem(VOICE_REVIEW_KEY);if(old)voiceReviewImport(state,{...JSON.parse(old),application:'kemono-voice-review'});voiceReviewApplyPublished(state,published,catalog);storage.setItem(VOICE_REVIEW_KEY,voiceReviewBackup(state));warning='';}catch{warning='端末に保存できません。出力からバックアップを保存してください。';}};
 const stop=()=>{clearTimeout(advanceTimer);advanceTimer=null;player.stop();playing=false;handled=false;};
 const pages=()=>{const chars=Array.from(current()?.line.text||''),limit=(globalThis.innerHeight||800)<500?16:(globalThis.innerHeight||800)<650?24:72;return Array.from({length:Math.ceil(chars.length/limit)},(_,i)=>chars.slice(i*limit,(i+1)*limit).join(''));};
 const counts=()=>{const result={pending:0,recheck:0,ok:0,fixed:0,ng:0,changed:0,todo:0,heard:0,new:0,removed:0,repaired:0};for(const row of voiceReviewRows(catalog,state)){const status=voiceReviewStatus(row,state.records[row.id]);result[status]++;if(voiceReviewNeedsInitial(row,state.records[row.id]))result.pending++;if(voiceReviewNeedsRecheck(row,state.records[row.id]))result.recheck++;if(!row.removed&&voiceReviewHasRepair(row,state.records[row.id]))result.repaired++;}return result;};
 const statusNames={pending:'未確認のみ',recheck:'修正後の確認',todo:'未再生',new:'追加された台詞',changed:'修正後・未確認',ng:'要修正',repaired:'修正音声・履歴あり',fixed:'修正後OK',ok:'問題なし',heard:'再生済み・未判定',removed:'削除された台詞'};
 const sortNames={scene:'場面順',status:'新規・再確認を優先',updated:'指摘・確認の新しい順',speaker:'キャラ順'};
 const opt=(value,label,selected)=>`<option value="${voiceReviewEscape(value)}" ${value===selected?'selected':''}>${voiceReviewEscape(label)}</option>`;
 const frame=(title,body,footer)=>`<section class="vr-panel" data-review-mode="${state.filters.status==='recheck'?'recheck':'initial'}"><header class="vr-header"><h2 id="modal-title">${title}</h2><div class="vr-header-actions"><button type="button" data-vr="${screen==='review'?'exit':'review'}">${screen==='review'?'閉じる':'← 確認へ'}</button></div></header>${body}${footer||''}<p class="vr-save ${warning?'vr-warning':''}" role="status" data-vr-status>${voiceReviewEscape(warning||'提出済みの判定＋この端末の作業を表示')}</p></section>`;
 const progressHTML=()=>{const c=counts();return `<div class="vr-progress"><span>確認済み <b>${c.ok+c.fixed+c.ng}</b> / ${catalog.length}</span><span class="vr-ng-text">要修正 ${c.ng}</span><span class="vr-change-text">更新 ${c.changed}</span></div><progress value="${c.ok+c.fixed+c.ng}" max="${catalog.length}" aria-label="確認の進捗"></progress>`;};
 function render(){
  if(disposed)return;
  const row=current(),record=row&&state.records[row.id],editable=decision(row),c=counts();
  if(screen==='filters'){
   const f=state.filters,scenes=[...new Map(voiceReviewRows(catalog,state).filter(r=>(!r.removed||f.status==='removed')&&(f.chapter==='all'||String(r.chapter)===f.chapter)).map(r=>[r.scene,r.sceneLabel])).entries()];
   root.innerHTML=frame('音声の絞り込み',`<div class="vr-filter-form"><label>幕<select data-vr-filter="chapter">${opt('all','すべて',f.chapter)}${opt('1','第一幕｜モク編',f.chapter)}${opt('2','第二幕｜ルナ編',f.chapter)}</select></label><label>場面<select data-vr-filter="scene">${opt('all','すべての場面',f.scene)}${scenes.map(([id,name])=>opt(id,name,f.scene)).join('')}</select></label><label>キャラ<select data-vr-filter="speaker">${opt('all','全員',f.speaker)}${Object.entries(VOICE_REVIEW_SPEAKERS).map(([id,name])=>opt(id,name,f.speaker)).join('')}</select></label><label>確認状況<select data-vr-filter="status">${opt('all','すべて',f.status)}${Object.entries(statusNames).map(([id,name])=>opt(id,`${name}（${id==='ok'?c.ok+c.fixed:id==='todo'?c.todo+c.new:c[id]}）`,f.status)).join('')}</select></label><label>並べ替え<select data-vr-filter="sort">${Object.entries(sortNames).map(([id,name])=>opt(id,name,f.sort||'scene')).join('')}</select></label><label>台詞を探す<input data-vr-search value="${voiceReviewEscape(f.search)}" placeholder="灰皿・入居者など" maxlength="100" enterkeyhint="search"></label></div>`,`<div class="vr-bottom"><button data-vr="reset-filters">絞り込み解除</button><button class="vr-primary" data-vr="apply-filters">この条件で確認</button></div>`);return;
  }
  if(screen==='export'){
   const ids=new Set(catalog.map(r=>r.id)),ng=Object.values(state.records).filter(r=>r.status==='ng'&&ids.has(r.id)).length,archived=Object.values(state.records).filter(r=>r.status==='ng'&&!ids.has(r.id)).length;
   root.innerHTML=frame('指摘を渡す',`<p class="vr-help">現行の要修正 ${ng}件／削除履歴 ${archived}件。問題なしの判定も含めてコピーし、ChatGPT / Codexに渡してください。</p><textarea class="vr-output" data-vr-output readonly aria-label="修正依頼の全文">${voiceReviewEscape(report())}</textarea><div class="vr-export-actions"><button class="vr-primary" data-vr="copy">修正依頼をコピー</button><button data-vr="share">共有する</button><button data-vr="backup">バックアップ保存</button><button data-vr="import">バックアップ復元</button></div><p class="vr-help">渡した判定は音声修正と一緒に本番へ反映され、別のPC・スマホにも引き継がれます。未提出の判定はこの端末に保存されます。</p>`);return;
  }
  if(screen==='import'){
   root.innerHTML=frame('バックアップを復元',`<p class="vr-help">保存したJSONファイルを選ぶか、JSONを貼り付けてください。現在の記録と統合し、新しい指摘を残します。</p><button class="vr-secondary" data-vr="choose-file">JSONファイルを選ぶ</button><input type="file" accept=".json,application/json" data-vr-file hidden><textarea class="vr-output" data-vr-import placeholder="バックアップJSONを貼り付け" aria-label="バックアップJSON"></textarea>`,`<div class="vr-bottom"><button data-vr="export">戻る</button><button class="vr-primary" data-vr="restore">記録を統合する</button></div>`);return;
  }
  if(screen==='note'){
   root.innerHTML=frame('この台詞のメモ',`<p class="vr-note-context">${voiceReviewEscape(row?.line.text)}</p><textarea class="vr-output" data-vr-note maxlength="2000" placeholder="例：入居者の「にゅうきょしゃ」が聞き取れない" aria-label="音声の修正メモ">${voiceReviewEscape(editable?.note||'')}</textarea>`,`<div class="vr-bottom"><button data-vr="review">確認へ戻る</button><button class="vr-primary" data-vr="save-note">メモを保存</button></div>`);return;
  }
  const textPages=pages();page=Math.max(0,Math.min(page,textPages.length-1));
  const status=row?voiceReviewStatus(row,record):'todo',playable=!!row&&!row.removed;
  root.innerHTML=frame('音声チェック',`${progressHTML()}<div class="vr-context"><span>${state.filters.status==='recheck'?'修正後':state.filters.status==='pending'?'未確認':'対象'} ${queue.length}本</span><div class="vr-context-actions"><button data-vr="filters">絞り込み・検索</button><button data-vr="recheck" aria-pressed="${state.filters.status==='recheck'}">${state.filters.status==='recheck'?'未確認へ戻る':'修正後の確認 '+c.recheck}</button></div></div><article class="vr-card vr-speaker-${row?.line.speaker||'none'}"><div class="vr-card-meta"><span>第${row?.chapter||'—'}幕・${voiceReviewEscape(row?.sceneLabel||'対象なし')}</span><b class="vr-state vr-state-${status}">${statusNames[status]}</b></div><h3>${row?VOICE_REVIEW_SPEAKERS[row.line.speaker]:'該当する音声がありません'}</h3><p class="vr-line">${voiceReviewEscape(row?textPages[page]:state.filters.status==='recheck'?'修正後の確認待ちはありません。':state.filters.status==='pending'?'未確認の音声はありません。':'絞り込み条件を変えてください。')}</p>${row?.removed?'<small class="vr-changed-note">削除済みの台詞です。記録だけ残し、再生・修正対象から外しています。</small>':status==='new'?'<small class="vr-changed-note">前回の一覧になかった新しい台詞です。</small>':status==='changed'&&!row.repairComment?'<small class="vr-changed-note">音声が更新されています。以前の指摘は保存されています。</small>':''}${playable&&voiceReviewNeedsRecheck(row,record)?`<small class="vr-repair-comment"><b>修正内容：</b>${voiceReviewEscape(row.repairComment||'音声が差し替えられています。再試聴して確認してください。')}</small>`:''}<div class="vr-text-pages"><span>${row?index+1:0} / ${queue.length}</span>${textPages.length>1?`<button data-vr="text-prev" ${page===0?'disabled':''}>◀ 本文</button><span>${page+1}/${textPages.length}</span><button data-vr="text-next" ${page===textPages.length-1?'disabled':''}>本文 ▶</button>`:''}</div></article><div class="vr-player"><button data-vr="prev" aria-label="前の音声" ${index<=0?'disabled':''}>◀ 前</button><button class="vr-play" data-vr="play" ${!playable?'disabled':''}>${playing?'■ 停止':'▶ 再生'}</button><button data-vr="next" aria-label="次の音声" ${!playable||(index>=queue.length-1&&voiceReviewFilter(catalog,state).some(r=>r.id===row?.id))?'disabled':''}>次 ▶</button><button data-vr="auto" aria-pressed="${auto}" ${!playable?'disabled':''}>連続 ${auto?'ON':'OFF'}</button></div><div class="vr-issues" aria-label="気になる点。複数選べます">${Object.entries(VOICE_REVIEW_ISSUES).map(([id,label])=>`<button class="vr-issue-${id}" data-vr-issue="${id}" aria-pressed="${!!editable?.issues?.includes(id)}" ${!playable?'disabled':''}>${editable?.issues?.includes(id)?'✓ ':''}${label}</button>`).join('')}</div><button class="vr-note-button" data-vr="note" ${!row?'disabled':''}>${editable?.note?'✎ メモあり・編集':'＋ 詳しいメモ'}</button>`,`<div class="vr-bottom"><button class="vr-good" data-vr="ok" ${!playable?'disabled':''}>✓ 問題なし → 次へ</button><button data-vr="export">指摘を出力</button></div>`);
 }
 function remember(){if(current())state.cursorId=current().id;save();}
 function navigate(delta,playNext=false){const target=queue[Math.max(0,Math.min(queue.length-1,index+delta))]?.id;rebuildQueue(target);render();if(playNext&&current()){auto=true;play();}}
 function play(){const row=current();if(!row||row.removed)return;stop();voiceReviewChapter=row.chapter;player.unlock();player.play(row.line,'voice-review:'+row.id+':'+row.version+':'+(++nonce));playing=true;handled=false;remember();render();}
 function rebuildQueue(id=current()?.id||state.cursorId){voiceReviewSyncCatalog(state,catalog);stop();auto=false;queue=voiceReviewFilter(catalog,state);index=Math.max(0,queue.findIndex(r=>r.id===id));page=0;remember();}
 function toast(text){const el=root.querySelector('[data-vr-status]');if(el){el.textContent=text;el.classList.toggle('vr-warning',!!warning);}}
 async function copy(){const text=report();try{if(!navigator.clipboard?.writeText)throw Error('clipboard');await navigator.clipboard.writeText(text);toast('コピーしました。ChatGPT / Codexに貼り付けてください。');}catch{const area=root.querySelector('[data-vr-output]');area?.focus();area?.select();try{if(document.execCommand('copy')){toast('コピーしました。');return;}}catch{}toast('本文を長押しし「すべて選択」→「コピー」してください。');}}
 function applyImport(text){try{if(text.length>5000000)throw Error('ファイルが大きすぎます。');const count=voiceReviewImport(state,JSON.parse(text));save();screen='export';render();toast(`${count}件を統合しました。`);}catch(error){toast(error.message||'読み込めませんでした。');}}
 const onClick=async event=>{
  const button=event.target.closest('button');if(!button||!root.contains(button))return;event.stopPropagation();
  const issue=button.dataset.vrIssue,row=current();
  if(issue&&row&&!row.removed){auto=false;clearTimeout(advanceTimer);const old=decision(row),issues=old?.issues?.includes(issue)?old.issues.filter(v=>v!==issue):[...(old?.issues||[]),issue];voiceReviewMark(state,row,{issues,status:issues.length||old?.note?'ng':'todo'});save();render();return;}
  switch(button.dataset.vr){
   case 'exit':onBack?.();return;
   case 'play':if(playing){auto=false;stop();render();}else play();return;
   case 'prev':navigate(-1);return;
   case 'next':navigate(1,auto);return;
   case 'auto':auto=!auto;if(auto&&!playing)play();else render();return;
   case 'ok':if(row&&!row.removed){const nextId=queue[index+1]?.id,wasAuto=auto;voiceReviewMark(state,row,{status:'ok',issues:[],note:'',listenedVersion:row.version});save();rebuildQueue(nextId||row.id);render();if(!queue.length)toast('この対象の確認が終わりました。');else if(wasAuto&&nextId){auto=true;play();}}return;
   case 'recheck':if(state.filters.status==='recheck')voiceReviewOpenPending(state);else state.filters={chapter:'all',scene:'all',speaker:'all',status:'recheck',search:'',sort:'scene'};rebuildQueue();screen='review';render();return;
   case 'text-prev':page--;render();return;
   case 'text-next':page++;render();return;
   case 'copy':await copy();return;
   case 'share':try{if(!navigator.share)throw Error('share');await navigator.share({title:'けもの荘 音声修正依頼',text:report()});}catch(error){if(error.name!=='AbortError')await copy();}return;
   case 'backup':{save();const url=URL.createObjectURL(new Blob([voiceReviewBackup(state)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='けもの荘-音声チェック-'+new Date().toISOString().slice(0,10)+'.json';root.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);toast('バックアップを書き出しました。');return;}
   case 'choose-file':root.querySelector('[data-vr-file]')?.click();return;
   case 'restore':applyImport(root.querySelector('[data-vr-import]')?.value||'');return;
   case 'save-note':if(row){const note=root.querySelector('[data-vr-note]').value;voiceReviewMark(state,row,{note,status:note||decision(row)?.issues?.length?'ng':'todo'});save();}screen='review';render();return;
   case 'apply-filters':state.filters.search=root.querySelector('[data-vr-search]')?.value.trim()||'';rebuildQueue();screen='review';render();return;
   case 'reset-filters':state.filters={chapter:'all',scene:'all',speaker:'all',status:'all',search:'',sort:'scene'};rebuildQueue();render();return;
   case 'review':screen='review';rebuildQueue();render();return;
   case 'filters':case 'note':case 'export':case 'import':auto=false;stop();screen=button.dataset.vr;render();return;
  }
 };
 const onChange=async event=>{const name=event.target.dataset.vrFilter;if(name){state.filters.search=root.querySelector('[data-vr-search]')?.value||'';state.filters[name]=event.target.value;if(name==='chapter')state.filters.scene='all';save();render();}if(event.target.matches('[data-vr-file]')){const file=event.target.files?.[0];if(file){if(file.size>5000000){toast('ファイルが大きすぎます。');return;}applyImport(await file.text());}}};
 const onInput=event=>{if(event.target.matches('[data-vr-note]')&&current()){const note=event.target.value;voiceReviewMark(state,current(),{note,status:note||decision(current())?.issues?.length?'ng':'todo'});save();toast(warning||'メモを自動保存しました。');}else if(event.target.matches('[data-vr-search]')){state.filters.search=event.target.value;save();}};
 const onVisibility=()=>{if(document.hidden){auto=false;stop();save();if(screen==='review')render();}};
 const onStorage=event=>{if(event.key===VOICE_REVIEW_KEY&&event.newValue)try{voiceReviewImport(state,JSON.parse(event.newValue));if(screen==='review'){rebuildQueue();render();}}catch{}};
 const onKey=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();auto=false;stop();screen==='review'?onBack?.():(screen='review',rebuildQueue(),render());}};
 const timer=setInterval(()=>{
  if(!playing||handled||disposed)return;
  if(player.outcome==='ended'){
   handled=true;playing=false;const row=current();if(row){const record=state.records[row.id];if(record){record.listenedVersion=row.version;}else voiceReviewMark(state,row,{listenedVersion:row.version});save();}
   render();if(auto&&index<queue.length-1)advanceTimer=setTimeout(()=>navigate(1,true),180);else if(auto){auto=false;render();toast('連続再生が終わりました。問題なしの判定は自動では付けません。');}
  }else if(['error','missing','timeout'].includes(player.outcome)){handled=true;playing=false;auto=false;render();toast('音声を再生できません。「音が出ない」で記録するか再生をやり直してください。');}
 },120);
 root.addEventListener('click',onClick);root.addEventListener('change',onChange);root.addEventListener('input',onInput);root.addEventListener('keydown',onKey);document.addEventListener('visibilitychange',onVisibility);globalThis.addEventListener?.('storage',onStorage);
 save();render();return ()=>{disposed=true;stop();save();clearInterval(timer);root.removeEventListener('click',onClick);root.removeEventListener('change',onChange);root.removeEventListener('input',onInput);root.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onVisibility);globalThis.removeEventListener?.('storage',onStorage);};
}
