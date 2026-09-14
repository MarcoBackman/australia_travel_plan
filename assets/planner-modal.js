(() => {
  'use strict';
  // The dedicated editor already has both views. Other pages open that same editor in place.
  if (document.getElementById('recommended-auto-open') || parent !== window) return;
  const nav = document.querySelector('.site-header nav');
  if (!nav) return;
  const scheduleLink = nav.querySelector('a[href="recommended-itinerary.html"]');
  const launchers = document.createElement('span');
  launchers.className = 'planner-launchers';
  launchers.innerHTML = '<button type="button" data-trip-planner="grid" aria-haspopup="dialog">일정표</button><button type="button" data-trip-planner="gantt" aria-haspopup="dialog">간트차트</button>';
  if (scheduleLink) scheduleLink.replaceWith(launchers); else nav.append(launchers);

  let modal, frame, heading, fullPage, loading, opener, ready = false, requested;
  function editorURL(embedded = false) {
    const url = new URL('recommended-itinerary.html', location.href);
    if (embedded) url.searchParams.set('embed', '1');
    url.searchParams.set('view', requested.view);
    if (requested.day) url.searchParams.set('day', requested.day);
    return url.href;
  }
  function post(message) { frame.contentWindow.postMessage(message, location.origin); }
  function requestClose() {
    if (ready) post({type: 'australia-recommended-request-close'});
    else modal.close();
  }
  function updateHeading() {
    heading.textContent = requested.view === 'gantt' ? '여행 간트차트' : '여행 일정표';
    fullPage.href = editorURL();
  }
  function createModal() {
    modal = document.createElement('dialog');
    modal.id = 'planner-modal';
    modal.className = 'planner-modal';
    modal.setAttribute('aria-labelledby', 'planner-modal-title');
    modal.innerHTML = '<header class="planner-modal-head"><div><p>10.13—10.23 · PORT DOUGLAS & SYDNEY</p><h2 id="planner-modal-title"></h2></div><a class="planner-full-page">전체 페이지 ↗</a><button type="button" class="dialog-close" aria-label="일정 모달 닫기" autofocus>×</button></header><p class="planner-loading" role="status">저장된 일정을 불러오는 중입니다. 열리지 않으면 전체 페이지에서 확인해 주세요.</p><iframe title="여행 일정표와 간트차트 편집기"></iframe>';
    heading = modal.querySelector('h2');
    frame = modal.querySelector('iframe');
    fullPage = modal.querySelector('a');
    loading = modal.querySelector('.planner-loading');
    modal.querySelector('button').addEventListener('click', requestClose);
    modal.addEventListener('cancel', event => { event.preventDefault(); requestClose(); });
    modal.addEventListener('click', event => {
      if (event.target !== modal) return;
      const r = modal.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) requestClose();
    });
    modal.addEventListener('close', () => {
      document.documentElement.classList.remove('planner-modal-open');
      if (opener?.isConnected) opener.focus({preventScroll: true});
    });
    document.body.append(modal);
    window.addEventListener('message', event => {
      if (event.source !== frame.contentWindow || event.origin !== location.origin) return;
      if (event.data?.type === 'australia-recommended-ready') {
        ready = true;
        loading.hidden = true;
        if (modal.open) post({type: 'australia-recommended-open', ...requested});
      } else if (event.data?.type === 'australia-recommended-close') {
        modal.close();
      } else if (ready && modal.open && event.data?.type === 'australia-recommended-state' && ['grid', 'gantt'].includes(event.data.view)) {
        requested = {view: event.data.view, day: validDay(event.data.day)};
        updateHeading();
      }
    });
  }
  function validDay(day) { return day === 'all' || /^2026-10-(1[3-9]|2[0-3])$/.test(day || '') ? day : ''; }
  function openPlanner(view, day, trigger) {
    requested = {view: view === 'gantt' ? 'gantt' : 'grid', day: validDay(day) || (view === 'gantt' ? 'all' : '')};
    opener = trigger || document.activeElement;
    if (!modal) createModal();
    updateHeading();
    if (!modal.open) modal.showModal();
    document.documentElement.classList.add('planner-modal-open');
    if (ready) post({type: 'australia-recommended-open', ...requested});
    else if (!frame.hasAttribute('src')) frame.src = editorURL(true);
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-trip-planner]');
    if (!trigger || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openPlanner(trigger.dataset.tripPlanner, trigger.dataset.tripDay, trigger);
  });
})();
