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

const coachJs=fs.readFileSync('phuket-coach.js','utf8');
new vm.Script(coachJs,{filename:'phuket-coach.js'});
vm.runInContext(coachJs,context);
const coach=context.window.PhuketCoach;
const novice=coach.evaluate('Купите срочно, гарантирую 100% доход!',api.create('investor'));
const skilled=coach.evaluate('Скажите, для чего вы рассматриваете покупку: для жизни или инвестиций?',api.create('investor'));
assert(skilled.score>novice.score);
assert(coach.guidance(api.create('investor')).hint);
assert(html.includes('src="./phuket-coach.js"'));
assert(html.includes('id="hintbody"'));
console.log('OK: broker hints and feedback');

const conversation=api.create('investor');
const profitability=api.respond(conversation,'Обещаете гарантированную доходность?');
assert.match(profitability,/расчёт|расход|провер/i);
assert.equal(Object.keys(conversation.facts).length,0);
assert.equal(api.respond(conversation,'Для чего вы покупаете квартиру?'),api.templates.investor.goal);
assert.match(api.respond(conversation,'Давайте назначим созвон и посмотрим подборку.'),/вариант|созвон/i);
assert.match(api.respond(conversation,'Спасибо за ответы'),/дальше/i);
console.log('OK: objection and next-step intents');

const branchJs=fs.readFileSync('phuket-branches.js','utf8');
new vm.Script(branchJs,{filename:'phuket-branches.js'});
vm.runInContext(branchJs,context);
const branches=context.window.PhuketBranches;
assert.equal(branches.roots.length,4);
assert(Object.keys(branches.nodes).length>=15);
assert(html.includes('tab-branches'));
assert(html.includes('src="./phuket-branches.js"'));
for(const root of branches.roots){
 const start=branches.create(root.id);
 const rootNode=branches.get(start.node);
 assert(rootNode.choices.length>=3);
 for(let i=0;i<rootNode.choices.length;i++){
  const s=branches.create(root.id);
  const target=branches.step(s,i);
  assert(target&&typeof target.client==='string');
  assert.equal(s.history.length,1);
  assert.equal(s.score,rootNode.choices[i][3]);
 }
}
for(const root of branches.roots){
 const queue=[root.id],seen=new Set();
 while(queue.length){
  const id=queue.shift();if(seen.has(id))continue;seen.add(id);
  const node=branches.get(id);assert(node,'Missing node: '+id);
  for(const choice of node.choices){assert(branches.get(choice[2]),'Missing target: '+choice[2]);queue.push(choice[2])}
 }
 assert(seen.has('end_good')&&seen.has('end_bad'),'Both outcomes must be reachable from '+root.id);
}
const flow=branches.create('first');
branches.step(flow,0);branches.step(flow,0);branches.step(flow,0);branches.step(flow,0);
assert.equal(branches.progress(flow).turns,4);
console.log('OK: branching graph, 4 starts, all targets and outcomes');

assert(html.includes("for(const t of ['scripts','dialog','branches','notes'])"),'Branching tab must have click handler');
console.log('OK: branching tab click binding');
