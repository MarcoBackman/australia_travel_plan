(() => {
 'use strict';const key='australia-honeymoon-2026-plan-v1',inputs=[...document.querySelectorAll('[data-check]')];
 const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}');}catch(e){return {};}};
 function count(){document.getElementById('check-status').textContent='완료 '+inputs.filter(x=>x.checked).length+' / '+inputs.length;}
 const booked=inputs.find(x=>x.dataset.check==='domestic');if(booked){booked.disabled=true;booked.closest('label').querySelector('b').textContent='02. 국내선 JQ959 예약 완료';booked.closest('label').querySelector('small').textContent='10/19 CNS 13:30 → SYD 17:25. 위탁 30kg·기내 12kg/인 사용자 제공. 운항·수하물 상세 재확인.';}
 const hotels=inputs.find(x=>x.dataset.check==='hotels');if(hotels)hotels.closest('label').querySelector('small').textContent='전체 숙소 300만원 이내. 케언스 5박·시드니 4박과 도착일 오전 객실 확보를 포함해 최종 청구액·입실 조건 확인.';
 function refresh(){const data=read();for(const input of inputs)input.checked=input===booked||!!data.checks?.[input.dataset.check];count();}
 inputs.forEach(input=>input.addEventListener('change',()=>{const data=read();data.checks={...(data.checks||{}),[input.dataset.check]:input.checked};try{localStorage.setItem(key,JSON.stringify(data));}catch(e){document.getElementById('check-status').textContent='현재 브라우저에 저장할 수 없습니다.';return;}count();}));window.addEventListener('storage',e=>{if(e.key===key)refresh();});refresh();
})();
