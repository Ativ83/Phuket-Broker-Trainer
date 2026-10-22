(function(){
const guides={
 goal:{title:'Выяснить цель покупки',hint:'Спросите, зачем клиенту недвижимость и как он будет её использовать.',phrase:'Для чего рассматриваете покупку: для жизни, отдыха или получения дохода?',pattern:/для чего|цель|зачем|инвестиц|сдава|прожива|отдых|переезд/},
 budget:{title:'Уточнить бюджет',hint:'Уточните комфортный диапазон и включены ли сопутствующие расходы.',phrase:'Какой общий бюджет комфортен с учётом оформления и содержания?',pattern:/бюджет|сумм|стоимост|ценов|сколько.*(готов|рассчитыва)/},
 area:{title:'Выявить требования к району',hint:'Спросите про образ жизни, инфраструктуру и транспорт.',phrase:'Что для вас важнее при выборе района: пляж, школы, тишина или аренда?',pattern:/район|локац|пляж|школ|инфраструктур|транспорт/},
 term:{title:'Уточнить сроки',hint:'Узнайте, когда клиент планирует принять решение.',phrase:'Когда вы планируете покупку и что должно произойти до решения?',pattern:/срок|когда.*(покуп|решен|планиру)|как скоро/},
 risk:{title:'Выявить сомнения',hint:'Дайте клиенту возможность назвать риски и не обесценивайте их.',phrase:'Что вызывает у вас больше всего вопросов или опасений при покупке?',pattern:/риск|опасен|беспоко|смуща|сомнен|довер|пережива/}
};
const safe={hint:'Сначала уточните задачу клиента, затем предложите проверяемый следующий шаг.',phrase:'Чтобы предложить подходящий вариант, уточню вашу цель, бюджет и основные требования.'};
function next(state){return Object.keys(guides).find(k=>!state.facts[k])||'risk'}
function guidance(state){const key=next(state);return {key,...(guides[key]||safe)}}
function evaluate(text,state){
 const value=String(text||'').toLowerCase().replace(/ё/g,'е');
 const found=Object.entries(guides).filter(([k,g])=>g.pattern.test(value)).map(([k])=>k);
 const question=/\?/.test(value)||/^(скажите|подскажите|расскажите|уточните)/.test(value);
 const pressure=/срочно|последн(ий|яя) шанс|гарантирую|точно заработаете|без риск|100\s*%/i.test(value);
 const score=Math.max(0,Math.min(100,25+(question?30:0)+(found.length?30:0)+(value.length>=45?15:0)-(pressure?45:0)));
 const feedback=[];
 if(question)feedback.push('Есть уточняющий вопрос — это помогает выявить потребность.');else feedback.push('Добавьте открытый вопрос клиенту.');
 if(found.length)feedback.push('Вы затронули: '+found.map(k=>guides[k].title.toLowerCase()).join(', ')+'.');else feedback.push('Уточните цель, бюджет, район, сроки или опасения.');
 if(pressure)feedback.push('Не обещайте неподтверждённые условия; уверенно предложите следующий конкретный шаг.');
 if(value.length<45)feedback.push('Ответ можно сделать конкретнее.');
 return {score,feedback,found,pressure};
}
window.PhuketCoach={guides,guidance,evaluate};
})();