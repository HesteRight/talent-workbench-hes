// Deterministic extraction with explicit unknowns. No LLM/API or automatic hiring decisions.
const ContactCore=(()=>{
const fields=['岗位','地点接受情况','到岗时间','实习周期','每周出勤','下一步'];
function extract(text,titles=[],enhanced=true){const t=String(text).normalize('NFKC'),out=Object.fromEntries(fields.map(k=>[k,'待确认']));
out['岗位']=titles.slice().sort((a,b)=>b.length-a.length).find(x=>t.includes(x.normalize('NFKC')))||'待确认';
if(enhanced){if(/(?:不接受|不能接受|无法接受|不考虑)北京|北京(?:不能接受|不接受)/.test(t))out['地点接受情况']='不接受北京';else if(/(?:接受|可以去|可接受)北京|北京(?:可以接受|可接受|没问题)/.test(t))out['地点接受情况']='接受北京'}else if(t.includes('北京'))out['地点接受情况']='接受北京';
const arrival=t.match(/(?:到岗[:：]?|最早)(\d{4}-\d{2}-\d{2})/);if(arrival)out['到岗时间']=arrival[1];
const duration=t.match(/(?:可实习|实习周期[:：]?|实习)(\d+)个月/);if(duration)out['实习周期']=duration[1]+'个月';
const attendance=t.match(/每周(?:出勤)?(\d+)天/);if(attendance)out['每周出勤']=attendance[1]+'天';
if(enhanced){const next=t.match(/下一步[:：]([^。；\n]+)/);if(next)out['下一步']=next[1].trim()}else if(/约面/.test(t))out['下一步']='安排面试';
return out}
function evaluate(samples,titles,enhanced){let correct=0,total=0,omitted=0,known=0;const rows=samples.map(s=>{const prediction=extract(s.text,titles,enhanced),errors=[];for(const f of fields){total++;if(prediction[f]===s.gold[f])correct++;else errors.push({field:f,expected:s.gold[f],predicted:prediction[f]});if(s.gold[f]!=='待确认'){known++;if(prediction[f]==='待确认')omitted++}}return {...s,prediction,errors}});return {correct,total,accuracy:correct/total,omitted,known,omission:known?omitted/known:0,rows}}
return {fields,extract,evaluate};
})();
if(typeof module!=='undefined')module.exports=ContactCore;
