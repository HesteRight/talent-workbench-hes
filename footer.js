// Footer destinations toggle back to the page and scroll position they were opened from.
const footerHistory=new Map();
document.querySelectorAll('[data-footer-toggle]').forEach(button=>button.dataset.toggleName=button.textContent.trim());
function refreshFooter(){document.querySelectorAll('[data-footer-toggle]').forEach(button=>{const target=button.dataset.footerToggle,back=footerHistory.get(target),canReturn=wfView===target&&back;button.textContent=button.dataset.toggleName;button.setAttribute('aria-label',canReturn?'返回'+back.title:'打开'+button.dataset.toggleName.replace(' ↗',''));button.title=canReturn?'返回点击前的页面':''})}
const showBeforeFooter=show;show=function(view){showBeforeFooter(view);refreshFooter()};
document.querySelectorAll('[data-footer-toggle]').forEach(button=>button.addEventListener('click',()=>{const target=button.dataset.footerToggle,back=footerHistory.get(target);if(wfView===target&&back){footerHistory.delete(target);show(back.view);window.scrollTo({top:back.scroll,behavior:'auto'})}else if(wfView!==target){footerHistory.set(target,{view:wfView,title:$('#heading').textContent,scroll:window.scrollY});show(target)}refreshFooter()}));
refreshFooter();
