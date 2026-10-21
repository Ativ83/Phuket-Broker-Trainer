(function(){
const roots=[
 {id:'first',title:'Первый контакт',client:'Здравствуйте. Я смотрю недвижимость на Пхукете, но пока не знаю, с чего начать.',choices:[
 ['Выявить цель','Для чего рассматриваете покупку — для жизни, отдыха или инвестиций?','goal',3],
 ['Сразу продавать','У меня есть отличная квартира, давайте бронировать!','push',-2],
 ['Спросить бюджет','В каком бюджете рассматриваете покупку?','budget',1],
 ['Предложить созвон','Давайте назначим презентацию прямо сейчас.','early',-1]]},
 {id:'invest',title:'Инвестиционный покупатель',client:'Я хочу вложить деньги. Но мне обещали 12% годовых. Вы тоже гарантируете?',choices:[
 ['Проверить расчёты','Давайте сравним чистый доход с учётом расходов, простоев и налогов.','returns',3],
 ['Пообещать доход','Конечно, 12% гарантированы!','push',-3],
 ['Уточнить горизонт','На какой срок вы планируете инвестицию?','term',2],
 ['Сменить тему','Лучше сразу посмотрим красивые фотографии.','distrust',-2]]},
 {id:'family',title:'Переезд с семьёй',client:'Переезжаем с детьми. Какой район лучше выбрать?',choices:[
 ['Выяснить потребности','Сколько лет детям и какие школы вы рассматриваете?','family',3],
 ['Назвать район','Банг Тао точно лучший район для всех.','distrust',-1],
 ['Спросить бюджет','Какой бюджет с учётом расходов вам комфортен?','budget',2],
 ['Предложить осмотр','Давайте сначала посмотрим 2–3 объекта.','early',0]]},
 {id:'skeptic',title:'Недоверчивый покупатель',client:'Я уже общался с агентами. Все обещают одно и то же. Почему вам доверять?',choices:[
 ['Признать сомнения','Предлагаю проверять цифры и документы независимо. Что вызывает больше всего вопросов?','risk',3],
 ['Надавить','Нужно решать сегодня, завтра будет дороже.','push',-3],
 ['Показать проверку','Могу подготовить документы и независимую юридическую проверку.','legal',2],
 ['Предложить скидку','У нас самые большие скидки!','distrust',-2]]}
];
const nodes={
 goal:{client:'Мне важна инвестиция, но иногда буду приезжать сам. Что посоветуете?',choices:[['Уточнить приоритет','Что важнее: аренда или личный отдых?','area',3],['Назвать доходность','У нас гарантированный доход!','push',-3],['Спросить бюджет','Какой общий бюджет рассматриваете?','budget',2]]},
 budget:{client:'Около 10 миллионов рублей. Но дополнительные расходы меня беспокоят.',choices:[['Обсудить полную цену','Подготовлю расчёт покупки, оформления и содержания.','costs',3],['Предложить дороже','Лучше сразу увеличить бюджет вдвое.','distrust',-2],['Выявить цель','Для чего вы планируете использовать объект?','goal',2]]},
 returns:{client:'Хорошо. А что будет, если квартира простаивает несколько месяцев?',choices:[['Показать сценарии','Сравним оптимистичный, базовый и осторожный сценарии.','costs',3],['Обещать загрузку','Простоев точно не будет.','push',-3],['Уточнить горизонт','На какой срок вы инвестируете?','term',2]]},
 term:{client:'Я могу ждать полгода. Но мне важно не потерять деньги.',choices:[['Выявить риск','Какие риски для вас наиболее существенны?','risk',3],['Предложить проверку','Сначала проверим документы и условия платежей.','legal',2],['Поторопить','Тогда нужно срочно вносить депозит.','push',-2]]},
 family:{client:'Детям 8 и 12 лет. Нужна школа и удобная дорога.',choices:[['Сравнить логистику','Сопоставим школы и реальное время в пути из районов.','area',3],['Назвать район','В любом районе будет удобно.','distrust',-2],['Спросить бюджет','Какой общий бюджет семьи?','budget',2]]},
 area:{client:'Хочу понять разницу между Банг Тао, Камалой и Раваи.',choices:[['Сравнить по критериям','Сравним районы по школе, пляжу, дороге и аренде под вашу цель.','selection',3],['Выбрать без анализа','Любой район одинаково хорош.','distrust',-2],['Уточнить цель','Для проживания или сдачи вы выбираете?','goal',1]]},
 risk:{client:'Я боюсь скрытых платежей и проблем с документами.',choices:[['Независимая проверка','Проверим договор, сборы и юридическую схему с независимым юристом.','legal',3],['Отмахнуться','Это мелочи, не переживайте.','distrust',-2],['Спросить бюджет','Давайте сначала уточним общий бюджет.','budget',1]]},
 legal:{client:'Кто будет проверять документы? И что я получу до оплаты?',choices:[['Дать план проверки','Согласуем перечень документов и независимого тайского юриста до оплаты.','selection',3],['Попросить депозит','Сначала внесите депозит, потом разберёмся.','push',-3],['Уточнить объект','Вы уже выбрали кондоминиум или виллу?','area',1]]},
 costs:{client:'Хорошо. А можно увидеть расчёт на конкретном объекте?',choices:[['Согласовать подборку','Да, подготовлю 2–3 варианта с расходами и ограничениями.','selection',3],['Назвать пример без данных','Прибыль точно будет большой.','distrust',-2],['Уточнить приоритет','Что важнее: цена, ликвидность или аренда?','area',2]]},
 early:{client:'Я пока не готов к встрече. Вы даже не знаете моих требований.',choices:[['Вернуться к потребности','Согласен. Сначала уточню вашу цель покупки.','goal',2],['Продолжить давить','Встречу нужно назначить прямо сейчас.','push',-2],['Уважить решение','Когда будет удобно обсудить вашу задачу?','term',1]]},
 distrust:{client:'Похоже, вы не слышите, что для меня важно.',choices:[['Признать ошибку','Вы правы, я поспешил. Что для вас самое важное?','goal',2],['Спорить','Нет, вы просто не понимаете рынок.','push',-3],['Уточнить опасения','Что вызвало недоверие?','risk',2]]},
 push:{client:'Мне не нравится давление. Думаю, разговор лучше закончить.',choices:[['Извиниться','Извините, я поспешил. Давайте вернёмся к вашим критериям.','risk',1],['Настаивать','Предложение сгорит через час!','end_bad',-3],['Уважить отказ','Понимаю. Не буду беспокоить без вашего согласия.','end_neutral',1]]},
 selection:{client:'Это уже интересно. Какой следующий шаг?',choices:[['Согласовать проверку','Подготовлю сравнительную подборку и список документов для проверки.','end_good',3],['Попросить оплату','Переведите депозит сейчас.','push',-3],['Назначить встречу','Когда удобно обсудить 2–3 подходящих варианта?','end_good',2]]},
 end_good:{client:'Договорились. Жду подборку и список документов.',choices:[]},
 end_neutral:{client:'Хорошо, спасибо. Возможно, вернусь позже.',choices:[]},
 end_bad:{client:'Нет, спасибо. Я прекращаю разговор.',choices:[]}
};
function create(root='first',difficulty='normal',variant=0){return {root:roots.some(x=>x.id===root)?root:'first',node:root,score:0,trust:difficulty==='hard'?35:50,difficulty:difficulty==='hard'?'hard':'normal',variant:Number.isInteger(variant)?Math.abs(variant)%3:0,history:[],visited:[root],memory:{topics:[],pressure:0,assurances:0}}}
function get(id){return roots.find(x=>x.id===id)||nodes[id]}
function memoryOf(state){
 const m=state.memory&&Array.isArray(state.memory.topics)?state.memory:{topics:[],pressure:0,assurances:0};
 return {topics:m.topics.slice(),pressure:m.pressure||0,assurances:m.assurances||0};
}
function view(state){
 const base=get(state.node);if(!base)return null;
 const m=memoryOf(state),visited=state.visited||[],v=state.variant||0;
 let prefix='';
 if(state.history.length&&state.node!=='end_bad'&&state.node!=='end_good'&&state.node!=='end_neutral'){
  if(m.pressure>=2)prefix='Вы уже несколько раз торопили меня. Мне нужны факты, а не давление. ';
  else if(visited.filter(x=>x===state.node).length>1)prefix='Мы уже обсуждали этот вопрос. Давайте двигаться дальше. ';
  else if(state.trust<35)prefix='Пока я не очень вам доверяю. ';
  else if(m.assurances>=2&&state.node==='selection')prefix='Вы внимательно разобрались в моих сомнениях. ';
  else if(v===1)prefix='Уточню ещё один момент. ';
  else if(v===2)prefix='Для меня это действительно важно. ';
 }
 return {client:prefix+base.client,choices:base.choices};
}
function step(state,index){const node=get(state.node);if(!node||!node.choices[index])throw Error('Invalid branch choice');const choice=node.choices[index];const trustBefore=state.trust;state.score+=choice[3];state.trust=Math.max(0,Math.min(100,state.trust+choice[3]*(state.difficulty==='hard'&&choice[3]<0?15:10)));const m=memoryOf(state);const topic=choice[2];if(!m.topics.includes(topic))m.topics.push(topic);if(choice[3]<0)m.pressure++;if(choice[3]>=2)m.assurances++;state.memory=m;
 const from=state.node;state.history.push({from,choice:index,label:choice[0],delta:choice[3],trust:state.trust,to:choice[2]});state.node=choice[2];
 if(state.node==='end_good'&&trustBefore<40)state.node='distrust';if(state.trust<=10&&state.node!=='end_good'&&state.node!=='end_neutral')state.node='end_bad';state.visited.push(state.node);return get(state.node)}
function summary(state){const p=progress(state);const positives=state.history.filter(h=>h.delta>0).length;const mistakes=state.history.filter(h=>h.delta<0).length;return {outcome:state.node==='end_good'?'Успешный следующий шаг':state.node==='end_bad'?'Клиент потерян':state.node==='end_neutral'?'Контакт сохранён': 'Переговоры продолжаются',positives,mistakes,tip:mistakes?'Обратите внимание на шаги с отрицательной оценкой: избегайте давления и проверяйте потребности.':'Продолжайте уточнять критерии и подтверждать следующий шаг.'}}
function progress(state){return {turns:state.history.length,score:state.score,trust:state.trust,unique:new Set(state.visited).size,complete:get(state.node).choices.length===0,topics:memoryOf(state).topics.length}}
function advice(id,index){
 const node=get(id),choice=node&&node.choices[index];if(!choice)return '';
 const delta=choice[3],to=choice[2];
 if(delta>=3)return 'Вы уточняете потребности или предлагаете проверяемый следующий шаг. Это укрепляет доверие клиента.';
 if(delta>=1)return 'Допустимый ход: разговор продолжается, но можно глубже выяснить потребности.';
 if(to==='push')return 'Давление и неподтверждённые гарантии повышают риск потерять клиента.';
 if(to==='distrust')return 'Ответ не учитывает запрос клиента. Лучше признать сомнения и задать уточняющий вопрос.';
 return 'Клиенту пока не хватает понимания вашей пользы. Сначала уточните его задачу.';
}
function best(id){const node=get(id);if(!node||!node.choices.length)return [];const max=Math.max(...node.choices.map(c=>c[3]));return node.choices.map((c,i)=>c[3]===max?i:-1).filter(i=>i>=0)}
window.PhuketBranches={roots,nodes,get,view,memoryOf,create,step,progress,summary,advice,best};
})();