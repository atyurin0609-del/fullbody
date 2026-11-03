/* ---------- экран: тренировка ---------- */
function cardHTML(ex,cyc){
  const e=S.draft.ex[ex.id]||{v:'main',sets:[]};const v=variant(ex,e.v);
  const last=lastFor(ex.id,v.id,S.date);const planned=planSets(ex,cyc);const rows=Math.max(planned,(e.sets||[]).length);
  let chip;
  if(cyc===8) chip=`<span class="chip deload">Разгрузка: вес на 30–40% ниже прошлого</span>`;
  else if(last&&last.sets.every(s=>(s.r||0)>=ex.reps[1])) chip=`<span class="chip up">Пора добавить: ${STEP[v.type]}</span>`;
  else if(last) chip=`<span class="chip">Цель: ${ex.reps[1]} повт. во всех подходах</span>`;
  else chip=`<span class="chip">Подбери вес на ${ex.reps[0]}–${ex.reps[1]} повт.</span>`;
  let sets='';
  for(let i=0;i<rows;i++){const s=(e.sets||[])[i]||{};const ls=last?.sets[i];
    sets+=`<div class="set${i>=planned?' extra':''}"><span class="n">${i+1}</span>
      <input id="w-${ex.id}-${i}" data-ex="${ex.id}" data-i="${i}" data-k="w" inputmode="decimal" aria-label="Вес, подход ${i+1}" placeholder="${ls?.w!=null?fmt(ls.w):'кг'}" value="${fmt(s.w)}">
      <span class="x">×</span>
      <input id="r-${ex.id}-${i}" data-ex="${ex.id}" data-i="${i}" data-k="r" inputmode="numeric" aria-label="Повторы, подход ${i+1}" placeholder="${ls?.r!=null?ls.r:ex.reps[0]+'–'+ex.reps[1]}" value="${fmt(s.r)}"></div>`}
  const done=(e.sets||[]).filter(filled).length>=planned;
  const unit=v.type==='assist'?'противовес, кг':'кг';
  return `<li class="card${ex.base?' base':''}${done?' done':''}">
    <div class="c-head"><span class="num">${ex.num}</span><div class="c-title"><strong>${esc(v.name)}</strong>
      <span class="c-meta"><span class="tgt">${planned}×${ex.reps[0]}–${ex.reps[1]}</span> · ${ex.muscle} · отдых ${ex.rest}</span></div></div>
    <div class="variants" role="group" aria-label="Вариант упражнения"><span class="lbl">Занято?</span>
      ${[{id:'main',name:ex.name},...ex.alts].map(a=>`<button data-act="variant" data-ex="${ex.id}" data-v="${a.id}" aria-pressed="${a.id===v.id}">${a.id==='main'?'Основное':esc(a.name)}</button>`).join('')}</div>
    ${chip}
    <div class="sets"><div class="set-h"><span>№</span><span style="text-align:center">${unit}</span><span></span><span style="text-align:center">повт.</span></div>${sets}</div>
    <div class="c-actions">
      ${last?`<button class="btn" data-act="copy" data-ex="${ex.id}">Веса как в прошлый раз</button>`:''}
      <button class="btn" data-act="addset" data-ex="${ex.id}">+ подход</button>
      ${rows>planned?`<button class="btn" data-act="delset" data-ex="${ex.id}">− подход</button>`:''}
      ${ex.restSec>0?`<button class="btn" data-act="rest" data-ex="${ex.id}">Отдых ${mmss(ex.restSec)}</button>`:''}
    </div>
    <p class="last">${last?`Прошлый раз, ${dmy(last.date)}: <b>${last.sets.map(s=>fmt(s.w)+'×'+(s.r??'?')).join(' · ')}</b>`:'По этому варианту записей еще нет'}</p>
  </li>`;
}
function renderLog(){
  const {idx,cyc,ph}=weekInfo(S.date);const d=S.draft;const lb=lastBw(S.date);const day=curDay();
  const doneN=day.ex.filter(ex=>(d.ex[ex.id]?.sets||[]).filter(filled).length>=planSets(ex,cyc)).length;
  return `<section class="day" aria-label="День тренировки">
      <div class="day-row">
        <label class="field"><span>Дата · ${wd(S.date)}</span><input type="date" id="dateIn" value="${S.date}"></label>
        <label class="field"><span>Вес тела, кг</span><input id="bwIn" inputmode="decimal" placeholder="${lb!=null?fmt(lb):'например 99,5'}" value="${fmt(d.bodyweight)}"></label>
      </div>
      <div class="daysel" role="group" aria-label="День программы">
        ${DAYS.map(x=>`<button data-act="day" data-day="${x.id}" aria-pressed="${x.id===day.id}"><b>${x.name}</b><span>${x.sub}</span></button>`).join('')}
      </div>
      <div class="phase ${ph.cls}"><b>Неделя ${cyc} из 8</b>${idx>8?` (цикл ${Math.ceil(idx/8)})`:''} · ${ph.name}<span>${ph.hint}</span></div>
      <div class="progressline" id="doneLine">Выполнено упражнений: ${doneN} из ${day.ex.length}. Разминка 8–10 мин перед стартом.</div>
    </section>
    <ol class="exlist">${day.ex.map(ex=>cardHTML(ex,cyc)).join('')}</ol>
    <section class="panel">
      <label class="field"><span>Заметка к тренировке</span><textarea id="noteIn" placeholder="Самочувствие, что было тяжело, какой тренажер был занят">${esc(d.note||'')}</textarea></label>
      <p class="muted">После силовой: 10–15 мин ходьбы в горку, наклон 8–12%, 5–6 км/ч.</p>
    </section>
    <section class="panel finish" id="finishBox">
      ${S.confirmFinish?`<p>Заполнено упражнений: ${doneN} из ${day.ex.length}. Завершить тренировку так?</p>
        <div class="c-actions"><button class="btn primary" data-act="finishYes">Да, завершить</button><button class="btn" data-act="finishNo">Вернуться к записи</button></div>`
      :`<button class="btn primary big" data-act="finish">${d.done?'Сохранить изменения':'Завершить тренировку'}</button>
        <p class="muted" id="finishMsg">${d.done?'Изменения сохраняются сразу, кнопка вернет к итогу тренировки.':'Записи сохраняются по ходу. Кнопка зафиксирует тренировку и защитит ее от случайной очистки.'}</p>`}
    </section>`;
}
function renderSummary(){
  const d=S.draft;const st=sessionStats(d);const g=gains(d);const {cyc,ph}=weekInfo(S.date);const day=dayOf(d);
  const rows=day.ex.map(p=>{const e=d.ex[p.id];const fs=(e?.sets||[]).filter(filled);const v=variant(p,e?.v);
    return `<div class="sum-row${fs.length?'':' miss'}"><span class="num">${p.num}</span><div class="sum-main"><b>${esc(v.name)}</b><span>${fs.length?fs.map(s=>fmt(s.w)+'×'+(s.r??'?')).join(' · '):'не выполнено'}</span></div></div>`}).join('');
  return `<section class="day" aria-label="День тренировки">
      <label class="field"><span>Дата · ${wd(S.date)}</span><input type="date" id="dateIn" value="${S.date}"></label>
      <div class="phase ${ph.cls}"><b>Неделя ${cyc} из 8</b> · ${ph.name}</div>
    </section>
    <section class="panel">
      <div class="done-head"><span class="done-badge">Тренировка завершена</span><h2>${dmy(S.date)} · ${wd(S.date)} · ${day.name}</h2></div>
      <div class="stats">
        <div class="stat"><span>Упражнений</span><b>${st.ex}/${day.ex.length}</b></div>
        <div class="stat"><span>Подходов</span><b>${st.sets}</b></div>
        <div class="stat"><span>Тоннаж</span><b>${st.ton.toLocaleString('ru-RU')}</b><small>кг поднято за тренировку</small></div>
        <div class="stat"><span>Вес тела</span><b>${d.bodyweight!=null?fmt(d.bodyweight):'—'}</b><small>кг</small></div>
      </div>
      ${g.length?`<div class="gains"><b>Рост к прошлому разу</b><ul>${g.map(x=>`<li>${esc(x.name)}: <span>${fmt(x.from.w)}×${x.from.r??'?'} → ${fmt(x.to.w)}×${x.to.r??'?'}</span></li>`).join('')}</ul></div>`:''}
      <div>${rows}</div>
      ${d.note?`<p class="muted">Заметка: ${esc(d.note)}</p>`:''}
      <div class="c-actions"><button class="btn primary" data-act="toProg">Открыть прогресс</button><button class="btn" data-act="edit">Изменить запись</button></div>
      <p class="muted">Следующая тренировка начнется с пустой формы и следующим днем программы, когда откроешь дневник в другой день. Чтобы записать прошлую тренировку, поменяй дату вверху.</p>
    </section>`;
}

