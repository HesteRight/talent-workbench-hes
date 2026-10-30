/* Requested demonstration totals, applied once through real stage events. */
function updateDemoFunnel(s,jobs,core,today){
 if(s.demoFunnelVersion===1)return;
 const isSample=a=>/^T-\d{3}$/.test(a.personId)||a.personId.startsWith('DEMO-');
 for(const [stage,target] of [[5,14],[6,12],[7,10],[8,7]]){
  let count=core.funnel(s,s.applications,today)[stage].count;
  const candidates=s.applications.filter(isSample).filter(a=>{const st=core.state(s,a,today);return !st.closed&&st.stage===stage-1}).sort((a,b)=>a.jobId.localeCompare(b.jobId)||a.id.localeCompare(b.id));
  for(const a of candidates){if(count>=target)break;core.addEvent(s,a.id,{kind:'stage',stage,date:today,note:'招聘进展更新（示例）',owner:'招聘负责人',waitReason:stage===8?'无需跟进':stage===7?'等待入职':stage===6?'等待谈薪确认':'等待业务评估',nextAt:stage===8?'':today});count++}
 }
 // Retain at least three active sample applications per job after joiners exit.
 const names=['李司浩','杨云云','李小龙','杨澜','房山','于涛','王晨汀','张国珍'];let n=0,seq=Math.max(0,...s.applications.map(a=>Number(a.id.match(/^APP-(\d+)$/)?.[1])||0)),order=Math.max(0,...s.events.map(e=>e.order||0));
 for(const job of jobs){const active=s.applications.filter(a=>a.jobId===job.id).filter(a=>{const st=core.state(s,a,today);return !st.closed&&st.stage<8});for(let k=active.length;k<3;k++){const id='DEMO-REFILL-'+job.id+'-'+k;s.people.push({id,name:names[n++%names.length],direction:job.directions?.[0]||'待确认',institution:'',school:'',educationLevel:'',source:'招聘流程示例',evidence:'',link:'无',status:'待核验',note:'仅用于流程演示，不代表同名作者的真实应聘信息。'});const a={id:'APP-'+String(++seq).padStart(4,'0'),personId:id,jobId:job.id,createdAt:'2026-08-25',source:'招聘流程示例',owner:'招聘负责人'};s.applications.push(a);s.events.push({id:'E-'+(++order),order,applicationId:a.id,kind:'stage',stage:0,date:a.createdAt,note:'模拟历史阶段事件',waitReason:'待核验',owner:'招聘负责人',nextAt:today})}}
 s.demoFunnelVersion=1;
}
