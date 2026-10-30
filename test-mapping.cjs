const assert=require('node:assert/strict'),fs=require('node:fs'),M=require('./mapping-core.js');
const example=JSON.parse(fs.readFileSync('public-data/mapping-example.json','utf8')),work=M.oa(example.work),rows=M.rows([work,work]);
assert.equal(rows.length,8);assert(rows.some(a=>a.name==='Ashish Vaswani'));assert(rows.every(a=>a.works.length===1));
assert.equal(M.doi('https://arxiv.org/pdf/1706.03762v7'),'10.48550/arXiv.1706.03762');assert.equal(M.doi('https://doi.org/10.1234/example.'),'10.1234/example');assert.equal(M.doi('无 DOI 文本'),'');
const person=rows[0],sameName={id:'LOCAL1',name:person.name};let found=M.internal(person,[sameName],[]);assert.equal(found.exact.length,0);assert.equal(found.possible.length,1);
found=M.internal(person,[{...sameName,externalId:person.id}],[{linkedId:'LOCAL1',name:person.name,applications:[]}]);assert.equal(found.exact.length,1);assert.equal(found.history.length,1);
const c=M.crossref({DOI:'10.1/test',title:['A paper'],published:{'date-parts':[[2026,10,1]]},author:[{given:'A',family:'B',ORCID:'https://orcid.org/0000-0000-0000-0001',affiliation:[{name:'An institution'}]}]});assert.equal(c.authors[0].name,'A B');assert.equal(c.date,'2026-10-01');assert.equal(c.authors[0].institution,'An institution');
assert.equal(M.rows([work],rows[0]).length,7);console.log('PASS: real 8-author snapshot, DOI/arXiv recognition, stable-ID deduplication, name-only uncertainty and metadata normalization');
