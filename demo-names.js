/* User-supplied public names are display aliases for sample roles, not author identities. */
function applyDemoDisplayNames(s,pool){
 const names=['蔡浩楠','连宙辉','崔昊阳','穆亚东','刘涵','尚敬捷','刘晋源','王源','孙敬博','柏天佑','张敬尧','向子维','李翰东','赵冬斌','殷飞','张煦尧','王冬悦','刘雅静','甄奕豪','黄鹏瑞','董家华','田建东','范慧杰','韩志','王强','韩博宇','李斐然','孟本源','许倩倩','黄庆明','于涛','张国珍','周子翔','王晨汀','王利民','李鑫','陈文智','王总辉','李戈','刘阳','陈卓','曾宇','周宇','李司浩','杨云云','李小龙','杨澜','房山'];
 if(s.demoNamesVersion!==1){
  const sample=s.people.filter(p=>/^T-\d{3}$/.test(p.id)||/^D-\d{3}$/.test(p.id)||p.id.startsWith('DEMO-J-')).sort((a,b)=>a.id.localeCompare(b.id));
  sample.forEach((p,i)=>{if(i>=names.length)return;p.name=names[i];p.displayNameSource='用户提供的公开作者姓名，仅用于模拟角色显示';});s.demoNamesVersion=1;
 }
 for(const entry of pool){const p=s.people.find(p=>p.id===entry.linkedId);if(p)entry.name=p.name}
}
