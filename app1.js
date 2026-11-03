const GOAL = 90;
/* Два тренировочных дня в чередовании. К каждому упражнению — запасные варианты, если основной тренажер занят. */
const DAYS = [
  {id:'A', name:'День 1', sub:'Присед · жим под наклоном · руки', ex:[
    {id:'squat',num:'1',name:'Присед со штангой',muscle:'Ноги, ягодицы',sets:3,reps:[6,8],rest:'2–3 мин',restSec:150,type:'bar',base:true,
     alts:[{id:'hack',name:'Гакк-присед',type:'mach'},{id:'legpress',name:'Жим ногами',type:'mach'}]},
    {id:'incpress',num:'2',name:'Жим гантелей под наклоном',muscle:'Верх груди, трицепс',sets:3,reps:[8,10],rest:'2 мин',restSec:120,type:'db',base:true,
     alts:[{id:'incbar',name:'Жим штанги под наклоном',type:'bar'},{id:'inchammer',name:'Жим под наклоном в хаммере',type:'mach'}]},
    {id:'legext',num:'3',name:'Разгибание ног сидя',muscle:'Квадрицепс',sets:3,reps:[12,15],rest:'90 с',restSec:90,type:'mach',
     alts:[{id:'legext1',name:'Разгибание по одной ноге',type:'mach'},{id:'sissy',name:'Сисси-присед в тренажере',type:'mach'}]},
    {id:'pulldown',num:'4',name:'Тяга верхнего блока',muscle:'Широчайшие',sets:3,reps:[8,12],rest:'90 с',restSec:90,type:'mach',
     alts:[{id:'gravitron',name:'Подтягивания в гравитроне',type:'assist'},{id:'hammerpull',name:'Тяга сверху в рычажном тренажере',type:'mach'}]},
    {id:'barcurl',num:'5',name:'Подъем штанги на бицепс',muscle:'Бицепс',sets:2,reps:[10,12],rest:'90 с',restSec:90,type:'bar',
     alts:[{id:'machcurl',name:'Сгибание рук в тренажере',type:'mach'},{id:'dbcurl',name:'Сгибание с гантелями',type:'db'}]},
    {id:'dboh',num:'6',name:'Жим гантели за головой',muscle:'Трицепс',sets:2,reps:[10,15],rest:'90 с',restSec:90,type:'db',
     alts:[{id:'ohext',name:'Разгибание из-за головы на блоке',type:'mach'},{id:'french',name:'Французский жим лежа',type:'bar'}]},
  ]},
  {id:'B', name:'День 2', sub:'Жим лежа · мертвая тяга · руки', ex:[
    {id:'bench',num:'1',name:'Жим штанги лежа',muscle:'Грудь, трицепс',sets:3,reps:[6,8],rest:'2–3 мин',restSec:150,type:'bar',base:true,
     alts:[{id:'dbbench',name:'Жим гантелей лежа',type:'db'},{id:'hammerchest',name:'Жим от груди в хаммере',type:'mach'}]},
    {id:'deadlift',num:'2',name:'Мертвая тяга',muscle:'Спина, задняя поверхность',sets:3,reps:[6,8],rest:'2–3 мин',restSec:150,type:'bar',base:true,
     alts:[{id:'rdl',name:'Румынская тяга со штангой',type:'bar'},{id:'smithdl',name:'Мертвая тяга в Смите',type:'bar'}]},
    {id:'fly',num:'3',name:'Бабочка в тренажере',muscle:'Грудь',sets:2,reps:[12,15],rest:'90 с',restSec:90,type:'mach',
     alts:[{id:'dbfly',name:'Разводка гантелей лежа',type:'db'},{id:'crossover',name:'Кроссовер через блоки',type:'mach'}]},
    {id:'row',num:'4',name:'Тяга блока к поясу сидя',muscle:'Середина спины',sets:3,reps:[10,12],rest:'90 с',restSec:90,type:'mach',
     alts:[{id:'hammerrow',name:'Тяга в рычажном тренажере с упором',type:'mach'},{id:'dbrow',name:'Тяга гантели одной рукой',type:'db'}]},
    {id:'hammer',num:'5',name:'Молотки на бицепс',muscle:'Бицепс, предплечье',sets:2,reps:[10,12],rest:'90 с',restSec:90,type:'db',
     alts:[{id:'cablehammer',name:'Молотки на нижнем блоке',type:'mach'},{id:'scott',name:'Сгибание на скамье Скотта',type:'mach'}]},
    {id:'ropepush',num:'6',name:'Разгибание рук с канатом',muscle:'Трицепс',sets:2,reps:[10,15],rest:'90 с',restSec:90,type:'mach',
     alts:[{id:'barpushdown',name:'Разгибание с прямой рукоятью',type:'mach'},{id:'ohpush',name:'Разгибание из-за головы на блоке',type:'mach'}]},
  ]},
];
const STEP = {bar:'+2,5–5 кг', db:'+1–2 кг на гантель', mach:'+1 плитка', assist:'−1 плитка противовеса'};
const WD = ['вс','пн','вт','ср','чт','пт','сб'];
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

