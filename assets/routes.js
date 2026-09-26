window.tripRoutes={"hotel-prices": "stay.html", "previous-hotel-prices": "stay.html", "stay-transport": "stay.html", "stay-plan": "stay.html", "budget": "budget.html", "flights": "transport.html", "booking": "transport.html", "transport": "transport.html", "baggage": "prepare.html", "freedive-rental": "prepare.html", "freedive-safety": "prepare.html", "entry-insurance": "prepare.html", "checklist": "prepare.html", "sources": "prepare.html", "cairns-bbq": "dining.html", "bbq-plan": "dining.html", "destinations": "explore.html", "atlas": "explore.html", "reef": "explore.html", "itinerary": "recommended-itinerary.html", "recommended-grid": "recommended-itinerary.html", "recommended-gantt": "recommended-itinerary.html?view=gantt", "trip-studio": "personal-plan.html", "destination-1": "explore.html", "destination-2": "explore.html", "destination-3": "explore.html", "destination-4": "explore.html", "destination-5": "explore.html", "destination-6": "explore.html", "destination-7": "explore.html", "destination-8": "explore.html", "destination-9": "explore.html", "destination-10": "explore.html", "destination-11": "explore.html", "destination-12": "explore.html", "destination-13": "explore.html", "destination-14": "explore.html", "destination-15": "explore.html", "destination-16": "explore.html", "destination-17": "explore.html", "destination-18": "explore.html", "destination-19": "explore.html", "destination-20": "explore.html", "minimap": "route-map.html", "route-map": "route-map.html"};
// Rental and entry guidance is shared across the existing multi-page navigation.
document.addEventListener('DOMContentLoaded',function(){
 const file=location.pathname.split('/').pop();
 if(!['index.html','stay.html','prepare.html','transport.html','rental-entry.html',''].includes(file))return;
 const host=document.querySelector('main');if(!host)return;
 const card=document.createElement('aside');card.className='notice';card.id='trinity-selected-stay';
 const heading=document.createElement('strong');heading.textContent='선택 숙소: Trinity Collective · 10/14 체크인 14:00';
 const p=document.createElement('p');p.textContent='10/14~19 케언스 북부 Trinity Beach 5박. 주소: 10–14 Navigation Drive. 체크인 시각은 사용자 안내 기준이며 예약·결제·객실 유형·숙박료는 미확인입니다. 기존 포트더글라스 숙소와 시내 숙소 비교는 과거 참고안이며, 식당·관광지까지 도보권이라고 가정하지 않습니다. 렌터카 전 기간 유지와 숙소 주차 조건을 함께 비교하세요.';
 const official=document.createElement('a');official.href='https://trinitycollective.com.au/';official.target='_blank';official.rel='noopener noreferrer';official.textContent='숙소 공식 안내';
 const map=document.createElement('a');map.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Trinity Collective 10-14 Navigation Drive Trinity Beach QLD 4879');map.target='_blank';map.rel='noopener noreferrer';map.textContent='실제 숙소 위치 검색';
 const itinerary=document.createElement('a');itinerary.href='recommended-itinerary.html?day=2026-10-14';itinerary.textContent='14일 일정 보기';
 card.append(heading,p,official,document.createTextNode(' · '),map,document.createTextNode(' · '),itinerary);host.prepend(card);
});
document.addEventListener('DOMContentLoaded',function(){
 const nav=document.querySelector('.site-header nav');
 if(nav&&!nav.querySelector('a[href="rental-entry.html"]')){const a=document.createElement('a');a.href='rental-entry.html';a.textContent='렌터카·비자';nav.append(a);}
 const file=location.pathname.split('/').pop();
 if(['index.html','prepare.html','transport.html','budget.html',''].includes(file)){
  const host=document.querySelector('main');if(!host)return;
  const box=document.createElement('aside');box.className='notice';box.id='rental-entry-summary';
  const title=document.createElement('strong');title.textContent='9/26 준비 업데이트 · 공항 렌터카 예산과 ETA';
  const p=document.createElement('p');p.textContent='렌터카 1대 계획 예산 A$110~220/일(보장 예비비 포함, 실시간 견적 아님). 10/14~19는 반납 시각에 따라 6일분 가정 A$660~1,320, 유류·주차 등 별도. 한국 일반여권 관광은 ETA 601, 2인 A$40. 미신청이면 지금 신청하고 승인 여부를 확인하세요.';
  const a=document.createElement('a');a.href='rental-entry.html';a.className='btn';a.textContent='비용표·예약 시점·비자 신청 안내';
  box.append(title,p,a);host.prepend(box);
 }
});
