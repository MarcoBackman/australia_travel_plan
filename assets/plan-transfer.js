(() => {
  'use strict';
  if (document.getElementById('plan-transfer-open')) return;
  const BACKUP = 'australia-transfer-restore-v1';
  const FORMAT = 'australia-private-plan-transfer';
  const MAX_BYTES = 8 * 1024 * 1024;
  const managed = key => key.startsWith('australia-') && key !== BACKUP;
  const stamp = () => new Date().toISOString();
  function snapshot() {
    const entries = Object.create(null);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && managed(key)) entries[key] = localStorage.getItem(key);
    }
    return {format: FORMAT, version: 1, exportedAt: stamp(), source: location.protocol === 'file:' ? 'local-file' : location.origin, entries};
  }
  function validate(value) {
    if (!value || value.format !== FORMAT || value.version !== 1 || !value.entries || typeof value.entries !== 'object' || Array.isArray(value.entries)) throw Error('이 기능에서 내보낸 일정·메모 파일을 선택해 주세요.');
    const entries = Object.entries(value.entries);
    if (entries.length > 500 || JSON.stringify(value).length > MAX_BYTES) throw Error('파일이 너무 큽니다. 최대 8MB, 500개 저장 항목까지 가져올 수 있습니다.');
    for (const [key, item] of entries) {
      if (!managed(key) || key.length > 300 || typeof item !== 'string') throw Error('지원하지 않는 저장 항목이 포함되어 있습니다.');
      if (key === 'australia-recommended-portdouglas-2026-v1' || key === 'australia-recommended-itinerary-photo-2026-v2') {
        let plan;
        try { plan = JSON.parse(item); } catch { throw Error('일정 데이터 형식이 올바르지 않습니다.'); }
        if (!plan || !plan.days || typeof plan.days !== 'object' || Array.isArray(plan.days)) throw Error('일정 데이터에 날짜별 내용이 없습니다.');
      }
    }
    return value;
  }
  function replaceEntries(entries) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && managed(key)) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }
  function applyWithBackup(incoming) {
    validate(incoming);
    const before = snapshot();
    // Abort if a recoverable copy cannot be saved. Never clear unrelated storage.
    localStorage.setItem(BACKUP, JSON.stringify(before));
    try { replaceEntries(incoming.entries); }
    catch (error) {
      try { replaceEntries(before.entries); }
      catch { throw Error('저장 공간 부족으로 적용·자동 복원이 실패했습니다. 이 창을 닫기 전에 이전 내용 백업을 내려받으세요.'); }
      throw Error('가져오지 못해 기존 내용으로 되돌렸습니다. 저장 공간과 브라우저 설정을 확인하세요.');
    }
  }
  let exportValue = null, exportName = '';
  function download(value, name) {
    exportValue = value; exportName = name;
    get('export-text').value = JSON.stringify(value, null, 2);
    get('export-result').hidden = false;
    get('export-filename').textContent = '파일 이름: ' + name;
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  const style = document.createElement('style');
  style.textContent = '.plan-transfer-dialog{box-sizing:border-box;width:min(680px,calc(100vw - 24px));max-height:90dvh;overflow:auto;border:1px solid #b9c9bd;border-radius:18px;background:#faf7ef;color:#173e3b;padding:24px}.plan-transfer-dialog::backdrop{background:#102b2bd9}.plan-transfer-dialog h2{margin:0;font-size:1.5rem}.plan-transfer-dialog p{line-height:1.7}.plan-transfer-head{display:flex;justify-content:space-between;align-items:center;gap:16px}.plan-transfer-actions{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}.plan-transfer-dialog button,.plan-transfer-dialog input{font:inherit}.plan-transfer-dialog button{min-height:44px;cursor:pointer}.plan-transfer-dialog input{max-width:100%;margin:8px 0}.plan-transfer-note{background:#e6ede3;padding:14px;border-radius:10px}.plan-transfer-preview{white-space:pre-wrap;overflow-wrap:anywhere}.plan-transfer-dialog summary{cursor:pointer;padding:12px 0}.plan-transfer-status{font-weight:600}.plan-transfer-dialog button:disabled{opacity:.5;cursor:not-allowed}@media(max-width:540px){.plan-transfer-dialog{padding:16px}.plan-transfer-actions>*{width:100%}}';
  document.head.append(style);
  const dialog = document.createElement('dialog');
  dialog.className = 'plan-transfer-dialog';
  dialog.setAttribute('aria-labelledby', 'plan-transfer-title');
  dialog.innerHTML = `<header class="plan-transfer-head"><h2 id="plan-transfer-title">일정·메모 옮기기</h2><button type="button" class="btn" data-close aria-label="일정 옮기기 닫기">닫기</button></header>
    <p class="plan-transfer-note">로컬 파일과 공개 사이트의 개인 저장 내용은 자동으로 동기화되지 않습니다. 먼저 각 편집창에서 저장을 마친 뒤, <strong>내용이 맞는 쪽에서 내보내고 다른 쪽에서 가져오세요.</strong></p>
    <p data-environment></p>
    <h3>1. 현재 일정·메모 내보내기</h3>
    <p>저장된 일정, 개인 메모와 아이콘 위치, 지도 지정 위치, 예산 등 이 여행 사이트의 저장 항목을 JSON 파일 하나로 내려받습니다. 현재 페이지에서 접근 가능한 저장 내용만 포함됩니다.</p>
    <button class="btn primary" type="button" data-export>현재 일정·메모 내보내기</button>
    <section class="plan-transfer-note" data-export-result hidden><h3>내보내기 데이터 준비됨</h3><p data-export-filename></p><p>파일이 저장되지 않았다면 아래에서 저장을 다시 시도하거나, 데이터를 복사해 공개 사이트의 ‘텍스트로 가져오기’에 붙여넣으세요. 이 내용은 개인 자료이므로 공개 댓글에 올리지 마세요.</p><label>내보낼 일정·메모<textarea data-export-text readonly rows="6" spellcheck="false" style="box-sizing:border-box;width:100%;font:12px monospace"></textarea></label><div class="plan-transfer-actions"><button class="btn" type="button" data-save-file>파일 저장 다시 시도</button><button class="btn" type="button" data-copy>일정·메모 데이터 복사</button></div></section>
    <h3>2. 다른 쪽에서 파일 가져오기</h3>
    <p>가져오기 전에 다른 여행 사이트 탭과 편집창을 닫아 주세요. 현재 브라우저의 여행 저장 항목을 파일 내용으로 교체합니다. 가져오는 파일에 없는 이전 항목도 제거해 두 화면의 기준을 맞춥니다.</p>
    <label>내보낸 JSON 파일 선택<br><input type="file" accept=".json,application/json" data-file></label>
    <details><summary>파일 없이 텍스트로 가져오기</summary><label>로컬에서 복사한 일정·메모 데이터<textarea data-import-text rows="6" spellcheck="false" style="box-sizing:border-box;width:100%;font:12px monospace" placeholder="내보내기 데이터를 여기에 붙여넣으세요"></textarea></label><button class="btn" type="button" data-read-text>붙여넣은 데이터 읽기</button></details>
    <p class="plan-transfer-preview" data-preview>파일을 선택하면 변경될 저장 항목 수를 표시합니다.</p>
    <div class="plan-transfer-actions"><button class="btn primary" type="button" data-import disabled>백업 후 가져오기</button><button class="btn" type="button" data-reload hidden>적용된 내용으로 새로고침</button></div>
    <p class="plan-transfer-status" role="status" aria-live="polite" data-status></p>
    <details><summary>가져오기 전 내용 복원</summary><p>가장 최근 가져오기 직전의 내용을 이 브라우저에 보관합니다. 복원하면 현재 내용이 다시 백업됩니다.</p><div class="plan-transfer-actions"><button class="btn" type="button" data-restore>이전 내용 복원</button><button class="btn" type="button" data-backup>이전 내용 백업 내려받기</button></div></details>
    <p class="fine">이 파일에는 개인 일정·메모가 포함될 수 있습니다. 공개 GitHub 저장소나 댓글에 올리지 마세요. 내보내기·가져오기는 서버로 전송하지 않습니다. GitHub 공개 댓글은 이미 서버에 저장되므로 포함하지 않습니다. 기기 간 실시간 동기화 기능은 아닙니다.</p>`;
  document.body.append(dialog);
  const get = name => dialog.querySelector('[data-' + name + ']');
  const say = value => { get('status').textContent = value; };
  get('environment').after(get('status'));
  const opener = document.createElement('button');
  opener.id = 'plan-transfer-open'; opener.type = 'button'; opener.className = 'btn'; opener.textContent = '일정·메모 옮기기';
  opener.setAttribute('aria-haspopup', 'dialog');
  (document.querySelector('.site-header nav') || document.querySelector('main') || document.body).append(opener);
  let pending = null, fileSequence = 0, changed = false;
  function markApplied() {
    changed = true; pending = null; get('import').disabled = true; get('reload').hidden = false;
    get('file').value = ''; get('preview').textContent = '저장 내용 적용 완료. 새로고침해야 카드·지도·메모에 표시됩니다.';
    say('가져오기가 완료됐습니다. 적용된 내용으로 새로고침을 눌러 주세요.');
  }
  opener.addEventListener('click', () => {
    get('environment').textContent = location.protocol === 'file:' ? '현재 위치: 로컬 파일. 이 화면의 내용이 맞다면 여기서 내보내세요.' : '현재 위치: 공개 웹사이트. 로컬에서 내보낸 파일을 여기서 가져오세요.';
    dialog.showModal();
  });
  get('close').addEventListener('click', () => { if (changed) location.reload(); else dialog.close(); });
  dialog.addEventListener('cancel', event => { if (changed) { event.preventDefault(); location.reload(); } });
  dialog.addEventListener('close', () => opener.focus());
  get('reload').addEventListener('click', () => location.reload());
  get('export').addEventListener('click', () => {
    try {
      const value = snapshot();
      if (!Object.keys(value.entries).length) { say('현재 페이지에서 읽을 수 있는 저장 내용이 없습니다. 일정을 편집한 페이지에서 내보내세요.'); return; }
      download(value, 'australia-private-plan-' + stamp().slice(0, 10) + '.json');
      say('내보내기 데이터를 준비했습니다. 다운로드가 안 됐다면 아래의 데이터 복사 또는 파일 저장 다시 시도를 이용하세요.');
      get('export-result').scrollIntoView({block: 'nearest'});
    } catch { say('브라우저 저장 내용에 접근하지 못했습니다. 개인정보 보호 설정을 확인하세요.'); }
  });
  get('save-file').addEventListener('click', async () => {
    if (!exportValue) return;
    try {
      if (typeof window.showSaveFilePicker === 'function') {
        const handle = await window.showSaveFilePicker({suggestedName: exportName, types: [{description: '여행 일정·메모 JSON', accept: {'application/json': ['.json']}}]});
        const writable = await handle.createWritable();
        try { await writable.write(JSON.stringify(exportValue, null, 2)); await writable.close(); }
        catch (error) { try { await writable.abort(); } catch {} throw error; }
        say('선택한 파일에 저장했습니다. 공개 사이트에서 이 JSON 파일을 가져오세요.');
      } else {
        download(exportValue, exportName);
        say('파일 다운로드를 다시 요청했습니다. 저장되지 않으면 데이터 복사를 이용해 주세요.');
      }
    } catch (error) {
      say(error.name === 'AbortError' ? '파일 저장을 취소했습니다. 데이터는 아래에 남아 있습니다.' : '이 브라우저에서 파일 저장을 완료하지 못했습니다. 아래의 데이터를 복사해 가져올 수 있습니다.');
    }
  });
  get('copy').addEventListener('click', async () => {
    const box = get('export-text');
    try {
      if (!navigator.clipboard?.writeText) throw Error('clipboard unavailable');
      await navigator.clipboard.writeText(box.value);
      say('일정·메모 데이터를 복사했습니다. 공개 사이트의 텍스트로 가져오기에 붙여넣으세요.');
    } catch {
      box.focus(); box.select(); box.setSelectionRange(0, box.value.length);
      let copied = false;
      try { copied = document.execCommand('copy'); } catch {}
      say(copied ? '일정·메모 데이터를 복사했습니다. 공개 사이트에서 붙여넣으세요.' : '자동 복사가 제한돼 데이터를 선택했습니다. Ctrl+C로 복사한 뒤 공개 사이트에 붙여넣으세요.');
    }
  });
  function prepareIncoming(value) {
    validate(value);
    const keys = Object.keys(value.entries), before = snapshot().entries;
    if (!keys.length) throw Error('저장 항목이 없는 데이터는 가져오지 않습니다.');
    const differences = keys.filter(key => before[key] !== value.entries[key]).length;
    const removed = Object.keys(before).filter(key => !(key in value.entries)).length;
    get('preview').textContent = '가져올 저장 항목: ' + keys.length + '개\n추가·변경: ' + differences + '개 / 이전 항목 제거: ' + removed + '개\n개인 메모 포함: ' + (keys.some(key => key === 'australia-free-notes-v1' || key.startsWith('australia-section-note-v1:')) ? '예' : '아니요') + '\n기존 내용은 먼저 백업됩니다.';
    pending = value; get('import').disabled = false;
    say('데이터를 읽었습니다. 변경 내용을 확인한 뒤 백업 후 가져오기를 누르세요.');
  }
  get('read-text').addEventListener('click', () => {
    ++fileSequence; pending = null; get('import').disabled = true;
    try {
      const text = get('import-text').value.trim();
      if (!text) throw Error('로컬에서 내보낸 데이터를 먼저 붙여넣어 주세요.');
      if (text.length > MAX_BYTES) throw Error('붙여넣은 데이터가 너무 큽니다.');
      prepareIncoming(JSON.parse(text));
    } catch (error) { say(error.message || '붙여넣은 데이터를 읽지 못했습니다.'); }
  });
  get('file').addEventListener('change', async () => {
    const sequence = ++fileSequence, file = get('file').files[0];
    pending = null; get('import').disabled = true; say('');
    if (!file) return;
    try {
      if (file.size > MAX_BYTES) throw Error('8MB 이하의 JSON 파일을 선택해 주세요.');
      const value = validate(JSON.parse(await file.text()));
      if (sequence !== fileSequence) return;
      prepareIncoming(value);
    } catch (error) { if (sequence === fileSequence) say(error.message || '파일을 읽지 못했습니다.'); }
  });
  get('import').addEventListener('click', () => {
    if (!pending || !confirm('현재 브라우저의 여행 일정·개인 메모·위치를 백업한 뒤 선택한 파일의 내용으로 교체할까요? 파일에 없는 이전 여행 저장 항목도 제거됩니다.')) return;
    try { applyWithBackup(pending); markApplied(); }
    catch (error) { say(error.message || '저장에 실패했습니다.'); }
  });
  get('restore').addEventListener('click', () => {
    try {
      const raw = localStorage.getItem(BACKUP);
      if (!raw) { say('이 브라우저에 가져오기 전 백업이 없습니다.'); return; }
      const value = validate(JSON.parse(raw));
      if (!confirm('현재 내용을 백업하고, 직전 가져오기 전 내용으로 복원할까요?')) return;
      applyWithBackup(value); markApplied(); say('이전 내용을 복원했습니다. 새로고침해 주세요.');
    } catch (error) { say(error.message || '백업을 복원하지 못했습니다.'); }
  });
  get('backup').addEventListener('click', () => {
    try {
      const raw = localStorage.getItem(BACKUP);
      if (!raw) { say('이 브라우저에 백업이 없습니다.'); return; }
      download(validate(JSON.parse(raw)), 'australia-before-import-' + stamp().slice(0, 10) + '.json');
      say('이전 내용의 백업 파일 내려받기를 요청했습니다.');
    } catch (error) { say(error.message || '백업을 읽지 못했습니다.'); }
  });
})();
