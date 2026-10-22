(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const RESULTS='phuket-smm-results-v1',NOTES='phuket-smm-notes-v1';
function load(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch{return {}}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}
function renderList(container){
const course=window.PhuketSMM,progress=load(RESULTS);
container.innerHTML='<h2>SMM · Продвижение брокера</h2><p class="kb-notice">'+esc(course.sourceNote)+'</p><p class="muted">Шесть шагов, домашние задания с сохранением на устройстве и интерактивные тесты. Курс размещён отдельно от юридической базы недвижимости.</p>'+
course.lessons.map((l,i)=>'<article class="kb-card"><div class="category">SMM · Шаг '+l.step+' · '+l.quiz.length+' вопроса</div><h3>'+esc(l.title)+'</h3><p>'+esc(l.summary)+'</p><p class="kb-video-status">'+(l.videoAnalyzed?'Конспект по субтитрам':'Практический материал по теме (не дословный пересказ)')+(progress[i]!==undefined?' · Лучший результат: '+progress[i]+'/'+l.quiz.length:' · Тест ещё не пройден')+'</p><div class="actions"><button class="primary" data-smm-open="'+i+'">Изучить и выполнить задание</button><a class="kb-video-link" target="_blank" rel="noopener noreferrer" href="'+esc(l.video)+'">Смотреть шаг '+l.step+' ↗</a></div></article>').join('');
container.querySelectorAll('[data-smm-open]').forEach(b=>b.onclick=()=>renderDetail(container,Number(b.dataset.smmOpen)));
}
function renderDetail(container,i){
const l=window.PhuketSMM.lessons[i];if(!l){renderList(container);return}
const completed=new Set();let correct=0,notes=load(NOTES),text=notes[i]??l.template;
container.innerHTML='<button id="smm-back">← К курсу SMM</button><article class="kb-card"><div class="category">SMM · Шаг '+l.step+'</div><h2>'+esc(l.title)+'</h2><p class="kb-notice">'+esc(l.videoAnalyzed?'Материал составлен по русским субтитрам видео; выводы и кейсы преподавателя не являются гарантией результатов.':'Самостоятельное учебное пособие по названию шага. Не приписывайте изложенные рекомендации автору ролика без сверки с видео.')+'</p><a class="kb-video-link" target="_blank" rel="noopener noreferrer" href="'+esc(l.video)+'">Смотреть исходный урок на YouTube ↗</a><p>'+esc(l.summary)+'</p>'+
l.facts.map(f=>'<section class="kb-fact"><h3>'+esc(f[0])+'</h3><p>'+esc(f[1])+'</p></section>').join('')+
'<section class="smm-task"><h3>Практическое задание</h3><ol>'+l.tasks.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol><label for="smm-work">Ваши ответы и план действий</label><textarea id="smm-work" rows="9" placeholder="Запишите свой план...">'+esc(text)+'</textarea><div class="actions"><button id="smm-save" class="primary">Сохранить задание</button><span id="smm-save-state" aria-live="polite"></span></div><p class="muted">Ваши заметки хранятся только в браузере этого устройства. Они не отправляются на сервер.</p></section>'+
'<h3>Проверьте знания</h3>'+l.quiz.map((q,j)=>'<section class="kb-question" data-smm-q="'+j+'"><div class="category">Вопрос '+(j+1)+' из '+l.quiz.length+'</div><p><strong>'+esc(q[0])+'</strong></p>'+q[1].map((a,k)=>'<button class="kb-answer" data-smm-choice="'+j+'-'+k+'">'+esc(a)+'</button>').join('')+'<p class="kb-feedback" id="smm-feedback-'+j+'" aria-live="polite"></p></section>').join('')+'<p class="kb-final" id="smm-final" aria-live="polite"></p></article>';
container.querySelector('#smm-back').onclick=()=>renderList(container);
container.querySelector('#smm-save').onclick=()=>{notes=load(NOTES);notes[i]=container.querySelector('#smm-work').value;container.querySelector('#smm-save-state').textContent=save(NOTES,notes)?'Задание сохранено на устройстве':'Не удалось сохранить — проверьте настройки браузера'};
container.querySelectorAll('[data-smm-choice]').forEach(b=>b.onclick=()=>{
 const [j,k]=b.dataset.smmChoice.split('-').map(Number);if(completed.has(j))return;
 completed.add(j);const q=l.quiz[j],ok=k===q[2];if(ok)correct++;
 const group=container.querySelector('[data-smm-q="'+j+'"]');
 group.querySelectorAll('button').forEach(btn=>{btn.disabled=true;btn.classList.toggle('kb-correct',Number(btn.dataset.smmChoice.split('-')[1])===q[2])});
 const fb=container.querySelector('#smm-feedback-'+j);fb.textContent=(ok?'Верно. ':'Правильный ответ: '+q[1][q[2]]+'. ')+q[3];fb.classList.add(ok?'kb-good':'kb-review');
 if(completed.size===l.quiz.length){const p=load(RESULTS);p[i]=Math.max(correct,Number(p[i])||0);const saved=save(RESULTS,p);container.querySelector('#smm-final').textContent='Результат: '+correct+' из '+l.quiz.length+(saved?'. Лучший результат сохранён на устройстве.':'. Не удалось сохранить результат.')}
});
}
window.PhuketSMMUI={renderList,renderDetail};
})();