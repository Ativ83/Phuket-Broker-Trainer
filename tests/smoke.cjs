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
vm.runInContext(fs.readFileSync('phuket-academy.js','utf8'),context);
vm.runInContext(branchJs,context);
const branches=context.window.PhuketBranches;
assert.equal(branches.roots.length,28);
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

assert(html.includes("for(const t of ['scripts','dialog','branches','deal','daily','exam','stats','calc','notes','knowledge'])"),'Branching tab must have click handler');
console.log('OK: branching tab click binding');

assert(html.includes('branchMode="training"'),'Training mode must be default');
assert(html.includes('id="branch-bot"'),'Bot toggle missing');
assert(html.includes('id="branch-training"'),'Training toggle missing');
assert(html.includes('branch-best'),'Best answer highlighting missing');
assert(html.includes("branchMode==='bot'&&PhuketBranches.best(s.node).includes(i)"),'Only bot mode should highlight highest-scoring answers');
for(const root of branches.roots){const node=branches.get(root.id);assert(node.choices.some(choice=>choice[3]===Math.max(...node.choices.map(x=>x[3]))))}
console.log('OK: training and bot mode controls, best-answer selection');

const trust=branches.create('first');
assert.equal(branches.progress(trust).trust,50);
assert.deepEqual(Array.from(branches.best('first')),[0]);
assert.match(branches.advice('first',0),/доверие|потребност/i);
branches.step(trust,0);
assert.equal(branches.progress(trust).trust,80);
const poor=branches.create('first');branches.step(poor,1);
assert.equal(branches.progress(poor).trust,30);
assert.match(branches.advice('first',1),/давлен|гарант/i);
assert(html.includes('PhuketBranches.advice('));
assert(html.includes('Доверие: '));
console.log('OK: trust meter and coaching guidance');

assert(html.includes('id="scriptsearch"'),'Scenario search missing');
assert(html.includes('phuket-branch-v5'),'Local progress save missing');
assert(html.includes('Итог переговоров'),'End of conversation summary missing');
const lost=branches.create('first');branches.step(lost,1);assert.equal(lost.trust,30);branches.step(lost,1);assert.equal(lost.trust,0);assert.equal(lost.node,'end_bad');
const completed=branches.summary(lost);assert.equal(completed.outcome,'Клиент потерян');assert(completed.mistakes>=2);
console.log('OK: search, persistence, critical trust loss and debrief');

assert(html.includes('font:19px/1.55'),'Larger body font required');
assert(html.includes('branchdifficulty'),'Difficulty selector missing');
assert(html.includes('aria-label="Доверие клиента"'),'Trust progress bar missing');
const demanding=branches.create('first','hard');
assert.equal(demanding.trust,35);
branches.step(demanding,1);
assert.equal(demanding.trust,5);
assert.equal(demanding.node,'end_bad');
console.log('OK: large type, trust progress and demanding client');

assert(html.includes('Новая тренировка началась.'),'Restart must confirm reset');
assert(html.includes("branchroot').scrollIntoView"),'Restart should scroll to beginning');
console.log('OK: restart feedback and scroll');

assert(html.includes('class="bot-marker"'),'Recommended badge must be a separate UI element');
assert(html.includes('class="broker-speech"'),'Spoken broker phrase must have separate element');
assert(html.includes('✓ РЕКОМЕНДУЕМЫЙ ОТВЕТ'));
assert(!html.includes("?' ✓ Рекомендуемый ответ':''"),'Badge must not be appended to broker speech');
console.log('OK: coaching badge separated from spoken broker text');

assert(html.includes('id="hintbody" class="hint-text"'));
assert(html.includes('.hint-text{font-size:21px'));
console.log('OK: readable broker assistant hint');

assert(html.includes('class="dialog-notice"'),'Dialogue introduction must be legible');
assert(html.includes('.dialog-notice{font-size:20px'),'Dialogue introduction should be larger');
assert(html.includes('coach-panel'),'Coach panel should have distinct color');
assert(html.includes('БРОКЕР · ВАШ ОТВЕТ'),'Broker messages should be clearly labeled');
assert(html.includes('КЛИЕНТ · ВОПРОС / ОТВЕТ'),'Client messages should be clearly labeled');
assert(html.includes('.chat .bubble.client{background:#263f52'),'Client should have a distinct background');
assert(html.includes('.chat .bubble.me{background:#3d3625'),'Broker should have a distinct background');
console.log('OK: large readable dialogue text and semantic color separation');

const memoryRun=branches.create('first','normal',1);
branches.step(memoryRun,0);
assert(branches.memoryOf(memoryRun).topics.includes('goal'));
assert.equal(branches.progress(memoryRun).topics,1);
assert.match(branches.view(memoryRun).client,/Уточню ещё один момент/);
const repeat=branches.create('first','normal',2);
branches.step(repeat,0);
assert.notEqual(branches.view(repeat).client,branches.view(memoryRun).client);
const cautious=branches.create('first','normal');
cautious.node='selection';cautious.trust=30;
branches.step(cautious,0);
assert.equal(cautious.node,'distrust','Low trust should block an easy closing');
const prior=branches.create('first','normal');
prior.node='goal';prior.visited=['first','goal','budget','goal'];prior.history=[{delta:2}];
assert.match(branches.view(prior).client,/уже обсуждали/);
assert(html.includes('Что помнит клиент'));
assert(html.includes('PhuketBranches.view(s)'));
console.log('OK: conversation memory, varied repeat playthrough and trust-sensitive closing');

