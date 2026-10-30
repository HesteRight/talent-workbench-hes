// Progressive disclosure of long non-actionable notices. All details remain accessible.
function compactNotes(){document.querySelectorAll('.explain').forEach(el=>{if(el.parentElement?.classList.contains('compact-note'))return;const details=document.createElement('details');details.className='compact-note';const summary=document.createElement('summary');summary.textContent=el.querySelector('b')?.textContent||'查看说明';el.before(details);details.append(summary,el)})}
const beforeMinimalShow=show;show=function(view){beforeMinimalShow(view);compactNotes()};compactNotes();
