/* Idempotent sample-data expansion. Names and recruiting histories are fictional. */
function ensureDemoCoverage(s,jobs,core,today){
 const aliases={'沈亦航':'王军','陆泽宇':'李娜','程嘉言':'陈斌'};
 s.people.forEach(p=>{if(/^D-/.test(p.id)&&aliases[p.name])p.name=aliases[p.name]});
 if(s.demoCoverageVersion===1)return;
 const names=['张伟','王磊','李强','赵敏','刘洋','陈静','杨帆','周杰','吴鹏','徐涛','孙宁','马超','朱琳','胡斌','郭凯','何倩','高峰','林涛','罗丹','郑欣','梁晨','谢芳','宋超','唐佳','许峰','韩雪','冯博','邓颖','曹阳','彭飞','曾涛','肖宁','田甜','董杰','袁媛','潘涛','于洋','蒋莉','蔡明','余斌','杜娟','叶平','苏敏','魏鹏','丁宁','任杰','沈涛','姚敏','卢杰','姜宁'];
 const old=['林知远','周亦辰','陈思齐','林知远','许景行','方予安','顾明轩','叶清和'];
 s.people.forEach(p=>{const i=Number(p.id?.replace('T-',''))-1;if(i>=0&&i<8&&(p.name===old[i]||/某$/.test(p.name)))p.name=i===3?'张伟':names[i]});
 let seq=Math.max(0,...s.applications.map(a=>Number(a.id.match(/^APP-(\d+)$/)?.[1])||0));let order=Math.max(0,...s.events.map(e=>e.order||0));let n=8;
 const schools=['浙江大学','上海交通大学','北京邮电大学','电子科技大学','西安电子科技大学','中国科学技术大学'];
 jobs.forEach((job,index)=>{const active=s.applications.filter(a=>a.jobId===job.id).filter(a=>{const st=core.state(s,a,today);return !st.closed&&st.stage<8});
  for(let k=active.length;k<3;k++){
   const personId='DEMO-'+job.id+'-'+k;if(s.people.some(p=>p.id===personId))continue;
   const date='2026-08-'+String(10+(index+k)%15).padStart(2,'0'),name=names[n++%names.length],stage=(index*3+k*2)%8;
   const p={id:personId,name,direction:job.directions?.[0]||'音视频生成',institution:schools[(index+k)%schools.length],school:schools[(index+k)%schools.length],educationLevel:k%2?'博士':'硕士',source:'招聘流程示例',evidence:'示例研究方向：'+(job.keywords||[]).join('、'),link:'无',status:'待核验',note:'用于展示招聘流程的虚构角色，与公开论文作者无关联。'};
   s.people.push(p);const a={id:'APP-'+String(++seq).padStart(4,'0'),personId,jobId:job.id,createdAt:date,source:'招聘流程示例',taskId:'demo-coverage-v1',path:'流程示例',verified:false,newPerson:true,owner:'招聘负责人'};s.applications.push(a);
   for(let t=0;t<=stage;t++)s.events.push({id:'E-'+(++order),order,applicationId:a.id,kind:'stage',stage:t,date:date,note:'模拟历史阶段事件'});
   s.events.push({id:'E-'+(++order),order,applicationId:a.id,kind:'note',date:today,note:'跟进当前招聘进展。',waitReason:stage===0?'待核验':stage===7?'等待入职':stage===6?'等待谈薪确认':'等待业务评估',owner:'招聘负责人',nextAt:today});
  }
 });s.demoCoverageVersion=1;
}
if(typeof module!=='undefined')module.exports=ensureDemoCoverage;
