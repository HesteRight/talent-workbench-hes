/* Pure application/event operations. Shared by UI and Node checks. */
const WorkflowCore=(()=>{
const stages=['寻访入池','有效沟通','一面完成','二面完成','三面完成','HR 面完成','启动谈薪','发出 Offer','完成入职'];
const waits=['等待候选人回复','等待业务评估','等待约面确认','面试待完成','面试结束未反馈','等待谈薪确认','等待入职','待核验','无需跟进'];
const reasons=['工作地点不匹配','到岗时间不匹配','实习周期不匹配','候选人主动退出','业务评估未通过','岗位需求调整','其他'];
function timeline(s,id,asOf='9999-12-31'){return s.events.filter(e=>e.applicationId===id&&e.date<=asOf).sort((a,b)=>a.date.localeCompare(b.date)||a.order-b.order)}
function state(s,a,asOf='9999-12-31'){
const es=timeline(s,a.id,asOf),ss=es.filter(e=>Number.isInteger(e.stage)),stage=ss.length?Math.max(...ss.map(e=>e.stage)):0,last=ss.at(-1),closed=es.filter(e=>e.kind==='closed').at(-1);
let waitReason=stage===8?'无需跟进':stage===0?'待核验':stage>=7?'等待入职':stage===6?'等待谈薪确认':'等待业务评估',nextAt='',owner=a.owner||'招聘负责人';
for(const e of es){if(e.waitReason!==undefined)waitReason=e.waitReason;if(e.nextAt!==undefined)nextAt=e.nextAt;if(e.owner)owner=e.owner}
if(closed||stage===8){waitReason='无需跟进';nextAt=''}
return {stage,closed:!!closed,reason:closed?.reason||'',waitReason,nextAt,owner,stageAt:last?.date||a.createdAt,events:es};
}
function days(from,to){return Math.max(0,Math.floor((Date.parse(to+'T00:00:00Z')-Date.parse(from+'T00:00:00Z'))/86400000))}
function cohort(s,{job='',start='',end='',asOf='9999-12-31'}={}){return s.applications.filter(a=>(!job||a.jobId===job)&&(!start||a.createdAt>=start)&&(!end||a.createdAt<=end)&&a.createdAt<=asOf)}
function funnel(s,apps,asOf){return stages.map((label,k)=>{const list=apps.filter(a=>timeline(s,a.id,asOf).some(e=>e.stage===k));return {label,k,count:list.length,apps:list}}).map((r,k,rs)=>({...r,rate:k&&rs[k-1].count?r.count/rs[k-1].count:null,overall:rs[0].count?r.count/rs[0].count:null}))}
function metrics(s,apps,asOf){const f=funnel(s,apps,asOf);return {funnel:f,active:apps.filter(a=>{const st=state(s,a,asOf);return !st.closed&&st.stage>=2&&st.stage<=5}).length,closed:apps.filter(a=>state(s,a,asOf).closed).length}}
function tasks(s,asOf){return cohort(s,{asOf}).map(a=>({application:a,...state(s,a,asOf)})).filter(x=>!x.closed&&x.stage<8&&x.waitReason!=='无需跟进').map(x=>({...x,dwell:days(x.stageAt,asOf),overdue:!!x.nextAt&&x.nextAt<asOf}))}
function addEvent(s,id,event){const a=s.applications.find(a=>a.id===id);if(!a)throw Error('找不到应聘记录');const es=timeline(s,id),st=state(s,a);if(st.closed||st.stage===8)throw Error('该申请已经结束，不能继续推进');if(!/^\d{4}-\d{2}-\d{2}$/.test(event.date)||!Number.isFinite(Date.parse(event.date))||new Date(event.date+'T00:00:00Z').toISOString().slice(0,10)!==event.date)throw Error('日期无效');if(event.date<a.createdAt||es.some(e=>e.date>event.date))throw Error('记录日期不能早于已有事件');if(event.nextAt&&event.nextAt<event.date)throw Error('下次跟进日期不能早于记录日期');if(event.nextAt&&(!Number.isFinite(Date.parse(event.nextAt))||new Date(event.nextAt+'T00:00:00Z').toISOString().slice(0,10)!==event.nextAt))throw Error('下次跟进日期无效');
if(Number.isInteger(event.stage)&&event.stage!==st.stage+1)throw Error('只能确认下一阶段，不能跳过中间阶段');if(event.kind==='closed'&&!reasons.includes(event.reason))throw Error('请选择结束原因');
if(!String(event.note||'').trim())throw Error('请填写记录依据');const order=Math.max(0,...s.events.map(e=>e.order))+1;const e={...event,id:'E-'+order,order,applicationId:id};s.events.push(e);return e}
function enroll(s,person,jobId,task){if(!jobId)throw Error('请先选择目标岗位');if(!task?.verified)throw Error('请完成人工相关性核验');let found=s.people.find(p=>p.id===person.id);const existing=s.applications.find(a=>a.personId===person.id&&a.jobId===jobId);if(existing)return {application:existing,added:false,newPerson:false};const newPerson=!found;if(found)found.status='已复核';if(!found){s.people.push({...person,status:'已复核'});found=person}
const seq=s.applications.length+1,id='APP-'+String(seq).padStart(4,'0'),a={id,personId:found.id,jobId,createdAt:task.date,source:task.source,taskId:task.id,path:task.path,verified:true,newPerson,owner:'招聘负责人',priority:'常规'};s.applications.push(a);const order=Math.max(0,...s.events.map(e=>e.order))+1;s.events.push({id:'E-'+order,order,applicationId:id,kind:'stage',stage:0,date:task.date,note:'人工核验后加入岗位线索池；'+task.path,waitReason:'等待候选人回复',nextAt:task.date,owner:a.owner});return {application:a,added:true,newPerson}}
function channelRows(s,apps,asOf){const labels=[...new Set(apps.map(a=>a.source))];return labels.map(source=>{const list=apps.filter(a=>a.source===source),f=funnel(s,list,asOf);return {source,total:list.length,newPeople:list.filter(a=>a.newPerson).length,verified:list.filter(a=>a.verified).length,contact:f[1].count,interview:f[2].count,offer:f[7].count,joined:f[8].count}})}
return {stages,waits,reasons,timeline,state,days,cohort,funnel,metrics,tasks,addEvent,enroll,channelRows};
})();
if(typeof module!=='undefined')module.exports=WorkflowCore;