/* ---------- календарь ---------- */
function shiftCal(dm){const [y,m]=S.cal.split('-').map(Number);const d=new Date(y,m-1+dm,1);
  S.cal=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function renderCal(){
  const [y,m]=S.cal.split('-').map(Number);
  const first=new Date(y,m-1,1);const lead=(first.getDay()+6)%7;const dim=new Date(y,m,0).getDate();
  const today=todayStr();
  const marks={};for(const d of sortedDates()){if(d.startsWith(S.cal))marks[d]=S.sessions[d].done?'ok':'has'}
  let cells='';
  for(let i=0;i<lead;i++)cells+='<span></span>';
  for(let d=1;d<=dim;d++){const ds=S.cal+'-'+String(d).padStart(2,'0');
    const cls=['cal-day',marks[ds]||'',ds===today?'today':''].join(' ').trim();
    cells+=`<button class="${cls}" data-act="calOpen" data-d="${ds}" aria-label="${dmy(ds)}">${d}</button>`}
  return `<div class="cal-head">
      <button class="btn" data-act="calPrev" aria-label="Предыдущий месяц">←</button>
      <b>${MONTHS[m-1]} ${y}</b>
      <button class="btn" data-act="calNext" aria-label="Следующий месяц">→</button></div>
    <div class="cal-grid">${['пн','вт','ср','чт','пт','сб','вс'].map(w=>`<span class="cal-dow">${w}</span>`).join('')}${cells}</div>
    <p class="muted">Зеленым отмечены завершенные тренировки, красным — записанные, но не завершенные. Нажми на день, чтобы открыть запись.</p>`;
}

/* ---------- экран: прогресс ---------- */
function renderProg(){
  const ds=sortedDates();
  const calPanel=`<section class="panel"><h2>Календарь</h2>${renderCal()}</section>`;
  if(!ds.length) return `${calPanel}<div class="panel"><div class="empty"><b>Здесь появится прогресс</b>Заполни первую тренировку на вкладке «Тренировка»: веса, повторы и вес тела. Графики строятся автоматически.</div></div>`;
  const now=todayStr();const mon=new Date(parseD(now));mon.setDate(mon.getDate()-((mon.getDay()+6)%7));const monS=todayStr(mon);
  const thisWeek=ds.filter(d=>d>=monS&&d<=now&&Object.values(S.sessions[d].ex||{}).some(e=>(e.sets||[]).some(filled))).length;
  const bw=ds.filter(d=>S.sessions[d].bodyweight!=null).map(d=>({d,v:S.sessions[d].bodyweight}));
  const bwLast=bw.length?bw[bw.length-1].v:null, bwDelta=bw.length>1?bwLast-bw[0].v:null;
  const stats=`<div class="stats">
    <div class="stat"><span>Тренировок</span><b>${ds.length}</b><small>с ${dmy(ds[0])}</small></div>
    <div class="stat"><span>Эта неделя</span><b>${thisWeek}</b><small>тренировок с понедельника</small></div>
    <div class="stat"><span>Вес тела</span><b>${bwLast!=null?fmt(bwLast):'—'}</b><small class="${bwDelta!=null&&bwDelta<0?'good':''}">${bwDelta!=null?(bwDelta>0?'+':'')+fmt(bwDelta)+' кг от старта':'кг'}</small></div>
    <div class="stat"><span>До цели</span><b>${bwLast!=null?fmt(Math.max(0,bwLast-GOAL)):'—'}</b><small>цель ${GOAL} кг</small></div></div>`;
  const rows=DAYS.map(day=>{
    const list=day.ex.map(ex=>{
      let lastV='main';for(const d of [...ds].reverse()){const e=S.sessions[d].ex?.[ex.id];if(e&&(e.sets||[]).some(filled)){lastV=e.v||'main';break}}
      const v=variant(ex,lastV);
      const series=ds.map(d=>{const e=S.sessions[d].ex?.[ex.id];if(!e||(e.v||'main')!==v.id)return null;const ws=(e.sets||[]).filter(s=>s.w!=null);if(!ws.length)return null;
        const top=ws.reduce((a,b)=>b.w>a.w||(b.w===a.w&&(b.r||0)>(a.r||0))?b:a);return top}).filter(Boolean);
      const vals=series.map(s=>s.w);let delta='';
      if(vals.length>1){const dd=vals[vals.length-1]-vals[0];const good=v.type==='assist'?dd<0:dd>0;delta=`<span class="delta ${dd===0?'':good?'up':'down'}">${dd>0?'+':''}${fmt(dd)} кг</span>`}
      const top=series.length?series[series.length-1]:null;
      return `<div class="prog-row"><div><div class="nm">${ex.num}. ${esc(v.name)}</div>
        <div class="sub">${top?`последний лучший подход <span class="best">${fmt(top.w)}×${top.r??'?'}</span> ${delta}`:'нет записей с весом'}</div></div>
        <div class="chart">${spark(vals)}</div></div>`}).join('');
    return `<p class="prog-group">${day.name} · ${esc(day.sub)}</p>${list}`;
  }).join('');
  const hist=[...ds].reverse().map(d=>{const s=S.sessions[d];const n=Object.values(s.ex||{}).filter(e=>(e.sets||[]).some(filled)).length;
    const conf=S.confirmDel===d;
    return `<div class="h-row"><div class="h-main"><b>${dmy(d)} · ${wd(d)} · ${dayOf(s).name}</b><span>${s.done?'':'<span class="draft">не завершена</span> · '}${n} упр.${s.bodyweight!=null?' · вес '+fmt(s.bodyweight)+' кг':''}${s.note?' · '+esc(s.note):''}</span></div>
      <div class="h-acts">${conf?`<button class="btn" data-act="cancelDel">Отмена</button><button class="btn danger solid" data-act="doDel" data-d="${d}">Удалить запись</button>`
      :`<button class="btn" data-act="open" data-d="${d}">Открыть</button><button class="btn danger" data-act="askDel" data-d="${d}">Удалить</button>`}</div></div>`}).join('');
  return `${backupNudge()}${stats}${calPanel}
    <section class="panel"><h2>Вес тела</h2><div class="chart">${bwChart(bw)}</div><p class="muted">Нормальный темп: 0,5–1 кг в неделю. Дефицит держи не больше ~500 ккал в день, чтобы не терять мышцы.</p></section>
    <section class="panel"><h2>Рабочие веса</h2><p class="muted">Лучший подход каждой тренировки по варианту, который ты делал последним.</p><div>${rows}</div></section>
    <section class="panel"><h2>История</h2><div class="hist">${hist}</div></section>`;
}

/* ---------- экран: программа ---------- */
function renderPlan(){
  const daysHtml=DAYS.map(day=>`<section class="panel"><h2>${day.name}</h2><p class="muted">${esc(day.sub)}</p><ul class="prog-list">${day.ex.map(ex=>`<li><span class="num" style="${ex.base?'background:var(--accent);color:var(--accent-ink);border-color:var(--accent)':''}">${ex.num}</span>
    <div><div><strong>${ex.name}</strong> · <span style="font-family:var(--f-num)">${ex.sets}×${ex.reps[0]}–${ex.reps[1]}</span></div>
    <div class="alts">Замена: ${ex.alts.map(a=>a.name).join(' или ')}</div><div class="alts">${ex.muscle} · отдых ${ex.rest}</div></div></li>`).join('')}</ul></section>`).join('');
  return `${daysHtml}
  <section class="panel"><h2>Правила</h2><ul class="rules">
    <li>Дни чередуются: после дня 1 идет день 2, затем снова день 1. Дневник сам подставляет следующий день на новую дату.</li>
    <li>Разминка 8–10 мин: дорожка, суставная, 2–3 разминочных подхода перед первым упражнением.</li>
    <li>Штанга: оставляй 2 повтора в запасе. Тренажеры: 1–2 в запасе, последний подход можно до отказа.</li>
    <li>Двойная прогрессия: во всех подходах вышел на верхнюю границу повторов, значит добавляй вес. Штанга +2,5–5 кг, гантели +1–2 кг, тренажер +1 плитка.</li>
    <li>Недели 1–2: по 2 подхода. Недели 3–7: полный объем. Неделя 8: разгрузка, затем новый цикл.</li>
    <li>Замена занятого тренажера сохраняет то же число подходов. Прогресс считается отдельно для каждого варианта.</li>
    <li>Выставляй одинаковые настройки сиденья и упоров, иначе веса несравнимы.</li>
    <li>После силовой 10–15 мин ходьбы в горку, плюс 8–10 тыс. шагов в день.</li></ul></section>
  ${backupPanel()}`;
}

/* ---------- рендер и события ---------- */
const view=document.getElementById('view');
function render(){
  document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===S.tab)));
  if(S.mode==='loading'){view.innerHTML=`<div class="panel"><div class="empty"><b>Загружаю дневник</b>Секунду…</div></div>`;return}
  if(!S.draft)loadDraft();
  view.innerHTML=S.tab==='log'?(S.draft.done&&!S.editing?renderSummary():renderLog()):S.tab==='prog'?renderProg():renderPlan();
}
function editingNow(){const a=document.activeElement;return a&&view.contains(a)&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA')}
function updateDoneLine(){const el=document.getElementById('doneLine');if(!el)return;const {cyc}=weekInfo(S.date);const day=curDay();
  const n=day.ex.filter(ex=>(S.draft.ex[ex.id]?.sets||[]).filter(filled).length>=planSets(ex,cyc)).length;
  el.textContent=`Выполнено упражнений: ${n} из ${day.ex.length}. Разминка 8–10 мин перед стартом.`}

document.querySelector('.tabs').addEventListener('click',async e=>{const b=e.target.closest('button[data-tab]');if(!b)return;
  if(S.dirty)await flush();S.tab=b.dataset.tab;S.confirmDel=null;render();window.scrollTo({top:0})});

view.addEventListener('input',e=>{const t=e.target;
  if(t.id==='bwIn'){S.draft.bodyweight=num(t.value);scheduleSave();return}
  if(t.id==='noteIn'){S.draft.note=t.value;scheduleSave();return}
  if(t.dataset.k){const ex=exOf(t.dataset.ex);const i=+t.dataset.i;while(ex.sets.length<=i)ex.sets.push({w:null,r:null});
    ex.sets[i][t.dataset.k]=num(t.value);scheduleSave();updateDoneLine();
    const card=t.closest('.card');if(card){const p=allEx().find(x=>x.id===t.dataset.ex);card.classList.toggle('done',ex.sets.filter(filled).length>=planSets(p,weekInfo(S.date).cyc))}}
});
view.addEventListener('change',async e=>{if(e.target.id==='dateIn'&&e.target.value){if(S.dirty)await flush();switchDate(e.target.value);render()}});
async function doFinish(){S.draft.done=true;S.draft.finishedAt=S.draft.finishedAt||new Date().toISOString();S.editing=false;S.confirmFinish=false;
  S.dirty=true;await flush();render();window.scrollTo({top:0})}
document.addEventListener('visibilitychange',async()=>{if(document.visibilityState!=='visible'||S.mode==='loading')return;const t=todayStr();
  if(S.date<t&&S.date===S.lastAuto&&!S.editing&&!editingNow()){if(S.dirty)await flush();switchDate(t);S.lastAuto=t;render()}});
view.addEventListener('click',async e=>{const b=e.target.closest('button[data-act]');if(!b)return;const act=b.dataset.act;
  if(act==='day'){if(S.draft.day===b.dataset.day)return;S.draft.day=b.dataset.day;scheduleSave();render();return}
  if(act==='variant'){const ex=exOf(b.dataset.ex);if(ex.v===b.dataset.v)return;ex.v=b.dataset.v;if(!ex.sets.some(filled))ex.sets=[];scheduleSave();render();return}
  if(act==='addset'){const ex=exOf(b.dataset.ex);const p=allEx().find(x=>x.id===b.dataset.ex);const rows=Math.max(planSets(p,weekInfo(S.date).cyc),ex.sets.length);
    while(ex.sets.length<rows)ex.sets.push({w:null,r:null});ex.sets.push({w:null,r:null});render();return}
  if(act==='delset'){const ex=exOf(b.dataset.ex);ex.sets.pop();scheduleSave();render();return}
  if(act==='copy'){const ex=exOf(b.dataset.ex);const last=lastFor(b.dataset.ex,ex.v||'main',S.date);if(!last)return;
    last.sets.forEach((s,i)=>{while(ex.sets.length<=i)ex.sets.push({w:null,r:null});if(ex.sets[i].w==null)ex.sets[i].w=s.w});scheduleSave();render();return}
  if(act==='rest'){const p=allEx().find(x=>x.id===b.dataset.ex);if(p&&p.restSec>0)tStart(p.restSec,p.name);return}
  if(act==='finish'){const any=Object.values(S.draft.ex).some(e=>(e.sets||[]).some(filled));
    if(!any){const m=document.getElementById('finishMsg');if(m)m.textContent='Впиши хотя бы один подход, потом завершай.';return}
    const {cyc}=weekInfo(S.date);const day=curDay();
    const n=day.ex.filter(p=>(S.draft.ex[p.id]?.sets||[]).filter(filled).length>=planSets(p,cyc)).length;
    if(n<day.ex.length&&!S.draft.done){S.confirmFinish=true;render();document.getElementById('finishBox')?.scrollIntoView({block:'center'});return}
    doFinish();return}
  if(act==='finishYes'){doFinish();return}
  if(act==='finishNo'){S.confirmFinish=false;render();document.getElementById('finishBox')?.scrollIntoView({block:'center'});return}
  if(act==='edit'){S.editing=true;render();return}
  if(act==='toProg'){S.tab='prog';render();window.scrollTo({top:0});return}
  if(act==='export'){exportData();return}
  if(act==='exportCsv'){exportCSV();return}
  if(act==='open'){if(S.dirty)await flush();switchDate(b.dataset.d);S.tab='log';render();window.scrollTo({top:0});return}
  if(act==='calOpen'){if(S.dirty)await flush();switchDate(b.dataset.d);S.tab='log';render();window.scrollTo({top:0});return}
  if(act==='calPrev'){shiftCal(-1);render();return}
  if(act==='calNext'){shiftCal(1);render();return}
  if(act==='askDel'){S.confirmDel=b.dataset.d;render();return}
  if(act==='cancelDel'){S.confirmDel=null;render();return}
  if(act==='doDel'){const d=b.dataset.d;try{if(S.mode==='db')await S.db.collection('sessions').doc(d).delete();delete S.sessions[d];if(S.mode!=='db')saveLocal();
      if(d===S.date)loadDraft();S.confirmDel=null;setSave('ok');render()}catch(err){setSave('err','Не удалось удалить, попробуй еще раз')}}
});

function onData(){if(!S.dirty&&!editingNow())loadDraft();if(!(S.tab==='log'&&(editingNow()||S.dirty)))render()}


/* ---------- резервная копия ---------- */
function lastBackup(){try{return localStorage.getItem('fb-backup')}catch(e){return null}}
function markBackup(){try{localStorage.setItem('fb-backup',todayStr())}catch(e){}}
function backupNudge(){const lb=lastBackup();const n=sortedDates().length;if(!n)return '';
  if(lb&&days(lb,todayStr())<14)return '';
  return `<div class="notice">${lb?'Последняя резервная копия '+dmy(lb)+'. ':'Резервной копии еще нет. '}Сохрани ее на вкладке «Программа», чтобы не потерять историю.</div>`}
function backupPanel(){const lb=lastBackup();
  return `<section class="panel"><h2>Резервная копия</h2>
    <p class="muted">Все записи хранятся только на этом телефоне. Раз в неделю сохраняй копию в «Файлы» или iCloud Drive. ${lb?'Последняя копия: '+dmy(lb)+'.':'Копий еще не было.'}</p>
    <div class="c-actions"><button class="btn primary" data-act="export">Сохранить копию</button>
    <button class="btn" data-act="exportCsv">Выгрузить в CSV</button>
    <label class="btn" for="importIn" style="display:inline-flex;align-items:center">Восстановить из файла</label>
    <input type="file" id="importIn" accept="application/json,.json" hidden></div>
    <p class="muted" id="backupMsg" aria-live="polite"></p></section>`}
async function exportData(){
  const name='fullbody-backup-'+todayStr()+'.json';
  const data=JSON.stringify({app:'fullbody-log',version:1,exportedAt:new Date().toISOString(),sessions:S.sessions});
  const file=new File([data],name,{type:'application/json'});
  const msg=t=>{const el=document.getElementById('backupMsg');if(el)el.textContent=t};
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:name});markBackup();msg('Копия передана. Выбери «Сохранить в Файлы», если еще не сохранил.');return}}
  catch(e){if(e&&e.name==='AbortError'){msg('Сохранение отменено.');return}}
  const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);markBackup();msg('Файл '+name+' сохранен в загрузки.');
}
function csvCell(v){const s=String(v??'');return /[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}
function exportCSV(){
  const msg=t=>{const el=document.getElementById('backupMsg');if(el)el.textContent=t};
  const rows=[['Дата','День недели','День программы','Упражнение','Подход','Вес кг','Повторы','Вес тела кг','Заметка']];
  for(const d of sortedDates()){const s=S.sessions[d];let firstRow=true;
    for(const p of dayOf(s).ex){const e=s.ex?.[p.id];if(!e)continue;const v=variant(p,e.v);
      (e.sets||[]).filter(filled).forEach((x,i)=>{
        rows.push([d,wd(d),dayOf(s).name,v.name,i+1,fmt(x.w),x.r??'',firstRow?fmt(s.bodyweight):'',firstRow?(s.note||''):'']);firstRow=false})}
    if(firstRow&&s.bodyweight!=null)rows.push([d,wd(d),dayOf(s).name,'','','','',fmt(s.bodyweight),s.note||''])}
  if(rows.length===1){msg('Записей пока нет, выгружать нечего.');return}
  const csv='﻿'+rows.map(r=>r.map(csvCell).join(';')).join('\n');
  const name='fullbody-log-'+todayStr()+'.csv';
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);msg('Файл '+name+' сохранен в загрузки. Откроется в Excel, разделитель — точка с запятой.');
}
async function importData(f){
  const msg=t=>{const el=document.getElementById('backupMsg');if(el)el.textContent=t};
  try{const obj=JSON.parse(await f.text());const ss=obj&&obj.sessions;
    if(!ss||typeof ss!=='object'||Array.isArray(ss))throw new Error('bad');
    let added=0,updated=0;
    for(const [d,s] of Object.entries(ss)){if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!s||typeof s!=='object')continue;
      const cur=S.sessions[d];
      if(!cur){S.sessions[d]=s;added++}else if((s.updatedAt||'')>(cur.updatedAt||'')){S.sessions[d]=s;updated++}}
    saveLocal();loadDraft();render();
    const el=document.getElementById('backupMsg');if(el)el.textContent=`Восстановлено: новых тренировок ${added}, обновлено ${updated}.`;
  }catch(e){msg('Не получилось прочитать файл. Выбери файл копии вида fullbody-backup-ГГГГ-ММ-ДД.json.')}
}
view.addEventListener('change',e=>{if(e.target.id==='importIn'&&e.target.files&&e.target.files[0])importData(e.target.files[0])});
(function(){
  S.sessions=loadLocal();S.mode='local';
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  loadDraft();render();setSave('ok');
  if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
})();
