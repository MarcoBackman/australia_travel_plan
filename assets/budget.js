
'use strict';
const storageKey='australia-honeymoon-2026-plan-v1';
const costRows=[
 {id:'flight',label:'케언스 → 시드니 국내선',detail:'JQ959 예약 완료 / 1인 × 2명 / 결제액 미제공: 추정값',qty:2,value:230,group:'transport'},
 {id:'cairns',label:'케언스 숙박',detail:'총 숙소 300만원 계획 / 객실 1개 1박 × 5박',qty:5,value:210,group:'stay'},
 {id:'sydney',label:'시드니 숙박',detail:'총 숙소 300만원 계획 / 객실 1개 1박 × 4박',qty:4,value:310,group:'stay'},
 {id:'early',label:'도착일 오전 객실 확보',detail:'조기 입실 또는 전날 1박 / 5박 비용과 중복 금지',qty:1,value:210,group:'stay'},
 {id:'freedive',label:'프리다이빙 투어 1회',detail:'공개 시작가 1인 × 성인 2명',qty:2,value:360,group:'sea'},
 {id:'reef',label:'10/17 두 번째 프리다이빙',detail:'선택 상품 1인 단가 × 성인 2명 / 지정일 견적 필요',qty:2,value:360,group:'sea'},
 {id:'ferry',label:'피츠로이섬 왕복 페리',detail:'1인 왕복 × 성인 2명 / 식사·장비 별도',qty:2,value:109,group:'sea'},
 {id:'car',label:'선택 렌터카 총액',detail:'기본안 0일 / 선택 시 대여·보험·연료·주차 총액',qty:1,value:0,group:'transport'},
 {id:'cnsairport',label:'케언스 공항 왕복',detail:'택시·차량 호출 / 2회 편도 합계 가정',qty:1,value:100,group:'transport'},
 {id:'sydairport',label:'시드니 공항 왕복',detail:'택시·차량 호출 / 2회 편도 합계 가정',qty:1,value:160,group:'transport'},
 {id:'city',label:'시드니 시내 대중교통',detail:'체류 기간 2인 합계 / 공항 제외',qty:1,value:80,group:'transport'},
 {id:'citytaxi',label:'시드니 구간 택시',detail:'10/22 두 구간 / 2인 차량 합계 가정',qty:1,value:80,group:'transport'},
 {id:'geartransfer',label:'선택 장비 매장 왕복',detail:'기본 0 / 매장 선택 시 4회 편도 총액 입력',qty:1,value:0,group:'transport'},
 {id:'food',label:'식사·카페',detail:'2인 하루 예산 × 10일',qty:10,value:150,group:'other'},
 {id:'misc',label:'통신·여행보험·소액 입장료',detail:'2인 합계 / 개별 상품 견적 아님',qty:1,value:225,group:'other'}
];
const el=id=>document.getElementById(id);
const aud=n=>'A$'+n.toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});
const won=n=>Math.round(n).toLocaleString('ko-KR')+'원';
const defaults={exchange:1000,reserve:10,international:0,extras:0};
let stored={};let canStore=true;
try{const parsed=JSON.parse(localStorage.getItem(storageKey)||'{}');if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))stored=parsed;}catch(e){canStore=false;}
function validNumber(value,min,max){return value!==''&&value!==null&&value!==undefined&&Number.isFinite(Number(value))&&Number(value)>=min&&Number(value)<=max;}
for(const [key,value] of Object.entries(defaults)){const node=el(key);const saved=stored[key];node.value=validNumber(saved,Number(node.min),Number(node.max))?saved:value;}
el('reef-choice').value=stored.reefChoice==='snorkel'?'snorkel':'freedive';
for(const row of costRows){
 const tr=document.createElement('tr');const name=document.createElement('td');const label=document.createElement('strong');label.id='label-'+row.id;label.textContent=row.label;const detail=document.createElement('small');detail.textContent=row.detail;name.append(label,detail);
 const valueCell=document.createElement('td');const input=document.createElement('input');input.type='number';input.min='0';input.max='100000';input.step='0.01';input.inputMode='decimal';input.id='cost-'+row.id;input.setAttribute('aria-label',row.label+' 단가 호주달러');
 const fallback=row.id==='reef'?(el('reef-choice').value==='freedive'?360:317):row.value;
 input.value=stored.costs&&validNumber(stored.costs[row.id],0,100000)?stored.costs[row.id]:fallback;valueCell.append(input);
 const sum=document.createElement('td');sum.id='sum-'+row.id;sum.className='num';tr.append(name,valueCell,sum);el('budget-rows').append(tr);
}
function updateReefLabel(){el('label-reef').textContent=el('reef-choice').value==='freedive'?'10/17 두 번째 프리다이빙':'10/17 Moore Reef 투어';}
updateReefLabel();
for(const checkbox of document.querySelectorAll('[data-check]')){checkbox.checked=!!(stored.checks&&stored.checks[checkbox.dataset.check]);checkbox.addEventListener('change',()=>{updateChecks();save();});}
function updateChecks(){if(el('check-status'))el('check-status').textContent='완료 '+document.querySelectorAll('[data-check]:checked').length+' / 6';}
function save(){
 if(!canStore)return;
 let latest={};try{latest=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch(e){}const state={...latest,reefChoice:el('reef-choice').value,costs:{},checks:{...(latest.checks||{})}};
 for(const key of Object.keys(defaults))state[key]=Number(el(key).value);
 for(const row of costRows)state.costs[row.id]=Number(el('cost-'+row.id).value);
 for(const checkbox of document.querySelectorAll('[data-check]'))state.checks[checkbox.dataset.check]=checkbox.checked;
 try{localStorage.setItem(storageKey,JSON.stringify(state));}catch(e){canStore=false;}
}
function calculate(persist=true){
 const inputs=[...Object.keys(defaults).map(el),...costRows.map(row=>el('cost-'+row.id))];let invalid=false;
 for(const input of inputs){const ok=validNumber(input.value,Number(input.min),Number(input.max));input.setAttribute('aria-invalid',String(!ok));if(!ok)invalid=true;}
 if(invalid){el('range-krw').textContent='· 입력 확인 필요';el('stay-cap-status').textContent='유효하지 않은 입력이 있어 숙소 상한 비교를 멈췄습니다.';el('budget').querySelector('.range-card').classList.remove('over-cap');el('budget-status').textContent='입력값을 확인하세요. 금액은 0 이상, 환율은 1 이상이어야 합니다. 결과는 마지막 유효 입력값입니다.';el('budget-status').classList.add('error');return;}
 el('budget-status').classList.remove('error');
 const rate=Number(el('exchange').value),reserve=Number(el('reserve').value),international=Number(el('international').value),extras=Number(el('extras').value);
 const groups={stay:0,sea:0,transport:0,other:extras};let total=extras;
 for(const row of costRows){const sum=Math.round(Number(el('cost-'+row.id).value)*row.qty*100)/100;el('sum-'+row.id).textContent=aud(sum);total+=sum;groups[row.group]+=sum;}
 total=Math.round(total*100)/100;const reserveAmount=Math.round(total*reserve)/100;const withReserve=Math.round((total+reserveAmount)*100)/100;
 el('total-aud').textContent=aud(total);el('total-krw').textContent=won(total*rate);el('reserve-label').textContent=reserve;el('reserve-aud').textContent=aud(reserveAmount);el('with-reserve-aud').textContent=aud(withReserve);el('with-reserve-krw').textContent=won(withReserve*rate);
 el('international-label').textContent=international>0?won(international):'미입력 · 제외';el('grand-total').textContent=won(withReserve*rate+international);el('grand-note').textContent=international>0?'입력한 국제선 + 현지 예산 + 현지 예비비. 미입력 선택비용은 제외됩니다.':'국제선 미입력. 전체 여행비가 아닙니다.';
 const stayWon=Math.round(groups.stay*rate),stayWithReserve=Math.round(groups.stay*rate*(1+reserve/100)),remaining=3000000-stayWithReserve;
 el('range-krw').textContent='· 현재 숙박 '+won(stayWon);
 el('stay-cap-status').textContent='숙박분 예비비 '+reserve+'% 포함 '+won(stayWithReserve)+' · '+(remaining>=0?'상한까지 '+won(remaining)+' 남음':'상한 '+won(-remaining)+' 초과 — 숙박비를 낮추세요.');
 el('budget').querySelector('.range-card').classList.toggle('over-cap',remaining<0);
 el('cost-bar').replaceChildren();const colors={stay:'#e3d2b0',sea:'#90beb1',transport:'#d88464',other:'#c2cbb3'};
 for(const key of Object.keys(groups)){const part=document.createElement('span');part.style.width=(total>0?groups[key]/total*100:0)+'%';part.style.backgroundColor=colors[key];el('cost-bar').append(part);}
 renderBudgetVisualization(groups,total,rate);
 if(persist)save();el('budget-status').textContent=canStore?'입력한 예산은 이 브라우저에 자동 저장됩니다.':'이 환경에서는 자동 저장을 사용할 수 없습니다. 현재 화면의 계산은 이용할 수 있습니다.';
}
for(const input of document.querySelectorAll('#budget input'))input.addEventListener('input',()=>calculate());
el('reef-choice').addEventListener('change',()=>{el('cost-reef').value=el('reef-choice').value==='freedive'?360:317;updateReefLabel();calculate();});
el('reset-budget').addEventListener('click',()=>{for(const [key,value] of Object.entries(defaults))el(key).value=value;for(const row of costRows)el('cost-'+row.id).value=row.value;el('reef-choice').value='freedive';updateReefLabel();calculate();});
el('print-button')?.addEventListener('click',()=>{const opened=[];for(const item of document.querySelectorAll('details')){if(!item.open){item.open=true;opened.push(item);}}const restore=()=>{for(const item of opened)item.open=false;window.removeEventListener('afterprint',restore);};window.addEventListener('afterprint',restore);window.print();});
function renderBudgetVisualization(groups,total,rate){
 let chart=el('budget-visualization');
 if(!chart){chart=document.createElement('div');chart.id='budget-visualization';chart.className='budget-visual';document.querySelector('.budget-total').prepend(chart);}
 const labels={stay:'숙박·오전 객실',sea:'프리다이빙·리프·섬',transport:'항공·렌터카·교통',other:'식비·기타·추가 선택'};
 const colors={stay:'#e3d2b0',sea:'#90beb1',transport:'#d88464',other:'#c2cbb3'};
 const parts=[];let start=0;for(const key of Object.keys(groups)){const end=start+(total>0?groups[key]/total*100:0);parts.push(colors[key]+' '+start+'% '+end+'%');start=end;}
 chart.replaceChildren();const heading=document.createElement('div');heading.className='eyebrow';heading.textContent='WHERE OUR BUDGET GOES';chart.append(heading);
 const wrap=document.createElement('div');wrap.className='donut-wrap';const donut=document.createElement('div');donut.className='budget-donut';donut.style.background=total>0?'conic-gradient('+parts.join(',')+')':'#315e56';donut.setAttribute('role','img');donut.setAttribute('aria-label',Object.entries(groups).map(([key,value])=>labels[key]+' '+aud(value)).join(', '));
 const hole=document.createElement('div');hole.className='donut-hole';const name=document.createElement('small');name.textContent='현지 소계';const number=document.createElement('strong');number.textContent='A$'+Math.round(total).toLocaleString('en-AU');const sub=document.createElement('small');sub.textContent='2인 · 예비비 전';hole.append(name,number,sub);donut.append(hole);wrap.append(donut);chart.append(wrap);
 const categories=document.createElement('div');for(const key of Object.keys(groups)){const percentage=total>0?groups[key]/total*100:0;const row=document.createElement('div');row.className='budget-category';const title=document.createElement('div');title.className='budget-category-head';const label=document.createElement('span');const dot=document.createElement('i');dot.className='dot';dot.style.background=colors[key];label.append(dot,document.createTextNode(labels[key]));const amount=document.createElement('small');amount.textContent=percentage.toFixed(1)+'% · '+aud(groups[key]);title.append(label,amount);const track=document.createElement('div');track.className='budget-category-track';const fill=document.createElement('div');fill.className='budget-category-fill';fill.style.width=percentage+'%';fill.style.background=colors[key];track.append(fill);row.append(title,track);categories.append(row);}chart.append(categories);
 const note=document.createElement('p');note.className='budget-chart-note';note.textContent='입력값·투어 선택과 함께 바뀝니다. 국제선 결제액과 예비비는 이 비중에서 제외합니다.';chart.append(note);
}
updateChecks();calculate(false);


(function(){let previous=null;
 const apply=values=>{previous=Object.fromEntries(Object.keys(values).map(k=>[k,el('cost-'+k).value]));for(const [k,v] of Object.entries(values))el('cost-'+k).value=v;calculate();el('undo-stay-budget').disabled=false;el('stay-budget-status').textContent='표시된 계획값을 적용했습니다. 다른 항목은 유지했습니다. 마지막 적용 취소로 복구할 수 있습니다.';};
 el('apply-stay-budget').addEventListener('click',()=>{const rate=Number(el('exchange').value);if(!validNumber(el('exchange').value,1,100000)){el('stay-budget-status').textContent='환율을 먼저 올바르게 입력하세요.';return;}const values=Object.fromEntries(Object.entries({cairns:210000,sydney:310000,early:210000}).map(([k,v])=>[k,Math.floor(v/rate*100)/100]));if(Object.values(values).some(v=>v>100000)){el('stay-budget-status').textContent='환율이 너무 작아 입력 범위를 벗어납니다. 환율을 확인하세요.';return;}apply(values);});el('apply-gear-transfer').addEventListener('click',()=>apply({geartransfer:250}));
 el('undo-stay-budget').addEventListener('click',()=>{if(!previous)return;for(const [k,v] of Object.entries(previous))el('cost-'+k).value=v;previous=null;calculate();el('undo-stay-budget').disabled=true;el('stay-budget-status').textContent='마지막 버튼 적용 전 금액으로 복구했습니다.';});
})();

function syncStayMeter(){const n=Number(el('cost-cairns').value)*5+Number(el('cost-sydney').value)*4+Number(el('cost-early').value);const v=n*Number(el('exchange').value)*(1+Number(el('reserve').value)/100);const meter=el('lodging-meter');meter.value=Math.min(3000000,Math.max(0,v||0));}document.querySelector('#budget').addEventListener('input',syncStayMeter);document.querySelector('#budget').addEventListener('click',syncStayMeter);syncStayMeter();