assert.equal(context.window.PhuketAcademy.questions.length,20);
assert.equal(context.window.PhuketAcademy.roots.length,24);
assert(html.includes('src="./phuket-academy.js"'));
assert(html.includes('id="tab-exam"'));
assert(html.includes('id="tab-stats"'));
assert(html.includes('id="tab-calc"'));
assert(html.includes("function exam()"));
assert(html.includes("function calc()"));
assert(html.includes("function stats()"));
assert(html.includes("phuket-records-v7"));
for(const q of context.window.PhuketAcademy.questions){assert.equal(q[1].length,3);assert(q[2]>=0&&q[2]<3)}
console.log('OK: 24 new scenarios, 20 exam questions, stats and calculator');

new vm.Script(fs.readFileSync('sw.js','utf8'),{filename:'sw.js'});
new vm.Script(fs.readFileSync('phuket-academy.js','utf8'),{filename:'phuket-academy.js'});
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
assert.equal(manifest.display,'standalone');
assert(html.includes('rel="manifest"'));
assert(html.includes("serviceWorker.register('./sw.js')"));
console.log('OK: offline PWA manifest and service worker');

assert(html.includes('id="tab-deal"'));
assert(html.includes('id="tab-daily"'));
assert(html.includes('function deal()'));
assert(html.includes('function daily()'));
assert(html.includes('Экзамен на полную сделку'));
assert(html.includes('Ежедневная тренировка · 10 минут'));
assert(html.includes('PhuketBranches.review(s).errors'));
const reviewed=branches.create('first');branches.step(reviewed,1);
const report=branches.review(reviewed);
assert.equal(report.errors.length,1);
assert.match(report.errors[0].better,/Для чего рассматриваете/);
assert.match(report.focus,/давления/);
console.log('OK: deal exam, daily practice and corrective feedback');

const knowledgeJs=fs.readFileSync('phuket-knowledge.js','utf8');
const knowledgeUi=fs.readFileSync('phuket-knowledge-ui.js','utf8');
new vm.Script(knowledgeJs,{filename:'phuket-knowledge.js'});
new vm.Script(knowledgeUi,{filename:'phuket-knowledge-ui.js'});
vm.runInContext(knowledgeJs,context);
const knowledge=context.window.PhuketKnowledge;
assert.equal(knowledge.lessons.length,8);
assert.deepEqual(Array.from(knowledge.lessons,l=>l.number),[1,2,3,4,9,10,15,16]);
assert.deepEqual(Array.from(knowledge.lessons,l=>l.step),[1,1,1,1,4,4,6,6]);
assert.deepEqual(Array.from(knowledge.lessons,l=>l.title),[
 'Пхукет',
 'Формы собственности',
 'Процедура заключения сделки:',
 'Процедура заключения сделки:',
 'Форматы управления недвижимостью',
 'Арендные программы',
 'Капитализация и доходность на примере реальных кейсов',
 'Самые актуальные проекты 2024-2025 г.'
]);
assert.deepEqual(Array.from(knowledge.lessons,l=>l.video),[
 'https://youtu.be/9tK4cXrw1jk',
 'https://youtu.be/FNtDBQaPTmA',
 'https://youtu.be/befMirUiHGU',
 'https://youtu.be/bcQMu_HnsW8',
 'https://youtu.be/574FFikQlpA',
 'https://youtu.be/fhSrvjgnCf8',
 'https://youtu.be/2vUCwVGUsbs',
 'https://youtu.be/nk5QUyjjX8g'
]);
assert.deepEqual(Array.from(knowledge.lessons,l=>Boolean(l.videoAnalyzed)),[false,false,false,false,true,true,true,true]);
assert.equal(knowledge.lessons.reduce((sum,l)=>sum+l.quiz.length,0),27);
for(const lesson of knowledge.lessons){
 assert(lesson.video.startsWith('https://youtu.be/'));
 assert(lesson.sources.length>0);
 assert(lesson.facts.length>=3);
 assert(lesson.quiz.every(q=>q[2]>=0&&q[2]<q[1].length));
}
assert(knowledge.sourceNote.includes('расшифровки этих роликов ещё не получены'));
assert(html.includes('id="tab-knowledge"'));
assert(html.includes('src="./phuket-knowledge.js"'));
assert(html.includes('src="./phuket-knowledge-ui.js"'));
assert(html.includes('PhuketKnowledgeUI.renderList(app)'));
assert(fs.readFileSync('sw.js','utf8').includes("'./phuket-knowledge-ui.js'"));
assert(knowledge.lessons[7].facts.some(x=>x[1].includes('2024')));
assert(knowledge.lessons[4].facts.some(x=>x[1].includes('5%')));
assert(knowledge.lessons[5].facts.some(x=>x[1].includes('Hotel Act')));
assert(knowledgeUi.includes('kb-step-title'));
assert(knowledgeUi.includes('l.number'));
console.log('OK: four new transcript lessons, eight correctly numbered videos, 27 quizzes, offline cache');
