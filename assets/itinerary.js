(function initTripStudio(){
 'use strict';
 const KEY='australia-recommended-itinerary-photo-2026-v2',DAY=86400000;
 const DATES=Array.from({length:11},(_,i)=>'2026-10-'+String(i+13).padStart(2,'0'));
 const WEEK=['화','수','목','금','토','일','월','화','수','목','금'];
 const ZONES={KR:{label:'한국·일본 +9',offset:9},CNS:{label:'케언스 +10',offset:10},SYD:{label:'시드니 +11',offset:11}};
 const STATES={draft:'계획 중',pending:'예약 확인 필요',confirmed:'예약 완료',done:'다녀옴'};
 const MODES=['미정','도보','보트·페리','항공','택시·차량 호출','대중교통','렌터카','투어 픽업','이동 없음'];
 const $=id=>document.getElementById(id),modal=$('trip-studio');
 const uid=()=>window.crypto&&crypto.randomUUID?crypto.randomUUID():'r-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 function row(start='',end='',zone='CNS',extra={}){return {id:uid(),start,end,startZone:zone,endZone:zone,endDay:0,title:'',place:'',transport:'미정',state:'draft',notes:'',...extra};}
 function initial(){
  const days={};for(const date of DATES)days[date]={zone:Number(date.slice(-2))<14?'KR':Number(date.slice(-2))<20?'CNS':'SYD',rows:[]};
  const planned=[{"day":13,"start":"11:40","end":"14:40","title":"인천공항 도착 · 출국 수속","place":"인천공항 T1","transport":"이동 없음","notes":"장비 가방과 일반 위탁수하물 접수. 공항 도착 목표 시각."},{"day":13,"start":"14:40","end":"16:30","title":"인천 → 간사이 · 피치 MM706","place":"ICN T1 → KIX T2","transport":"항공","notes":"기존 전자항공권 기준. 한국·일본 현지 시각.","state":"confirmed"},{"day":13,"start":"16:30","end":"20:45","title":"일본 입국 · 짐 수취 · 터미널 이동 · 저녁","place":"간사이 T2 → T1","transport":"대중교통","notes":"분리 발권 환승. 입국·세관·장비 재접수 및 젯스타 수속 마감 확인."},{"day":13,"start":"20:45","end":"21:45","title":"보안검색 · 케언스행 탑승 준비","place":"간사이공항 T1","transport":"도보","notes":"탑승권에 표시된 게이트·마감 시각 우선."},{"day":13,"start":"21:45","end":"05:55","title":"간사이 → 케언스 · 젯스타 JQ016","place":"KIX T1 → CNS T1","transport":"항공","notes":"10/14 케언스 도착. 출발과 도착 도시의 현지 시각.","endDay":1,"endZone":"CNS","state":"confirmed"},{"day":14,"start":"05:55","end":"07:30","title":"입국 · 짐 찾기 · 세관","place":"케언스공항 T1","transport":"도보","notes":"수속 소요시간은 상황에 따라 변동."},{"day":14,"start":"07:30","end":"08:00","title":"공항 → 케언스 숙소","place":"케언스공항 → 에스플러네이드 인근 숙소","transport":"택시·차량 호출","notes":"장비 가방이 들어가는 차량 선택."},{"day":14,"start":"08:00","end":"12:00","title":"오전 객실 입실 · 수면","place":"케언스 숙소","transport":"이동 없음","notes":"08:00 입실 확약 필요. 10/14~19 5박+유료 조기 입실 또는 10/13~19 6박 비교. 전날부터 예약 시 실제 10/14 아침 도착·노쇼 방지 객실 보유 서면 확약. 24시간 리셉션만으로 조기 입실 보장 아님. 후보 Mantra Esplanade / Trilogy 1 Bedroom Apartment.","state":"pending"},{"day":14,"start":"12:00","end":"13:00","title":"늦은 점심","place":"케언스 에스플러네이드","transport":"도보","notes":""},{"day":14,"start":"13:00","end":"15:00","title":"첫날 회복 · 자유 시간","place":"케언스 숙소","transport":"이동 없음","notes":"긴 이동이나 해양 투어를 넣지 않는 시간."},{"day":14,"start":"15:00","end":"16:30","title":"[조건부 대여] 슈트·웨이트·벨트 수령","place":"케언스 숙소 ↔ Cairns Scuba Tech · 170 Timberlea Dr, Bentley Park","transport":"택시·차량 호출","state":"pending","notes":"투어에서 필요한 장비를 제공하지 못할 때만 실행. 15:30 매장 예약 목표, 이동·피팅 포함 계획 시간. 슈트 지참 시 제외. 핀·랜야드·스노클링 장비는 직접 지참. 19일 09:00 반납 약속·5회분 요금·현금 보증금 A$100 적용 단위·신분증·재고·프리다이빙 적합성을 확인. 왕복시간은 숙소 위치에 따라 조정. https://www.cairnsscubatech.com/services-2-2"},{"day":14,"start":"16:30","end":"17:00","title":"에스플러네이드 산책","place":"Cairns Esplanade","transport":"도보","notes":"피곤하면 생략."},{"day":14,"start":"18:00","end":"19:00","title":"숙소 가까이에서 저녁","place":"케언스 시내","transport":"도보","notes":""},{"day":15,"start":"07:00","end":"08:00","title":"프리다이빙 투어 집결 · 브리핑","place":"케언스 · 운영사 지정 집결지","transport":"투어 픽업","notes":"집결지·송영 여부와 정확한 시간은 예약 시 확인.","state":"pending"},{"day":15,"start":"08:00","end":"17:00","title":"[사진 1] 그레이트배리어리프 · 강사 동행 프리다이빙","place":"Great Barrier Reef · Scubabo 후보","transport":"보트·페리","notes":"AIDA 2 인정, 지정일 출항, 가이드·버디, 장비 포함 범위 확인. 전일 투어용 시간 확보.\n\n[장비 대여·반납 2026-09-14] 개인 핀·랜야드·마스크·스노클 지참. 집결 브리핑에서 슈트·웨이트·퀵릴리스 벨트 수령·피팅(제공·요금 미확정). 운영사 대여품은 귀항 후 17:00~17:30 반납 확인. 매장 별도 대여품은 10/19 09:00 같은 매장 반납. Scubabo는 강사 동행 상품; 무가이드로 확정하지 않음.","state":"pending"},{"day":15,"start":"17:00","end":"17:30","title":"운영사 대여 장비 반납 확인","place":"프리다이빙 투어 운영사 지정 반납지","transport":"이동 없음","state":"pending","notes":"투어 운영사 대여품만 해당. 실제 귀항·반납 지시 우선. 개인 핀·랜야드·마스크·스노클 회수. 별도 매장 대여품은 보관 후 19일 같은 매장 반납."},{"day":15,"start":"17:30","end":"18:30","title":"샤워 · 휴식","place":"케언스 숙소","transport":"이동 없음","notes":""},{"day":15,"start":"18:30","end":"19:30","title":"가까운 식당에서 저녁","place":"케언스 시내","transport":"도보","notes":""},{"day":16,"start":"08:45","end":"17:30","title":"[사진 3] 무어 리프 외해 산호초 · 전일 투어","place":"Cairns Reef Fleet Terminal → Moore Reef","transport":"보트·페리","notes":"Sunlover 후보. 공식 일반 일정: 08:45부터 체크인, 10:15 출항, 17:30 복귀. 10/16 운영·좌석·최종 시각은 미확인. 수중 관찰·스노클링 중심; 프리다이빙 임의 허용 아님.\n\n[장비 대여·반납 2026-09-14] Sunlover 라이크라 포함, 웨트슈트 선택 대여 A$10/인. 개인 핀·마스크·스노클 사용 여부 확인. 승선 후 수령·마지막 입수 후 승무원 지시에 따라 반납; 17:30~17:45 하선 시 반납·개인 장비 회수 확인. 웨이트·무가이드 프리다이빙은 승인 미확인으로 수면 스노클링 기본.","state":"pending"},{"day":16,"start":"17:30","end":"17:45","title":"Sunlover 반납·개인 장비 회수 확인","place":"Sunlover 선내·하선 지점","transport":"이동 없음","state":"pending","notes":"대여 보호복은 마지막 입수 후 승무원 지시에 따라 반납하고 하선 때 최종 확인. 운영사 실제 반납 시각 우선. https://sunlover.com.au/faqs/"},{"day":16,"start":"17:45","end":"19:30","title":"샤워 · 숙소 가까이에서 저녁","place":"케언스 숙소·시내","transport":"도보","notes":"바다 투어 3일 연속이 부담이면 상단에서 보트 2일 여유안 선택."},{"day":17,"start":"08:00","end":"17:00","title":"[사진 17] 미카엘마스 케이 · 보트 관광","place":"Cairns Reef Fleet Terminal → Michaelmas Cay","transport":"보트·페리","notes":"Ocean Spirit 후보. 집결 포함 전일 계획 블록이며 08시는 확정 집결 시각 아님. 복귀는 공식 안내상 약 17시. 정확한 집결·출항·참가 활동은 예약서 확인. 스쿠버 체험·교육 및 헬멧 다이빙은 제외합니다.\n\n[장비 대여·반납 2026-09-14] Ocean Spirit 보호복 포함·대여료 확인 필요. 대여했다면 마지막 입수 후 반납, 17:00~17:15 하선 시 최종 확인. Cairns Scuba Tech는 토 13:30 폐점이므로 귀항 후 매장 반납 불가. 별도 대여품은 19일 예약 반납. 무가이드 프리다이빙 승인 미확인.","state":"pending"},{"day":17,"start":"17:00","end":"17:15","title":"Ocean Spirit 반납·개인 장비 회수 확인","place":"Ocean Spirit 선내·하선 지점","transport":"이동 없음","state":"pending","notes":"대여품이 있을 때만 반납. 포함 품목·요금·정확한 반납 방식은 예약 시 확인. 귀항 지연 시 이후 저녁을 늦춤. 매장 별도 대여품은 19일 반납."},{"day":17,"start":"17:15","end":"19:00","title":"휴식 · 저녁","place":"케언스 숙소·시내","transport":"도보","notes":"다음 날은 잠수와 고지대 이동을 넣지 않은 휴식일."},{"day":18,"start":"09:00","end":"11:00","title":"늦잠 · 잠수 없는 휴식일","place":"케언스 숙소","transport":"이동 없음","notes":"피츠로이섬 대신 여유일 확보. 취소된 바다 활동을 이 날로 자동 이동하지 않기."},{"day":18,"start":"11:00","end":"13:00","title":"브런치 · 시내에서 느긋하게","place":"Cairns Esplanade","transport":"도보","notes":""},{"day":18,"start":"14:00","end":"17:00","title":"장비 세척 · 건조 · 포장 · 휴식","place":"케언스 숙소","transport":"이동 없음","notes":"10/19 국내선 전 여유. 스쿠버 제외. 프리다이빙 후 비행은 실제 잠수 이력과 강사·다이빙 의료진의 지침을 확인. 휴식일만으로 비행 안전을 보장하지 않음.\n\n[장비 대여·반납 2026-09-14] 개인 장비와 매장 대여품 분리·담수 세척·건조. Cairns Scuba Tech 일요일 휴무로 반납 없음. 별도 대여 시 19일 09:00 반납 약속·보증금 정산 준비."},{"day":18,"state":"draft","start":"17:00","end":"17:45","title":"[BBQ] 고기·채소·얼음 장보기","place":"Woolworths Cairns · 103 Abbott St","transport":"도보","notes":"2인 야외 고기 파티 준비. 당일 영업·재고 확인. 고기는 마지막 구매 후 보냉백에 넣기. 집게·뒤집개·접시·양념·키친타월은 직접 준비. 장보기·소모품 계획 A$50~90, 신규 조리도구·보냉백 별도. 기존 식비에 포함해 중복 합산하지 않기. 비·강풍이면 고기 구매 전 식당 대안 결정. https://www.woolworths.com.au/shop/storelocator/qld-cairns-2537"},{"day":18,"state":"draft","start":"17:45","end":"18:00","title":"[BBQ] 라군으로 이동 · 자리 확인","place":"Woolworths → Jabiru BBQ · Cairns Esplanade Lagoon","transport":"도보","notes":"Jabiru는 라군 동쪽. 작동·현장 표지 확인, 만석이면 서쪽 Lorikeet 확인. 무료 일반 이용이며 자리 확보·대관 예약 아님. 이동은 계획 시간. https://www.cairns.qld.gov.au/experience-cairns/Cairns-Esplanade/Esplanade-bbqs"},{"day":18,"state":"draft","start":"18:00","end":"19:30","title":"[BBQ] 에스플러네이드 야외 고기 파티","place":"Jabiru BBQ · 대안 Lorikeet BBQ","transport":"이동 없음","notes":"공용 전기 철판 직접 조리. 무료 일반 이용, 매일 06:00~21:00 공식 안내. 개인 화로·숯은 준비하지 않음. 공원 음주 금지·라군 수영장 안 음식/음료 금지. 원재료 냉장·생고기/익힌 음식 도구 분리. 비·강풍·만석 시 Waterbar & Grill(1 Pier Point Rd, 매일 17:30부터, 미예약) 대안. Rib Eye 280g A$62 + Rib Platter A$94 = 음식 A$156 공개 메뉴 예; 음료 등 별도. https://www.cairns.qld.gov.au/experience-cairns/Cairns-Esplanade/Esplanade-bbqs / https://www.waterbarandgrill.com.au/"},{"day":18,"state":"draft","start":"19:30","end":"20:00","title":"[BBQ] 철판·테이블 정리 · 숙소 복귀","place":"Cairns Esplanade → 케언스 숙소","transport":"도보","notes":"현장 안내에 따라 철판·테이블 청소, 쓰레기 처리, 개인 조리도구 회수. 숙소 위치에 따라 복귀시간 조정. 10/19 09:00 조건부 장비 반납·10:45 공항 이동·13:30 JQ959 유지."},{"day":19,"start":"07:45","end":"08:15","title":"[숙소] 체크아웃 · 짐 보관 (매장 반납 선택 시)","place":"케언스 숙소 · 사전 확약한 짐 보관 장소","transport":"이동 없음","state":"pending","notes":"Mantra Esplanade·Trilogy 후보는 10:00 체크아웃. 매장 반납이 있으면 08:30 출발 전에 체크아웃·짐 보관. 에어비앤비 짐 보관은 확약 필요. 보관 불가 시 장비 적재 차량으로 매장 반납 후 공항까지 이동할 견적·시간을 확인하고, 둘 다 안 되면 매장 대여 생략. 매장 대여를 안 하면 이 블록은 생략하고 10시까지 체크아웃. 10:15~10:45 짐 수령·10:45 공항 출발. https://www.mantrahotels.com/mantra-esplanade/"},{"day":19,"start":"08:30","end":"10:15","title":"[조건부 대여] 매장 반납 · 보증금 정산","place":"케언스 숙소 ↔ Cairns Scuba Tech · Bentley Park","transport":"택시·차량 호출","state":"pending","notes":"14일 별도 매장 대여를 했을 때만 실행. 09:00~09:30 예약 반납 목표·10:15 숙소 복귀 계획. 담수 세척한 장비·대여 영수증 지참. 일요일 휴무. 월요일 반납 예약·왕복시간 확인이 안 되면 이 대여안을 선택하지 않기. 10:45 공항 이동·13:30 JQ959 유지. https://www.cairnsscubatech.com/services-2-2"},{"day":19,"start":"10:45","end":"11:30","title":"보관 짐 수령 완료 · 케언스 공항 이동","place":"케언스 숙소 → CNS 국내선 터미널","transport":"택시·차량 호출","notes":"계획 시간: 장비 가방을 실을 차량으로 이동, 11:30 공항 도착 목표. 호텔 위치·교통·항공사 안내에 따라 앞당기세요. 체크아웃은 매장 반납 전에 완료. 10:15~10:45 숙소에서 짐 수령·화장실·차량 탑승 준비, 10:45 출발. 매장 방문이 없으면 10시까지 체크아웃 후 짐 보관."},{"day":19,"start":"11:30","end":"13:30","title":"국내선 수속 · 장비 가방 접수 · 탑승 준비","place":"케언스공항 국내선 터미널","transport":"이동 없음","notes":"출발 2시간 전 도착 목표이며 수속 마감시간 자체가 아닙니다. 인당 위탁 30kg·기내 12kg 사용자 제공. 롱핀 대형 취급료 구매 여부·접수 위치와 항공사의 실제 수속·탑승 마감 확인."},{"day":19,"start":"13:30","end":"17:25","title":"케언스 → 시드니 · 젯스타 JQ959","place":"CNS → SYD","transport":"항공","notes":"2026-09-14 사용자 제공 예약 이미지 기준: 젯스타 JQ959, 2026-10-19 CNS 13:30 → SYD 17:25, 실제 비행 2시간 55분. 출도착은 각각 현지 시각. 인당 위탁 30kg·기내 12kg은 사용자 제공 구매 정보이며 사진에는 수하물 항목이 보이지 않습니다. 기내 한도·개별 가방 제한은 예약 상세 확인. 결제금액·대형 장비 취급료 구매 여부는 미제공.","state":"confirmed","endZone":"SYD","startZone":"CNS"},{"day":19,"start":"17:25","end":"19:00","title":"짐 수취 · 시드니 숙소 체크인","place":"시드니공항 → Wynyard / Circular Quay","transport":"택시·차량 호출","notes":"계획 시간. 시드니 현지 시각. 수하물 수취·시내 교통 지연 시 저녁을 늦추고 항구 산책은 생략. 숙소 우선 비교: 윈야드 인근 Airbnb 1베드룸(25174383). 전체 숙소 300만원 상한, 도로 소음·19시 키 수령 확인 필요. 10/19~23 4박, 미예약. 장비 적재 차량으로 문 앞 이동·19시 입실 목표.","startZone":"SYD"},{"day":19,"start":"19:30","end":"20:30","title":"숙소 근처 저녁 · 항구 야경은 선택","place":"Circular Quay → Sydney Opera House","transport":"도보","notes":"시간 고정 예약 없이 숙소 근처 식사. Circular Quay 근처 숙소이고 여유가 있을 때만 오페라하우스 외관 야경을 짧게 보기. 피곤하면 10/21 식물원 방문 앞뒤로 옮기기.","startZone":"SYD"},{"day":20,"start":"09:00","end":"10:00","title":"서큘러키 → 맨리 · 페리 이동","place":"Circular Quay → Manly Wharf","transport":"보트·페리","notes":"승선 대기·도보 포함 계획 시간. 실제 페리 시간표는 당일 확인."},{"day":20,"start":"10:00","end":"13:30","title":"[사진 7] 맨리 & 셸리 비치 · 산책과 점심","place":"Manly Beach → Shelly Beach","transport":"도보","notes":"해변 산책 중심. 현지 해변 프리다이빙은 자격만으로 임의 확정하지 않기. 컨디션에 따라 셸리 방향 일부만 걷기.\n\n[장비 대여·반납 2026-09-14] 기본은 산책. 조건부 버디 입수 선택 시 이 블록을 10:00~10:30 Dive Centre Manly 수령, 10:30~11:00 셸리 이동·현장 판단, 11:00~12:00 입수, 12:00~12:30 정리, 12:30~13:00 매장 이동·반납, 13:00~13:30 간단한 점심으로 대체. 슈트 A$30+웨이트 A$15/인, 2인 A$90; 벨트 포함 미확인. 구조 가능한 버디·기상·현장 통제 확인 실패 시 입수·대여 생략. 혼자 잠수하거나 두 사람이 동시에 잠수하지 않음."},{"day":20,"start":"13:30","end":"14:30","title":"맨리 → 서큘러키 복귀","place":"Manly Wharf → Circular Quay","transport":"보트·페리","notes":"승선 대기 포함 계획 블록."},{"day":20,"start":"14:30","end":"15:30","title":"시내 복귀 · 카페에서 쉬기","place":"시드니 시내","transport":"대중교통","notes":""},{"day":20,"start":"15:30","end":"16:30","title":"[사진 12] QVB & 조지 스트리트","place":"Queen Victoria Building → George Street Sydney","transport":"도보","notes":"건축과 상점 한두 곳 위주. 쇼핑이 길어지면 저녁 산책을 줄이기."},{"day":20,"start":"16:30","end":"17:00","title":"QVB → 달링하버","place":"Queen Victoria Building → Darling Harbour","transport":"도보","notes":""},{"day":20,"start":"17:00","end":"19:00","title":"[사진 10] 달링하버 저녁 산책","place":"Darling Harbour Sydney","transport":"도보","notes":"식사 포함. 특별 행사·불꽃놀이를 확정 일정으로 가정하지 않음."},{"day":21,"start":"09:30","end":"11:00","title":"[사진 8] 왕립식물원 & 항구 전망","place":"Royal Botanic Garden Sydney","transport":"도보","notes":"사진 포인트와 미술관 방향 동선 위주. 정원 전체 일주 대신 짧은 산책."},{"day":21,"start":"11:00","end":"11:15","title":"식물원 → NSW 주립미술관","place":"Royal Botanic Garden → Art Gallery of NSW","transport":"도보","notes":"출발 지점에 따라 소요시간 변동."},{"day":21,"start":"11:15","end":"12:45","title":"[사진 18] NSW 주립미술관","place":"Art Gallery of New South Wales","transport":"도보","notes":"관심 전시 한두 곳만. 유료 특별전과 예약은 별도. 방문 전 운영 공지 확인."},{"day":21,"start":"12:45","end":"13:45","title":"점심 · 카페","place":"The Domain / Sydney CBD","transport":"도보","notes":""},{"day":21,"start":"13:45","end":"15:30","title":"숙소 복귀 · 휴식","place":"시드니 숙소","transport":"대중교통","notes":"오후 뉴타운을 가기 전 쉬는 시간. 피곤하면 이후 뉴타운은 생략 가능."},{"day":21,"start":"15:30","end":"16:00","title":"시내 → 뉴타운","place":"Sydney CBD → Newtown","transport":"대중교통","notes":"정확한 출발 역·배차에 맞춰 조정."},{"day":21,"start":"16:00","end":"18:00","title":"[사진 14] 뉴타운 · 상점·거리·이른 저녁","place":"King Street Newtown Sydney","transport":"도보","notes":"상점별 폐점 시각 별도 확인. 휴식이 우선이면 생략하는 선택 일정."},{"day":21,"start":"18:00","end":"18:45","title":"뉴타운 → 숙소","place":"Newtown → 시드니 숙소","transport":"대중교통","notes":""},{"day":22,"start":"09:30","end":"11:00","title":"[사진 6] 서리힐스 카페 거리 · 브런치","place":"Crown Street Surry Hills Sydney","transport":"대중교통","notes":"숙소 출발 이동·브런치 포함. 카페 한 곳 중심."},{"day":22,"start":"11:00","end":"11:30","title":"서리힐스 → 패딩턴","place":"Surry Hills → Paddington Sydney","transport":"택시·차량 호출","notes":"걷는 양을 줄이는 차량 이동 예산 별도."},{"day":22,"start":"11:30","end":"12:30","title":"[사진 20] 패딩턴 골목 & 부티크","place":"Oxford Street Paddington Sydney","transport":"도보","notes":"목요일 방문. 주말 마켓을 일정에 넣지 않음. 컨디션에 따라 생략 가능."},{"day":22,"start":"12:30","end":"13:15","title":"패딩턴 → 본다이","place":"Paddington → Bondi Beach","transport":"택시·차량 호출","notes":"주차 부담 없이 편도 차량 이용. 교통에 따라 변동."},{"day":22,"start":"13:15","end":"15:15","title":"[사진 11] 본다이 비치 · 점심·해변","place":"Bondi Beach Sydney","transport":"도보","notes":"해변·카페 중심. Bondi–Coogee 전체 해안 트레킹은 제외."},{"day":22,"start":"15:15","end":"16:15","title":"본다이 → 시내 숙소","place":"Bondi Beach → 시드니 숙소","transport":"대중교통","notes":"버스·전철 환승과 대기 포함 예산 시간."},{"day":22,"start":"16:15","end":"18:00","title":"휴식 · 짐 정리","place":"시드니 숙소","transport":"이동 없음","notes":""},{"day":22,"start":"18:00","end":"19:30","title":"숙소 가까이에서 마지막 저녁","place":"시드니 숙소 인근","transport":"도보","notes":"바랑가루까지 추가 이동하지 않아도 됨."},{"day":22,"start":"19:30","end":"21:00","title":"장비 포장 · 귀국 준비","place":"시드니 숙소","transport":"이동 없음","notes":"별도 장비 가방과 일반 캐리어의 무게·개수·치수 확인."},{"day":23,"start":"08:45","end":"09:40","title":"체크아웃 · 국제선 공항 이동","place":"시드니 숙소 → SYD T1","transport":"택시·차량 호출","notes":"09:40 도착 목표. 실제 호텔 위치와 교통에 맞춰 더 일찍 출발. 출발 전에 체크아웃 완료. 10/19~23 4박 숙소 기준. 장비 적재 차량 사전 배차·T1 목적지 확인."},{"day":23,"start":"09:40","end":"12:40","title":"위탁수하물 · 출국 수속 · 탑승","place":"시드니공항 T1","transport":"이동 없음","notes":"국제선 출발 3시간 전 도착을 목표로 잡은 준비 시간."},{"day":23,"start":"12:40","end":"21:30","title":"시드니 → 인천 · 티웨이 TW502","place":"SYD T1 → ICN T1","transport":"항공","notes":"기존 전자항공권 기준. 시드니와 인천 현지 시각.","state":"confirmed","endZone":"KR"}];
  for(const item of planned){const {day,...fields}=item;const date='2026-10-'+day;const zone=fields.startZone||days[date].zone;fields.notes=(fields.notes||'')+window.tripFreediveGuide(date,fields);days[date].rows.push(row(fields.start,fields.end,zone,fields));}
  return {version:1,days};
 }
 function validate(raw){
  if(!raw||raw.version!==1||!raw.days||typeof raw.days!=='object'||Array.isArray(raw.days)||Object.keys(raw.days).length!==11||Object.keys(raw.days).some(date=>!DATES.includes(date)))throw new Error('10월 13~23일 일정 JSON 형식이 아닙니다.');
  const clean={version:1,days:{}};const time=v=>typeof v==='string'&&(v===''||/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(v));
  for(const date of DATES){const day=raw.days[date];if(!day||!Object.hasOwn(ZONES,day.zone)||!Array.isArray(day.rows)||day.rows.length>100)throw new Error('날짜·시간대 또는 일정 개수 오류');
   clean.days[date]={zone:day.zone,rows:day.rows.map(item=>{if(!item||!time(item.start)||!time(item.end)||!Object.hasOwn(ZONES,item.startZone)||!Object.hasOwn(ZONES,item.endZone)||![0,1,2].includes(item.endDay)||!Object.hasOwn(STATES,item.state)||!MODES.includes(item.transport))throw new Error('일정의 시간·상태 형식 오류');for(const [field,max]of [['title',250],['place',350],['notes',3000]])if(typeof item[field]!=='string'||item[field].length>max)throw new Error('제목·장소·메모 길이 또는 형식 오류');return row(item.start,item.end,item.startZone,{endZone:item.endZone,endDay:item.endDay,title:item.title,place:item.place,transport:item.transport,state:item.state,notes:item.notes});})};
  }return clean;
 }
 function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
 function status(text,error=false){$('studio-status').textContent=text;$('studio-status').classList.toggle('is-error',error);}
 let data=initial(),filter=DATES[1],view='grid',selectedId='',blocked=false,external=null,dirty=false,history=[],future=[],editToken='',dragId='',pointerDrag=null,opener=null;
 try{const raw=localStorage.getItem(KEY);if(raw){data=validate(JSON.parse(raw));status('已저장된 개인 일정을 불러왔습니다.'.replace('已',''));}else status('사진의 13곳을 반영한 새 일정입니다. 이전 편집본은 별도 보관하며 미예약 시간은 조정하세요.');}
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
  editToken='';$('studio-grid-view').hidden=view!=='grid';$('studio-gantt-view').hidden=view!=='gantt';
  modal.querySelectorAll('[data-studio-view]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.studioView===view));if(button.dataset.studioView==='grid')button.textContent=mobileScreen.matches?'카드 편집':'표 편집';});
  $('studio-help').textContent=view==='grid'?'셀을 눌러 편집 · Tab으로 다음 셀 · 행 손잡이를 다른 날짜에 드래그':'막대를 다른 날짜·시간으로 드래그 · 15분 단위 · 소요시간 유지 · 더블클릭으로 표 편집';
  $('studio-chart-zone').disabled=view!=='gantt';if(view==='grid')grid();else chart();summary();
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
 $('studio-reset').addEventListener('click',()=>{if(!confirm('이 편집 내용을 사진의 13곳을 모두 넣은 기본안으로 되돌릴까요? 필요하면 먼저 JSON을 백업하세요. 기존 개인 일정·메모·예산은 유지됩니다.'))return;data=initial();history=[];future=[];selectedId='';blocked=false;external=null;$('studio-conflict').hidden=true;save();render();});
 window.addEventListener('storage',event=>{if(event.key!==KEY&&event.key!==null)return;blocked=true;external=event.newValue;$('studio-conflict').hidden=false;status('다른 탭 변경 감지. 이 탭 자동 저장을 중지했습니다.',true);});
 $('studio-external').addEventListener('click',()=>{if(!confirm('현재 편집을 버리고 다른 탭 내용으로 전환할까요? 필요하면 먼저 JSON을 백업하세요.'))return;try{const incoming=external?validate(JSON.parse(external)):initial();data=incoming;history=[];future=[];selectedId='';blocked=false;dirty=false;$('studio-conflict').hidden=true;status('다른 탭 내용을 적용했습니다.');render();}catch(e){status('다른 탭 데이터 형식 오류. 현재 내용을 유지합니다.',true);}});

 document.querySelectorAll('[data-photo-date]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.photoDate;$('studio-add-date').value=filter;render();}));
 document.querySelectorAll('[data-photo-preset]').forEach(button=>button.addEventListener('click',()=>{
  if(blocked){status('저장 충돌 또는 오류를 먼저 처리한 뒤 변경하세요.',true);return;}
  const dates=['2026-10-16','2026-10-17'];
  if(dates.some(date=>data.days[date].rows.some(item=>locked(item)))){status('변경 날짜에 예약 완료로 보호된 일정이 있습니다. 내용을 먼저 확인하세요.',true);return;}
  if(!confirm('10/16~17의 편집 내용을 선택한 투어 구성으로 바꿀까요? 다른 날짜는 유지하고, 실행 취소로 복구할 수 있습니다.'))return;
  const seed=initial(),mode=button.dataset.photoPreset;
  push();for(const date of dates)data.days[date]=seed.days[date];
  const restDate=mode==='moore'?'2026-10-17':mode==='michaelmas'?'2026-10-16':'';
  if(restDate)data.days[restDate]={zone:'CNS',rows:[row('10:00','12:00','CNS',{title:'브런치 · 쉬어 가는 하루',place:'케언스 시내',transport:'도보',notes:'보트 2일 여유안을 선택해 전일 투어를 휴식으로 교체.'}),row('13:00','17:00','CNS',{title:'호텔 휴식 · 자유 시간',place:'케언스 숙소',transport:'이동 없음',notes:'잠수 또는 장거리 이동을 자동 추가하지 않습니다.'})]};
  selectedId='';filter='all';save();render();
  $('photo-plan-status').textContent=mode==='all'?'13곳 기본안: 15일 프리다이빙 · 16일 무어 리프 · 17일 미카엘마스 · 18일 휴식.':'12곳 여유안: 15일 프리다이빙 + '+(mode==='moore'?'16일 무어 리프; 17일 휴식.':'17일 미카엘마스; 16일 휴식.')+' 생략한 산호초는 대안으로 남깁니다.';
 }));
 $('photo-old-backup').addEventListener('click',()=>{
  try{const raw=localStorage.getItem('australia-recommended-itinerary-2026-v1');if(!raw){status('이 브라우저에 저장된 이전 추천 편집본이 없습니다. 현재 일정은 유지합니다.');return;}download(raw,'application/json;charset=utf-8','australia-recommended-before-photo.json');status('이전 추천 편집본 백업을 요청했습니다. 현재 사진 반영 일정은 유지했습니다.');}catch(error){status('이전 저장 공간에 접근할 수 없습니다. 현재 일정은 유지합니다.',true);}
 });




 $('apply-stay-plan').addEventListener('click',()=>{
  const report=$('stay-apply-status'),date='2026-10-19';if(blocked){report.textContent='저장 오류 또는 다른 탭 충돌을 먼저 해결하세요.';return;}
  if(Object.values(data.days).some(d=>d.rows.some(r=>r.title.startsWith('[숙소]')))){report.textContent='이미 숙소 체크아웃 일정이 있습니다. 날짜·시간을 편집했을 수 있어 중복 추가하지 않았습니다.';return;}
  const begin=utc(date,'07:45','CNS'),end=utc(date,'08:15','CNS');if(events().some(e=>Number.isFinite(e.start)&&Number.isFinite(e.end)&&e.start<end&&e.end>begin)){report.textContent='10/19 07:45~08:15에 기존 일정이 있어 변경하지 않았습니다. 위 체크아웃 동선을 참고해 직접 조정하세요.';return;}
  if(data.days[date].rows.length>=100){report.textContent='일정 개수 제한으로 추가하지 않았습니다.';return;}
  const addition=initial().days[date].rows.find(r=>r.title.startsWith('[숙소]'));push();data.days[date].rows.push(addition);
  for(const item of data.days[date].rows){if(item.title==='체크아웃 · 케언스 공항 이동'&&item.start==='10:45'&&!['confirmed','done'].includes(item.state)){const note='[숙소 동선] 체크아웃은 오전 매장 방문 전에 완료. 10:15~10:45 보관 짐 수령, 10:45 공항 출발. 매장 대여 미선택 시 10시까지 체크아웃·짐 보관.';if(item.notes.length+note.length+2<=3000){item.title='보관 짐 수령 완료 · 케언스 공항 이동';item.notes+='\n\n'+note;}}}
  selectedId='';filter=date;save();render();report.textContent='조건부 체크아웃·짐 보관을 추가했습니다. 해당 미확정 공항 이동 행의 시간은 유지하고 제목·메모만 보완했습니다. 확정·완료 행과 다른 날짜는 유지했으며 실행 취소할 수 있습니다.';
 });

 $('apply-bbq-plan').addEventListener('click',()=>{
  const report=$('bbq-apply-status');
  if(blocked){report.textContent='저장 오류 또는 다른 탭 충돌을 먼저 해결하세요.';return;}
  const date='2026-10-18',rows=initial().days[date].rows.filter(r=>r.title.startsWith('[BBQ]'));
  if(Object.values(data.days).some(day=>day.rows.some(r=>r.title.startsWith('[BBQ]')))){
   report.textContent='이미 BBQ 일정이 있습니다. 날짜를 옮기거나 일부를 편집했을 수 있어 중복 추가하지 않았습니다.';return;
  }
  const begin=utc(date,'17:00','CNS'),end=utc(date,'20:00','CNS');
  if(events().some(e=>Number.isFinite(e.start)&&Number.isFinite(e.end)&&e.start<end&&e.end>begin)){
   report.textContent='10/18 17:00~20:00에 기존 일정이 있어 추가하지 않았습니다. 위 동선을 참고해 저녁 시간을 직접 조정하세요. 예약·메모는 유지했습니다.';return;
  }
  if(data.days[date].rows.length+rows.length>100){report.textContent='일정 개수 제한으로 추가하지 않았습니다. 불필요한 빈 행을 정리하세요.';return;}
  push();data.days[date].rows.push(...rows);selectedId='';filter=date;save();render();
  report.textContent='10/18 장보기·이동·야외 BBQ·정리 4개 일정을 추가했습니다. 기존 일정은 유지했으며 실행 취소로 복구할 수 있습니다.';
 });

 $('apply-rental-plan').addEventListener('click',()=>{
  if(blocked){status('저장 오류 또는 다른 탭 충돌을 먼저 해결하세요.',true);return;}
  const seed=initial(),additions=[],edits=[],skipped=[];
  const targets={"15": "[사진 1]", "16": "[사진 3]", "17": "[사진 17]", "18": "장비 세척", "20": "[사진 7]"};
  for(const [d,needle] of Object.entries(targets)){
   const date='2026-10-'+d,source=seed.days[date].rows.find(r=>r.title.includes(needle));
   const note=source.notes.split('[장비 대여·반납 2026-09-14]')[1].split('[프리다이빙 안내]')[0].trim();
   for(const item of data.days[date].rows.filter(r=>r.title.includes(needle))){
    if(item.notes.includes('[장비 대여·반납 2026-09-14]'))continue;
    if(item.state==='confirmed'||item.state==='done'){skipped.push(date.slice(5)+' 예약·완료 메모 유지');continue;}
    const updated=item.notes+'\n\n[장비 대여·반납 2026-09-14] '+note;
    if(updated.length>3000){skipped.push(date.slice(5)+' 메모 길이 초과');continue;}
    edits.push({item,notes:updated});
   }
  }
  for(const [date,day] of Object.entries(seed.days))for(const item of day.rows){
   if(!item.title.startsWith('[조건부 대여]'))continue;
   if(Object.values(data.days).some(d=>d.rows.some(r=>r.title===item.title)))continue;
   const begin=utc(date,item.start,item.startZone),end=utc(date,item.end,item.endZone,item.endDay);
   const clash=events().some(e=>Number.isFinite(e.start)&&Number.isFinite(e.end)&&e.start<end&&e.end>begin);
   if(clash||data.days[date].rows.length>=100){skipped.push(date.slice(5)+' 방문 시간 겹침·행 제한');continue;}
   additions.push({date,item});
  }
  if(additions.length||edits.length){
   push();for(const edit of edits)edit.item.notes=edit.notes;
   for(const {date,item} of additions)data.days[date].rows.push(item);
   for(const day of Object.values(data.days))day.rows.sort((a,b)=>a.start.localeCompare(b.start));
   save();render();
  }
  $('rental-apply-status').textContent='조건부 매장 방문 '+additions.length+'개·반납 메모 '+edits.length+'개 추가. 기존 시간·예약 유지. '+(skipped.length?'직접 확인: '+skipped.join(', ')+'. 위 계획표를 참고해 조정하세요.':'이미 반영된 항목은 중복 추가하지 않았습니다.');
 });

 $('apply-booked-domestic').addEventListener('click',()=>{
  if(blocked){status('저장 오류 또는 다른 탭 충돌을 먼저 해결하세요.',true);return;}
  if(!confirm('10/19의 편집 일정을 확정 JQ959와 새 공항·저녁 일정으로 교체할까요? 다른 날짜는 유지합니다. 기존 전체 일정은 JSON으로 먼저 다운로드하며 실행 취소도 가능합니다.'))return;
  download(JSON.stringify(data,null,2),'application/json;charset=utf-8','australia-before-JQ959.json');
  push();data.days['2026-10-19']=initial().days['2026-10-19'];selectedId='';filter='2026-10-19';save();render();
 });

 summary();historyButtons();
})();
