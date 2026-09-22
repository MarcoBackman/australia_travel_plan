(() => {
  'use strict';
  const D=window.TripMapData,$=id=>document.getElementById(id),params=new URLSearchParams(location.search);
  const embedded=parent!==window&&params.get('embed')==='1';
  if(embedded)document.body.classList.add('map-embedded');
  const path={
    stay:'M3 11 12 3l9 8M5 10v11h14V10M9 21v-8h6v8',
    airport:'m3 10 7 2 8-8c2-2 4 0 2 2l-8 8 2 7-3-1-3-5-5-3Z',
    harbour:'M12 3v13m-4-9 4-4 4 4M5 12H3c0 10 18 10 18 0h-2M8 15l4 4 4-4',
    food:'M4 3v6c0 3 6 3 6 0V3M7 3v18M19 3c-5 3-5 10 0 10V3Zm0 10v8',
    shop:'M4 7h16l-1 14H5L4 7Zm4 0V5a4 4 0 0 1 8 0v2',
    beach:'M3 11a9 9 0 0 1 18 0H3Zm9 0v9M6 21h12M8 11c0-10 8-10 8 0',
    dive:'M3 7h18v6a4 4 0 0 1-7 2h-4a4 4 0 0 1-7-2V7Zm9 0v5M21 7V3',
    museum:'m3 8 9-5 9 5H3Zm3 3v8m6-8v8m6-8v8M3 21h18',
    park:'m12 2-6 8h3l-5 7h16l-5-7h3L12 2Zm0 15v5',
    landmark:'M4 21V9h5V3h6v6h5v12M8 13v3m4-7v7m4-3v3M2 21h20',
    drive:'m4 9 2-5h12l2 5M3 9h18v10H3V9Zm3 4h2m8 0h2M5 19v2m14-2v2',
    walk:'M14 5a2 2 0 1 0 0 .1M12 9l-3 5-5 1m8-6 4 5 4 1m-8-6 1 8-5 5m5-5 5 5',
    transit:'M5 3h14v16H5V3Zm0 8h14M8 15h1m6 0h1M7 19l-2 3m12-3 2 3M12 3v8',
    pin:'M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13ZM9 9a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
    link:'M4 12h16m-5-5 5 5-5 5'
  };
  path.flight=path.airport;path.sea=path.harbour;
  const icon=kind=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(path[kind]||path.pin)+'"/></svg>';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colors={stay:'#e9c296',airport:'#f5cc86',harbour:'#8bd3e8',food:'#eeacaa',shop:'#e7dba0',beach:'#99dfdc',dive:'#9fd6e7',museum:'#c6b9ed',park:'#c0e4a8',landmark:'#c2cdea',pin:'#ddd9b6'};
  const routeColors={flight:'#e8b674',sea:'#67c1e2',walk:'#98dcae',drive:'#d6db8e',transit:'#bbafd9',link:'#b1c7c7'};
  const modeNames={flight:'항공 · 개략선',sea:'보트·페리 · 개략선',walk:'도보',drive:'차량',transit:'대중교통 · 개략선',link:'일정 사이 연결'};
  let day=D.dates.includes(params.get('day'))?params.get('day'):params.get('day')==='all'?'all':D.dates[1];
  let state=D.read(),pins=D.readPins(),events=[],legs=[],selected=0,map=null,routeLayer,poiLayer,markerLayer,playing=null,epoch=0,requestController=null,lastRequest=0,pinOpener=null;
  let lastSignature='',selectedSignature='',pointMarkers=new Map(),routeCache=new Map(),routeLines=[],cameraReady=false,cameraMotion=null;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const coord=p=>[p.lat,p.lng],quality=p=>p.quality==='custom'?'직접 지정':p.quality==='area'?'권역 대표 · 장소 미확정':'대표 위치';
  const endLabel=e=>(e.end||'미정')+(e.endDay?' (+'+e.endDay+'일)':'');
  const post=message=>{if(embedded)parent.postMessage(message,location.origin);};
  document.querySelectorAll('[data-icon]').forEach(e=>e.insertAdjacentHTML('afterbegin',icon(e.dataset.icon)));
  $('map-day').innerHTML='<option value="all">전체 여행 · 11일</option>'+D.dates.map((d,i)=>'<option value="'+d+'">10월 '+(13+i)+'일 '+['화','수','목','금','토','일','월','화','수','목','금'][i]+'요일</option>').join('');

  function routeKey(leg){return [leg.kind,leg.a.lat,leg.a.lng,leg.b.lat,leg.b.lng].join('|');}
  function currentLeg(){const list=legs.filter(l=>l.index===selected);return list.find(l=>!l.connector)||list[0];}
  function allPoints(){return events.flatMap(e=>e.stops.map(s=>s.point).filter(Boolean));}
  function stopCamera(){
    if(cameraMotion)cameraMotion.finish(false);
    if(cameraReady)map.stop();
  }
  function stopPlayback(){if(playing)clearTimeout(playing.timer);playing=null;stopCamera();$('map-play').textContent='▶ 순서 재생';$('map-play').setAttribute('aria-pressed','false');}
  function invalidateRequest(){epoch++;if(requestController)requestController.abort();requestController=null;}
  function fit(points,maxZoom=15){
    if(!map||!points.length)return Promise.resolve(true);
    stopCamera();
    const bounds=L.latLngBounds(points.map(p=>Array.isArray(p)?p:coord(p))),options={padding:[60,55],maxZoom};
    // Set the initial view once. Every subsequent destination uses the same moving map.
    if(!cameraReady||reducedMotion.matches){map.fitBounds(bounds,{...options,animate:false});cameraReady=true;return Promise.resolve(true);}
    const zoom=Math.min(maxZoom,map.getBoundsZoom(bounds,false,L.point(120,110))),center=bounds.getCenter();
    const distance=map.project(map.getCenter(),zoom).distanceTo(map.project(center,zoom))/Math.max(1,map.getSize().x);
    const duration=Math.min(3.6,1.1+Math.log2(1+distance)*.35+Math.abs(map.getZoom()-zoom)*.13);
    return new Promise(resolve=>{
      let timeout;
      const motion={finish:completed=>{if(cameraMotion!==motion)return;map.off('moveend',onEnd);clearTimeout(timeout);cameraMotion=null;resolve(completed);}};
      const onEnd=()=>motion.finish(true);
      cameraMotion=motion;map.once('moveend',onEnd);
      // A hidden/resized map must not leave playback waiting indefinitely.
      timeout=setTimeout(()=>motion.finish(true),duration*1000+1200);
      map.flyToBounds(bounds,{...options,duration});
    });
  }
  function highlightSelection(){
    for(const {line,leg} of routeLines){const active=leg.index===selected;line.setStyle({color:active?'#e7f5a0':routeColors[leg.kind],weight:active?5:2.5,opacity:active?.95:.64});line.getElement()?.classList.toggle('map-selected-path',active);}
    for(const {marker,indices} of pointMarkers.values()){const active=indices.includes(selected);marker.getElement()?.querySelector('.map-pin-dot')?.classList.toggle('is-selected',active);marker.setZIndexOffset(active?800:100);}
  }
  function drawRoutes(){
    if(!map)return;routeLayer.clearLayers();routeLines=[];
    for(const leg of legs){
      const cached=routeCache.get(routeKey(leg)),active=leg.index===selected;
      const line=L.polyline(cached?cached.coords:[coord(leg.a),coord(leg.b)],{color:active?'#e7f5a0':routeColors[leg.kind],weight:active?5:2.5,opacity:active?.95:.64,dashArray:cached?undefined:leg.kind==='flight'?'10 9':'5 7',className:'map-route-path'+(active?' map-selected-path':'')}).addTo(routeLayer);
      routeLines.push({line,leg});
      line.bindTooltip((cached?'조회 경로 · ':'개략 연결 · ')+modeNames[leg.kind]+' · '+leg.a.name+' → '+leg.b.name,{sticky:true});
      line.on('click',()=>selectEvent(leg.index,false,true));
    }
  }
  function markerHTML(point,indices=[],isPOI=false){return '<span class="map-pin-dot'+(isPOI?' is-poi':'')+(indices.includes(selected)?' is-selected':'')+(point.quality==='area'?' is-uncertain':'')+'" style="--pin-color:'+colors[point.kind]+'">'+icon(point.kind)+(indices.length?'<em>'+indices.slice(0,3).map(i=>i+1).join('·')+(indices.length>3?'…':'')+'</em>':'')+'</span>';}
  function drawMarkers(){
    if(!map)return;markerLayer.clearLayers();poiLayer.clearLayers();pointMarkers=new Map();
    const grouped=new Map();events.forEach((e,i)=>e.stops.forEach(s=>{if(!s.point)return;const key=s.point.id;let group=grouped.get(key);if(!group){group={point:s.point,indices:[]};grouped.set(key,group);}if(!group.indices.includes(i))group.indices.push(i);}));
    for(const group of grouped.values()){
      const {point,indices}=group,marker=L.marker(coord(point),{title:point.name+' · 일정 '+indices.map(i=>i+1).join(', '),alt:point.name,icon:L.divIcon({className:'map-pin-icon',html:markerHTML(point,indices),iconSize:[32,32],iconAnchor:[16,16]}),zIndexOffset:indices.includes(selected)?800:100}).addTo(markerLayer);
      const labelMarker=()=>marker.getElement()?.setAttribute('aria-label',point.name+' · 일정 '+indices.map(i=>i+1).join(', '));
      marker.on('add',labelMarker);labelMarker();
      marker.bindTooltip(esc(point.name)+' · '+quality(point));
      marker.on('click',()=>{selectEvent(indices.includes(selected)?selected:indices[0],false,true);details();});pointMarkers.set(point.id,{marker,indices});
    }
    if($('map-poi').getAttribute('aria-pressed')==='true'){
      const zones=new Set(allPoints().map(p=>p.zone));
      for(const point of D.places){if(grouped.has(point.id)||!zones.has(point.zone))continue;
        const marker=L.marker(coord(point),{title:'주요 장소 · '+point.name,alt:point.name,icon:L.divIcon({className:'map-pin-icon',html:markerHTML(point,[],true),iconSize:[25,25],iconAnchor:[12,12]}),zIndexOffset:0}).addTo(poiLayer);
        const popup=document.createElement('div');const b=document.createElement('b');b.textContent=point.name;const small=document.createElement('small');small.textContent=quality(point)+' · 오늘 일정에 포함된 장소는 아닙니다.';popup.append(b,small);marker.bindPopup(popup);
      }
    }
  }
  function initMap(){
    if(!window.L){$('trip-route-map').innerHTML='<p class="map-loading">지도 연결에 실패했습니다. 이동 목록·상세 내용과 외부 지도 링크를 이용해 주세요.</p>';return;}
    $('trip-route-map').replaceChildren();
    map=L.map('trip-route-map',{zoomControl:false,scrollWheelZoom:false,minZoom:2,maxZoom:18,zoomSnap:0,zoomAnimation:!reducedMotion.matches,fadeAnimation:!reducedMotion.matches});L.control.zoom({position:'topright'}).addTo(map);
    const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,keepBuffer:4,updateWhenIdle:false,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener">지도 수정</a> · 경로 <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noopener">OSRM / FOSSGIS</a>'}).addTo(map);
    tiles.on('tileerror',()=>{$('map-tile-status').hidden=false;$('map-tile-status').textContent='배경 지도 일부를 불러오지 못했습니다. 일정과 연결선은 계속 볼 수 있습니다.';});
    L.control.scale({imperial:false,position:'bottomleft',maxWidth:100}).addTo(map);
    routeLayer=L.layerGroup().addTo(map);poiLayer=L.layerGroup().addTo(map);markerLayer=L.layerGroup().addTo(map);
    map.getContainer().addEventListener('pointerdown',stopPlayback);
    map.getContainer().addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','+','-','=','Enter',' '].includes(e.key))stopPlayback();});
    new ResizeObserver(()=>map.invalidateSize({pan:false})).observe($('trip-route-map'));
  }
  function renderList(){
    $('map-events').replaceChildren();events.forEach((event,i)=>{
      const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.className='map-event';button.dataset.eventIndex=i;
      button.innerHTML='<span class="event-number">'+String(i+1).padStart(2,'0')+'</span><span><time>'+(day==='all'?esc(event.date.slice(5))+' · ':'')+esc(event.start||'시각 미정')+' → '+esc(endLabel(event))+'</time><b>'+esc(event.title||'제목 없는 일정')+'</b><span class="event-mode">'+icon(event.mode)+esc(event.transport||'이동수단 미정')+'</span>'+(event.stops.some(s=>!s.point)?'<small>◇ 미정 위치 · 직접 지정 가능</small>':'')+'</span>';
      button.addEventListener('click',()=>selectEvent(i,true,true));li.append(button);$('map-events').append(li);
    });
  }
  function describeRoute(){
    const event=events[selected],leg=currentLeg();
    $('map-road').disabled=!leg||!['drive','walk'].includes(leg.kind)||!map;
    $('map-pin').disabled=!event;$('map-details').disabled=!event;$('map-play').disabled=events.length<2;$('map-progress').disabled=!events.length;
    if(!event){$('map-route-status').textContent='이 날짜에는 표시할 이동이 없습니다.';$('map-external').removeAttribute('href');return;}
    const point=event.stops.at(-1)?.point;
    $('map-external').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(point?point.lat+','+point.lng:event.place||event.title);
    if(event.stops.some(s=>!s.point)){$('map-route-status').textContent='일부 장소가 미정입니다. 위치가 없는 구간은 선으로 연결하지 않았습니다.';return;}
    if(!leg){$('map-route-status').textContent='선택 장소에 머무는 일정입니다. 표시한 위치는 '+(point?quality(point):'미정')+'입니다.';return;}
    const cached=routeCache.get(routeKey(leg));
    $('map-route-status').textContent=cached?'조회한 '+modeNames[leg.kind]+' 경로 약 '+(cached.distance/1000).toFixed(1)+'km · 현장 상황·실시간 교통 미반영':modeNames[leg.kind]+' · 직선 참고거리 '+D.distance(leg.a,leg.b).toFixed(1)+'km · 실제 이동 경로와 다를 수 있습니다.';
    if(leg.kind==='drive'||leg.kind==='walk')$('map-external').href='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(leg.a.lat+','+leg.a.lng)+'&destination='+encodeURIComponent(leg.b.lat+','+leg.b.lng)+'&travelmode='+(leg.kind==='drive'?'driving':'walking');
  }
  function selectEvent(index,focus=true,manual=false){
    if(manual)stopPlayback();invalidateRequest();selected=Math.max(0,Math.min(events.length-1,Number(index)||0));const event=events[selected];
    if(event){selectedSignature=event.key;$('map-selected-time').textContent=(day==='all'?event.date.slice(5)+' · ':'')+(event.start||'시각 미정')+' → '+endLabel(event);$('map-selected-title').textContent=event.title||'제목 없는 일정';$('map-selected-place').textContent=event.place||'장소 미지정';
      const stateName={confirmed:'예약 완료',pending:'확인 필요',done:'다녀옴',draft:'계획 중'}[event.state]||'계획 중';
      $('map-selected-tags').innerHTML='<span>'+stateName+'</span><span>'+esc(event.transport||'미정')+'</span><span>'+esc(event.startZone==='KR'?'한국·일본 UTC+9':event.startZone==='CNS'?'포트더글라스·CNS UTC+10':'시드니 UTC+11')+(event.startZone!==event.endZone?' → '+esc(event.endZone==='SYD'?'SYD UTC+11':event.endZone==='KR'?'한국 UTC+9':'CNS UTC+10'):'')+'</span>';
    }else{$('map-selected-time').textContent='—';$('map-selected-title').textContent='등록된 일정이 없습니다';$('map-selected-place').textContent='';$('map-selected-tags').replaceChildren();selectedSignature='';}
    document.querySelectorAll('.map-event').forEach((b,i)=>{if(i===selected)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    $('map-progress').value=selected;$('map-step-count').textContent=(event?selected+1:0)+' / '+events.length;highlightSelection();describeRoute();
    let movement=Promise.resolve(true);
    if(focus&&event){const leg=currentLeg(),points=leg?(routeCache.get(routeKey(leg))?.coords||[leg.a,leg.b]):event.stops.map(s=>s.point).filter(Boolean);movement=fit(points);}
    const list=$('map-events'),button=list.children[selected]?.firstChild;
    if(button&&playing){const item=button.getBoundingClientRect(),viewport=list.getBoundingClientRect();if(item.top<viewport.top||item.bottom>viewport.bottom)list.scrollTo({top:list.scrollTop+item.top-viewport.top-8,behavior:reducedMotion.matches?'auto':'smooth'});}
    return movement;
  }
  function renderDay(keepSelection=false){
    const old=selectedSignature,oldIndex=selected;stopPlayback();invalidateRequest();
    const rows=day==='all'?D.dates.flatMap(d=>state.days[d]):state.days[day];({events,legs}=D.build(rows,pins));
    $('map-day').value=day;$('map-prev-day').disabled=day===D.dates[0];$('map-next-day').disabled=day===D.dates.at(-1);
    $('map-day-title').textContent=day==='all'?'11일의 여행 경로':Number(day.slice(-2))+'일의 이동 순서';$('map-event-count').textContent=String(events.length).padStart(2,'0');$('map-empty').hidden=!!events.length;
    $('map-progress').max=Math.max(0,events.length-1);renderList();drawRoutes();drawMarkers();const found=keepSelection?events.findIndex(e=>e.key===old):-1;selectEvent(keepSelection?(found>=0?found:oldIndex):0,false);
    const points=allPoints();fit(points.length?points:[{lat:-16.4837,lng:145.4639}],points.length?15:12);
    const missing=events.filter(e=>e.stops.some(s=>!s.point)).length;
    $('map-warning').textContent=[state.error,missing?missing+'개 일정에 미정 위치가 있습니다. 리프 포인트·지정 선착장은 예약서 확인 후 위치를 지정하세요.':'숙소·식당 권역의 핀은 대표 위치이며 예약 확정 장소가 아닙니다.'].filter(Boolean).join(' ');
    $('map-sync-status').textContent=state.error?'기본안 포함 · 확인 필요':state.usesSaved?'저장된 일정 연결됨':'기본 추천 일정 연결됨';
    post({type:'australia-recommended-state',view:'map',day});
  }
  function setDay(value){if(value!=='all'&&!D.dates.includes(value))return;day=value;const url=new URL(location.href);url.searchParams.set('day',day);history.replaceState(null,'',url);renderDay();}
  function refresh(){const next=D.read(),nextPins=D.readPins(),signature=JSON.stringify([next,nextPins]);if(signature===lastSignature)return;lastSignature=signature;state=next;pins=nextPins;renderDay(true);$('map-sync-status').textContent=state.error?'일정 읽기 확인 필요':'일정 갱신됨 · '+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});}
  function details(){
    const e=events[selected];if(!e)return;
    const body=document.createElement('div');body.innerHTML='<span class="tag '+(e.state==='confirmed'?'confirmed':'proposed')+'">'+esc(e.date)+' · '+esc(e.start)+' → '+esc(endLabel(e))+'</span><div class="map-detail-points">'+e.stops.map(s=>'<span>'+esc(s.text)+'<br><small>'+esc(s.point?quality(s.point):'위치 미정')+'</small></span>').join('<span aria-hidden="true">→</span>')+'</div><p>'+esc(e.notes||'추가 메모가 없습니다.').replace(/\n/g,'<br>')+'</p><p class="fine">각 시작·도착 도시의 현지 시각입니다. 점선은 순서를 확인하는 연결선입니다.</p>';
    window.openTripInfo(e.title||'일정 상세',body,$('map-details'));
  }
  function edit(){const chosen=events[selected]?.date||(day==='all'?D.dates[1]:day);if(embedded)post({type:'australia-map-edit',day:chosen});else {const b=$('map-edit');b.dataset.tripPlanner='grid';b.dataset.tripDay=chosen;}}
  function openPin(){
    const event=events[selected];if(!event)return;stopPlayback();pinOpener=$('map-pin');
    const form=document.createElement('form');form.className='map-pin-form';form.innerHTML='<p>선택한 장소 문구를 실제 위치에 연결합니다. 숙소를 예약한 뒤 지도에서 건물 위치를 맞춰 지정할 수 있습니다.</p><label>연결할 장소<select name="segment">'+event.stops.map((s,i)=>'<option value="'+i+'">'+esc(s.text)+'</option>').join('')+'</select></label><label>등록된 장소<select name="place"><option value="">장소 선택</option>'+D.places.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join('')+'</select></label><button type="button" class="btn" data-center>현재 지도 중심점 사용</button><label>직접 지정한 장소 이름<input name="customName" maxlength="120" placeholder="예: 예약한 숙소 입구"></label><p class="fine" data-coord>지도를 원하는 곳으로 옮긴 뒤 이 창을 열어 중심점을 선택하세요.</p><div class="actions"><button class="btn primary" type="submit">이 위치로 연결</button><button class="btn" type="button" data-reset>직접 연결 해제</button></div><p class="fine" role="status" data-pin-status></p>';
    const part=form.elements.segment,place=form.elements.place,name=form.elements.customName,notice=form.querySelector('[data-pin-status]');let center=null;
    function selectedPart(){return event.stops[Number(part.value)];}
    function fillCurrent(){center=null;place.value='';name.value='';const s=selectedPart(),p=pins[D.pinKey(s.text,s.zone)];if(typeof p==='string')place.value=p;else if(p?.name){center={lat:p.lat,lng:p.lng};name.value=p.name;}form.querySelector('[data-coord]').textContent=center?'저장된 좌표: '+center.lat.toFixed(5)+', '+center.lng.toFixed(5):'등록된 장소 또는 현재 지도 중심점을 선택하세요.';notice.textContent='';}
    part.addEventListener('change',fillCurrent);place.addEventListener('change',()=>{center=null;form.querySelector('[data-coord]').textContent='등록된 장소를 사용합니다.';});
    form.querySelector('[data-center]').disabled=!map;
    form.querySelector('[data-center]').addEventListener('click',()=>{const c=map.getCenter();center={lat:Number(c.lat.toFixed(6)),lng:Number(c.lng.toFixed(6))};place.value='';name.value=selectedPart().text;form.querySelector('[data-coord]').textContent='지도 중심 좌표: '+center.lat.toFixed(5)+', '+center.lng.toFixed(5);});
    function store(value){const s=selectedPart(),key=D.pinKey(s.text,s.zone),next=D.readPins();if(value)next[key]=value;else delete next[key];try{localStorage.setItem(D.PINS,JSON.stringify(next));pins=next;renderDay(true);$('info-dialog').close();pinOpener.focus({preventScroll:true});}catch(e){notice.textContent='이 브라우저에 저장하지 못했습니다. 기존 위치를 유지합니다.';}}
    form.addEventListener('submit',e=>{e.preventDefault();if(center&&name.value.trim())store({...center,name:name.value.trim()});else if(place.value)store(place.value);else notice.textContent='등록된 장소를 선택하거나 지도 중심점과 이름을 지정해 주세요.';});
    form.querySelector('[data-reset]').addEventListener('click',()=>store(null));fillCurrent();window.openTripInfo('장소 위치 지정',form,pinOpener);
  }
  async function requestRoad(){
    const leg=currentLeg();if(!leg||!['walk','drive'].includes(leg.kind))return;stopPlayback();
    const key=routeKey(leg);if(routeCache.has(key)){drawRoutes();describeRoute();fit(routeCache.get(key).coords,16);return;}
    let globalLast=0;try{globalLast=Number(localStorage.getItem('australia-map-route-request-at')||0);}catch(e){}
    const now=Date.now();if(now-Math.max(lastRequest,globalLast)<1100){$('map-route-status').textContent='잠시 뒤 다시 눌러 주세요. 경로는 한 번에 하나씩 조회합니다.';return;}lastRequest=now;try{localStorage.setItem('australia-map-route-request-at',String(now));}catch(e){}
    invalidateRequest();const currentEpoch=epoch,controller=new AbortController();requestController=controller;const timeout=setTimeout(()=>controller.abort(),9000);$('map-road').disabled=true;$('map-route-status').textContent='선택한 '+modeNames[leg.kind]+' 경로를 조회하고 있습니다…';
    try{
      const profile=leg.kind==='walk'?'foot':'car';
      const url='https://routing.openstreetmap.de/routed-'+profile+'/route/v1/driving/'+leg.a.lng+','+leg.a.lat+';'+leg.b.lng+','+leg.b.lat+'?overview=full&geometries=geojson&steps=false';
      const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('network');const data=await response.json(),route=data.routes?.[0];
      if(data.code!=='Ok'||!route||!Array.isArray(route.geometry?.coordinates)||route.geometry.coordinates.length<2||!Number.isFinite(route.distance))throw Error('route');
      if(data.waypoints?.some(p=>p.distance>1500))throw Error('too far from roads');
      const coords=route.geometry.coordinates.map(p=>[p[1],p[0]]);if(coords.some(p=>p.length!==2||p.some(n=>!Number.isFinite(n))||Math.abs(p[0])>90||Math.abs(p[1])>180))throw Error('coordinates');
      routeCache.set(key,{coords,distance:route.distance});if(routeCache.size>50)routeCache.delete(routeCache.keys().next().value);
      if(currentEpoch!==epoch)return;drawRoutes();describeRoute();fit(coords,16);
    }catch(error){if(currentEpoch===epoch)$('map-route-status').textContent='경로를 조회하지 못했습니다. 점선은 개략 연결이며 실제 길은 외부 지도에서 확인하세요.';}
    finally{clearTimeout(timeout);if(currentEpoch===epoch){requestController=null;$('map-road').disabled=false;}}
  }
  $('map-day').addEventListener('change',e=>setDay(e.target.value));
  $('map-prev-day').addEventListener('click',()=>setDay(D.dates[Math.max(0,D.dates.indexOf(day)-1)]));
  $('map-next-day').addEventListener('click',()=>setDay(D.dates[Math.min(10,D.dates.indexOf(day)+1)]));
  $('map-fit').addEventListener('click',()=>{stopPlayback();fit(allPoints());});$('map-poi').addEventListener('click',()=>{$('map-poi').setAttribute('aria-pressed',String($('map-poi').getAttribute('aria-pressed')!=='true'));drawMarkers();});
  $('map-progress').addEventListener('input',e=>selectEvent(Number(e.target.value),true,true));
  async function playStep(run,index){
    const completed=await selectEvent(index,true);
    if(playing!==run||!completed)return;
    if(selected>=events.length-1){stopPlayback();return;}
    run.timer=setTimeout(()=>playStep(run,selected+1),1300);
  }
  $('map-play').addEventListener('click',()=>{if(playing){stopPlayback();return;}const run={timer:null};playing=run;$('map-play').textContent='Ⅱ 재생 멈춤';$('map-play').setAttribute('aria-pressed','true');playStep(run,selected>=events.length-1?0:selected);});
  reducedMotion.addEventListener('change',()=>{stopPlayback();if(map){map.options.zoomAnimation=!reducedMotion.matches;map.options.fadeAnimation=!reducedMotion.matches;}});
  $('map-details').addEventListener('click',details);$('map-pin').addEventListener('click',openPin);$('map-road').addEventListener('click',requestRoad);$('map-edit').addEventListener('click',edit);
  window.addEventListener('storage',e=>{if([D.KEY,D.PINS,'australia-recommended-itinerary-photo-2026-v2',null].includes(e.key))refresh();});window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();else refresh();});
  document.addEventListener('keydown',e=>{if(embedded&&e.key==='Escape'&&!e.defaultPrevented&&!document.querySelector('dialog:modal')){e.preventDefault();stopPlayback();post({type:'australia-recommended-close'});}});
  window.addEventListener('message',e=>{if(!embedded||e.source!==parent||e.origin!==location.origin)return;
    if(e.data?.type==='australia-recommended-request-close'){stopPlayback();invalidateRequest();document.querySelectorAll('dialog[open]').forEach(d=>d.close());post({type:'australia-recommended-close'});}
    if(e.data?.type==='australia-recommended-open'&&e.data.view==='map'){refresh();setDay(e.data.day||day);}
  });
  window.addEventListener('pagehide',()=>{stopPlayback();invalidateRequest();});
  initMap();lastSignature=JSON.stringify([state,pins]);renderDay();post({type:'australia-recommended-ready'});
})();
