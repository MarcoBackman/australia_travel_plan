
window.initBaggageGuide=function(){
 const root=document.getElementById('bag-result').closest('section');
 const output=document.getElementById('bag-result');
 function update(){
  const ids=['bag-length','bag-width','bag-height','bag-weight','bag-existing'];
  const inputs=ids.map(id=>document.getElementById(id));
  if(inputs.some(input=>!input.value||!input.checkValidity())){output.textContent='치수·장비 무게는 양수, 기존 위탁 무게는 0 이상으로 표시된 범위 안에서 입력하세요.';return;}
  const [length,width,height,weight,existingWeight]=inputs.map(input=>Number(input.value));
  const combinedWeight=existingWeight+weight;
  const dimensions=[length,width,height].sort((a,b)=>a-b);
  const longest=dimensions[2],sum=length+width+height;
  const count=Number(document.getElementById('bag-count').value);
  const domestic=document.getElementById('bag-domestic').value==='jq';
  const airport=document.getElementById('bag-payment').value==='airport';
  const oversized=longest>100;
  const internationalFee=oversized?count*(airport?45:40):0;
  const domesticFee=domestic&&oversized?count*(airport?35:30):0;
  const notes=[];
  notes.push('세 변 합 '+sum.toFixed(1)+'cm / 가장 긴 변 '+longest.toFixed(1)+'cm / 가방 1개 '+weight.toFixed(1)+'kg.');
  if(dimensions[0]>80||dimensions[1]>80||longest>230||weight>32)notes.push('피치: 최대 외형 또는 개당 중량 범위 초과. 현재 포장 그대로 접수를 가정하지 마세요.');
  else notes.push('피치: '+(sum<=203?'일반 크기 범위.':'일반 크기 범위 초과, 대형 옵션 및 수용 여부 문의.')+' '+(weight>20?'20kg 초과 옵션 필요.':'이 가방은 20kg 이하.')+' 기존 일반 가방과 별도로 추가 장비 가방의 개수 요금이 필요합니다.');
  notes.push('장비를 맡길 1인 기준: 기존 '+existingWeight.toFixed(1)+'kg + 장비 '+weight.toFixed(1)+'kg = 총 '+combinedWeight.toFixed(1)+'kg. 다른 동반자의 중량과 자동 합산할 수 있다고 가정하지 않습니다.');
  notes.push('젯스타 국제선: 항공권의 20kg 대비 '+(combinedWeight>20?(combinedWeight-20).toFixed(1)+'kg 초과. 필요한 위탁 중량을 추가 구매해야 하며 가격은 아래 취급료에 미포함.':'중량 범위 이내. 100cm 초과 취급료는 별도.')+' 국내선 JQ959의 구매 한도는 별도입니다.');
  if(domestic)notes.push('10/19 젯스타 JQ959 · 예약 확정: 1인 위탁 30kg · 기내 12kg. 위탁 합계 '+combinedWeight.toFixed(1)+'kg은 구매한 30kg 대비 '+(combinedWeight>30?(combinedWeight-30).toFixed(1)+'kg 초과.':(30-combinedWeight).toFixed(1)+'kg 여유.')+' 기내수하물 무게와 대형 장비 취급료는 이 위탁 중량 계산에 포함하지 않습니다.');
  notes.push('티웨이: '+(sum>203?'일반 크기 범위 초과, 사전 문의.':'장비 분류·포장 확인 필요.')+' '+(combinedWeight>23?'기존 짐과 장비 합계가 23kg 대비 '+(combinedWeight-23).toFixed(1)+'kg 초과. 초과료 별도 확인.':'합산 중량은 항공권의 23kg 이내이나 접수 조건은 별도 확인.'));
  const tooLarge=weight>32||longest>(domestic?230:277);
  let heading;
  if(tooLarge){heading='젯스타: 규격 재확인 필요, 운송 가능 금액으로 계산하지 않습니다.';notes.push('개당 32kg, JQ 국내선 길이 2.3m / 국제선 787 길이 2.77m 상한을 확인하고 재포장 또는 항공사에 문의하세요.');}
  else {heading='젯스타 취급료 부분 합계: A$'+(internationalFee+domesticFee);notes.push('JQ 국제선 A$'+internationalFee+(domestic?' + JQ 국내선 A$'+domesticFee:' / 다른 국내선 항공사의 요금은 미포함')+'. '+(oversized?'100cm 초과 가방 '+count+'개 기준.':'모든 변이 100cm 이하라 대형 취급료만 A$0. 위탁 중량·개수 비용까지 무료라는 뜻은 아닙니다.'));if(longest>230)notes.push('국제선 길이 예외는 Boeing 787 운항일 때만 적용. 실제 기종을 확인하세요.');}
  const title=document.createElement('b');title.textContent=heading;output.replaceChildren(title);
  for(const note of notes){const p=document.createElement('p');p.textContent=note;output.append(p);}
 }
 root.querySelectorAll('.bag-inputs input,.bag-inputs select').forEach(input=>input.addEventListener('input',update));
 update();
};
