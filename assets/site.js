(() => {
  'use strict';
  const dialog=document.getElementById('info-dialog'),body=document.getElementById('info-body'),title=document.getElementById('info-title');
  let returnFocus=null,held=null,activeId='';const initialized=new WeakSet(),scriptLoads=new Map();
  function restore(){if(held){held.template.content.append(...body.childNodes);held=null;}else body.replaceChildren();activeId='';}
  function setupContent(){
    body.querySelectorAll('[id]').forEach(node=>{const existing=document.getElementById(node.id);if(existing!==node)node.removeAttribute('id');});
    const bag=body.querySelector('#bag-result');if(bag&&!initialized.has(bag))loadScript('assets/baggage.js?v=booked-20260914').then(()=>{if(body.contains(bag)&&!initialized.has(bag)){window.initBaggageGuide();initialized.add(bag);}}).catch(()=>{bag.textContent='계산기를 불러오지 못했습니다. 모달을 다시 열어주세요.';});
    const entry=body.querySelector('#entry-copy-inquiry');if(entry&&!initialized.has(entry))loadScript('assets/entry.js?v=port-20260914').then(()=>{if(body.contains(entry)&&!initialized.has(entry)){window.initEntryPreparation();initialized.add(entry);}}).catch(()=>{});
  }
  function loadScript(src){if(!scriptLoads.has(src))scriptLoads.set(src,new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>{scriptLoads.delete(src);reject();};document.body.append(script);}));return scriptLoads.get(src);}
  window.openTripInfo=(heading,content,trigger)=>{const wasOpen=dialog.open;restore();returnFocus=trigger||document.activeElement;title.textContent=heading;if(typeof content==='string')body.innerHTML=content;else body.append(content);if(!wasOpen)dialog.showModal();dialog.scrollTop=0;setupContent();};
  function openTemplate(id,heading,trigger){const template=document.getElementById(id);if(!template)return;if(activeId===id&&dialog.open)return;const wasOpen=dialog.open;restore();returnFocus=trigger||document.activeElement;title.textContent=heading;held={template};activeId=id;body.append(template.content);if(!wasOpen)dialog.showModal();dialog.scrollTop=0;setupContent();}
  document.addEventListener('click',event=>{const button=event.target.closest('[data-info]');if(button)openTemplate(button.dataset.info,button.dataset.title||button.textContent,button);if(event.target.closest('[data-info-close]'))dialog.close();if(event.target.closest('[data-notes-open]'))document.querySelector('.fn-launch')?.click();});
  dialog.addEventListener('close',()=>{restore();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  function routeHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(e){return;}if(!id)return;const path=location.pathname.split('/').pop()||'index.html',route=window.tripRoutes[id];if(route&&route.split('?')[0]!==path){location.replace(route+(route.includes('?')?'':'#'+encodeURIComponent(id)));return;}const target=document.getElementById(id);if(target){if(dialog.open&&!dialog.contains(target))dialog.close();for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;target.scrollIntoView({block:'start',behavior:'auto'});}else if(id.startsWith('destination-'))document.dispatchEvent(new CustomEvent('trip-destination-route',{detail:id}));}
  window.addEventListener('hashchange',routeHash);window.addEventListener('load',routeHash,{once:true});
  // Expanding one guide does not expand every other topic on the page.
  document.querySelectorAll('.page-shell details[open]').forEach(d=>{if(!d.closest('#trip-studio'))d.open=false;});
})();
