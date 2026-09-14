
(function initPublicComments(){
 'use strict';
 const config=JSON.parse(document.getElementById('public-comments-config').textContent);
 const dialog=document.getElementById('public-comments-dialog');
 const select=document.getElementById('public-comments-section');
 const status=document.getElementById('public-comments-status');
 const github=document.getElementById('public-comments-github');
 const host=document.getElementById('public-comments-host');
 const sections=Array.from(document.querySelectorAll('main section.section[id]'));
 const labels=new Map(),repoURL='https://github.com/'+config.repo;
 const enabled=Boolean(config.repoId&&config.categoryId);
 let active='',scriptStarted=false,ready=false,frame=null,returnFocus=null,timer=null;
 const term=id=>'australia-travel-2026 / section: '+id;
 function say(message,error=false){status.textContent=message;status.classList.toggle('is-error',error);}
 function element(tag,className,text){const result=document.createElement(tag);if(className)result.className=className;if(text!==undefined)result.textContent=text;return result;}
 function fallback(){
  github.href=repoURL+'/discussions?discussions_q='+encodeURIComponent('"'+term(active)+'"');
  github.textContent='GitHub에서 이 섹션 토론 찾기';
 }
 function setContext(){
  select.value=active;
  document.getElementById('public-comments-title').textContent=labels.get(active)+' 공개 댓글';
  fallback();
 }
 function sendContext(){
  if(!ready||!frame||!frame.contentWindow)return;
  frame.contentWindow.postMessage({giscus:{setConfig:{
   term:term(active),description:labels.get(active)+'에 관한 여행 공개 메모',
   backLink:config.site+'#'+active,strict:true,emitMetadata:true
  }}},'https://giscus.app');
 }
 function loadComments(){
  if(!enabled){say('사이트 내 댓글은 앱 연결 대기 중입니다. 아래 링크로 GitHub 토론을 열 수 있습니다. 기존 개인 메모는 그대로 유지됩니다.');return;}
  if(scriptStarted){sendContext();return;}
  scriptStarted=true;
  say('GitHub 공개 댓글을 불러오는 중입니다. 로그인·댓글 처리는 giscus와 GitHub에서 이루어집니다.');
  const observer=new MutationObserver(()=>{
   const found=host.querySelector('iframe.giscus-frame');
   if(found){frame=found;frame.title='GitHub 공개 댓글';observer.disconnect();}
  });
  observer.observe(host,{childList:true,subtree:true});
  const script=document.createElement('script');
  script.src='https://giscus.app/client.js';script.async=true;script.crossOrigin='anonymous';
  const attributes={
   'data-repo':config.repo,'data-repo-id':config.repoId,
   'data-category':config.category,'data-category-id':config.categoryId,
   'data-mapping':'specific','data-term':term(active),'data-strict':'1',
   'data-reactions-enabled':'1','data-emit-metadata':'1','data-input-position':'top',
   'data-theme':'light','data-lang':'ko','data-loading':'eager'
  };
  for(const [key,value]of Object.entries(attributes))script.setAttribute(key,value);
  script.addEventListener('error',()=>{clearTimeout(timer);observer.disconnect();say('댓글 서비스를 불러오지 못했습니다. 광고 차단·네트워크 설정을 확인하거나 GitHub 링크를 이용하세요.',true);});
  timer=setTimeout(()=>{if(!ready)say('댓글 응답이 지연되고 있습니다. 잠시 기다리거나 아래 GitHub 링크를 이용하세요.',true);},15000);
  host.append(script);
 }
 function open(id,trigger){
  if(!labels.has(id))return;
  if(active&&active!==id&&scriptStarted&&!confirm('다른 섹션으로 이동하면 작성 중인 댓글이 사라질 수 있습니다. 먼저 게시하거나 복사했나요?'))return;
  active=id;setContext();
  if(!dialog.open){returnFocus=trigger||document.activeElement;dialog.showModal();}
  loadComments();
 }
 for(const section of sections){
  const nav=document.querySelector('nav a[href="#'+section.id+'"]');
  const title=(nav?nav.textContent:section.querySelector('h2')?.textContent||section.id).trim();
  labels.set(section.id,title);
  const option=element('option','',title);option.value=section.id;select.append(option);
  const card=element('div','public-note-card'),copy=element('div'),button=element('button','btn primary','공개 댓글 열기');
  copy.append(element('strong','','이 이야기는 함께 나눠요.'),element('p','','GitHub 공개 댓글 · 개인 메모와 별도로 저장'));
  button.type='button';button.setAttribute('aria-label',title+' 공개 댓글 열기');
  button.addEventListener('click',()=>open(section.id,button));
  card.append(copy,button);section.append(card);
 }
 const guide=document.getElementById('memo-sharing');
 if(guide){
  guide.innerHTML='<summary>GitHub 공개 댓글로 함께 메모하기</summary><div class="public-comments-guide"><div><b>개인 메모</b><p>현재 브라우저에만 저장합니다. 기존 메모를 자동 공개하지 않습니다. 다른 사람과 파일로 주고받는 기능은 그대로 사용할 수 있습니다.</p></div><div><b>함께 보는 공개 댓글</b><p>각 섹션 끝의 공개 댓글 버튼을 누르세요. 같은 섹션은 같은 GitHub 대화에 연결합니다. 작성자는 GitHub로 로그인하며, 직접 게시한 댓글만 공개됩니다.</p></div></div><p>댓글은 공개 기록입니다. 개인정보나 예약 문서를 첨부하지 마세요. 일정 시트의 공동 편집 기능이 아니며, 댓글을 남겨도 다른 사람의 일정·예산은 변경되지 않습니다. 새 댓글이 바로 보이지 않으면 페이지를 새로고침하세요.</p><p class="public-comments-setup"></p><p><a href="https://giscus.app/ko" target="_blank" rel="noopener noreferrer">giscus 공식 안내</a> · <a href="'+repoURL+'/discussions" target="_blank" rel="noopener noreferrer">GitHub 전체 토론 열기</a></p>';
  guide.querySelector('.public-comments-setup').textContent=enabled?'첫 댓글이나 반응을 남기면 해당 섹션의 토론이 생성됩니다. 댓글 삭제·관리는 GitHub에서도 가능합니다.':'현재 상태: giscus 앱 연결 대기. 연결 전에는 GitHub 전체 토론 링크를 이용하세요. 섹션별 댓글 창은 연결 완료 후 이용할 수 있습니다.';
 }
 select.addEventListener('change',()=>{
  const next=select.value;
  if(next===active)return;
  if(scriptStarted&&!confirm('작성 중인 댓글은 섹션을 바꾸면 사라질 수 있습니다. 이동할까요?')){select.value=active;return;}
  active=next;setContext();if(enabled)say('선택한 섹션의 댓글로 전환합니다.');loadComments();
 });
 document.getElementById('public-comments-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{if(returnFocus&&returnFocus.isConnected)returnFocus.focus();});
 window.addEventListener('message',event=>{
  frame=frame||host.querySelector('iframe.giscus-frame');
  if(event.origin!=='https://giscus.app'||!frame||event.source!==frame.contentWindow)return;
  const message=event.data&&event.data.giscus;
  if(!message||typeof message!=='object')return;
  if(!ready){ready=true;clearTimeout(timer);sendContext();}
  if(message.error){
   const missing=typeof message.error==='string'&&/discussion not found/i.test(message.error);
   say(missing?'아직 이 섹션의 토론이 없습니다. 첫 댓글이나 반응을 남기면 생성됩니다.':'댓글 서비스에 연결 문제가 있습니다. 아래 GitHub 링크를 이용하거나 잠시 후 새로고침하세요.',!missing);
  }else if(Object.prototype.hasOwnProperty.call(message,'discussion')){
   say(message.discussion?'이 섹션에 직접 작성한 댓글은 모두에게 공개됩니다.':'첫 댓글이나 반응을 남기면 이 섹션의 공개 토론이 생성됩니다.');
  }else if(message.resizeHeight){say('댓글 영역에서 GitHub로 로그인해 작성하세요. 직접 게시한 내용은 공개됩니다.');}
 });
})();
