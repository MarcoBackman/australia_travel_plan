
(function initFloatingNotes(){
 'use strict';
 const KEY='australia-free-notes-v1',OLD='australia-section-note-v1:',MAX=12000,LIMIT=200;
 const page=location.pathname.split('/').pop()||'index.html',pages=new Set(['index.html','personal-plan.html',...Object.values(window.tripRoutes||{}).map(x=>x.split('?')[0])]);
 const anchorPage=a=>a.page||window.tripRoutes?.[(a.selector.match(/^#([\w-]+)/)||[])[1]]?.split('?')[0]||'index.html';
 const svg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 11a8 8 0 0 1-8 8H5l-4 3 1-7a8 8 0 1 1 18-4Z"/><path d="M7 9h8M7 13h5"/></svg>';
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const uid=()=>crypto.randomUUID?crypto.randomUUID():'note-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 let pins=[],snapshot=null,blocked=false,dirty=false,selected='',placing=null,drag=null,opener=null,frame=0;
 const layer=el('div','fn-ui fn-layer'),launcher=el('button','fn-ui fn-launch');launcher.type='button';launcher.innerHTML=svg;launcher.append(el('span','','메모'),el('small','','0'));launcher.setAttribute('aria-label','자유 메모 목록 열기. 끌어 놓으면 새 메모');launcher.setAttribute('aria-haspopup','dialog');
 const tip=el('div','fn-ui fn-tip'),tipText=el('span'),cancel=el('button','','취소');tip.setAttribute('role','status');cancel.type='button';tip.append(tipText,cancel);tip.hidden=true;
 const dialog=el('dialog','fn-ui fn-dialog');dialog.setAttribute('aria-labelledby','fn-title');
 const head=el('div','fn-head'),title=el('h2','','자유 메모'),close=el('button','','닫기');title.id='fn-title';close.type='button';head.append(title,close);
 const body=el('div','fn-body');body.append(el('p','','+ 위치 선택을 누른 뒤 원하는 항목에 메모를 붙이세요. 메모 목록은 모든 페이지에서 공유되며 이 브라우저에만 저장됩니다.'));
 const toolsBar=el('div','fn-tools'),add=el('button','btn primary','+ 위치 선택'),backup=el('button','btn','전체 백업'),importButton=el('button','btn','파일 가져오기'),all=el('button','btn','메모 목록');for(const b of [add,backup,importButton,all])b.type='button';toolsBar.append(add,backup,importButton,all);
 const file=el('input');file.type='file';file.accept='.json,application/json';file.hidden=true;
 const editor=el('div'),anchorLabel=el('p','fn-anchor'),label=el('label','','기억할 내용'),input=el('textarea');input.id='fn-input';label.htmlFor=input.id;input.maxLength=MAX;input.placeholder='이 항목에서 확인할 것, 둘이 나눌 아이디어, 예약 전에 물어볼 내용을 적어보세요.';
 const editTools=el('div','fn-tools'),move=el('button','btn','위치 옮기기'),locate=el('button','btn','붙인 곳 보기'),remove=el('button','btn','메모 삭제');for(const b of [move,locate,remove])b.type='button';editTools.append(move,locate,remove);editor.append(anchorLabel,label,input,editTools);
 const list=el('div','fn-list'),state=el('p','fn-state'),remote=el('button','btn','다른 탭 내용 반영');remote.type='button';remote.hidden=true;state.setAttribute('role','status');state.setAttribute('aria-live','polite');
 body.append(toolsBar,file,editor,list,state,remote);dialog.append(head,body);document.body.append(layer,launcher,tip,dialog);
 function say(text,error=false){state.textContent=text;state.classList.toggle('is-error',error);}
 function current(){return pins.find(p=>p.id===selected);}
 function payload(){return {kind:'australia-free-notes',version:1,pins};}
 function conflict(){blocked=true;remote.hidden=false;say('다른 탭 변경 또는 저장 오류가 있습니다. 현재 메모를 백업한 뒤 다시 불러오세요. 자동 덮어쓰기는 중지했습니다.',true);}
 function save(){
  dirty=true;if(blocked){conflict();return false;}
  try{if(localStorage.getItem(KEY)!==snapshot){conflict();return false;}snapshot=JSON.stringify(payload());localStorage.setItem(KEY,snapshot);dirty=false;say('메모와 위치 저장됨 · 개인 브라우저 전용');return true;}
  catch(e){blocked=true;conflict();return false;}
 }
 function parse(value){
  if(!value||value.kind!=='australia-free-notes'||value.version!==1||!Array.isArray(value.pins)||value.pins.length>LIMIT)throw Error('메모 백업 형식이 아닙니다.');
  const ids=new Set();return value.pins.map(p=>{
   const a=p&&p.anchor;
   if(!p||typeof p.id!=='string'||p.id.length>100||ids.has(p.id)||typeof p.text!=='string'||p.text.length>MAX||!a||typeof a.selector!=='string'||a.selector.length>2000||!Number.isFinite(a.x)||!Number.isFinite(a.y)||a.x<0||a.x>1||a.y<0||a.y>1||typeof p.label!=='string'||p.label.length>400)throw Error('메모 또는 위치 형식 오류');
   if(a.page!==undefined&&!pages.has(a.page))throw Error('메모 페이지 형식 오류');
   ids.add(p.id);return {id:p.id,text:p.text,label:p.label,anchor:{selector:a.selector,x:a.x,y:a.y,...(a.page?{page:a.page}:{})}};
  });
 }
 try{
  snapshot=localStorage.getItem(KEY);
  if(snapshot!==null)pins=parse(JSON.parse(snapshot));
  else{
   for(const key of Object.keys(localStorage).filter(k=>k.startsWith(OLD))){
    const id=key.slice(OLD.length),section=document.getElementById(id),raw=localStorage.getItem(key);if(!raw)continue;const note=JSON.parse(raw);
    if(typeof note.text!=='string'||note.text.length>MAX)throw Error('이전 메모 형식 오류');
    if(note.text.trim())pins.push({id:uid(),text:note.text,label:(section?.querySelector('h2')?.textContent||id).slice(0,400),anchor:{selector:'#'+CSS.escape(id),x:.95,y:0}});
   }
   if(pins.length){save();say('기존 섹션 메모를 말풍선으로 옮겼습니다. 이전 저장 원본도 보존했습니다.');}
  }
 }catch(e){conflict();}
 function resolve(pin){if(anchorPage(pin.anchor)!==page)return null;try{return document.querySelector(pin.anchor.selector);}catch(e){return null;}}
 function position(){
  frame=0;const buttons=layer.querySelectorAll('.fn-pin:not(.fn-ghost)');
  for(const button of buttons){const pin=pins.find(p=>p.id===button.dataset.id);if(!pin)continue;const target=resolve(pin),r=target?.getBoundingClientRect();if(!r||!r.width||!r.height){button.hidden=true;continue;}
   const x=r.left+r.width*pin.anchor.x,y=r.top+r.height*pin.anchor.y;button.hidden=y<0||y>innerHeight||x<0||x>innerWidth;if(button.hidden)continue;button.style.left=Math.max(24,Math.min(innerWidth-24,x))+'px';button.style.top=y+'px';
  }
 }
 function schedulePosition(){if(!frame)frame=requestAnimationFrame(position);}
 function paint(){
  layer.replaceChildren();pins.forEach((pin,i)=>{const b=el('button','fn-pin');b.type='button';b.dataset.id=pin.id;b.innerHTML=svg;b.append(el('small','',String(i+1)));b.title=(pin.text||'빈 메모').slice(0,120);b.setAttribute('aria-label','메모 '+(i+1)+' 열기: '+(pin.text||pin.label).slice(0,90));b.setAttribute('aria-haspopup','dialog');layer.append(b);bindDrag(b,pin.id);});
  launcher.querySelector('small').textContent=pins.length;position();
 }
 function show(id,trigger){
  selected=id||'';opener=trigger||document.activeElement;
  const pin=current();editor.hidden=!pin;list.hidden=!!pin;all.hidden=!pin;title.textContent=pin?'붙여 둔 메모':'자유 메모';
  if(pin){input.value=pin.text;anchorLabel.textContent=pin.label||'선택한 항목';}
  else{list.replaceChildren();if(!pins.length)list.append(el('p','','아직 메모가 없습니다. + 위치 선택으로 첫 메모를 붙여보세요.'));
   pins.forEach((p,i)=>{const b=el('button');b.type='button';b.append(el('b','',String(i+1)),el('span','',(p.text||'빈 메모').slice(0,100)+'\n'+p.label.slice(0,55)));b.addEventListener('click',()=>show(p.id,b));list.append(b);});
  }
  if(!blocked&&!dirty)say('텍스트를 입력하면 자동 저장됩니다. 위치는 아이콘 드래그 또는 위치 선택으로 변경합니다.');
  if(!dialog.open)dialog.showModal();
 }
 function stopPlace(){placing=null;tip.hidden=true;document.documentElement.classList.remove('fn-placing');}
 function beginPlace(id){if(blocked){conflict();return;}if(dialog.open)dialog.close();placing={id:id||''};tipText.textContent='붙일 항목을 누르세요. 키보드는 항목에 초점을 맞춘 뒤 Enter.';tip.hidden=false;document.documentElement.classList.add('fn-placing');cancel.focus({preventScroll:true});}
 function targetAt(x,y){return document.elementsFromPoint(x,y).find(n=>n instanceof HTMLElement&&!n.closest('.fn-ui,dialog')&&n!==document.body&&n!==document.documentElement&&n.tagName!=='IFRAME');}
 function selectorFor(target){
  const parts=[];let n=target;
  while(n&&n!==document.body){if(n.id){parts.unshift('#'+CSS.escape(n.id));break;}const tag=n.tagName.toLowerCase();const peers=Array.from(n.parentElement?.children||[]).filter(e=>e.tagName===n.tagName);parts.unshift(tag+':nth-of-type('+(peers.indexOf(n)+1)+')');n=n.parentElement;}
  return parts.join(' > ')||'body';
 }
 function attach(id,x,y,target){
  target=target||targetAt(x,y);if(!target){tipText.textContent='본문 항목에 붙여 주세요. 모달·지도 내부 프레임에는 붙일 수 없습니다.';tip.hidden=false;return false;}
  const r=target.getBoundingClientRect();if(!r.width||!r.height)return false;
  const selector=selectorFor(target);if(selector.length>2000)return false;
  const data={selector,page,x:Math.max(0,Math.min(1,(x-r.left)/r.width)),y:Math.max(0,Math.min(1,(y-r.top)/r.height))};
  let pin=pins.find(p=>p.id===id);
  if(!pin){if(pins.length>=LIMIT){show('');say('최대 200개입니다. 불필요한 메모를 백업·정리하세요.',true);return false;}pin={id:uid(),text:'',label:'',anchor:data};pins.push(pin);}
  pin.anchor=data;pin.label=(target.getAttribute('aria-label')||target.getAttribute('alt')||target.textContent||target.tagName).trim().replace(/\s+/g,' ').slice(0,140);
  stopPlace();save();paint();show(pin.id,launcher);return true;
 }
 function finishDrag(cancelled=false){
  if(!drag)return;const d=drag;drag=null;cancelAnimationFrame(d.raf);d.ghost?.remove();d.button.style.opacity='';try{d.button.releasePointerCapture(d.pointerId);}catch(e){}
  if(cancelled){position();return;}
  if(d.moved){if(!attach(d.id,d.x,d.y))position();}
  else show(d.id,d.button);
 }
 function bindDrag(button,id){
  button.addEventListener('pointerdown',event=>{
   if(event.button!==0||blocked)return;event.preventDefault();button.focus({preventScroll:true});drag={button,id,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,moved:false,ghost:null,raf:0};button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove',event=>{
   const d=drag;if(!d||d.pointerId!==event.pointerId)return;d.x=event.clientX;d.y=event.clientY;
   if(!d.moved&&Math.hypot(d.x-d.startX,d.y-d.startY)<8)return;
   if(!d.moved){d.moved=true;stopPlace();d.ghost=el('div','fn-pin fn-ghost');d.ghost.innerHTML=svg;layer.append(d.ghost);button.style.opacity='.35';
    const tick=()=>{if(drag!==d)return;if(d.y<70)scrollBy(0,-10);else if(d.y>innerHeight-70)scrollBy(0,10);d.raf=requestAnimationFrame(tick);};d.raf=requestAnimationFrame(tick);
   }
   event.preventDefault();d.ghost.style.left=d.x+'px';d.ghost.style.top=d.y+'px';
  });
  button.addEventListener('pointerup',()=>finishDrag(false));button.addEventListener('pointercancel',()=>finishDrag(true));
  button.addEventListener('click',event=>{if(event.detail===0)show(id,button);});
 }
 bindDrag(launcher,'');
 document.addEventListener('click',event=>{if(!placing||event.target.closest('.fn-ui'))return;event.preventDefault();event.stopImmediatePropagation();attach(placing.id,event.clientX,event.clientY);},true);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){stopPlace();finishDrag(true);}if(placing&&event.key==='Enter'&&!document.activeElement.closest('.fn-ui')){event.preventDefault();event.stopImmediatePropagation();const t=document.activeElement,r=t.getBoundingClientRect();attach(placing.id,r.left+r.width/2,r.top+r.height/2,t);}},true);
 cancel.addEventListener('click',stopPlace);close.addEventListener('click',()=>dialog.close());dialog.addEventListener('cancel',event=>{if(dirty){event.preventDefault();say('保存되지 않은 메모가 있습니다. 전체 백업 후 닫아 주세요.'.replace('保存','저장'),true);}});
 dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
 input.addEventListener('input',()=>{const pin=current();if(!pin)return;pin.text=input.value;save();const b=Array.from(layer.children).find(n=>n.dataset.id===pin.id);if(b){b.title=pin.text.slice(0,120);b.setAttribute('aria-label','메모 열기: '+pin.text.slice(0,90));}});
 add.addEventListener('click',()=>beginPlace(''));move.addEventListener('click',()=>beginPlace(selected));all.addEventListener('click',()=>show(''));
 locate.addEventListener('click',()=>{const pin=current();if(!pin)return;const destination=anchorPage(pin.anchor);if(destination!==page&&pages.has(destination)){const id=(pin.anchor.selector.match(/^#([\w-]+)/)||[])[1];location.href=destination+(id?'#'+encodeURIComponent(id):'');return;}const target=resolve(pin);if(!target||!target.getClientRects().length){say('이 항목이 현재 화면에 없습니다. 상세 안내를 열거나 위치 옮기기로 다시 붙여 주세요.',true);return;}dialog.close();target.scrollIntoView({block:'center',behavior:'auto'});schedulePosition();});
 remove.addEventListener('click',()=>{if(blocked){conflict();return;}if(!confirm('이 말풍선 메모를 삭제할까요? 삭제 전 필요하면 전체 백업을 사용하세요.'))return;pins=pins.filter(p=>p.id!==selected);save();paint();show('');});
 backup.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(payload(),null,2)],{type:'application/json;charset=utf-8'})),a=el('a');a.href=url;a.download='australia-free-notes-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);say('메모·위치 백업 다운로드를 요청했습니다. 파일에 개인 메모가 포함됩니다.');});
 importButton.addEventListener('click',()=>file.click());
 file.addEventListener('change',async()=>{const f=file.files?.[0];if(!f)return;try{if(blocked)throw Error('저장 충돌을 먼저 처리하세요.');if(f.size>5*1024*1024)throw Error('5MB 이하 파일만 가능합니다.');
   const value=JSON.parse(await f.text());let incoming;
   if(value.kind==='australia-section-notes'&&value.version===1&&value.notes&&typeof value.notes==='object'){
    incoming=Object.entries(value.notes).map(([id,n])=>{if(!n||typeof n.text!=='string')throw Error('이전 메모 형식 오류');return {id:uid(),text:n.text,label:id,anchor:{selector:'#'+CSS.escape(id),x:.95,y:0}};});incoming=parse({kind:'australia-free-notes',version:1,pins:incoming});
   }else incoming=parse(value);
   if(pins.length+incoming.length>LIMIT)throw Error('최대 200개를 초과합니다.');
   if(!confirm(incoming.length+'개 메모를 현재 메모와 별도로 추가할까요? 같은 파일을 반복해서 가져오면 중복됩니다.'))return;
   pins.push(...incoming.map(p=>({...p,id:uid()})));save();paint();show('');
  }catch(e){say('가져오기 실패: '+e.message,true);}finally{file.value='';}});
 remote.addEventListener('click',()=>{if(!confirm('이 탭의 미저장 내용을 버리고 저장된 메모를 다시 불러올까요? 필요하면 먼저 전체 백업을 하세요.'))return;try{const raw=localStorage.getItem(KEY);pins=raw?parse(JSON.parse(raw)):[];snapshot=raw;blocked=false;dirty=false;remote.hidden=true;paint();show('');}catch(e){conflict();}});
 window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null)conflict();});
 document.addEventListener('scroll',schedulePosition,true);window.addEventListener('resize',schedulePosition);document.addEventListener('load',schedulePosition,true);
 if(window.ResizeObserver)new ResizeObserver(schedulePosition).observe(document.body);
 paint();
})();
