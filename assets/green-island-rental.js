(() => {
  'use strict';
  const KEY = 'australia-recommended-portdouglas-2026-v1';
  const BACKUP = 'australia-before-revised-car-rental-0800-1130-20260926';
  const dates = [14, 15, 16, 19];
  const stay = 'Trinity Collective · Trinity Beach';
  const carDepot = 'East Coast Car Rentals · 411 Sheridan Street, Cairns';
  const shop = 'Cairns Scuba Tech · 170 Timberlea Drive, Bentley Park';
  const rentalSource = 'https://www.cairnsscubatech.com/services-2-2';
  const caution = '계획 선택 완료, 실제 예약·결제 아님. AIDA 2만으로 자유 프리다이빙이 허용되는 것은 아님. 운영사의 잠영·롱핀 규정을 서면 확인하고 허용 구역에서 구조 가능한 버디가 번갈아 관찰. 부이·로프 훈련 없음. 허용되지 않으면 수면 스노클링만 진행.';
  const rental = '사전 약속과 2인 사이즈 확보 후에만 방문. 공식 5mm 앞지퍼 웨트슈트 A$15/인/24시간. 14일 10:30 수령~16일 09시대 반납은 48시간 이내로 2인 A$60 계획, 실제 과금은 업체 확인. 현금 보증금 A$100 안내(예약당/인당 적용 확인), 신분증 제시, 담수 세척 후 반납. AIDA 2 프리다이빙·스노클링 용도 및 단품 외부 반출 가능 여부 확인. ' + rentalSource;
  let serial = 0;
  function row(day, start, end, title, place, transport, notes, state = 'draft') {
    return {day, id: 'green-rental-' + (++serial), start, end, title, place, transport, notes, state, startZone: 'CNS', endZone: 'CNS', endDay: 0};
  }
  const plan = [
    row(14, '05:55', '07:30', '케언스 도착 · 입국·짐 찾기', '케언스공항 T1', '도보', 'JQ016 도착 후 입국·세관. 지연 시 대여 약속부터 조정.'),
    row(14, '07:30', '08:00', '셔틀 연락 · 공항 밖 렌터카 영업소 이동', 'CNS T1 셔틀 Bay 6 → East Coast Car Rentals', '투어 픽업', '짐 수취·세관 통과 후 +61 7 5555 8908 또는 1800 474 258로 연락해 08:00 수령 예약을 알리기. 무료 셔틀이며 투어 송영이 아님. 국제선 출구 왼쪽으로 이동해 Bay 6 방향, 실제 바우처·문자 안내 우선. 입국 지연 시 영업소에 연락하고 슈트 수령 시간을 조정. https://www.eastcoastcarrentals.com.au/pick-up-information/cairns-international-arrivals/'),
    row(14, '08:00', '08:30', '[렌터카 확정] 08:00 수령 · 차량 점검', carDepot, '렌터카', '사용자 변경 예약 확인: 2026-10-14 08:00~10-19 11:30, 이용 시간 5일 3시간 30분(과금 일수와 구분). Hyundai i30 또는 동급, 자동, 5인승, 무제한 주행거리 표기. 08:00은 예약 수령 시각이며 이후 30분은 수속·점검용 계획 여유. 외부 영업소에서 수령. 면허·국제운전면허·결제카드 조건, 보증금·연료 규정, 롱핀 적재 확인. 예약 화면 원화 항목 합계 412,668원: 차량 284,621원 - 할인 28,462원 + Protection 156,509원. 달러 총액은 약 US$305.38이며 실제 청구·결제 상태는 영수증 확인. Protection의 보장 범위·면책금은 미확인. 예약번호·이메일 미공개.', 'confirmed'),
    row(14, '08:30', '09:45', '아침 식사 · 시차 적응 휴식', '케언스 시내', '렌터카', '영업소에서 식당 이동 포함. 수령이 빨라진 만큼 아침 휴식 시간을 확보. 피로하면 슈트 수령은 사전 확약된 섬 내 대여로 대체.'),
    row(14, '09:45', '10:30', '대여 업체로 이동 · 예약 시간 여유', '케언스 시내 → Bentley Park', '렌터카', 'Cairns Scuba Tech는 시내 남쪽. Trinity Beach와 반대 방향이므로 입실 전 한 번에 들르기. 실제 도로 상황 확인.'),
    row(14, '10:30', '11:00', '[슈트 수령] 피팅 · 2벌 대여', shop, '이동 없음', rental, 'pending'),
    row(14, '11:00', '11:30', '식료품점으로 이동', 'Bentley Park → 케언스 시내', '렌터카', '계획 시간. 식료품점은 실제 동선에 맞춰 선택.'),
    row(14, '11:30', '12:00', '식료품 · 생수 · 간식 장보기', '케언스 시내 식료품점', '도보', '숙소 입실 전이므로 냉장 식품은 보냉 가방 사용 또는 입실 후 구입.'),
    row(14, '12:00', '12:45', 'Trinity Beach로 이동', '케언스 → Trinity Beach', '렌터카', '교통 여유를 포함한 계획 블록.'),
    row(14, '12:45', '14:00', '점심 · 체크인 전 휴식', 'Trinity Beach 숙소 인근', '이동 없음', '추가 관광 없이 쉬기. 짐 보관 가능 여부는 숙소 확인.'),
    row(14, '14:00', '15:00', 'Trinity Collective 체크인', stay, '이동 없음', '사용자 지정 체크인 오후 2시. 숙박 결제 완료 여부는 별도.', 'pending'),
    row(14, '15:00', '18:00', '회복 수면 · 내일 장비 준비', stay, '이동 없음', '슈트·마스크·스노클·롱핀·타월 준비. 투어 집결지와 잠영 허용 회신 확인. 슈트는 가게에 별도 문의 후 예약하며 자동 예약되지 않음.'),
    row(14, '18:00', '19:30', '숙소 근처 저녁', 'Trinity Beach', '도보', '도착일은 일찍 쉬기.'),
    row(15, '07:30', '08:15', '숙소 → 케언스 선착장', 'Trinity Collective → Cairns Marlin Marina', '렌터카', '이동·주차 여유 포함. 선택한 운영사의 체크인 마감과 부두 번호 우선.'),
    row(15, '08:15', '09:00', '크루즈 체크인 · 개인 장비 확인', 'Cairns Marlin Marina', '도보', 'Big Cat 09시 출항을 기준으로 한 계획. 실제 운영사·10/15 좌석·출항 시각 미확정. 롱핀 수납과 자유 잠영 허용 조건 재확인.', 'pending'),
    row(15, '09:00', '10:15', '그린 아일랜드행 크루즈', 'Cairns → Green Island', '보트·페리', '전일 상품 선택. 항해·하선 시간을 넉넉히 잡은 계획이며 실제 선박 시간표 우선.', 'pending'),
    row(15, '10:15', '10:45', '슈트 착용 · 현장 브리핑', 'Green Island 지정 활동 구역', '도보', '기본은 14일 빌린 개인 대여 슈트 지참. 섬 내 대여로 변경하면 이 시간에 피팅·수령하되 웨트슈트 재고·사이즈·외부 크루즈 고객 대여를 사전 확약. 스팅어 슈트와 보온용 슈트 구분.', 'pending'),
    row(15, '10:45', '12:00', '그린 아일랜드 스노클링', 'Green Island 운영사 지정 구역', '이동 없음', caution, 'pending'),
    row(15, '12:00', '13:00', '점심 · 충분한 휴식', 'Green Island', '도보', '점심 포함 여부는 선택 상품 확인.'),
    row(15, '13:00', '15:00', '해변·산책 · 선택 스노클링', 'Green Island', '도보', caution + ' Snorkel Safari는 선택 사항이며 기본 예산에 포함하지 않음. 추가 선택 시 업체 배정 시간으로 조정.'),
    row(15, '15:00', '15:45', '물놀이 종료 · 장비 정리 · 탑승 준비', 'Green Island', '도보', '섬 내 대여를 선택했다면 이 시간에 반납(업체 마감·귀항편 우선). 시내 대여 슈트는 챙겨 와서 숙소에서 담수 세척. 승선 시간에 맞춰 앞당기기.'),
    row(15, '15:45', '17:00', '케언스 귀항', 'Green Island → Cairns', '보트·페리', '17시 귀항을 기준으로 한 계획. 정확한 섬 출항·복귀 시간은 예약서 우선.', 'pending'),
    row(15, '17:00', '18:00', '숙소 복귀 · 저녁 준비', 'Cairns → Trinity Collective', '렌터카', '늦은 귀항 후 남쪽 매장까지 반납하러 가지 않기. 내일 오전 반납 약속 확인.'),
    row(15, '18:00', '19:30', '저녁 · 슈트 세척·보관', stay, '이동 없음', '업체 지침대로 담수 세척하고 숙소의 건조 규칙 준수. 다음 날 반납할 슈트 2벌 확인.'),
    row(16, '08:00', '09:00', '슈트 반납 업체로 이동', 'Trinity Collective → Bentley Park', '렌터카', '아침 식사 후 출발. 09시 방문 사전 약속 필수. 섬 내 당일 대여를 선택했다면 이 이동과 반납 블록은 삭제하고 늦은 아침으로 대체.'),
    row(16, '09:00', '09:20', '[슈트 반납] 검수 · 보증금 정산', shop, '이동 없음', rental + ' 14일 수령 시각부터 48시간을 넘기지 않도록 약속. 금요일 공개 영업 09~18시, 방문은 예약제.', 'pending'),
    row(16, '09:20', '10:00', '아쿠아리움으로 이동', 'Bentley Park → Cairns Aquarium', '렌터카', '10시 아쿠아리움 일정에 합류. 반납 지연 시 관람 시작을 늦추고 이후 휴식 시간을 조정.'),
    row(19, '08:00', '09:00', '아침 식사 · 마지막 짐 정리', stay, '이동 없음', '반납 예약이 11:30으로 변경되어 이른 새벽 출발은 필요 없음. 실제 숙소 체크아웃 규정 확인.'),
    row(19, '09:00', '09:30', '체크아웃 · 짐 싣기', stay, '이동 없음', '키 반환 방법 확인. 롱핀·슈트·여권·충전기 확인. 슈트 반납은 16일 완료하는 계획 유지.'),
    row(19, '09:30', '10:15', '숙소 → 렌터카 영업소 인근', 'Trinity Collective → Cairns North', '렌터카', '월요일 교통 여유를 고려한 계획 시간. 공항 터미널 주차장으로 가지 말고 바우처상 East Coast 반납지로 이동.'),
    row(19, '10:15', '10:45', '주유 · 영업소 진입 · 짐 확인', '반납 영업소 인근 주유소 → East Coast Car Rentals', '렌터카', '예약의 연료 정책에 맞춰 주유하고 영수증 보관. 선불 연료 여부 미확인. 영업소에 10:45 도착 목표.'),
    row(19, '10:45', '11:00', '[렌터카 확정] 11:30 마감 · 11:00 반납 목표', carDepot, '렌터카', '확정 예약 반납 시각은 2026-10-19 11:30. 13:30 JQ959의 장비 접수와 공항 셔틀 대기를 고려해 11:00까지 인계하는 조기 반납 계획이며 예약 시간 변경이 아님. 실제 조기 반납 절차·셔틀 배차는 수령 시 확인. 11:30에 영업소에 도착하면 터미널 도착은 더 늦어짐. 사진·반납 확인서 보관.', 'confirmed'),
    row(19, '11:00', '11:30', '무료 셔틀 → 국내선 터미널', 'East Coast Car Rentals → CNS 국내선 T2', '투어 픽업', '11:30 터미널 도착 목표이며 보장 시각 아님. 셔틀 대기·교통에 따라 더 일찍 반납. JQ959 국내선 탑승이라고 알리기. 13:30 비행의 실제 수속·장비 접수 마감은 항공사 안내 우선. https://www.eastcoastcarrentals.com.au/car-hire/cairns/')
  ];
  const existing = window.tripInitialRows || [];
  window.tripInitialRows = existing.filter(r => r.day !== 14 && r.day !== 15 && !(r.day === 16 && r.start < '10:00') && !(r.day === 19 && r.start < '11:30')).concat(plan).sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));

  function mount() {
    const panel = document.createElement('section');
    panel.id = 'green-island-rental-plan';
    panel.setAttribute('aria-labelledby', 'green-rental-title');
    panel.innerHTML = `
      <style>
        #green-island-rental-plan{margin:24px auto;padding:24px;max-width:1120px;box-sizing:border-box;background:#f4efe3;color:#193f3b;border:1px solid #c9d5c8;border-radius:18px;font:inherit;line-height:1.7}
        #green-island-rental-plan h2{font-size:clamp(21px,4vw,30px);margin:0 0 8px}#green-island-rental-plan h3{margin:0 0 8px;font-size:18px}
        #green-island-rental-plan .rental-flow{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}#green-island-rental-plan .rental-flow span{flex:1;min-width:160px;padding:12px;background:#fffaf1;border-radius:10px}
        #green-island-rental-plan details{margin:12px 0;padding:14px;background:#fffaf1;border:1px solid #d8d9cb;border-radius:10px}#green-island-rental-plan summary{cursor:pointer;font-weight:700;overflow-wrap:anywhere}
        #green-island-rental-plan a{color:#075c5a;text-decoration:underline}#green-island-rental-plan button{padding:12px 16px;border:1px solid #195b52;border-radius:8px;background:#195b52;color:white;font:inherit;cursor:pointer;min-height:44px;margin:6px 6px 6px 0;white-space:normal}
        #green-island-rental-plan p{overflow-wrap:anywhere}#green-island-rental-plan small{display:block}#green-island-rental-plan .rental-notice{border-left:4px solid #ae6342;padding-left:12px}
        @media(max-width:600px){#green-island-rental-plan{padding:16px;margin:16px 8px}#green-island-rental-plan button{width:100%;margin-right:0}}
      </style>
      <small>10월 14~19일 · 렌터카 예약 확정 · 슈트 2벌 · 조사 2026-09-26</small>
      <h2 id="green-rental-title">그린 아일랜드와 슈트 대여 동선</h2>
      <p>15일 전일 크루즈로 계획 선택 완료. 투어·대여는 아직 미예약이며, 기본은 개인 마스크·스노클·롱핀 지참입니다.</p>
      <div class="rental-flow"><span><b>14일 08:00</b><br>렌터카 확정 수령</span><span><b>14일 10:30</b><br>슈트 피팅·수령 예정</span><span><b>15일 전일</b><br>그린 아일랜드 · 슈트 지참</span><span><b>16일 09:00</b><br>슈트 반납 후 아쿠아리움</span><span><b>19일 11:30 반납 예약</b><br>실제 인계 목표 11:00 · 공항 셔틀</span></div>
      <details open><summary>렌터카 예약 완료 | East Coast · Hyundai i30 또는 동급 · 원화 항목 합계 412,668원</summary>
        <p><b>10/14 08:00 수령 → 10/19 11:30 반납.</b> 이용 시간은 5일 3시간 30분이며 과금 일수와 구분합니다. 자동변속기·5인승·무제한 주행거리 표기, Hyundai i30 또는 동급 차량입니다. 특정 차종 보장은 아닙니다. 예약 화면 수하물 표시는 큰 가방 1개·작은 가방 1개이므로 두 분의 캐리어와 롱핀 적재는 수령 시 확인하세요. 예약번호와 이메일은 공개하지 않았습니다.</p>
        <p><b>차량 284,621원 - Genius 할인 28,462원 + Protection 156,509원 = 412,668원.</b> 예약 화면 원화 항목을 합산한 값이며 달러 총액은 약 US$305.38입니다. 통화별 금액을 중복 합산하지 않습니다. 실제 원화 청구·결제 완료 여부는 영수증으로 확인하며, Protection을 완전면책으로 간주하지 않습니다. 보장 범위·면책금·보증금·연료 조건은 바우처 확인이 필요합니다.</p>
        <p>공항 밖 영업소 <b>411 Sheridan Street</b>까지 무료 셔틀로 이동합니다. 14일 국제선 짐 수취 후 셔틀에 연락해 08:00 수령 예약을 알리고, 공식 안내의 T1 Bay 6에서 탑승하되 실제 바우처·문자가 우선입니다. 셔틀 연락: <a href="tel:+61755558908">+61 7 5555 8908</a>.</p>
        <p>19일은 <b>09:30 숙소 출발 → 주유 → 10:45 영업소 도착 → 11:00 반납 목표 → 셔틀로 11:30 국내선 T2 도착 목표</b>입니다. 예약 반납 시각 11:30은 그대로 두고 공항 이동 여유를 확보하는 계획입니다. 셔틀 배차가 늦으면 더 일찍 반납하세요. 국내선 JQ959 13:30과 1인 위탁 30kg·기내 12kg 예약은 그대로 유지합니다.</p>
        <p><a href="https://www.eastcoastcarrentals.com.au/car-hire/cairns/" target="_blank" rel="noopener">공식 영업소·셔틀 안내</a> · <a href="https://www.eastcoastcarrentals.com.au/pick-up-information/cairns-international-arrivals/" target="_blank" rel="noopener">국제선 픽업 위치</a></p>
      </details>
      <p class="rental-notice">확인된 대여 후보와 문의만 가능한 후보를 구분했습니다. 현장에 가면 무조건 빌릴 수 있다는 뜻은 아닙니다. 보온용 웨트슈트와 얇은 라이크라·스팅어 슈트는 다릅니다.</p>
      <details open><summary>1순위 · Cairns Scuba Tech | 단품 대여·공개 요금 확인</summary>
        <p>5mm 앞지퍼 웨트슈트 A$15/인/24시간. 두 분 48시간은 <b>A$60 계획</b>이며, 최종 과금 단위는 업체 확인. 현금 보증금 A$100은 지출과 별도이고 예약당/인당 적용 여부를 문의하세요. 신분증 제시와 담수 세척 후 반납 조건입니다.</p>
        <p>170 Timberlea Drive, Bentley Park · 평일 09~18시 <b>사전 약속제</b>. 시내 남쪽이라 숙소에서 바로 가기보다 14일 입실 전 수령하고 16일 시내 관람 전 반납합니다. 재고·핏·프리다이빙 용도 승인과 반출 조건은 미확정입니다.</p>
        <p><a href="https://www.cairnsscubatech.com/services-2-2" target="_blank" rel="noopener">공식 대여 요금·조건</a> · <a href="tel:+61499526554">+61 499 526 554</a> · <a href="mailto:cairnsscubatech@gmail.com">이메일 문의</a></p>
      </details>
      <details><summary>이동 최소 대안 · Green Island Dive Shop | 웨트슈트 재고 문의</summary>
        <p>15일 섬 도착 후 수령하고 귀항 전 반납하면 별도 차량 이동이 없습니다. 공식 운영사는 라이크라 슈트 대여를 확인해 주며, 현지 여행사는 웨트슈트 대여도 안내합니다. 다만 보온용 슈트의 사이즈·두께·가격·10/15 재고와 다른 크루즈 고객도 이용 가능한지는 서면 확인이 필요합니다.</p>
        <p>이 방식이 확약되면 14일 매장 방문과 16일 반납 이동을 생략하고, 15일 10:15~10:45 수령·15:00~15:45 반납 블록을 사용하세요. 실제 배 시간과 대여소 마감 우선.</p>
        <p><a href="https://green-island.com.au/tours-green-island/green-island-snorkeling" target="_blank" rel="noopener">공식 장비 안내</a> · <a href="https://cairnsdiveadventures.com.au/tour/great-adventures-green-island-half-day/" target="_blank" rel="noopener">현지 여행사 웨트슈트 안내</a></p>
      </details>
      <details><summary>예비 문의 · Pro Dive Cairns Retail Shop | 단독 대여 미확인</summary>
        <p>Shields Street와 Grafton Street 모퉁이의 시내 매장. 아쿠아리움 방문일과 동선을 묶기 좋지만, 공식 판매 매장·연락처 확인만으로 슈트 단품 대여가 가능하다고 판단하지 않았습니다. 투어 미참가자의 외부 반출 대여가 가능한지 먼저 문의하고, 불가하면 후보에서 제외하세요. 가격·재고·방문 시간 미확정.</p>
        <p><a href="https://www.divestore.com.au/pages/Contact-Us.html" target="_blank" rel="noopener">공식 연락처</a> · <a href="tel:+61740316681">+61 7 4031 6681</a> · <a href="mailto:shop@prodivecairns.com">매장 이메일</a></p>
      </details>
      <details><summary>예산·예약 전 확인사항</summary>
        <p>Big Cat 기본 전일 상품 공개가 A$122 × 2 = A$244를 비교 기준으로 사용. 슈트 48시간 계획 A$60을 합하면 <b>2인 A$304</b>이며 식사·주차·유류비·환급 보증금은 별도입니다. 운영사와 선택 옵션은 아직 미확정이며 Snorkel Safari는 포함하지 않았습니다. <a href="https://page.reefunlimited.com/26/27-retail" target="_blank" rel="noopener">2026/27 공식 투어 요금</a></p>
        <p>지금 대여 가능 여부를 문의하고, 수령·반납 약속은 예약 회신 후 확정하세요. 키·몸무게·평소 슈트 사이즈, 전신/반신·두께, 2벌 재고, 48시간 총액, 보증금 적용 단위, 세척·취소 조건을 함께 확인합니다. 5mm는 대여 상품 정보이며 두 분에게 맞는 두께라는 보장은 아닙니다.</p>
        <p>${caution}</p>
      </details>
      <p>기본 엑셀·간트에는 새 동선을 반영했습니다. 기존 저장 일정이 보이면 아래 버튼으로 14~16일과 19일 오전을 교체하세요. 19일 11:30 이후 국내선·시드니 일정과 다른 날짜, 별도 메모 저장소는 유지하고 교체 전 전체 일정을 백업합니다.</p>
      <button type="button" data-rental-apply>렌터카 확정·슈트 동선을 저장 일정에 적용</button>
      <button type="button" data-rental-restore>이 변경 직전 일정 복원</button>
      <p role="status" aria-live="polite" data-rental-status></p>`;
    const host = document.querySelector('main') || document.body;
    host.prepend(panel);
    const status = panel.querySelector('[data-rental-status]');
    panel.querySelector('[data-rental-apply]').addEventListener('click', () => {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) { status.textContent = '저장 일정이 없어 기본 일정이 적용됩니다. 엑셀·간트 페이지에서 확인하세요.'; return; }
        const data = JSON.parse(raw);
        if (data.version !== 1 || !data.days || dates.some(day => !Array.isArray(data.days['2026-10-' + day]?.rows))) throw new Error('지원하지 않는 저장 형식입니다.');
        const isProtected = (day, r) => {
          if (day === 19 && r.start >= '11:30') return false;
          if (r.state === 'done') return true;
          if (r.state !== 'confirmed') return false;
          return !((day === 14 && ((r.start === '08:30' && r.title === '[렌터카 확정] 08:30 수령 · 차량 점검') || (r.start === '08:00' && r.title === '[렌터카 확정] 08:00 수령 · 차량 점검'))) || (day === 19 && ((r.start === '08:15' && r.title === '[렌터카 확정] 08:30까지 차량 반납') || (r.start === '10:45' && r.title === '[렌터카 확정] 11:30 마감 · 11:00 반납 목표'))));
        };
        if (dates.some(day => data.days['2026-10-' + day].rows.some(r => isProtected(day, r)))) {
          status.textContent = '교체 범위에 별도의 예약 완료·다녀옴 행이 있어 자동 교체하지 않았습니다. 엑셀에서 해당 확정 행을 보존하면서 수령·반납 시간을 직접 조정하세요. 19일 11:30 이후 항공 일정은 교체 대상이 아닙니다.'; return;
        }
        if (!confirm('14~16일과 19일 11:30 이전의 저장된 시간표·행 메모를 새 동선으로 교체합니다. 기존 전체 일정은 백업하며 19일 11:30 이후 항공·시드니 일정, 다른 날짜와 별도 메모는 유지합니다. 편집 중인 간트·엑셀은 먼저 저장하고 닫아주세요. 적용할까요?')) return;
        const next = JSON.parse(raw);
        for (const day of dates) {
          const rows = window.tripInitialRows.filter(r => r.day === day && (day !== 19 || r.start < '11:30')).map((r, i) => ({startZone:'CNS', endZone:'CNS', endDay:0, state:'draft', transport:'미정', notes:'', ...r, id:'green-rental-' + day + '-' + i}));
          if (day === 19) rows.push(...next.days['2026-10-19'].rows.filter(r => r.start >= '11:30'));
          next.days['2026-10-' + day] = {...next.days['2026-10-' + day], zone: 'CNS', rows};
        }
        localStorage.setItem(BACKUP, raw);
        next.updatedAt = new Date().toISOString();
        localStorage.setItem(KEY, JSON.stringify(next));
        location.reload();
      } catch (error) { status.textContent = '적용하지 못했습니다: ' + error.message + ' 현재 일정·메모 내보내기로 먼저 백업하세요.'; }
    });
    panel.querySelector('[data-rental-restore]').addEventListener('click', () => {
      try {
        const raw = localStorage.getItem(BACKUP);
        if (!raw) { status.textContent = '이 브라우저에는 대여 동선 적용 전 백업이 없습니다.'; return; }
        if (!confirm('전체 일정을 이 변경 직전으로 복원합니다. 적용 후 편집한 내용은 사라질 수 있습니다. 계속할까요?')) return;
        const current = localStorage.getItem(KEY);
        if (current) localStorage.setItem(BACKUP + '-before-restore', current);
        localStorage.setItem(KEY, raw); location.reload();
      } catch (error) { status.textContent = '복원하지 못했습니다: ' + error.message; }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true}); else mount();
})();
