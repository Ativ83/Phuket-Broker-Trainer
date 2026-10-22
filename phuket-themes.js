(function(){
"use strict";
const KEY="phuket-trainer-appearance-v1";
const themes=[
 {id:"classic",name:"Classic Dark",label:"Привычный строгий стиль",caption:"Максимальная концентрация",tagline:"Тренируйте навыки. Заключайте уверенные сделки."},
 {id:"thai",name:"Thai Paradise",label:"Пхукет · мечта · новые возможности",caption:"Пальмы, острова, бирюзовое море и золотой свет",tagline:"Каждая тренировка — шаг к мечте о Пхукете."},
 {id:"ocean",name:"Business Ocean",label:"Премиальный деловой океан",caption:"Глубокий синий, бирюза, уверенность",tagline:"Знания превращаются в уверенные решения."},
 {id:"sunset",name:"Sunset Gold",label:"Золотой час на берегу",caption:"Тёплый закат, бронза, вдохновение",tagline:"Большие цели начинаются с ежедневного шага."}
];
function normalize(value){
 const theme=themes.some(t=>t.id===value?.theme)?value.theme:"classic";
 return {theme:theme,scenic:value?.scenic===false?false:true};
}
function getPreferences(){
 try{return normalize(JSON.parse(localStorage.getItem(KEY)||"null"))}catch{return normalize(null)}
}
let current=getPreferences();
function apply(prefs){
 current=normalize(prefs);
 if(typeof document!=="undefined"&&document.documentElement){
 document.documentElement.setAttribute("data-theme",current.theme);
 document.documentElement.setAttribute("data-scenic",String(current.scenic));
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta){meta.setAttribute("content",{classic:"#151c28",thai:"#0c3946",ocean:"#102b46",sunset:"#422d3f"}[current.theme]);}
 const tagline=document.getElementById("hero-theme-tagline");
 if(tagline)tagline.textContent=themes.find(t=>t.id===current.theme).tagline;
 }
 return {...current};
}
function store(){
 try{localStorage.setItem(KEY,JSON.stringify(current));return true}catch{return false}
}
function setTheme(name){if(!themes.some(t=>t.id===name))return {...current};apply({theme:name,scenic:current.scenic});store();return {...current}}
function setScenic(value){apply({theme:current.theme,scenic:Boolean(value)});store();return {...current}}
function escapeHtml(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderPicker(container){
 if(!container)return;
 const p=getPreferences();current=p;apply(p);
 container.innerHTML='<section class="themes-screen"><div class="theme-intro"><span class="category">ОФОРМЛЕНИЕ · ЛИЧНЫЙ ВЫБОР</span><h2>Выбери атмосферу тренировки</h2><p>От закатного побережья Таиланда до сдержанного делового оформления. Тема сохраняется на этом устройстве и не влияет на прогресс обучения.</p></div><div class="theme-picker-grid">'+
 themes.map(t=>'<button type="button" class="theme-option'+(p.theme===t.id?' is-selected':'')+'" data-theme-pick="'+t.id+'" aria-pressed="'+(p.theme===t.id)+'"><span class="theme-preview theme-preview-'+t.id+'" aria-hidden="true"><span class="theme-preview-head"></span><span class="theme-preview-card"><span></span><span></span><span></span></span></span><span class="theme-option-text"><strong>'+escapeHtml(t.name)+'</strong><span>'+escapeHtml(t.label)+'</span><small>'+escapeHtml(t.caption)+'</small></span><span class="theme-selection">'+(p.theme===t.id?'✓ Выбрано':'Выбрать')+'</span></button>').join('')+'</div>'+
 '<div class="theme-setting-panel"><h3>Атмосферный фон</h3><p>Островной пейзаж для Thai Paradise и мягкий свет для остальных тем. Если хочется сосредоточиться только на тексте, выключи декоративный фон — цвета и кнопки останутся.</p><div class="theme-setting-actions"><button type="button" data-scenic-pick="true" class="'+(p.scenic?'primary':'')+'" aria-pressed="'+p.scenic+'">С фоном</button><button type="button" data-scenic-pick="false" class="'+(!p.scenic?'primary':'')+'" aria-pressed="'+(!p.scenic)+'">Без фона</button></div><p class="muted">Оформление можно изменить в любой момент через кнопку «Скины».</p></div></section>';
 container.querySelectorAll('[data-theme-pick]').forEach(b=>b.addEventListener("click",()=>{setTheme(b.dataset.themePick);renderPicker(container)}));
 container.querySelectorAll('[data-scenic-pick]').forEach(b=>b.addEventListener("click",()=>{setScenic(b.dataset.scenicPick==="true");renderPicker(container)}));
}
window.PhuketThemes={themes,getPreferences,applySaved:()=>apply(getPreferences()),setTheme,setScenic,renderPicker,storageKey:KEY};
apply(current);
})();