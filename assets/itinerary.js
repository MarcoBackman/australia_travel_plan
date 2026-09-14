(function initTripStudio(){
 'use strict';
 const KEY='australia-recommended-portdouglas-2026-v1',DAY=86400000;
 const DATES=Array.from({length:11},(_,i)=>'2026-10-'+String(i+13).padStart(2,'0'));
 const WEEK=['화','수','목','금','토','일','월','화','수','목','금'];
 const ZONES={KR:{label:'한국·일본 +9',offset:9},CNS:{label:'포트더글라스·CNS +10',offset:10},SYD:{label:'시드니 +11',offset:11}};
 const STATES={draft:'계획 중',pending:'예약 확인 필요',confirmed:'예약 완료',done:'다녀옴'};
 const MODES=['미정','도보','보트·페리','항공','택시·차량 호출','대중교통','렌터카','투어 픽업','이동 없음'];
 const $=id=>document.getElementById(id),modal=$('trip-studio');
 const uid=()=>window.crypto&&crypto.randomUUID?crypto.randomUUID():'r-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 function row(start='',end='',zone='CNS',extra={}){return {id:uid(),start,end,startZone:zone,endZone:zone,endDay:0,title:'',place:'',transport:'미정',state:'draft',notes:'',...extra};}
 function initial(){
  const days={};for(const date of DATES)days[date]={zone:Number(date.slice(-2))<14?'KR':Number(date.slice(-2))<20?'CNS':'SYD',rows:[]};
  const planned=window.tripInitialRows;
  for(const item of planned){const {day,...fields}=item;const date='2026-10-'+day;const zone=fields.startZone||days[date].zone;fields.notes=(fields.notes||'')+window.tripFreediveGuide(date,fields);days[date].rows.push(row(fields.start,fields.end,zone,fields));}
  return {version:1,days};
 }
 function validate(raw){
  if(!raw||raw.version!==1||!raw.days||typeof raw.days!=='object'||Array.isArray(raw.days)||Object.keys(raw.days).length!==11||Object.keys(raw.days).some(date=>!DATES.includes(date)))throw new Error('10월 13~23일 일정 JSON 형식이 아닙니다.');
  const clean={version:1,days:{}};const time=v=>typeof v==='string'&&(v===''||/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(v));
  for(const date of DATES){const day=raw.days[date];if(!day||!Object.hasOwn(ZONES,day.zone)||!Array.isArray(day.rows)||day.rows.length>100)throw new Error('날짜·시간대 또는 일정 개수 오류');
   clean.days[date]={zone:day.zone,rows:day.rows.map(item=>{if(!item||!time(item.start)||!time(item.end)||!Object.hasOwn(ZONES,item.startZone)||!Object.hasOwn(ZONES,item.endZone)||![0,1,2].includes(item.endDay)||!Object.hasOwn(STATES,item.state)||!MODES.includes(item.transport))throw new Error('일정의 시간·상태 형식 오류');for(const [field,max]of [['title',250],['place',350],['notes',3000]])if(typeof item[field]!=='string'||item[field].length>max)throw new Error('제목·장소·메모 길이 또는 형식 오류');return row(item.start,item.end,item.startZone,{endZone:item.endZone,endDay:item.endDay,title:item.title,place:item.place,transport:item.transport,state:item.state,notes:window.tripRefreshConfirmedFlightNotes(date,item)});})};
  }return clean;
 }
 function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
 function status(text,error=false){$('studio-status').textContent=text;$('studio-status').classList.toggle('is-error',error);}
 let data=initial(),filter=DATES[1],view='grid',selectedId='',blocked=false,external=null,dirty=false,history=[],future=[],editToken='',dragId='',pointerDrag=null,opener=null;
 try{const raw=localStorage.getItem(KEY);if(raw){data=validate(JSON.parse(raw));status('已저장된 개인 일정을 불러왔습니다.'.replace('已',''));}else {const old=localStorage.getItem('australia-recommended-itinerary-photo-2026-v2');if(old){const previous=validate(JSON.parse(old));for(const d of ['2026-10-13','2026-10-20','2026-10-21','2026-10-22','2026-10-23'])data.days[d]=previous.days[d];const arrival='2026-10-19';const late=previous.days[arrival].rows.filter(r=>r.startZone==='SYD'||r.start>='17:25');data.days[arrival].rows=data.days[arrival].rows.filter(r=>r.start<'17:25');data.days[arrival].rows.push(...late);for(const d of DATES.filter(d=>d>='2026-10-14'&&d<='2026-10-19')){for(const item of previous.days[d].rows.filter(r=>r.state==='confirmed'||r.state==='done')){data.days[d].rows=data.days[d].rows.filter(r=>r.title!==item.title);data.days[d].rows.push(item);}}status('기존 출국·시드니 편집과 확정·완료 행을 이어받았습니다. 북부의 기존 예약은 포트더글라스 동선과 함께 재확인하세요.');}else status('포트더글라스 중심의 새 추천안입니다. 숙소·투어는 미예약입니다.');}}
 catch(e){blocked=true;status('저장소 접근 또는 데이터 형식 오류. 자동 저장 중지. JSON 백업을 이용하세요.',true);}
 function save(){dirty=true;if(blocked){status('자동 저장 중지. 현재 내용을 JSON으로 백업하세요.',true);return;}try{localStorage.setItem(KEY,JSON.stringify({...data,updatedAt:new Date().toISOString()}));dirty=false;status('자동 저장됨 · '+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));}catch(e){status('저장 실패. 닫기 전에 JSON으로 백업하세요.',true);}}
 function snapshot(){return JSON.stringify(data);}
 function push(){history.push(snapshot());if(history.length>50)history.shift();future=[];editToken='';historyButtons();}
 function historyButtons(){$('studio-undo').disabled=!history.length;$('studio-redo').disabled=!future.length;}
 function find(id){for(const date of DATES){const index=data.days[date].rows.findIndex(item=>item.id===id);if(index>=0)return {date,index,item:data.days[date].rows[index]};}return null;}
 const active=item=>Boolean(item.title.trim()||item.place.trim()||item.notes.trim());
 const locked=item=>$('studio-lock').checked&&item.state==='confirmed';
 function utc(date,time,zone,plus=0){if(!time)return NaN;const [h,m]=time.split(':').map(Number);return Date.UTC(2026,9,Number(date.slice(-2))+plus,h-ZONES[zone].offset,m);}
 function events(){return DATES.flatMap(date=>data.days[date].rows.filter(active).map(item=>({date,item,start:utc(date,item.start,item.startZone),end:utc(date,item.end,item.endZone,item.endDay)})));}
 function datesShown(){return filter==='all'?DATES:[filter];}

 const mobileScreen=window.matchMedia('(max-width:700px)');
 function mobileSummary(){
  const i=DATES.indexOf(filter);
  $('studio-mobile-date').textContent=i<0?'전체 11일':filter.slice(5)+' '+WEEK[i]+'요일';
  $('studio-mobile-prev').disabled=i===0;$('studio-mobile-next').disabled=i===DATES.length-1;
  $('studio-touch-control').hidden=view!=='gantt';
 }
 function stepMobile(delta){const i=DATES.indexOf(filter);filter=DATES[i<0?1:Math.max(0,Math.min(DATES.length-1,i+delta))];$('studio-add-date').value=filter;render();$('studio-content').scrollTop=0;}
 $('studio-mobile-prev').addEventListener('click',()=>stepMobile(-1));
 $('studio-mobile-next').addEventListener('click',()=>stepMobile(1));
 $('studio-touch-drag').addEventListener('change',()=>{modal.classList.toggle('studio-touch-drag',$('studio-touch-drag').checked);if(!$('studio-touch-drag').checked)cleanupDrag();});



 let readableCards=true,peekId='',peekOpener=null;
 modal.classList.add('studio-readable');
 const readableToggle=el('button','btn','엑셀 표 보기');readableToggle.id='studio-readable-toggle';readableToggle.type='button';modal.querySelector('.studio-tools').append(readableToggle);
 readableToggle.addEventListener('click',()=>{readableCards=!readableCards;modal.classList.toggle('studio-readable',readableCards);render();});
 const peek=el('dialog','itinerary-peek');peek.setAttribute('aria-labelledby','itinerary-peek-title');
 const peekHead=el('div','itinerary-peek-head'),peekClose=el('button','','닫기');peekClose.type='button';peekHead.append(el('span','','ITINERARY / DETAILS'),peekClose);
 const peekBody=el('div','itinerary-peek-body'),peekTime=el('div','itinerary-peek-time'),peekMeta=el('p','itinerary-peek-meta'),peekTitle=el('h3'),peekPlace=el('p','itinerary-peek-route'),peekNotes=el('p','itinerary-peek-notes');
 peekTitle.id='itinerary-peek-title';peekBody.append(peekTime,peekMeta,peekTitle,peekPlace,el('h4','','준비물 · 예약 확인 · 메모'),peekNotes);
 const peekActions=el('div','itinerary-peek-actions'),peekEdit=el('button','btn primary','일정 수정'),peekMap=el('a','btn','장소 검색');peekEdit.type='button';peekMap.target='_blank';peekMap.rel='noopener noreferrer';peekActions.append(peekEdit,peekMap);
 peek.append(peekHead,peekBody,peekActions);document.body.append(peek);
 function showItineraryDetails(id,trigger){
  const found=find(id);if(!found)return;peekId=id;peekOpener=trigger||document.activeElement;
  const item=found.item;peekTime.textContent=(item.start||'시각 미정')+' → '+(item.end||'미정')+(item.endDay?' (+'+item.endDay+'일)':'');
  peekMeta.textContent=found.date+' · '+ZONES[item.startZone].label+' → '+ZONES[item.endZone].label+' · '+STATES[item.state]+' · '+item.transport;
  peekTitle.textContent=item.title||'새 일정';peekPlace.textContent=item.place||'장소를 아직 정하지 않았습니다.';
  peekNotes.textContent=(item.notes||'추가 메모가 없습니다. 일정 수정에서 준비물이나 확인할 내용을 적어 주세요.')+(item.notes.includes('[프리다이빙 안내]')?'':window.tripFreediveGuide(found.date,item));
  peekMap.hidden=!item.place.trim();peekMap.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(item.place);
  peekEdit.textContent=locked(item)?'보호된 일정 보기':'일정 수정';
  if(!peek.open)peek.showModal();
 }
 peekClose.addEventListener('click',()=>peek.close());peek.addEventListener('close',()=>{if(peekOpener?.isConnected)peekOpener.focus({preventScroll:true});});
 peekEdit.addEventListener('click',()=>{const found=find(peekId);if(!found)return;peek.close();selectedId=found.item.id;filter=found.date;view='grid';compactExpanded.add(selectedId);render();const card=$('studio-grid-view').querySelector('tr[data-id="'+selectedId+'"]');if(card)card.scrollIntoView({block:'start'});});
 function itineraryOverview(item){
  const wrap=el('div','itinerary-overview');
  const kind=item.transport==='항공'?'flight':item.transport==='보트·페리'?'sea':/휴식|늦잠|수면|짐 정리|건조|포장/.test(item.title)?'rest':'city';
  wrap.dataset.kind=kind;
  const top=el('div','itinerary-overview-top'),clock=el('div','itinerary-clock',item.start||'미정');
  clock.append(el('small','','→ '+(item.end||'미정')+(item.endDay?' +'+item.endDay+'일':'')));
  top.append(clock,el('span','itinerary-kind',({flight:'항공 이동',sea:'바다 활동',rest:'쉬어가기',city:'관광 · 이동'})[kind]));
  const title=el('button','itinerary-title',item.title||'새 일정');title.type='button';title.setAttribute('aria-haspopup','dialog');title.setAttribute('aria-label',(item.title||'새 일정')+' 자세히 보기');title.addEventListener('click',()=>showItineraryDetails(item.id,title));
  const tags=el('div','itinerary-tags');tags.append(el('span',item.state==='confirmed'?'is-confirmed':'',STATES[item.state]),el('span','',item.transport),el('span','',ZONES[item.startZone].label));
  wrap.append(top,title,el('p','itinerary-place',item.place||'장소 미정'),tags);return wrap;
 }
 function refreshReadableOverview(id){
  const found=find(id),line=$('studio-grid-view').querySelector('tr[data-id="'+id+'"]');if(!found||!line)return;
  const existing=line.querySelector('.itinerary-overview');if(existing)existing.replaceWith(itineraryOverview(found.item));
 }

 const compactScreen=window.matchMedia('(max-width:700px)'),compactExpanded=new Set();
 const compactMore=el('button','','설정');compactMore.id='studio-mobile-more';compactMore.type='button';compactMore.setAttribute('aria-haspopup','dialog');modal.querySelector('.studio-tools').append(compactMore);
 const compactOptions=el('dialog','studio-mobile-options');compactOptions.setAttribute('aria-label','일정 설정과 파일');
 const compactHead=el('div','compact-options-head'),compactClose=el('button','','닫기');compactClose.type='button';compactHead.append(el('h3','','일정 설정'),compactClose);
 const compactBody=el('div','compact-options-body');compactOptions.append(compactHead,compactBody);document.body.append(compactOptions);
 const compactWideLabel=el('label','compact-wide-control'),compactWide=el('input');compactWide.type='checkbox';compactWideLabel.append(compactWide,document.createTextNode('모바일에서도 가로 간트 사용'));compactBody.append(compactWideLabel);
 const compactNav=el('div','studio-compact-nav'),compactPrev=el('button','','‹'),compactNext=el('button','','›'),compactPicker=el('select');
 compactNav.setAttribute('aria-label','일정 날짜 선택');compactPrev.type=compactNext.type='button';compactPrev.setAttribute('aria-label','이전 날짜');compactNext.setAttribute('aria-label','다음 날짜');compactPicker.setAttribute('aria-label','보고 편집할 날짜');
 for(const [value,label]of [['all','전체 일정'],...DATES.map((d,i)=>[d,d.slice(5)+' '+WEEK[i]+'요일'])]){const option=el('option','',label);option.value=value;compactPicker.append(option);}
 compactNav.append(compactPrev,compactPicker,compactNext);modal.querySelector('.studio-tools').after(compactNav);
 const compactMoved=[];
 for(const selector of ['.studio-history','.studio-lock','.studio-file-menu','.studio-subtools','.studio-guidance','.photo-route-guide','#studio-touch-control','#studio-readable-toggle']){
  const node=modal.querySelector(selector);if(!node)continue;const anchor=document.createComment('compact tools origin');node.before(anchor);compactMoved.push({node,anchor});
 }
 function compactLayout(){
  if(compactScreen.matches){for(const {node}of compactMoved)compactBody.append(node);}
  else{if(compactOptions.open)compactOptions.close();for(const {node,anchor}of compactMoved)anchor.after(node);}
 }
 compactLayout();
 compactMore.addEventListener('click',()=>compactOptions.showModal());compactClose.addEventListener('click',()=>compactOptions.close());
 compactOptions.addEventListener('close',()=>{if(modal.open)compactMore.focus({preventScroll:true});});
 compactOptions.addEventListener('click',event=>{if(event.target===compactOptions){const rect=compactOptions.getBoundingClientRect();if(event.clientY<rect.top||event.clientY>rect.bottom)compactOptions.close();}});
 compactBody.addEventListener('click',event=>{if(event.target.closest('[data-photo-date]'))compactOptions.close();});
 function compactPick(date){filter=date;if(date!=='all')$('studio-add-date').value=date;render();$('studio-content').scrollTop=0;}
 compactPicker.addEventListener('change',()=>compactPick(compactPicker.value));
 compactPrev.addEventListener('click',()=>compactPick(DATES[Math.max(0,DATES.indexOf(filter)-1)]));
 compactNext.addEventListener('click',()=>compactPick(DATES[Math.min(DATES.length-1,DATES.indexOf(filter)+1)]));
 compactWide.addEventListener('change',()=>{if(view==='gantt')chart();});
 compactScreen.addEventListener('change',()=>{compactLayout();render();});
 function compactSummary(){readableToggle.textContent=readableCards?'엑셀 표 보기':'요약 카드 보기';const gridTab=modal.querySelector('[data-studio-view="grid"]');if(gridTab)gridTab.textContent=readableCards?'일정 카드':'표 편집';compactPicker.value=filter;compactPrev.disabled=filter===DATES[0];compactNext.disabled=filter===DATES[DATES.length-1];}
 function phoneChart(){
  const host=$('studio-gantt-view');host.replaceChildren();const canvas=el('div','phone-gantt');canvas.append(el('p','phone-gantt-note','세로로 스크롤 · 일정을 누르면 카드 상세 편집 · 시간은 선택한 차트 도시 기준'));
  const zone=$('studio-chart-zone').value,all=events();
  for(const date of datesShown()){
   const start=utc(date,'00:00',zone),end=start+DAY,section=el('section','phone-gantt-day');
   section.append(el('h3','',date.slice(5)+' '+WEEK[DATES.indexOf(date)]+' · '+ZONES[zone].label));
   const items=all.filter(e=>Number.isFinite(e.start)&&Number.isFinite(e.end)&&e.end>e.start&&e.start<end&&e.end>start).sort((a,b)=>a.start-b.start);
   if(!items.length){section.append(el('p','phone-gantt-empty','시간이 있는 일정이 없습니다. 카드에서 일정을 추가하세요.'));canvas.append(section);continue;}
   const first=Math.max(0,Math.floor((Math.max(start,items[0].start)-start)/3600000)-1);
   const last=Math.min(24,Math.ceil((Math.min(end,Math.max(...items.map(e=>e.end)))-start)/3600000)+1);
   const track=el('div','phone-gantt-track');track.style.height=((last-first)*48+18)+'px';
   for(let hour=first;hour<=last;hour++){const tick=el('span','phone-gantt-hour',String(hour).padStart(2,'0')+':00');tick.style.top=((hour-first)*48)+'px';track.append(tick);}
   const lanes=[],positioned=items.map(event=>{const visibleStart=Math.max(start,event.start),visibleEnd=Math.min(end,event.end);let lane=lanes.findIndex(until=>until<=visibleStart);if(lane<0)lane=lanes.length;lanes[lane]=visibleEnd;return {event,lane,visibleStart,visibleEnd};});
   for(const {event,lane,visibleStart,visibleEnd}of positioned){
    const from=local(event.start,zone),to=local(event.end,zone),button=el('button','phone-gantt-event'+(event.item.transport==='항공'?' is-flight':''));
    button.type='button';button.style.setProperty('--phone-lane',lane);button.style.setProperty('--phone-lanes',lanes.length);
    button.style.setProperty('--phone-top',((visibleStart-start)/3600000-first)*48+'px');button.style.setProperty('--phone-height',Math.max(22,(visibleEnd-visibleStart)/3600000*48-3)+'px');
    button.append(el('b','',from.time+' → '+to.time),document.createTextNode(event.item.title||'제목 없는 일정'));
    button.setAttribute('aria-label',(event.item.title||'일정')+' '+from.date+' '+from.time+'부터 '+to.date+' '+to.time+'까지, 상세 편집');
    button.addEventListener('click',()=>showItineraryDetails(event.item.id,button));
    track.append(button);
   }
   section.append(track);canvas.append(section);
  }
  host.append(canvas);
 }
 function compactViewport(){
  const viewport=window.visualViewport;if(!viewport)return;
  document.documentElement.style.setProperty('--studio-phone-height',Math.round(viewport.height)+'px');
  document.documentElement.classList.toggle('phone-keyboard',compactScreen.matches&&viewport.height<window.innerHeight*.78);
 }
 if(window.visualViewport)window.visualViewport.addEventListener('resize',compactViewport);compactViewport();

 function summary(){
  compactSummary();
  mobileSummary();
  const all=events(),completed=all.filter(e=>e.item.state==='done').length;
  $('studio-count').textContent=all.length+'개 일정 · '+completed+'개 다녀옴';
  $('studio-launch-count').textContent='추천안 편집 일정 '+all.length+'개 · 표와 간트차트에서 함께 편집';
  const usable=all.filter(e=>Number.isFinite(e.start)&&Number.isFinite(e.end)&&e.end>e.start).sort((a,b)=>a.start-b.start);
  let overlap=0;for(let i=0;i<usable.length;i++)for(let j=i+1;j<usable.length&&usable[j].start<usable[i].end;j++)overlap++;
  const invalid=all.length-usable.length;
  $('studio-warning').textContent=[invalid?invalid+'개 일정의 시간·종료 날짜를 확인하세요.':'',overlap?'시간이 겹치는 일정 '+overlap+'쌍. 이동·수속·안전 여유는 별도 확인하세요.':''].filter(Boolean).join(' ');
  $('studio-dates').querySelectorAll('button').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.date===filter));if(button.dataset.date!=='all'){const i=DATES.indexOf(button.dataset.date);button.textContent=(i+13)+'일 '+WEEK[i]+' · '+data.days[button.dataset.date].rows.filter(active).length;}});
  const selected=find(selectedId);$('studio-selection').hidden=!selected;
  if(selected)$('studio-selection-text').textContent=(selected.item.title||'제목 없는 일정')+' · '+selected.date.slice(5)+' '+(selected.item.start||'시작 미입력')+' → '+(selected.item.end||'종료 미입력')+(locked(selected.item)?' · 예약 완료 보호 중':'');
  historyButtons();
 }
 const columns=[
  {field:'date',label:'시작 날짜',width:118,choices:DATES.map(d=>[d,d.slice(5)])},
  {field:'start',label:'시작',width:100,type:'time'},
  {field:'startZone',label:'시작 도시',width:135,choices:Object.entries(ZONES).map(([k,z])=>[k,z.label])},
  {field:'end',label:'종료',width:100,type:'time'},
  {field:'endZone',label:'종료 도시',width:135,choices:Object.entries(ZONES).map(([k,z])=>[k,z.label])},
  {field:'endDay',label:'종료일',width:110,choices:[[0,'같은 날'],[1,'다음 날'],[2,'+2일']]},
  {field:'title',label:'활동·예약 이름',width:240,max:250},
  {field:'place',label:'장소·집결지',width:210,max:350},
  {field:'transport',label:'이동수단',width:150,choices:MODES.map(v=>[v,v])},
  {field:'state',label:'상태',width:135,choices:Object.entries(STATES)},
  {field:'notes',label:'메모·준비물',width:280,max:3000,multiline:true}
 ];
 function grid(){
  const host=$('studio-grid-view');host.replaceChildren();const table=el('table','studio-grid-table');table.setAttribute('aria-label','날짜별 일정 편집 표');
  const cols=el('colgroup');for(const width of [45,...columns.map(c=>c.width),115]){const col=el('col');col.style.width=width+'px';cols.append(col);}table.append(cols);
  const thead=el('thead'),tr=el('tr');for(const label of ['이동',...columns.map(c=>c.label),'행 작업']){const th=el('th','',label);th.scope='col';tr.append(th);}thead.append(tr);table.append(thead);
  const tbody=el('tbody');for(const date of datesShown()){
   const group=el('tr','studio-day-group');group.dataset.date=date;const cell=el('td');cell.colSpan=13;const i=DATES.indexOf(date);cell.append(el('strong','',date.slice(5)+' '+WEEK[i]+'요일'),el('span','','다른 날짜의 행 손잡이를 여기로 끌어 놓기'));group.append(cell);tbody.append(group);
   const rows=data.days[date].rows;cell.append(el('span','readable-day-count',rows.filter(active).length+'개 일정'));
   if(!rows.length){const empty=el('tr','studio-grid-empty');empty.dataset.date=date;const td=el('td','','비워 둔 하루입니다. 위의 + 일정 버튼으로 추가하거나 다른 날짜에서 행을 옮기세요.');td.colSpan=13;empty.append(td);tbody.append(empty);}
   for(const [index,item]of rows.entries()){
    const line=el('tr',(item.id===selectedId?'is-selected':'')+(compactExpanded.has(item.id)?' compact-expanded':''));line.dataset.id=item.id;line.dataset.date=date;
    const handleCell=el('td','grid-index'),handle=el('button','grid-row-handle',locked(item)?'·':'⋮⋮');handle.type='button';handle.draggable=!locked(item);handle.disabled=locked(item);handle.setAttribute('aria-label',locked(item)?'예약 완료 보호 중':'일정 '+(index+1)+'을 다른 날짜로 드래그');handle.append(el('small','',String(index+1)));handleCell.append(itineraryOverview(item));handleCell.append(handle,el('span','compact-card-meta',ZONES[item.startZone].label+' → '+ZONES[item.endZone].label+(item.endDay?' · 종료 +'+item.endDay+'일':'')+' · '+STATES[item.state]));line.append(handleCell);
    for(const column of columns){const td=el('td');td.dataset.label=column.label;td.dataset.mobileField=column.field;let input;if(column.choices){input=el('select','studio-cell');for(const [value,label]of column.choices){const option=el('option','',label);option.value=String(value);input.append(option);}input.value=String(column.field==='date'?date:item[column.field]);}
     else{input=el(column.multiline?'textarea':'input','studio-cell');if(!column.multiline)input.type=column.type||'text';input.value=item[column.field];if(column.max)input.maxLength=column.max;if(column.field==='title')input.placeholder='새 일정';if(column.multiline)input.rows=1;}
     input.dataset.field=column.field;input.disabled=locked(item);input.setAttribute('aria-label',date.slice(5)+' 일정 '+(index+1)+' '+column.label);td.append(input);line.append(td);
    }
    const buttons=el('td','grid-buttons');for(const [action,label]of [['details',compactExpanded.has(item.id)?'편집 접기':'더보기'],['copy','복제'],['delete','삭제']]){const button=el('button','',label);button.type='button';button.dataset.action=action;if(action==='details')button.setAttribute('aria-expanded',String(compactExpanded.has(item.id)));button.disabled=action==='delete'&&locked(item);buttons.append(button);}line.append(buttons);tbody.append(line);
   }
  }table.append(tbody);host.append(table);
 }
 function local(instant,zone){const d=new Date(instant+ZONES[zone].offset*3600000);return {date:d.toISOString().slice(0,10),time:d.toISOString().slice(11,16)};}
 function chart(){
  if(compactScreen.matches&&!compactWide.checked){phoneChart();return;}
  const host=$('studio-gantt-view');host.replaceChildren();const canvas=el('div','studio-gantt-canvas'),axis=el('div','gx-axis');axis.append(el('div','gx-axis-title','날짜 / '+ZONES[$('studio-chart-zone').value].label));const hours=el('div','gx-hours');for(let h=0;h<24;h++)hours.append(el('span','',String(h).padStart(2,'0')+':00'));axis.append(hours);canvas.append(axis);
  const all=events(),zone=$('studio-chart-zone').value;
  for(const date of datesShown()){
   const start=utc(date,'00:00',zone),end=start+DAY,lane=el('div','gx-day');lane.dataset.date=date;
   const label=el('div','gx-day-label');label.append(el('b','',date.slice(5)),el('span','',WEEK[DATES.indexOf(date)]+'요일'));lane.append(label);
   const track=el('div','gx-track');track.dataset.date=date;
   const items=all.filter(e=>Number.isFinite(e.start)&&Number.isFinite(e.end)&&e.end>e.start&&e.start<end&&e.end>start).sort((a,b)=>a.start-b.start);
   track.style.height=Math.max(80,items.length*39+22)+'px';
   if(!items.length)track.append(el('span','gx-free','시간이 있는 일정을 표에서 추가하거나 다른 날의 막대를 옮기세요.'));
   items.forEach((event,index)=>{const carry=event.start<start,protectedItem=locked(event.item),bar=el('button','gx-bar'+(event.item.id===selectedId?' is-selected':''),(protectedItem?'[보호] ':'')+(carry?'[이월] ':'')+(event.item.title||'제목 없는 일정'));bar.type='button';bar.dataset.id=event.item.id;bar.dataset.carry=String(carry);bar.dataset.protected=String(protectedItem);
    bar.style.setProperty('--left',Math.max(0,(event.start-start)/DAY*100)+'%');bar.style.setProperty('--width',((Math.min(event.end,end)-Math.max(event.start,start))/DAY*100)+'%');bar.style.setProperty('--top',(index*39+12)+'px');bar.style.setProperty('--color',event.item.transport==='항공'?'#a36343':event.item.transport==='보트·페리'?'#387f8b':event.item.state==='done'?'#858c67':'#2b6a59');
    const from=local(event.start,zone),to=local(event.end,zone);bar.title=(event.item.title||'제목 없는 일정')+' · '+from.date.slice(5)+' '+from.time+' → '+to.date.slice(5)+' '+to.time+' ('+ZONES[zone].label+')';bar.setAttribute('aria-label',bar.title+(protectedItem?' · 보호 중':carry?' · 이월 구간, 표에서 편집':' · 드래그로 15분 단위 이동, 더블클릭으로 셀 편집'));
    track.append(bar);
   });lane.append(track);canvas.append(lane);
  }host.append(canvas);
 }
 function render(){
  const mapLink=document.getElementById('studio-map-link');if(mapLink)mapLink.dataset.tripDay=filter;
  editToken='';$('studio-grid-view').hidden=view!=='grid';$('studio-gantt-view').hidden=view!=='gantt';
  modal.querySelectorAll('[data-studio-view]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.studioView===view));if(button.dataset.studioView==='grid')button.textContent=mobileScreen.matches?'카드 편집':'표 편집';});
  $('studio-help').textContent=view==='grid'?'셀을 눌러 편집 · Tab으로 다음 셀 · 행 손잡이를 다른 날짜에 드래그':'막대를 다른 날짜·시간으로 드래그 · 15분 단위 · 소요시간 유지 · 더블클릭으로 표 편집';
  $('studio-chart-zone').disabled=view!=='gantt';if(view==='grid')grid();else chart();summary();
  window.dispatchEvent(new CustomEvent('trip-editor-view',{detail:{view,day:filter}}));
 }
 function open(which,trigger){opener=trigger||document.activeElement;view=which||'grid';if(!modal.open){modal.show();document.documentElement.classList.add('studio-open');}render();}
 document.addEventListener('click',event=>{const trigger=event.target.closest('[data-open-studio],a[href="#schedule-sheet"]');if(!trigger)return;event.preventDefault();event.stopImmediatePropagation();open(trigger.dataset.openStudio||'grid',trigger);},true);
 $('studio-close').addEventListener('click',()=>modal.close());modal.addEventListener('close',()=>{document.documentElement.classList.remove('studio-open');cleanupDrag();if(dirty||blocked)status('현재 편집본을 JSON으로 백업하세요.',true);if(opener&&opener.isConnected)opener.focus({preventScroll:true});});
 modal.addEventListener('cancel',event=>{if(dirty){event.preventDefault();if(confirm('저장되지 않은 변경이 있습니다. JSON 백업 없이 편집기를 닫을까요?'))modal.close();}});
 modal.querySelectorAll('[data-studio-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.studioView;render();}));
 for(const [date,label]of [['all','전체 11일'],...DATES.map((d,i)=>[d,(i+13)+'일 '+WEEK[i]])]){const button=el('button','',label);button.type='button';button.dataset.date=date;button.addEventListener('click',()=>{filter=date;if(date!=='all')$('studio-add-date').value=date;render();});$('studio-dates').append(button);}
 for(const date of DATES){const option=el('option','',date.slice(5)+' '+WEEK[DATES.indexOf(date)]);option.value=date;$('studio-add-date').append(option);}
 $('studio-add-date').value=DATES[1];
 $('studio-lock').addEventListener('change',render);$('studio-chart-zone').addEventListener('change',()=>{if(view==='gantt')chart();});
 function focusCell(id,field='title'){const input=$('studio-grid-view').querySelector('tr[data-id="'+id+'"] [data-field="'+field+'"]');if(input){input.focus();input.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});}}
 function editSelected(){const found=find(selectedId);if(!found)return;filter=found.date;view='grid';render();focusCell(selectedId);}
 $('studio-edit-selected').textContent='선택 일정 더보기';$('studio-edit-selected').addEventListener('click',()=>showItineraryDetails(selectedId,$('studio-edit-selected')));
 $('studio-add').addEventListener('click',()=>{const date=$('studio-add-date').value;if(data.days[date].rows.length>=100){status('하루 최대 100개까지 추가할 수 있습니다.',true);return;}push();const item=row('09:00','10:00',data.days[date].zone,{title:'새 일정'});data.days[date].rows.push(item);selectedId=item.id;filter=date;view='grid';save();render();focusCell(item.id);});
 $('studio-sort').addEventListener('click',()=>{push();for(const date of datesShown())data.days[date].rows.sort((a,b)=>{const aa=utc(date,a.start,a.startZone),bb=utc(date,b.start,b.startZone);return (Number.isFinite(aa)?aa:Infinity)-(Number.isFinite(bb)?bb:Infinity);});save();render();});
 $('studio-undo').addEventListener('click',()=>{if(!history.length)return;future.push(snapshot());data=JSON.parse(history.pop());save();render();});
 $('studio-redo').addEventListener('click',()=>{if(!future.length)return;history.push(snapshot());data=JSON.parse(future.pop());save();render();});
 const gridHost=$('studio-grid-view');
 gridHost.addEventListener('focusin',event=>{const line=event.target.closest('tr[data-id]');if(line){selectedId=line.dataset.id;summary();}editToken='';});
 gridHost.addEventListener('input',event=>{
  const input=event.target,field=input.dataset.field,line=input.closest('tr[data-id]');if(!field||!line)return;const found=find(line.dataset.id);if(!found||locked(found.item))return;
  if(field==='date'){if(input.value!==found.date){moveToDate(found.item.id,input.value);}}else{const token=found.item.id+':'+field;if(editToken!==token){push();editToken=token;}found.item[field]=field==='endDay'?Number(input.value):input.value;save();summary();refreshReadableOverview(found.item.id);}
 });
 gridHost.addEventListener('change',event=>{if(event.target.tagName==='SELECT'&&event.target.dataset.field)render();});
 gridHost.addEventListener('focusout',()=>{editToken='';});
 gridHost.addEventListener('keydown',event=>{if(event.key!=='Enter'||event.target.tagName==='TEXTAREA')return;const line=event.target.closest('tr[data-id]');if(!line)return;event.preventDefault();const rows=Array.from(gridHost.querySelectorAll('tr[data-id]')),index=rows.indexOf(line),next=rows[index+(event.shiftKey?-1:1)];if(next){const target=next.querySelector('[data-field="'+event.target.dataset.field+'"]');if(target&&!target.disabled)target.focus();}});
 gridHost.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');if(!button)return;const found=find(button.closest('tr[data-id]').dataset.id);if(!found)return;
  if(button.dataset.action==='details'){if(readableCards&&!compactExpanded.has(found.item.id)){showItineraryDetails(found.item.id,button);return;}const line=button.closest('tr[data-id]'),expand=!compactExpanded.has(found.item.id);if(expand)compactExpanded.add(found.item.id);else compactExpanded.delete(found.item.id);line.classList.toggle('compact-expanded',expand);button.textContent=expand?'편집 접기':'더보기';button.setAttribute('aria-expanded',String(expand));return;}
  if(button.dataset.action==='delete'){if(locked(found.item))return;if(!confirm('이 일정과 메모를 삭제할까요? 실행 취소로 복구할 수 있습니다.'))return;push();data.days[found.date].rows.splice(found.index,1);}
  else{if(data.days[found.date].rows.length>=100){status('하루 최대 100개입니다.',true);return;}push();data.days[found.date].rows.splice(found.index+1,0,{...found.item,id:uid(),state:'draft'});}
  save();render();
 });
 function moveToDate(id,date){
  const found=find(id);if(!found||!DATES.includes(date)||locked(found.item)||date===found.date)return;
  if(data.days[date].rows.length>=100){status('대상 날짜의 일정이 100개입니다.',true);render();return;}
  push();data.days[found.date].rows.splice(found.index,1);data.days[date].rows.push(found.item);selectedId=id;save();render();
 }
 gridHost.addEventListener('dragstart',event=>{const handle=event.target.closest('.grid-row-handle');if(!handle)return;const found=find(handle.closest('tr[data-id]').dataset.id);if(!found||locked(found.item)){event.preventDefault();return;}dragId=found.item.id;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',dragId);});
 gridHost.addEventListener('dragover',event=>{const target=event.target.closest('tr[data-date]');if(!dragId||!target)return;event.preventDefault();event.dataTransfer.dropEffect='move';gridHost.querySelectorAll('.is-drop-target').forEach(e=>e.classList.remove('is-drop-target'));target.classList.add('is-drop-target');});
 gridHost.addEventListener('drop',event=>{const target=event.target.closest('tr[data-date]');if(!dragId||!target)return;event.preventDefault();const id=dragId;dragId='';moveToDate(id,target.dataset.date);gridHost.querySelectorAll('.is-drop-target').forEach(e=>e.classList.remove('is-drop-target'));});
 gridHost.addEventListener('dragend',()=>{dragId='';gridHost.querySelectorAll('.is-drop-target').forEach(e=>e.classList.remove('is-drop-target'));});
 const gantt=$('studio-gantt-view'),tip=$('studio-drag-tip');
 function cleanupDrag(){if(pointerDrag){const bar=pointerDrag.bar;bar.classList.remove('is-dragging');try{if(bar.hasPointerCapture(pointerDrag.pointerId))bar.releasePointerCapture(pointerDrag.pointerId);}catch(e){}}pointerDrag=null;tip.hidden=true;gantt.querySelectorAll('.is-drop-target').forEach(e=>e.classList.remove('is-drop-target'));}
 function dragProposal(event){
  const current=pointerDrag;if(!current)return null;
  const track=document.elementsFromPoint(event.clientX,event.clientY).map(e=>e.closest&&e.closest('.gx-track')).find(Boolean);if(!track||!gantt.contains(track))return null;
  const rect=track.getBoundingClientRect(),minute=Math.round((((event.clientX-rect.left)/rect.width)*1440-current.grabMinutes)/15)*15;
  const zone=$('studio-chart-zone').value,newStart=utc(track.dataset.date,'00:00',zone)+Math.min(1425,Math.max(0,minute))*60000;
  return {track,newStart};
 }
 gantt.addEventListener('pointerdown',event=>{
  const bar=event.target.closest('.gx-bar');if(!bar||event.button!==0)return;
  const found=find(bar.dataset.id);if(!found)return;selectedId=found.item.id;summary();gantt.querySelectorAll('.gx-bar').forEach(e=>e.classList.toggle('is-selected',e.dataset.id===selectedId));
  if(locked(found.item)||bar.dataset.carry==='true'||(mobileScreen.matches&&!$('studio-touch-drag').checked))return;
  const track=bar.closest('.gx-track'),rect=track.getBoundingClientRect(),zone=$('studio-chart-zone').value,start=utc(found.date,found.item.start,found.item.startZone),end=utc(found.date,found.item.end,found.item.endZone,found.item.endDay);
  pointerDrag={bar,pointerId:event.pointerId,id:found.item.id,start,end,x:event.clientX,y:event.clientY,grabMinutes:((event.clientX-rect.left)/rect.width)*1440-(start-utc(track.dataset.date,'00:00',zone))/60000,moved:false,proposal:null};
  bar.setPointerCapture(event.pointerId);
 });
 gantt.addEventListener('pointermove',event=>{
  const current=pointerDrag;if(!current||event.pointerId!==current.pointerId)return;
  if(!current.moved&&Math.hypot(event.clientX-current.x,event.clientY-current.y)<6)return;
  current.moved=true;current.bar.classList.add('is-dragging');event.preventDefault();
  const proposal=dragProposal(event);current.proposal=proposal;gantt.querySelectorAll('.is-drop-target').forEach(e=>e.classList.remove('is-drop-target'));
  tip.hidden=false;tip.style.left=Math.max(8,Math.min(window.innerWidth-285,event.clientX+15))+'px';tip.style.top=Math.max(8,Math.min(window.innerHeight-70,event.clientY+15))+'px';
  if(proposal){proposal.track.classList.add('is-drop-target');const when=local(proposal.newStart,$('studio-chart-zone').value);tip.textContent=when.date.slice(5)+' '+when.time+' 시작 · 소요시간 유지';}else tip.textContent='옮길 날짜의 차트 안에 놓으세요.';
 });
 gantt.addEventListener('pointerup',event=>{
  const current=pointerDrag;if(!current||event.pointerId!==current.pointerId)return;const proposal=current.proposal,moved=current.moved,found=find(current.id);
  cleanupDrag();if(!moved||!proposal||!found)return;
  const end=proposal.newStart+(current.end-current.start),from=local(proposal.newStart,found.item.startZone),to=local(end,found.item.endZone),dayOffset=Math.round((Date.parse(to.date+'T00:00:00Z')-Date.parse(from.date+'T00:00:00Z'))/DAY);
  if(!DATES.includes(from.date)||![0,1,2].includes(dayOffset)){status('이 시트의 날짜 범위 또는 종료일 범위를 벗어나 이동하지 않았습니다.',true);return;}
  if(from.date!==found.date&&data.days[from.date].rows.length>=100){status('대상 날짜의 일정이 100개라 이동하지 않았습니다.',true);return;}
  push();const item=found.item;if(from.date!==found.date){data.days[found.date].rows.splice(found.index,1);data.days[from.date].rows.push(item);}
  item.start=from.time;item.end=to.time;item.endDay=dayOffset;selectedId=item.id;save();render();
 });
 gantt.addEventListener('pointercancel',cleanupDrag);
 gantt.addEventListener('dblclick',event=>{const bar=event.target.closest('.gx-bar');if(bar){selectedId=bar.dataset.id;editSelected();}});
 gantt.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){const bar=event.target.closest('.gx-bar');if(bar){event.preventDefault();selectedId=bar.dataset.id;summary();editSelected();}}});
 function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type}));const a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 const stamp=()=>new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
 $('studio-export').addEventListener('click',()=>download(JSON.stringify({...data,exportedAt:new Date().toISOString()},null,2),'application/json;charset=utf-8','australia-recommended-'+stamp()+'.json'));
 function csv(value){let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';}
 $('studio-csv').addEventListener('click',()=>{const rows=[['시작 날짜','시작 시각','시작 도시','종료 날짜','종료 시각','종료 도시','활동','장소','이동수단','상태','메모']];for(const date of DATES)for(const item of data.days[date].rows){const endDate=new Date(Date.UTC(2026,9,Number(date.slice(-2))+item.endDay)).toISOString().slice(0,10);rows.push([date,item.start,ZONES[item.startZone].label,endDate,item.end,ZONES[item.endZone].label,item.title,item.place,item.transport,STATES[item.state],item.notes]);}download('\uFEFF'+rows.map(r=>r.map(csv).join(',')).join('\r\n'),'text/csv;charset=utf-8','australia-recommended-'+stamp()+'.csv');});
 $('studio-import').addEventListener('click',()=>$('studio-file').click());
 $('studio-file').addEventListener('change',async event=>{const input=event.target,file=input.files&&input.files[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('2MB 이하의 일정 파일만 가능합니다.');const incoming=validate(JSON.parse(await file.text()));if(!confirm('11일 전체 일정을 파일 내용으로 교체할까요? 필요한 기존 내용은 먼저 JSON으로 백업하세요.'))return;data=incoming;blocked=false;external=null;history=[];future=[];selectedId='';$('studio-conflict').hidden=true;save();render();}catch(e){status('불러오기 실패. 기존 일정은 유지했습니다: '+e.message,true);}finally{input.value='';}});
 $('studio-reset').addEventListener('click',()=>{if(!confirm('이 편집 내용을 포트더글라스 기본안으로 되돌릴까요? 필요하면 먼저 JSON을 백업하세요. 기존 개인 일정·메모·예산은 유지됩니다.'))return;data=initial();history=[];future=[];selectedId='';blocked=false;external=null;$('studio-conflict').hidden=true;save();render();});
 window.addEventListener('storage',event=>{if(event.key!==KEY&&event.key!==null)return;blocked=true;external=event.newValue;$('studio-conflict').hidden=false;status('다른 탭 변경 감지. 이 탭 자동 저장을 중지했습니다.',true);});
 $('studio-external').addEventListener('click',()=>{if(!confirm('현재 편집을 버리고 다른 탭 내용으로 전환할까요? 필요하면 먼저 JSON을 백업하세요.'))return;try{const incoming=external?validate(JSON.parse(external)):initial();data=incoming;history=[];future=[];selectedId='';blocked=false;dirty=false;$('studio-conflict').hidden=true;status('다른 탭 내용을 적용했습니다.');render();}catch(e){status('다른 탭 데이터 형식 오류. 현재 내용을 유지합니다.',true);}});

 document.querySelectorAll('[data-photo-date]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.photoDate;$('studio-add-date').value=filter;render();}));
 $('photo-old-backup').addEventListener('click',()=>{
  try{const raw=localStorage.getItem('australia-recommended-itinerary-photo-2026-v2');if(!raw){status('이 브라우저에 저장된 이전 추천 편집본이 없습니다. 현재 일정은 유지합니다.');return;}download(raw,'application/json;charset=utf-8','australia-before-portdouglas.json');status('이전 추천 편집본 백업을 요청했습니다. 현재 포트더글라스 일정은 유지했습니다.');}catch(error){status('이전 저장 공간에 접근할 수 없습니다. 현재 일정은 유지합니다.',true);}
 });




 $('apply-booked-domestic').addEventListener('click',()=>{
  if(blocked){status('저장 오류 또는 다른 탭 충돌을 먼저 해결하세요.',true);return;}
  if(!confirm('10/19의 편집 일정을 확정 JQ959와 새 공항·저녁 일정으로 교체할까요? 다른 날짜는 유지합니다. 기존 전체 일정은 JSON으로 먼저 다운로드하며 실행 취소도 가능합니다.'))return;
  download(JSON.stringify(data,null,2),'application/json;charset=utf-8','australia-before-JQ959.json');
  push();data.days['2026-10-19']=initial().days['2026-10-19'];selectedId='';filter='2026-10-19';save();render();
 });

 summary();historyButtons();
})();
