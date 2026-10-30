/* Exports share the same cohort and cutoff as the analysis screen. */
async function wfExportAnalytics(apps,f){
 apps=RecruitmentExport.sort(workflow,apps,jobCatalog,f.asOf,WF);
 const button=document.querySelector('#wf-export'),format=document.querySelector('#wf-export-format').value;
 const ids=new Set(apps.map(a=>a.id)),events=workflow.events.filter(e=>ids.has(e.applicationId)&&e.date<=f.asOf);
 const kind=e=>e.kind==='closed'?'申请结束':Number.isInteger(e.stage)?WF.stages[e.stage]:e.kind==='interview'?'面试安排':e.kind==='feedback'?'面试反馈':'沟通 / 待办';
 const rows=events.map(e=>{const a=apps.find(a=>a.id===e.applicationId);return {'应聘者':wfPerson(a.personId)?.name||a.personId,'岗位':wfJob(a.jobId)?.title||a.jobId,'事件':kind(e),'日期':e.date,'内容':e.note||'','负责人':e.owner||'','面试轮次':e.round||'','面试官':e.interviewer||'','待办':e.waitReason||'','下次跟进':e.nextAt||'','结束原因':e.reason||'','应聘编号':a.id,'事件编号':e.id}});
 try{
 button.disabled=true;
 if(format==='csv'){const columns=['应聘者','岗位','事件','日期','内容','负责人','面试轮次','面试官','待办','下次跟进','结束原因','应聘编号','事件编号'];downloadFile('招聘事件.csv','\uFEFF'+LabCore.serialize(rows,columns),'text/csv;charset=utf-8');return}
 if(format==='json'){downloadFile('招聘事件.json',JSON.stringify({观察起始日期:f.start||null,统计截至:f.asOf,岗位:wfJob(f.job)?.title||'全部岗位',事件:rows},null,2),'application/json');return}
 if(!globalThis.ExcelJS)throw Error('Excel 导出组件未加载，请刷新后重试');
 const book=new ExcelJS.Workbook();book.creator='人才线索工作台';
 function sheet(name,headers,data){const ws=book.addWorksheet(name,{views:[{state:'frozen',ySplit:1}]});ws.addRow(headers);for(const row of data)ws.addRow(row);ws.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};ws.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFEF7A2D'}};ws.columns.forEach((c,i)=>{c.width=Math.min(55,Math.max(14,...data.map(r=>String(r[i]??'').length*1.5),headers[i].length*2));c.alignment={vertical:'top',wrapText:true}});ws.autoFilter={from:{row:1,column:1},to:{row:Math.max(1,data.length+1),column:headers.length}};return ws}
 const funnel=WF.funnel(workflow,apps,f.asOf);
 const summary=sheet('阶段转化',['阶段','人数','阶段转化率','整体转化率'],funnel.map(r=>[r.label,r.count,r.rate,r.overall]));summary.getColumn(3).numFmt='0.0%';summary.getColumn(4).numFmt='0.0%';
 const stageData=RecruitmentExport.stages(workflow,apps,f.asOf,WF,wfPerson,wfJob);
 sheet('全部应聘者',RecruitmentExport.headers,apps.map(a=>RecruitmentExport.record(workflow,a,WF.state(workflow,a,f.asOf).stage,f.asOf,WF,wfPerson,wfJob)));
 const sheetNames=['01 寻访入池','02 有效沟通','03 一面','04 二面','05 三面','06 HR面','07 谈薪','08 Offer','09 入职','10 已结束'];
 stageData.forEach((stage,i)=>sheet(sheetNames[i],RecruitmentExport.headers,stage.rows));
 const eventHeaders=['应聘者','岗位','事件','日期','内容','负责人','面试轮次','面试官','待办','下次跟进','结束原因','应聘编号','事件编号'];
 sheet('事件明细',eventHeaders,rows.map(r=>eventHeaders.map(h=>r[h]||'')));
 sheet('统计范围',['项目','值'],[['观察起始日期',f.start||'不限'],['统计截至',f.asOf],['岗位',wfJob(f.job)?.title||'全部岗位'],['统计范围','在所选起止日期内首次入池的应聘记录；阶段按截至结束日期的已确认事件统计。'],['阶段名单','每条应聘记录只按截至结束日期的最新阶段分到一个名单，已结束单列；同一人应聘不同岗位分别记录。'],['漏斗与名单','阶段转化统计累计到达人数；阶段名单统计当前所在人数，两者口径不同。'],['Mapping 名单','仅含当前处于 Mapping 阶段且已关联岗位的应聘者；未关联岗位的人才线索不计入。'],['背景字段','前司、毕业院校、学历由人工录入；公开署名机构不等同毕业院校或当前任职。'],['面试字段','按轮次展示已记录面试官和反馈；空白表示未记录，不推断。'],['阶段差额','含等待与结束，不直接等于流失。']]);
 downloadFile('招聘分析-'+f.asOf+'.xlsx',await book.xlsx.writeBuffer(),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 }catch(error){document.querySelector('#wf-filter-error').textContent=error.message}finally{button.disabled=false}
}
