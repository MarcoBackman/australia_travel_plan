
window.initEntryPreparation=function(){
 const button=document.getElementById('entry-copy-inquiry'),text=document.getElementById('entry-inquiry-text'),status=document.getElementById('entry-copy-status');
 button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text.value);status.textContent='문의 문구를 복사했습니다. 보험사에 직접 보내고 서면 답변을 받아두세요.';}catch(error){text.focus();text.select();status.textContent='자동 복사가 제한되어 문구를 선택했습니다. 기기의 복사 기능을 사용하세요.';}});
};
