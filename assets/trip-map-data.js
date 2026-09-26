(() => {
  'use strict';
  const KEY='australia-recommended-portdouglas-2026-v1',PINS='australia-trip-map-pins-v1';
  const dates=Array.from({length:11},(_,i)=>'2026-10-'+(13+i));
  // Landmark coordinates are representative map points, not entrances or booked accommodation.
  const places=[
    ['icn','인천공항 T1',37.4602,126.4407,'airport','KR'],
    ['kix','간사이공항',34.4347,135.244,'airport','KR'],
    ['cns','케언스공항',-16.8765,145.7553,'airport','CNS'],
    ['syd','시드니공항',-33.9399,151.1753,'airport','SYD'],
    ['armour-museum','Australian Armour & Artillery Museum · Smithfield 권역 근사 위치, 입구 아님',-16.85,145.70,'museum','CNS','area'],
['trinity-stay','Trinity Collective · Trinity Beach 권역 근사 위치, 입구 아님',-16.802,145.690,'stay','CNS','area'],
    ['smithfield-food','Smithfield · 북부 식당 권역, 점포 미정',-16.833,145.692,'food','CNS','area'],
    ['smithfield-shop','Smithfield · 식료품점 권역, 점포 미정',-16.833,145.692,'shop','CNS','area'],
    ['cairns-aquarium','Cairns Aquarium · 시설 권역 대표점',-16.917,145.773,'museum','CNS','area'],
    ['cairns-gardens','Cairns Botanic Gardens · 정원 권역 대표점',-16.900,145.748,'park','CNS','area'],
    ['cairns-pool','Tobruk Memorial Pool · 시설 권역 대표점',-16.902,145.757,'pool','CNS','area'],
    ['cairns-stay','케언스 시내 숙소 권역 · 미예약',-16.920,145.773,'stay','CNS','area'],
    ['cairns-food','케언스 시내 식당·휴식 권역 · 가상 대표점',-16.919,145.775,'food','CNS','area'],
    ['cairns-groceries','케언스 시내 식료품점 권역 · 점포 미정',-16.922,145.771,'shop','CNS','area'],
    ['port-stay','포트더글라스 숙소 권역',-16.487,145.464,'stay','CNS','area'],
    ['macrossan','Macrossan Street · 식당 권역',-16.4837,145.4639,'food','CNS','area'],
    ['fourmile','Four Mile Beach 북쪽',-16.4891,145.4693,'beach','CNS'],
    ['rex','Rex Smeal Park',-16.479,145.463,'park','CNS'],
    ['marina','Crystalbrook Superyacht Marina',-16.4866,145.459,'harbour','CNS'],
    ['abc','ABC · Macrossan St 매장 권역',-16.484,145.4645,'dive','CNS','area'],
    ['market','포트더글라스 장보기 권역',-16.485,145.465,'shop','CNS','area'],
    ['syd-stay','윈야드 숙소 권역',-33.8657,151.2058,'stay','SYD','area'],
    ['quay','Circular Quay',-33.8611,151.2112,'harbour','SYD'],
    ['opera','Sydney Opera House',-33.8568,151.2153,'landmark','SYD'],
    ['manly-wharf','Manly Wharf',-33.8005,151.2848,'harbour','SYD'],
    ['manly-beach','Manly Beach',-33.7972,151.2883,'beach','SYD'],
    ['shelly','Shelly Beach',-33.8007,151.2973,'beach','SYD'],
    ['qvb','Queen Victoria Building',-33.8718,151.2067,'shop','SYD'],
    ['george','George Street · 도심 권역',-33.872,151.207,'landmark','SYD','area'],
    ['darling','Darling Harbour',-33.8723,151.1991,'harbour','SYD'],
    ['garden','Royal Botanic Garden',-33.8642,151.2166,'park','SYD'],
    ['gallery','Art Gallery of NSW',-33.8688,151.2173,'museum','SYD'],
    ['domain','The Domain · 점심 권역',-33.869,151.214,'food','SYD','area'],
    ['newtown','Newtown · King Street',-33.8975,151.179,'food','SYD','area'],
    ['surry','Surry Hills · Crown Street',-33.8844,151.213,'food','SYD','area'],
    ['paddington','Paddington · Oxford Street',-33.885,151.226,'shop','SYD','area'],
    ['bondi','Bondi Beach',-33.8915,151.2767,'beach','SYD'],
    ['rocks','The Rocks',-33.8598,151.2088,'landmark','SYD'],
    ['barangaroo','Barangaroo',-33.8584,151.2015,'park','SYD']
  ].map(([id,name,lat,lng,kind,zone,quality='landmark'])=>({id,name,lat,lng,kind,zone,quality}));
  const byId=Object.fromEntries(places.map(p=>[p.id,p]));
  const norm=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
  const validRows=rows=>Array.isArray(rows)&&rows.length<=100&&rows.every(r=>r&&typeof r.title==='string'&&typeof r.place==='string'&&typeof r.start==='string'&&typeof r.end==='string');
  function startMinute(row){if(!/^\d{2}:\d{2}$/.test(row.start))return Infinity;const [h,m]=row.start.split(':').map(Number);return h*60+m-({KR:9,CNS:10,SYD:11}[row.startZone]||10)*60;}
  function read(){
    let saved=null,old=null,error='';
    try{saved=JSON.parse(localStorage.getItem(KEY)||'null');old=JSON.parse(localStorage.getItem('australia-recommended-itinerary-photo-2026-v2')||'null');}catch(e){error='저장된 일정을 읽지 못해 기본 추천안을 표시합니다.';}
    const days={};let usesSaved=false;
    for(const date of dates){
      const day=Number(date.slice(-2));let rows=window.tripInitialRows.filter(r=>r.day===day);
      if(validRows(saved?.days?.[date]?.rows)){rows=saved.days[date].rows;usesSaved=true;}
      else if(saved)error='일부 저장 일정의 형식을 읽지 못해 해당 날짜는 기본안으로 표시합니다.';
      else if(validRows(old?.days?.[date]?.rows)){
        const previous=old.days[date].rows;
        if(day===13||day>=20)rows=previous;
        else {
          if(day===19)rows=[...rows.filter(r=>r.start<'17:25'),...previous.filter(r=>r.startZone==='SYD'||r.start>='17:25')];
          for(const row of previous.filter(r=>r.state==='confirmed'||r.state==='done'))rows=[...rows.filter(r=>r.title!==row.title),row];
        }
        usesSaved=true;
      }
      const zone=day<14?'KR':day<20?'CNS':'SYD';
      days[date]=rows.map((r,index)=>({...r,date,index,startZone:r.startZone||zone,endZone:r.endZone||r.startZone||zone,state:r.state||'draft',notes:window.tripRefreshConfirmedFlightNotes(date,{...r,notes:r.notes||''}),key:date+'|'+(r.id||index)})).filter(r=>r.title||r.place||r.start);
    }
    for(const rows of Object.values(days))rows.sort((a,b)=>startMinute(a)-startMinute(b)||a.index-b.index);
    return {days,usesSaved,error};
  }
  function readPins(){try{const p=JSON.parse(localStorage.getItem(PINS)||'{}');return p&&typeof p==='object'&&!Array.isArray(p)?p:{};}catch(e){return {};}}
  function segments(row){return (row.place||'장소 미지정').split(/\s*(?:→|->|⇒)\s*/).filter(Boolean);}
  function pinKey(text,zone){return zone+'|'+norm(text);}
  function resolve(text,zone,pins={}){
    const key=pinKey(text,zone),custom=pins[key];
    if(typeof custom==='string'&&byId[custom])return {...byId[custom],manual:true};
    if(custom&&typeof custom.name==='string'&&typeof custom.lat==='number'&&typeof custom.lng==='number'&&Number.isFinite(custom.lat)&&Number.isFinite(custom.lng)&&Math.abs(custom.lat)<=85&&Math.abs(custom.lng)<=180)return {id:key,...custom,quality:'custom',kind:'pin',zone,manual:true};
    const s=norm(text);let id='';
    if(/wynyard|윈야드/.test(s))return byId['syd-stay'];
    if(/trinity collective|트리니티 콜렉티브/.test(s))return byId['armour-museum','Australian Armour & Artillery Museum · Smithfield 권역 근사 위치, 입구 아님',-16.85,145.70,'museum','CNS','area'],
['trinity-stay'];
    if(/smithfield.*식료품/.test(s))return byId['smithfield-shop'];
    if(/smithfield.*식당/.test(s))return byId['smithfield-food'];
    if(/cairns aquarium|케언스 아쿠아리움/.test(s))return byId['cairns-aquarium'];
    if(/cairns botanic|케언스 식물원|tank sixty four/.test(s))return byId['cairns-gardens'];
    if(/tobruk.*cairns|토브룩/.test(s))return byId['cairns-pool'];
    if(/케언스 시내 숙소/.test(s))return byId['cairns-stay'];
    if(/케언스 시내 식료품/.test(s))return byId['cairns-groceries'];
    if(/케언스 시내 (식당|휴식)/.test(s))return byId['cairns-food'];
    if(/outer|외해|리프|reef|선내|지정.*(선착장|반납|하선)|marano|independence/.test(s)&&!/abc.*macrossan/.test(s))return null;
    const rules=[[/\bicn\b|인천.*공항/,'icn'],[/\bkix\b|간사이/,'kix'],[/\bcns\b|케언스.*공항/,'cns'],[/\bsyd\b|시드니.*공항/,'syd'],[/crystalbrook|superyacht/,'marina'],[/abc.*macrossan/,'abc'],[/four mile/,'fourmile'],[/rex smeal/,'rex'],[/슈퍼|장보기/,'market'],[/manly wharf/,'manly-wharf'],[/manly beach/,'manly-beach'],[/shelly/,'shelly'],[/circular quay/,'quay'],[/opera/,'opera'],[/queen victoria|\bqvb\b/,'qvb'],[/george street/,'george'],[/darling/,'darling'],[/botanic/,'garden'],[/art gallery|주립미술관/,'gallery'],[/domain/,'domain'],[/newtown/,'newtown'],[/surry/,'surry'],[/paddington/,'paddington'],[/bondi/,'bondi'],[/the rocks/,'rocks'],[/barangaroo/,'barangaroo']];
    for(const [pattern,target]of rules)if(pattern.test(s)){id=target;break;}
    if(!id&&/숙소|wynyard|윈야드|davidson/.test(s))id=zone==='SYD'?'syd-stay':'port-stay';
    if(!id&&/macrossan|포트더글라스 중심가|^중심가$/.test(s))id='macrossan';
    if(!id&&/^port douglas$/.test(s))id='port-stay';
    if(!id&&/sydney cbd|시드니 시내/.test(s))id='syd-stay';
    return id?byId[id]:null;
  }
  function points(row,pins){const parts=segments(row);return parts.map((text,i)=>({text,zone:i===parts.length-1&&parts.length>1?row.endZone:row.startZone,point:resolve(text,i===parts.length-1&&parts.length>1?row.endZone:row.startZone,pins)}));}
  const mode=row=>row.transport==='항공'?'flight':row.transport==='보트·페리'?'sea':row.transport==='도보'?'walk':/택시|픽업|렌터카/.test(row.transport)?'drive':row.transport==='대중교통'?'transit':'link';
  function distance(a,b){const rad=Math.PI/180,dlat=(b.lat-a.lat)*rad,dlng=(b.lng-a.lng)*rad;return 6371*2*Math.asin(Math.min(1,Math.sqrt(Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlng/2)**2)));}
  function build(rows,pins){
    const events=rows.map(row=>({...row,stops:points(row,pins),mode:mode(row)}));const legs=[];let previous=null;
    events.forEach((event,i)=>{
      const first=event.stops[0]?.point;
      if(previous&&first&&previous.date===event.date&&distance(previous.point,first)>.02)legs.push({a:previous.point,b:first,index:i,kind:'link',connector:true});
      for(let p=1;p<event.stops.length;p++){const a=event.stops[p-1].point,b=event.stops[p].point;if(a&&b&&distance(a,b)>.02)legs.push({a,b,index:i,kind:event.mode});}
      const last=event.stops.at(-1)?.point;previous=last?{point:last,date:event.date}:null;
    });return {events,legs};
  }
  window.TripMapData={KEY,PINS,dates,places,byId,read,readPins,segments,pinKey,resolve,points,mode,distance,build};
})();
