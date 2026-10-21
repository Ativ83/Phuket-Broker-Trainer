const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('phuket-v2.js','utf8');
new vm.Script(js,{filename:'phuket-v2.js'});
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
assert.equal(scripts.length,1,'Expected one inline app script');
new vm.Script(scripts[0],{filename:'index-inline.js'});
const context={window:{}};vm.createContext(context);vm.runInContext(js,context);
const api=context.window.PhuketV2;
assert.equal(api.extra.length,28);
assert.equal(Object.keys(api.templates).length,3);
assert(html.includes('.concat(PhuketV2.extra)'),'New scripts must be included');
assert(html.includes('src="./phuket-v2.js"'),'External logic must load');
for(const name of Object.keys(api.templates)){
 const state=api.create(name);
 assert.equal(state.persona,name);
 assert.equal(typeof api.templates[name].opening,'string');
 const goal=api.respond(state,'Для чего вы покупаете?');
 assert.equal(goal,api.templates[name].goal);
 const budget=api.respond(state,'Какой бюджет рассматриваете?');
 assert.equal(budget,api.templates[name].budget);
 assert.equal(Object.keys(state.facts).length,2);
 const repeated=api.respond(state,'Какой бюджет рассматриваете?');
 assert(repeated.includes(api.templates[name].budget));
 assert.equal(state.history.length,3);
 const reset=api.create(name);assert.equal(Object.keys(reset.facts).length,0);
}
console.log('OK: syntax, 28 additional scripts, 3 personas, memory and reset');
