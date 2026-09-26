(() => {
  'use strict';
  const host=document.getElementById('studio-gantt-view');
  if(!host)return;
  const states={draft:'계획 중',pending:'확인 필요',confirmed:'예약 완료',done:'다녀옴'};
  const zones={CNS:'케언스 UTC+10',SYD:'시드니 UTC+11',KR:'한국·일본 UTC+9'};
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  const barFor=target=>target instanceof Element?target.closest('.gx-bar,.phone-gantt-event'):null;
  const read=bar=>bar&&typeof window.tripGanttItem==='function'?window.tripGanttItem(bar.dataset.id):null;
  const when=item=>(item.date||'날짜 미정').replaceAll('-','.')+' · '+(item.start||'미정')+' → '+(item.end||'미정')+(Number(item.endDay)>0?' (+'+item.endDay+'일)':'');
  const style=make('style');
  style.textContent=`
  .gantt-peek{position:fixed;z-index:1000;width:min(330px,calc(100vw - 24px));box-sizing:border-box;padding:17px;border:1px solid #bccfc5;border-radius:14px;background:#fffdf6;color:#193f3c;box-shadow:0 14px 44px #123b3b33;overflow-wrap:anywhere;font-size:13px;line-height:1.55}
  .gantt-peek[hidden]{display:none}.gantt-peek strong{display:block;font-size:16px;margin:7px 0}.gantt-peek p{margin:6px 0}.gantt-peek small{color:#49655d}.gantt-peek-note{border-top:1px solid #d9dfd4;padding-top:9px;color:#43534e}.gantt-peek-hint{display:block;margin-top:10px;font-size:11px;letter-spacing:.04em}
  .gantt-detail{box-sizing:border-box;width:min(680px,calc(100vw - 24px));max-height:calc(100dvh - 32px);padding:0;border:1px solid #becabd;border-radius:20px;background:#faf7ef;color:#193f3c;overflow:auto;box-shadow:0 24px 80px #102e2e55}.gantt-detail::backdrop{background:#102b2bc9;backdrop-filter:blur(3px)}
  .gantt-detail-head{position:sticky;top:0;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:23px 25px;background:#174c49;color:#fffaf0}.gantt-detail-head h2{margin:8px 0 0;font-size:clamp(20px,4vw,28px);line-height:1.35;overflow-wrap:anywhere}.gantt-detail-head small{font-size:11px;letter-spacing:.15em;color:#c5e0d6}.gantt-detail-close{flex-shrink:0;border:1px solid #adc6be;background:transparent;color:inherit;border-radius:50%;width:44px;height:44px;font:inherit;font-size:24px;cursor:pointer}
  .gantt-detail-body{padding:24px}.gantt-detail-date{font-weight:600;color:#426258;margin:0 0 13px}.gantt-detail-times{display:grid;grid-template-columns:1fr 1fr;gap:12px}.gantt-time-box{padding:16px;background:#e8eee4;border-radius:12px}.gantt-time-box span{display:block;font-size:12px;color:#526b60}.gantt-time-box strong{display:block;font-size:29px;font-weight:500;line-height:1.3;margin:5px 0}.gantt-time-box small{display:block;color:#526b60}
  .gantt-detail-tags{display:flex;gap:8px;flex-wrap:wrap;margin:17px 0}.gantt-detail-tag{padding:5px 11px;background:#eee4cf;border-radius:30px;font-size:12px}.gantt-detail-tag.is-confirmed{background:#d2e5d6;color:#234d35}.gantt-detail-section{margin-top:20px}.gantt-detail-section h3{font-size:12px;letter-spacing:.05em;color:#66766c;margin:0 0 9px}.gantt-detail-section p{font-size:15px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere;margin:0}.gantt-detail-notes{padding:17px;border-left:3px solid #ba7858;background:#f0eadc;border-radius:0 10px 10px 0}.gantt-detail-footer{display:flex;gap:10px;justify-content:flex-end;padding:16px 24px;border-top:1px solid #dfdfd2;background:#faf7ef}.gantt-detail-footer button{min-height:44px;font:inherit;cursor:pointer}.gx-bar:focus-visible,.phone-gantt-event:focus-visible{outline:3px solid #b6744e;outline-offset:3px}
  @media(max-width:600px){.gantt-peek{display:none}.gantt-detail{width:calc(100vw - 16px);max-height:calc(100dvh - 16px);border-radius:16px}.gantt-detail-head{padding:18px}.gantt-detail-body{padding:18px}.gantt-detail-footer{padding:14px 18px}.gantt-detail-footer button{flex:1}.gantt-time-box{padding:13px}}
  @media(prefers-reduced-motion:no-preference){.gantt-detail[open]{animation:gantt-detail-enter .18s ease-out}@keyframes gantt-detail-enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}}`;
  document.head.append(style);
  const tip=make('div','gantt-peek');tip.id='gantt-peek';tip.setAttribute('role','tooltip');tip.hidden=true;
  // Keep the tooltip inside the editor dialog's top layer, not behind its backdrop.
  (host.closest('dialog')||document.body).append(tip);
  const dialog=make('dialog','gantt-detail');dialog.setAttribute('aria-labelledby','gantt-detail-title');
  const header=make('header','gantt-detail-head'),heading=make('div');heading.append(make('small','','ITINERARY / 일정 상세'));
  const title=make('h2');title.id='gantt-detail-title';heading.append(title);
  const close=make('button','gantt-detail-close','×');close.type='button';close.setAttribute('aria-label','일정 상세 닫기');
  header.append(heading,close);
  const body=make('div','gantt-detail-body'),footer=make('footer','gantt-detail-footer');
  const dismiss=make('button','btn','닫기'),edit=make('button','btn primary','이 일정 편집');dismiss.type=edit.type='button';
  footer.append(dismiss,edit);dialog.append(header,body,footer);document.body.append(dialog);
  let activeBar=null,descriptionBefore=null,opener=null,currentId='',gesture=null,suppressClickUntil=0,editing=false;
  function hide(){
    tip.hidden=true;
    if(activeBar){if(descriptionBefore===null)activeBar.removeAttribute('aria-describedby');else activeBar.setAttribute('aria-describedby',descriptionBefore);}
    activeBar=null;descriptionBefore=null;
  }
  function showTip(bar,x,y){
    if(dialog.open||gesture?.moved)return;
    const item=read(bar);if(!item)return;
    if(activeBar!==bar){hide();activeBar=bar;descriptionBefore=bar.getAttribute('aria-describedby');bar.setAttribute('aria-describedby',((descriptionBefore||'')+' '+tip.id).trim());}
    tip.replaceChildren(make('small','',when(item)),make('strong','',item.title||'제목 없는 일정'),make('p','',item.place||'장소 미정'),make('small','',(states[item.state]||'계획 중')+' · '+(item.transport||'이동수단 미정')));
    if(item.notes){const text=String(item.notes).trim();tip.append(make('p','gantt-peek-note',text.length>110?text.slice(0,110)+'…':text));}
    tip.append(make('span','gantt-peek-hint','클릭하면 전체 내용 · 드래그하면 일정 이동'));
    tip.hidden=false;
    const rect=bar.getBoundingClientRect(),width=tip.offsetWidth,height=tip.offsetHeight;
    const left=x===undefined?rect.left:x+16,top=y===undefined?rect.bottom+10:y+18;
    tip.style.left=Math.max(12,Math.min(left,window.innerWidth-width-12))+'px';
    tip.style.top=Math.max(12,Math.min(top,window.innerHeight-height-12))+'px';
  }
  function section(label,text,cls){const box=make('section','gantt-detail-section');box.append(make('h3','',label),make('p',cls||'',text));return box;}
  function open(id,trigger){
    const item=typeof window.tripGanttItem==='function'?window.tripGanttItem(id):null;if(!item)return;
    hide();opener=trigger;currentId=id;editing=false;title.textContent=item.title||'제목 없는 일정';
    body.replaceChildren(make('p','gantt-detail-date',(item.date||'날짜 미정').replaceAll('-','.')+' · 각 도시 현지 시각'));
    const times=make('div','gantt-detail-times');
    for(const [label,time,zone,extra] of [['시작',item.start,item.startZone,''],['종료',item.end,item.endZone,Number(item.endDay)>0?' · +'+item.endDay+'일':'']]){
      const box=make('div','gantt-time-box');box.append(make('span','',label+extra),make('strong','',time||'미정'),make('small','',zones[zone]||'시간대 미정'));times.append(box);
    }
    const tags=make('div','gantt-detail-tags');tags.append(make('span','gantt-detail-tag'+(item.state==='confirmed'?' is-confirmed':''),states[item.state]||'계획 중'),make('span','gantt-detail-tag',item.transport||'이동수단 미정'));
    body.append(times,tags,section('장소 · 이동 경로',item.place||'아직 장소를 정하지 않았습니다.'),section('메모 · 예약 조건 · 준비사항',item.notes||'등록된 메모가 없습니다. 편집에서 추가할 수 있습니다.','gantt-detail-notes'));
    edit.disabled=typeof window.tripGanttEdit!=='function';
    if(!dialog.open)dialog.showModal();dialog.scrollTop=0;close.focus();
  }
  window.openTripGanttDetails=open;
  close.addEventListener('click',()=>dialog.close());dismiss.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{if(!editing&&opener?.isConnected)opener.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  edit.addEventListener('click',()=>{editing=true;dialog.close();window.tripGanttEdit?.(currentId);});
  host.addEventListener('pointerover',event=>{if(event.pointerType==='touch')return;const bar=barFor(event.target);if(bar&&host.contains(bar)&&!bar.contains(event.relatedTarget))showTip(bar,event.clientX,event.clientY);});
  host.addEventListener('pointerout',event=>{if(activeBar&&!activeBar.contains(event.relatedTarget)&&!tip.contains(event.relatedTarget))hide();});
  tip.addEventListener('pointerleave',event=>{if(!activeBar?.contains(event.relatedTarget))hide();});
  host.addEventListener('focusin',event=>{const bar=barFor(event.target);if(bar)showTip(bar);});
  host.addEventListener('focusout',event=>{if(!tip.contains(event.relatedTarget))hide();});
  host.addEventListener('pointerdown',event=>{const bar=barFor(event.target);gesture=bar?{id:bar.dataset.id,pointer:event.pointerId,x:event.clientX,y:event.clientY,moved:false}:null;hide();},true);
  host.addEventListener('pointermove',event=>{if(gesture&&gesture.pointer===event.pointerId&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>4){gesture.moved=true;hide();}},true);
  host.addEventListener('pointerup',()=>{if(gesture?.moved)suppressClickUntil=Date.now()+600;gesture=null;},true);
  host.addEventListener('pointercancel',()=>{suppressClickUntil=Date.now()+600;gesture=null;hide();},true);
  host.addEventListener('click',event=>{const bar=barFor(event.target);if(!bar)return;event.preventDefault();event.stopImmediatePropagation();if(Date.now()>=suppressClickUntil)open(bar.dataset.id,bar);},true);
  host.addEventListener('keydown',event=>{const bar=barFor(event.target);if(!bar||!['Enter',' '].includes(event.key))return;event.preventDefault();event.stopImmediatePropagation();open(bar.dataset.id,bar);},true);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!tip.hidden){hide();event.preventDefault();event.stopPropagation();}},true);
  document.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);
  window.addEventListener('trip-editor-view',hide);
})();