const S = {sessions:{}, tab:'log', date:todayStr(), draft:null, dirty:false, db:null, mode:'loading', confirmDel:null, editing:false, confirmFinish:false, lastAuto:todayStr(), cal:todayStr().slice(0,7)};

function todayStr(d=new Date()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function parseD(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function dmy(s){const d=parseD(s);return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')}
function wd(s){return WD[parseD(s).getDay()]}
function days(a,b){return Math.round((parseD(b)-parseD(a))/864e5)}
function fmt(n){return n==null||n===''?'':String(Math.round(n*100)/100).replace('.',',')}
function num(v){if(v==null)return null;const s=String(v).trim().replace(',','.');if(s==='')return null;const n=parseFloat(s);return isFinite(n)?n:null}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function clone(o){return JSON.parse(JSON.stringify(o))}
function variant(ex,v){return v&&v!=='main'?(ex.alts.find(a=>a.id===v)||{id:'main',name:ex.name,type:ex.type}):{id:'main',name:ex.name,type:ex.type}}
function filled(set){return set&&(set.w!=null||set.r!=null)}
function hasContent(s){return s&&(s.bodyweight!=null||Object.values(s.ex||{}).some(e=>(e.sets||[]).some(filled)))}
function sortedDates(){return Object.keys(S.sessions).filter(k=>hasContent(S.sessions[k])).sort()}
function mmss(sec){const m=Math.floor(sec/60),s=sec%60;return m+':'+String(s).padStart(2,'0')}

/* ---------- дни программы ---------- */
function allEx(){return DAYS.flatMap(d=>d.ex)}
function dayById(id){return DAYS.find(d=>d.id===id)||DAYS[0]}
function dayOf(s){if(s&&s.day&&DAYS.some(d=>d.id===s.day))return dayById(s.day);
  let best=DAYS[0],bn=-1;
  for(const d of DAYS){const n=d.ex.filter(p=>s&&s.ex&&s.ex[p.id]).length;if(n>bn){bn=n;best=d}}
  return best}
function curDay(){return dayOf(S.draft)}
function nextDay(){const ds=sortedDates();if(!ds.length)return DAYS[0];
  return dayOf(S.sessions[ds[ds.length-1]]).id==='A'?DAYS[1]:DAYS[0]}

function weekInfo(date){
  const ds=sortedDates(); const first=ds.length&&ds[0]<date?ds[0]:date;
  const idx=Math.floor(Math.max(0,days(first,date))/7)+1; const cyc=((idx-1)%8)+1;
  let ph;
  if(cyc<=2) ph={cls:'intro',name:'втягивание',hint:'2 подхода, 3 повтора в запасе, отрабатываем технику'};
  else if(cyc===8) ph={cls:'deload',name:'разгрузка',hint:'половина подходов, веса на 30–40% ниже'};
  else ph={cls:'',name:'основная работа',hint:'1–2 повтора в запасе, последний подход в тренажере можно до отказа'};
  return {idx,cyc,ph};
}
function planSets(ex,cyc){if(cyc<=2)return 2;if(cyc===8)return Math.max(1,Math.ceil(ex.sets/2));return ex.sets}

function lastFor(id,v,before){
  const ds=sortedDates().filter(d=>d<before).reverse();
  for(const d of ds){const e=S.sessions[d].ex?.[id];if(e&&(e.v||'main')===(v||'main')){const sets=(e.sets||[]).filter(filled);if(sets.length)return {date:d,sets}}}
  return null;
}
function lastBw(before){const ds=sortedDates().filter(d=>d<before).reverse();for(const d of ds){if(S.sessions[d].bodyweight!=null)return S.sessions[d].bodyweight}return null}

function loadDraft(){const s=S.sessions[S.date];S.draft=s?clone(s):{date:S.date,day:nextDay().id,bodyweight:null,note:'',ex:{}};S.draft.ex=S.draft.ex||{};if(!S.draft.day)S.draft.day=dayOf(S.draft).id}
function exOf(id){return S.draft.ex[id]||(S.draft.ex[id]={v:'main',sets:[]})}
function switchDate(d){S.date=d;S.editing=false;S.confirmFinish=false;loadDraft()}
function topSet(sets){const ws=sets.filter(s=>s.w!=null);if(!ws.length)return null;return ws.reduce((a,b)=>b.w>a.w||(b.w===a.w&&(b.r||0)>(a.r||0))?b:a)}
function sessionStats(s){let ex=0,sets=0,ton=0;
  for(const p of dayOf(s).ex){const e=s.ex?.[p.id];if(!e)continue;const fs=(e.sets||[]).filter(filled);if(!fs.length)continue;ex++;sets+=fs.length;
    if(variant(p,e.v).type!=='assist')fs.forEach(x=>{if(x.w!=null&&x.r!=null)ton+=x.w*x.r})}
  return {ex,sets,ton:Math.round(ton)}}
function gains(s){const out=[];
  for(const p of dayOf(s).ex){const e=s.ex?.[p.id];if(!e)continue;const v=variant(p,e.v);const t=topSet((e.sets||[]).filter(filled));if(!t)continue;
    const last=lastFor(p.id,v.id,s.date);const lt=last?topSet(last.sets):null;if(!lt)continue;
    const better=v.type==='assist'?t.w<lt.w:(t.w>lt.w||(t.w===lt.w&&(t.r||0)>(lt.r||0)));
    if(better)out.push({name:v.name,from:lt,to:t})}
  return out}

/* ---------- сохранение ---------- */
let saveTimer=null, writing=false, again=false;
function setSave(st,msg){const el=document.getElementById('saveState');el.className='save '+st;
  el.textContent=st==='ok'?'Сохранено на телефоне':st==='pending'?'Сохраняю…':st==='err'?(msg||'Не сохранилось, проверь связь'):msg||''}
function scheduleSave(){S.dirty=true;setSave('pending');clearTimeout(saveTimer);saveTimer=setTimeout(flush,700)}
function cleanDraft(d){
  const out={date:d.date,day:dayOf(d).id,bodyweight:d.bodyweight??null,note:(d.note||'').trim(),ex:{},done:!!d.done,finishedAt:d.finishedAt||null,updatedAt:new Date().toISOString()};
  for(const [id,e] of Object.entries(d.ex||{})){const sets=(e.sets||[]).filter(filled).map(s=>({w:s.w??null,r:s.r??null}));
    if(sets.length||(e.v&&e.v!=='main'))out.ex[id]={v:e.v||'main',sets}}
  return out;
}
async function flush(){
  clearTimeout(saveTimer);
  if(writing){again=true;return}
  if(!S.dirty)return;
  writing=true; const body=cleanDraft(S.draft); const date=body.date;
  try{
    const empty=!hasContent(body)&&!body.note;
    if(!(empty&&!S.sessions[date])){
      if(S.mode==='db') await S.db.collection('sessions').doc(date).set(body);
      S.sessions[date]=body; if(S.mode!=='db') saveLocal();
    }
    S.dirty=false; setSave('ok');
  }catch(e){
    setSave('err', e&&e.code==='quota_exceeded'?'Хранилище заполнено, удали старые записи':'Не сохранилось, проверь связь');
  }
  writing=false; if(again){again=false;flush()}
}
function saveLocal(){try{localStorage.setItem('fb-sessions',JSON.stringify(S.sessions))}catch(e){}}
function loadLocal(){try{return JSON.parse(localStorage.getItem('fb-sessions')||'{}')||{}}catch(e){return {}}}

/* ---------- таймер отдыха ---------- */
const T={left:0,total:0,label:'отдых',iv:null,ringing:false};
const tBar=()=>document.getElementById('timerBar');
function tDraw(){const bar=tBar();if(!bar)return;
  document.getElementById('tTime').textContent=mmss(Math.max(0,T.left));
  document.getElementById('tLabel').textContent=T.ringing?'пора работать':T.label;
  bar.classList.toggle('ringing',T.ringing)}
function tStop(){clearInterval(T.iv);T.iv=null;T.ringing=false;const bar=tBar();if(bar)bar.hidden=true}
function tStart(sec,label){
  clearInterval(T.iv);T.ringing=false;
  T.left=sec;T.total=sec;T.label=label||'отдых';
  const bar=tBar();bar.hidden=false;tDraw();
  T.iv=setInterval(()=>{T.left--;tDraw();
    if(T.left<=0){clearInterval(T.iv);T.iv=null;T.ringing=true;T.left=0;tDraw();tSignal();
      setTimeout(()=>{if(T.ringing)tStop()},12000)}
  },1000)}
function tSignal(){
  try{navigator.vibrate&&navigator.vibrate([250,120,250,120,400])}catch(e){}
  try{const C=window.AudioContext||window.webkitAudioContext;const ctx=new C();
    [880,1175].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.value=f;o.connect(g);g.connect(ctx.destination);
      const t0=ctx.currentTime+i*0.28;
      g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(0.4,t0+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.24);
      o.start(t0);o.stop(t0+0.26)});
    setTimeout(()=>ctx.close(),900);
  }catch(e){}
}
document.getElementById('timerBar').addEventListener('click',e=>{const b=e.target.closest('button[data-tact]');if(!b)return;
  const a=b.dataset.tact;
  if(a==='stop'){tStop();return}
  if(T.ringing){T.ringing=false;tStop();return}
  if(a==='plus'){T.left+=30;tDraw();return}
  if(a==='minus'){T.left=Math.max(0,T.left-15);tDraw();if(T.left===0&&T.iv){clearInterval(T.iv);T.iv=null;T.ringing=true;tDraw();tSignal()}}});

/* ---------- графики ---------- */
function spark(vals){
  if(vals.length<2)return `<div class="spark-empty">${vals.length?'график после 2-й записи':'нет записей'}</div>`;
  const w=110,h=36,p=4;let mn=Math.min(...vals),mx=Math.max(...vals);if(mx===mn){mx+=1;mn-=1}
  const X=i=>p+i*(w-2*p)/(vals.length-1),Y=v=>p+(mx-v)*(h-2*p)/(mx-mn);
  const pts=vals.map((v,i)=>[X(i),Y(v)]);const line=pts.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
  const area='M'+pts[0][0].toFixed(1)+','+h+' L'+pts.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' L')+' L'+pts[pts.length-1][0].toFixed(1)+','+h+' Z';
  const e=pts[pts.length-1];
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Динамика рабочего веса"><path d="${area}" fill="var(--accent-soft)"/><polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" r="3" fill="var(--accent)"/></svg>`;
}
function bwChart(rows){
  if(rows.length<2)return `<p class="muted">${rows.length?'Отметь вес тела еще хотя бы раз, и здесь появится график.':'Вписывай вес тела в начале тренировки, и здесь появится график снижения к цели '+GOAL+' кг.'}</p>`;
  const W=320,H=150,L=34,R=8,T=10,B=22;const vals=rows.map(r=>r.v);
  let mn=Math.floor(Math.min(...vals,GOAL)-1),mx=Math.ceil(Math.max(...vals)+1);
  const X=i=>L+i*(W-L-R)/(rows.length-1),Y=v=>T+(mx-v)*(H-T-B)/(mx-mn);
  const pts=rows.map((r,i)=>[X(i),Y(r.v)]);const line=pts.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
  const area='M'+L+','+(H-B)+' L'+line.split(' ').join(' L')+' L'+pts[pts.length-1][0].toFixed(1)+','+(H-B)+' Z';
  const ticks=[mx,Math.round((mx+mn)/2),mn];const e=pts[pts.length-1];
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Вес тела по датам">
    ${ticks.map(t=>`<line x1="${L}" x2="${W-R}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" stroke="var(--line)" stroke-width="1"/><text x="${L-6}" y="${(Y(t)+3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--muted)" font-family="JetBrains Mono,monospace">${t}</text>`).join('')}
    <line x1="${L}" x2="${W-R}" y1="${Y(GOAL).toFixed(1)}" y2="${Y(GOAL).toFixed(1)}" stroke="var(--good)" stroke-width="1.4" stroke-dasharray="4 4"/>
    <text x="${W-R}" y="${(Y(GOAL)-5).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--good)" font-family="Golos Text,sans-serif">цель ${GOAL}</text>
    <path d="${area}" fill="var(--accent-soft)" opacity=".8"/>
    <polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" r="3.5" fill="var(--accent)"/>
    <text x="${L}" y="${H-6}" font-size="10" fill="var(--muted)" font-family="JetBrains Mono,monospace">${dmy(rows[0].d)}</text>
    <text x="${W-R}" y="${H-6}" text-anchor="end" font-size="10" fill="var(--muted)" font-family="JetBrains Mono,monospace">${dmy(rows[rows.length-1].d)}</text>
  </svg>`;
}
