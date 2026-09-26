(() => {
  'use strict';
  const DATE='2026-10-18',KEY='australia-recommended-portdouglas-2026-v1',BACKUP='australia-before-armour-museum-20260926';
  const museum='The Australian Armour & Artillery Museum';
  const notes='방문 예정·입장권 미구매. 주소: 2 Skyrail Drive, Smithfield. 공식 운영 09:30~16:30, 성인 A$36씩 2인 A$72. 사전 예약 필수 아님: 현장 구매 계획. 관람 2시간은 여유 있게 잡은 계획값. 냉방이 없으므로 물과 가벼운 옷 준비. APC 탑승 등 추가 체험은 미선택·별도 비용. 2026-09-26 공식 안내 확인: https://www.ausarmour.com/buy-tickets/ 및 https://www.ausarmour.com/faqmuseum/ . 입장료 A$72는 기존 예산 계산기에 자동 합산되지 않음.';
  const rows=[
    {id:'armour-museum-drive-out',day:18,start:'12:30',end:'13:00',startZone:'CNS',endZone:'CNS',title:'점심 후 장갑차·포병 박물관으로 이동',place:'Australian Armour & Artillery Museum',transport:'렌터카',state:'pending',notes:'수영장 방문과 점심 이후 Smithfield로 이동. 식당 미정이므로 30분은 일정용 여유이며 실시간 이동시간이 아닙니다.'},
    {id:'armour-museum-visit',day:18,start:'13:00',end:'15:00',startZone:'CNS',endZone:'CNS',title: museum+' 관람',place:museum,transport:'현장 도보',state:'pending',notes},
    {id:'armour-museum-drive-home',day:18,start:'15:00',end:'15:30',startZone:'CNS',endZone:'CNS',title:'박물관에서 숙소 복귀 · 이후 휴식',place:museum+' → Trinity Collective',transport:'렌터카',state:'pending',notes:'복귀 30분은 주차를 포함한 계획상 여유입니다. 숙소에서 장비 정리·휴식 후 다음 날 국내선 이동을 준비합니다.'}
  ];
  const matches=r=>/armour|장갑차.*박물관|포병.*박물관/i.test((r.title||'')+' '+(r.place||''));
  const overlaps=r=>r.start<'15:30'&&r.end>'12:30';
  function merge(source){
    if(source.some(matches))return source;
    const next=[];
    for(const original of source){
      if(!overlaps(original)){next.push(original);continue;}
      if(original.start<'12:30')next.push({...original,end:'12:30'});
      if(original.end>'15:30')next.push({...original,id:(original.id||'museum-rest')+'-after',start:'15:30'});
    }
    return next.concat(rows.map(r=>({...r}))).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  }
  if(Array.isArray(window.tripInitialRows)){
    const day=window.tripInitialRows.filter(r=>r.day===18);
    if(!day.some(r=>overlaps(r)&&['confirmed','done'].includes(r.state)))window.tripInitialRows=window.tripInitialRows.filter(r=>r.day!==18).concat(merge(day)).sort((a,b)=>a.day-b.day||a.start.localeCompare(b.start));
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const host=document.querySelector('main');if(!host)return;
    const panel=document.createElement('aside');panel.className='notice';panel.id='armour-museum-update';
    panel.innerHTML='<strong>10/18 추가 방문 · Australian Armour &amp; Artillery Museum</strong><p>오전 토브룩 수영장 → 점심 → 12:30 이동 → 13:00~15:00 박물관 → 15:30 숙소 복귀·휴식. 박물관 입장 2인 A$72, 현장 구매 계획이며 미예약입니다. 추가 체험은 선택하지 않았습니다.</p><p>Smithfield · 2 Skyrail Drive. 매일 09:30~16:30 운영 안내. 냉방이 없으므로 물·가벼운 옷을 준비하세요. 이동시간은 계획용 여유입니다. 입장료는 예산 계산기에 자동 합산하지 않았습니다.</p><p><a href="https://www.ausarmour.com/buy-tickets/" target="_blank" rel="noopener noreferrer">공식 입장료·예약 안내</a> · <a href="https://www.ausarmour.com/faqmuseum/" target="_blank" rel="noopener noreferrer">방문 안내</a> · <a href="https://www.google.com/maps/search/?api=1&amp;query=Australian+Armour+Artillery+Museum+2+Skyrail+Drive+Smithfield" target="_blank" rel="noopener noreferrer">실제 위치 검색</a></p>';
    const status=document.createElement('p');status.setAttribute('role','status');
    const apply=document.createElement('button');apply.className='btn';apply.type='button';apply.textContent='내 저장 일정에도 박물관 반영';
    const restore=document.createElement('button');restore.className='btn';restore.type='button';restore.textContent='박물관 반영 전 일정 복원';restore.hidden=true;
    function describe(){
      try{
        const saved=JSON.parse(localStorage.getItem(KEY)||'null'),existing=saved?.days?.[DATE]?.rows;
        restore.hidden=!localStorage.getItem(BACKUP);
        if(!Array.isArray(existing)){status.textContent='기본 추천 일정에 반영했습니다. 저장된 일정이 없는 경우 카드·일정표·지도에서 이 기본안을 사용합니다.';apply.hidden=true;}
        else if(existing.some(matches)){status.textContent='저장된 18일 일정에 박물관이 포함되어 있습니다.';apply.hidden=true;}
        else{status.textContent='편집한 일정은 유지했습니다. 아래 버튼을 누르면 겹치는 일정을 확인하고 반영할 수 있습니다.';apply.hidden=false;}
      }catch{status.textContent='저장된 일정을 읽지 못해 자동 변경하지 않았습니다. 기본 추천안에는 방문 계획이 포함됩니다.';apply.disabled=true;}
    }
    apply.addEventListener('click',()=>{
      try{
        const raw=localStorage.getItem(KEY),saved=JSON.parse(raw||'null'),day=saved?.days?.[DATE];
        if(!Array.isArray(day?.rows))throw Error('저장된 일정을 찾지 못했습니다. 일정표를 열어 저장한 뒤 다시 시도하세요.');
        if(day.rows.some(matches)){describe();return;}
        const conflicts=day.rows.filter(overlaps);
        if(conflicts.some(r=>['confirmed','done'].includes(r.state)))throw Error('12:30~15:30에 예약 완료·완료 일정이 있어 변경하지 않았습니다. 일정표에서 시간을 직접 조정하세요.');
        if(!confirm('10/18 12:30~15:30에 박물관 이동·관람을 넣을까요?\n'+(conflicts.length?'겹치는 구간은 줄이거나 교체합니다:\n'+conflicts.map(r=>r.start+'~'+r.end+' '+r.title).join('\n'):'겹치는 일정이 없습니다.')+'\n기존 일정은 복원용으로 백업하며 개인 메모는 변경하지 않습니다.'))return;
        localStorage.setItem(BACKUP,raw);
        day.rows=merge(day.rows);localStorage.setItem(KEY,JSON.stringify(saved));location.reload();
      }catch(error){status.textContent=error.message||'저장하지 못했습니다.';}
    });
    restore.addEventListener('click',()=>{
      try{
        const backup=localStorage.getItem(BACKUP);if(!backup)return;
        if(!confirm('박물관을 반영하기 전 일정으로 복원할까요? 이후 일정 수정도 함께 되돌아갑니다. 현재 일정은 같은 복원 버튼으로 다시 되돌릴 수 있도록 보관합니다.'))return;
        const current=localStorage.getItem(KEY);if(current)localStorage.setItem(BACKUP,current);
        localStorage.setItem(KEY,backup);location.reload();
      }catch{status.textContent='복원하지 못했습니다. 저장 공간과 브라우저 설정을 확인하세요.';}
    });
    panel.append(status,apply,document.createTextNode(' '),restore);host.prepend(panel);describe();
  });
})();
