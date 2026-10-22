(function(){
"use strict";
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let progress={};
try{progress=JSON.parse(localStorage.getItem("phuket-knowledge-progress-v1")||"{}")||{}}catch{}
function save(){try{localStorage.setItem("phuket-knowledge-progress-v1",JSON.stringify(progress))}catch{}}
function renderList(container){
 const k=window.PhuketKnowledge;
 container.innerHTML='<h2>База знаний · Таиланд</h2>'+
 '<p class="kb-notice">'+escapeHtml(k.sourceNote)+'</p>'+
 '<p class="muted">Шаг 1: «ЗАКОНОДАТЕЛЬСТВО и ПХУКЕТ». Официальные источники проверены: '+escapeHtml(k.checkedOn)+'.</p>'+
 k.lessons.map((l,i)=>'<article class="kb-card"><div class="category">Урок '+(i+1)+' · '+l.quiz.length+' вопроса</div><h3>'+escapeHtml(l.title)+'</h3>'+
 '<p>'+escapeHtml(l.summary)+'</p><p class="kb-video-status">Видео: расшифровка пока недоступна'+(progress[i]!==undefined?' · Лучший результат: '+progress[i]+'/'+l.quiz.length:' · Тест не пройден')+'</p>'+
 '<div class="actions"><button class="primary" data-kb-lesson="'+i+'">Изучить и проверить себя</button><a class="kb-video-link" href="'+escapeHtml(l.video)+'" target="_blank" rel="noopener noreferrer">Смотреть видео ↗</a></div></article>').join("");
 container.querySelectorAll("[data-kb-lesson]").forEach(b=>b.onclick=()=>renderDetail(container,Number(b.dataset.kbLesson)));
}
function renderDetail(container,i){
 const l=window.PhuketKnowledge.lessons[i];if(!l){renderList(container);return}
 const answered=new Set();let correct=0;
 container.innerHTML='<button id="kb-back">← К базе знаний</button><article class="kb-card"><div class="category">Урок '+(i+1)+' · Независимая справка</div><h2>'+escapeHtml(l.title)+'</h2>'+
 '<p class="kb-notice">Это не расшифровка видеоролика. Сведения получены из опубликованных официальных источников. Перед сделкой необходима проверка действующих правил и документов независимым специалистом в Таиланде.</p>'+
 '<a class="kb-video-link" href="'+escapeHtml(l.video)+'" target="_blank" rel="noopener noreferrer">Открыть видео на YouTube ↗</a>'+
 '<p>'+escapeHtml(l.summary)+'</p>'+
 l.facts.map(f=>'<section class="kb-fact"><h3>'+escapeHtml(f[0])+'</h3><p>'+escapeHtml(f[1])+'</p></section>').join("")+
 '<section class="kb-speech"><div class="category">Как объяснить клиенту</div><p>'+escapeHtml(l.broker)+'</p></section>'+
 '<h3>Официальные источники</h3><ul>'+l.sources.map(x=>'<li><a href="'+escapeHtml(x[1])+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(x[0])+' ↗</a></li>').join("")+'</ul>'+
 '<h3>Проверь знания</h3>'+
 l.quiz.map((q,j)=>'<section class="kb-question" data-kb-question="'+j+'"><div class="category">Вопрос '+(j+1)+' из '+l.quiz.length+'</div><p><strong>'+escapeHtml(q[0])+'</strong></p>'+
 q[1].map((a,n)=>'<button class="kb-answer" data-kb-answer="'+j+'-'+n+'">'+escapeHtml(a)+'</button>').join("")+
 '<p class="kb-feedback" id="kb-feedback-'+j+'" aria-live="polite"></p></section>').join("")+
 '<p class="kb-final" id="kb-final" aria-live="polite"></p></article>';
 container.querySelector("#kb-back").onclick=()=>renderList(container);
 container.querySelectorAll("[data-kb-answer]").forEach(b=>b.onclick=()=>{
   const [j,n]=b.dataset.kbAnswer.split("-").map(Number);
   if(answered.has(j))return;
   answered.add(j);
   const q=l.quiz[j],ok=n===q[2];if(ok)correct++;
   const group=container.querySelector('[data-kb-question="'+j+'"]');
   group.querySelectorAll("button").forEach(x=>{x.disabled=true;x.classList.toggle("kb-correct",Number(x.dataset.kbAnswer.split("-")[1])===q[2])});
   const feedback=container.querySelector("#kb-feedback-"+j);
   feedback.textContent=(ok?"Верно. ":"Правильный ответ: "+q[1][q[2]]+". ")+q[3];
   feedback.classList.add(ok?"kb-good":"kb-review");
   if(answered.size===l.quiz.length){
      progress[i]=Math.max(correct,Number(progress[i])||0);save();
      container.querySelector("#kb-final").textContent="Результат: "+correct+" из "+l.quiz.length+". Лучший результат сохранён на устройстве.";
   }
 });
}
window.PhuketKnowledgeUI={renderList,renderDetail};
})();