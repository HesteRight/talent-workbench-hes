/* Build stage membership from confirmed events; never infer biographical facts. */
const RecruitmentExport=(()=>{
 const rounds=['技术一面','技术二面','技术三面','HR 面'];
 const headers=['应聘编号','姓名','岗位','来源','入池日期','最新阶段日期','当前阶段','前司背景','毕业院校','学历层级','公开署名机构','一面面试官','一面评价','二面面试官','二面评价','三面面试官','三面评价','HR 面面试官','HR 面评价','待办','负责人','下次跟进'];
 function record(s,a,stage,cutoff,core,person,job){
  const es=core.timeline(s,a.id,cutoff),st=core.state(s,a,cutoff),p=person(a.personId)||{},stageDate=st.closed?es.filter(e=>e.kind==='closed').at(-1)?.date:st.stageAt,roundFields=[];
  for(const round of rounds){const matching=es.filter(e=>e.round===round&&(e.kind==='interview'||e.kind==='feedback'));const names=[...new Set(matching.map(e=>e.interviewer).filter(Boolean))];const feedback=matching.filter(e=>e.kind==='feedback'&&e.note||e.kind==='interview'&&e.feedback).map(e=>`${e.date}：${e.kind==='feedback'?e.note:e.feedback}`);roundFields.push(names.join('、'),feedback.join('\n'))}
  return [a.id,p.name||'',job(a.jobId)?.title||'',a.source||'',a.createdAt||'',stageDate||'',st.closed?'已结束 · '+st.reason:core.stages[st.stage],p.previousCompany||'',p.school||'',p.educationLevel||'',p.institution||'',...roundFields,st.waitReason||'',st.owner||'',st.nextAt||''];
 }
 function stages(s,apps,cutoff,core,person,job){const groups=core.stages.map((label,k)=>({label,k,rows:[]}));groups.push({label:'已结束',k:null,rows:[]});for(const a of apps){const st=core.state(s,a,cutoff),i=st.closed?core.stages.length:st.stage;groups[i].rows.push(record(s,a,st.stage,cutoff,core,person,job))}return groups}
 function sort(s,apps,jobs,cutoff,core){const order=new Map(jobs.map((j,i)=>[j.id,i])),rank=new Map(apps.map(a=>{const st=core.state(s,a,cutoff);return [a.id,st.closed?9:st.stage]}));return apps.slice().sort((a,b)=>(order.get(a.jobId)??999)-(order.get(b.jobId)??999)||rank.get(a.id)-rank.get(b.id)||a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id))}
 return {headers,record,stages,sort};
})();
if(typeof module!=='undefined')module.exports=RecruitmentExport;
