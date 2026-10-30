const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync('data-lab.js','utf8');
const context=vm.createContext({});vm.runInContext(fs.readFileSync("jobs.js","utf8"),context);vm.runInContext(code.slice(0,code.indexOf('function downloadFile'))+';globalThis.Lab=LabCore;',context);
const L=context.Lab,sample=L.makeSample(),processed=L.process(sample);
assert.equal(sample.length,120);assert.equal(processed.clean.length+processed.errors.length,120);assert.equal(processed.errors.length,5);assert(processed.changes.some(c=>c.rule==='去除首尾空格'));assert(processed.changes.some(c=>c.rule==='日期格式统一'));assert.equal(new Set(sample.map(r=>r.job).filter(Boolean)).size,14);
assert.equal(L.date('2026-02-30'),null);assert.equal(L.date('2026/9/2'),'2026-09-02');assert.equal(L.date('2024-02-29'),'2024-02-29');assert.equal(L.date('2026-02-29'),null);
const csv=L.serialize(sample),parsed=L.csvParse(csv);assert.equal(parsed.length,120);assert.equal(L.process(parsed).clean.length,processed.clean.length);
assert.throws(()=>L.csvParse('wrong\nx'));assert.throws(()=>L.csvParse('"not closed'));
const quoted={...sample[0],job:'模拟,"研发"\n岗位'};assert.equal(L.csvParse(L.serialize([quoted]))[0].job,quoted.job);
const start=code.indexOf('const ModelCore=');const end=code.indexOf('let trainedModel',start);vm.runInContext(code.slice(start,end)+';globalThis.M=ModelCore;',context);
const M=context.M,model=M.train(M.training),result=M.metrics(M.test,t=>M.predict(model,t));assert.equal(M.training.length,24);assert.equal(M.test.length,12);assert(!M.test.some(t=>M.training.some(r=>r.text===t.text)));assert.equal(M.predict(model,'XYZ'),'待人工判断');assert.equal(result.rows.length,12);
console.log(JSON.stringify({quality:{raw:sample.length,valid:processed.clean.length,isolated:processed.errors.length},model:{accuracy:result.accuracy,macroF1:result.macroF1},checks:'passed'},null,2));

