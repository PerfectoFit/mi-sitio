
/* ══════════════════════════════════
   ONBOARDING STATE
══════════════════════════════════ */
let obStep=1;
const OB_TOTAL=6;
const trainSelected=new Set(['padel']);
let sexSel='m', goalSel='loss', protSel=true, dietSel='normal', actSel='sed';
const mealSlots=[
  {id:'desayuno',name:'Desayuno',time:'07:30',defaultOn:true},
  {id:'almuerzo',name:'Media mañana',time:'10:30',defaultOn:false},
  {id:'comida',name:'Comida',time:'14:00',defaultOn:true},
  {id:'merienda',name:'Merienda',time:'17:30',defaultOn:false},
  {id:'cena',name:'Cena',time:'21:00',defaultOn:true},
  {id:'postcena',name:'Post-cena',time:'22:30',defaultOn:false},
];
let mealConfig={};
mealSlots.forEach(m=>{mealConfig[m.id]={on:m.defaultOn,prot:true,carb:true,fat:true,supp:false};});

function obUpdateUI(){
  document.querySelectorAll('.ob-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('step-'+obStep).classList.add('active');
  document.getElementById('ob-progress').style.width=(obStep/OB_TOTAL*100)+'%';
  document.getElementById('ob-step-ind').textContent=`Paso ${obStep} de ${OB_TOTAL}`;
  document.getElementById('ob-back-btn').style.display=obStep>1?'block':'none';
  const nextBtn=document.getElementById('ob-next-btn');
  nextBtn.textContent=obStep===OB_TOTAL?'¡Empezar mi plan! 🚀':'Continuar →';
  if(obStep===4){ initMealToggleGrid(); renderMealConfig(); }
  if(obStep===6) renderObSummary();
}

function obNext(){
  if(obStep===OB_TOTAL){launchApp();return;}
  obStep++;obUpdateUI();
  window.scrollTo(0,0);
}
function obBack(){if(obStep>1){obStep--;obUpdateUI();}}

function selectSex(s){
  sexSel=s;
  ['m','f'].forEach(x=>document.getElementById('sex-'+x).className='opt-card');
  document.getElementById('sex-'+s).className='opt-card sel';
}
function selectGoal(g){
  goalSel=g;
  ['loss','muscle','both'].forEach(x=>document.getElementById('goal-'+x).className='opt-card');
  document.getElementById('goal-'+g).className='opt-card sel';
}
function selectProt(v){
  protSel=v;
  document.getElementById('prot-si').className='opt-card'+(v?' sel':'');
  document.getElementById('prot-no').className='opt-card'+(!v?' sel':'');
}
function selectDiet(d){
  dietSel=d;
  ['normal','vegeta','vegan','gluten'].forEach(x=>document.getElementById('diet-'+x).className='opt-card');
  document.getElementById('diet-'+d).className='opt-card sel';
}
function selectAct(a){
  actSel=a;
  ['sed','mod','act'].forEach(x=>document.getElementById('act-'+x).className='opt-card');
  document.getElementById('act-'+a).className='opt-card sel';
}
function toggleTrain(t){
  const card=document.getElementById('tr-'+t);
  const colorMap={padel:'sel-green',fuerza:'sel-blue',cardio:'sel-purple',natacion:'sel-blue',ciclismo:'sel-blue',yoga:'sel-green'};
  if(trainSelected.has(t)){
    trainSelected.delete(t);
    card.className='opt-card';
  } else {
    trainSelected.add(t);
    card.className='opt-card '+colorMap[t];
  }
  document.getElementById('padel-days-grp').style.display=trainSelected.has('padel')?'block':'none';
  document.getElementById('fuerza-days-grp').style.display=trainSelected.has('fuerza')?'block':'none';
}
function stepField(id,dir,min,max){
  const inp=document.getElementById(id);
  let v=parseInt(inp.value)+dir;
  v=Math.max(min,Math.min(max,v));
  inp.value=v;
  document.getElementById(id+'-disp').textContent=v;
  if(id==='f-meals') syncMealToggles(v);
}
function updateMonthsLabel(){
  const v=document.getElementById('f-months').value;
  document.getElementById('f-months-disp').textContent=v;
}
function initMealToggleGrid(){
  const grid=document.getElementById('meal-toggle-grid');
  if(!grid)return;
  const icons={desayuno:'☀️',almuerzo:'🍎',comida:'🍽️',merienda:'🥤',cena:'🌙',postcena:'⭐'};
  grid.innerHTML=mealSlots.map(m=>{
    const on=mealConfig[m.id].on;
    return `<button class="opt-card${on?' sel':''}" id="meal-tog-${m.id}" onclick="toggleMealOn('${m.id}')">
      <span class="oc-ico">${icons[m.id]||'🍽️'}</span>
      <div class="oc-name">${m.name}</div>
      <div class="oc-desc">${m.time} h</div>
    </button>`;
  }).join('');
}
function toggleMealOn(id){
  const on=!mealConfig[id].on;
  const active=mealSlots.filter(m=>mealConfig[m.id].on).length;
  if(!on && active<=1) return; // minimum 1
  mealConfig[id].on=on;
  document.getElementById('meal-tog-'+id).className='opt-card'+(on?' sel':'');
  const count=mealSlots.filter(m=>mealConfig[m.id].on).length;
  document.getElementById('f-meals').value=count;
  renderMealConfig();
}
function syncMealToggles(n){
  const order=['desayuno','almuerzo','comida','merienda','cena','postcena'];
  order.forEach((id,i)=>{ mealConfig[id].on = i<n; });
  initMealToggleGrid();
  renderMealConfig();
}
function renderMealConfig(){
  const container=document.getElementById('meal-config-list');
  if(!container)return;
  container.innerHTML=mealSlots.filter(m=>mealConfig[m.id].on).map(m=>{
    const cfg=mealConfig[m.id];
    return `<div class="meal-config-row">
      <div class="mcr-left">
        <div class="mcr-name">${m.name} <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--ink3)">${m.time} h</span></div>
        <div class="macro-checks">
          <button class="macro-chip prot${cfg.prot?' on':''}" onclick="toggleMacro('${m.id}','prot')">Proteína</button>
          <button class="macro-chip carb${cfg.carb?' on':''}" onclick="toggleMacro('${m.id}','carb')">Carbos</button>
          <button class="macro-chip fat${cfg.fat?' on':''}" onclick="toggleMacro('${m.id}','fat')">Grasas</button>
          ${protSel?`<button class="macro-chip supp${cfg.supp?' on':''}" onclick="toggleMacro('${m.id}','supp')">Batido prot.</button>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}
function toggleMacro(mealId,macro){
  mealConfig[mealId][macro]=!mealConfig[mealId][macro];
  renderMealConfig();
}
function renderObSummary(){
  const name=document.getElementById('f-name').value||'Usuario';
  const age=document.getElementById('f-age').value;
  const weight=parseFloat(document.getElementById('f-weight').value)||80;
  const height=parseFloat(document.getElementById('f-height').value)||175;
  const target=parseFloat(document.getElementById('f-target').value)||(weight-10);
  const months=document.getElementById('f-months').value;
  const imc=(weight/(height/100)**2).toFixed(1);
  const tmb=calcTMB(weight,height,parseInt(age),sexSel,actSel);
  const kcalObj=calcKcalTarget(tmb,goalSel);
  const trainList=[...trainSelected].join(', ');
  const mealN=parseInt(document.getElementById('f-meals').value);
  document.getElementById('ob-summary').innerHTML=`
    <div class="summary-card">
      <div class="sc-title">Tus datos</div>
      <div class="sc-row"><span class="sc-key">Nombre</span><span class="sc-val coral">${name}</span></div>
      <div class="sc-row"><span class="sc-key">Edad · Sexo</span><span class="sc-val">${age} años · ${sexSel==='m'?'Hombre':'Mujer'}</span></div>
      <div class="sc-row"><span class="sc-key">Peso · Altura</span><span class="sc-val">${weight} kg · ${height} cm</span></div>
      <div class="sc-row"><span class="sc-key">IMC</span><span class="sc-val">${imc}</span></div>
      <div class="sc-row"><span class="sc-key">TMB estimada</span><span class="sc-val">${Math.round(tmb)} kcal/día</span></div>
    </div>
    <div class="summary-card">
      <div class="sc-title">Tu objetivo</div>
      <div class="sc-row"><span class="sc-key">Peso objetivo</span><span class="sc-val green">${target} kg</span></div>
      <div class="sc-row"><span class="sc-key">A perder/ganar</span><span class="sc-val coral">${Math.abs(weight-target).toFixed(1)} kg</span></div>
      <div class="sc-row"><span class="sc-key">Plazo</span><span class="sc-val">${months} meses</span></div>
      <div class="sc-row"><span class="sc-key">Objetivo kcal/día</span><span class="sc-val blue">${kcalObj} kcal</span></div>
    </div>
    <div class="summary-card">
      <div class="sc-title">Entrenamiento &amp; Dieta</div>
      <div class="sc-row"><span class="sc-key">Actividades</span><span class="sc-val" style="text-transform:capitalize">${trainList||'Sin seleccionar'}</span></div>
      <div class="sc-row"><span class="sc-key">Comidas/día</span><span class="sc-val">${mealN}</span></div>
      <div class="sc-row"><span class="sc-key">Dieta</span><span class="sc-val" style="text-transform:capitalize">${dietSel}</span></div>
      <div class="sc-row"><span class="sc-key">Proteína en polvo</span><span class="sc-val">${protSel?'Sí':'No'}</span></div>
    </div>
  `;
}

/* ══════════════════════════════════
   CALCULATIONS
══════════════════════════════════ */
function calcTMB(w,h,age,sex,act){
  // Harris-Benedict
  let tmb=sex==='m'
    ?(88.362+13.397*w+4.799*h-5.677*age)
    :(447.593+9.247*w+3.098*h-4.330*age);
  const actMult={sed:1.2,mod:1.375,act:1.55}[act]||1.2;
  return tmb*actMult;
}
function calcKcalTarget(tmb,goal){
  if(goal==='loss') return Math.round(tmb-500);
  if(goal==='muscle') return Math.round(tmb+300);
  return Math.round(tmb-200);
}

/* ══════════════════════════════════
   LAUNCH APP
══════════════════════════════════ */
async function launchApp(){
  const profile={
    name:document.getElementById('f-name').value||'Usuario',
    age:parseInt(document.getElementById('f-age').value)||30,
    weight:parseFloat(document.getElementById('f-weight').value)||80,
    height:parseFloat(document.getElementById('f-height').value)||175,
    target:parseFloat(document.getElementById('f-target').value)||70,
    months:parseInt(document.getElementById('f-months').value)||6,
    sex:sexSel, goal:goalSel, prot:protSel, diet:dietSel, act:actSel,
    trains:[...trainSelected],
    padelDays:parseInt(document.getElementById('f-padel-days').value)||3,
    fuerzaDays:parseInt(document.getElementById('f-fuerza-days').value)||3,
    meals:mealSlots.filter(m=>mealConfig[m.id].on).length,
    mealConfig:JSON.parse(JSON.stringify(mealConfig)),
  };
  profile.tmb=calcTMB(profile.weight,profile.height,profile.age,profile.sex,profile.act);
  profile.kcalTarget=calcKcalTarget(profile.tmb,profile.goal);
  localStorage.setItem('fp_profile',JSON.stringify(profile));

  // Always get fresh session — don't rely on currentUser variable which may be null
  // if the user just registered and went straight to onboarding
  try {
    const {data:{session}} = await sb.auth.getSession();
    if(session && session.user){
      currentUser = session.user;
      await syncProfileToCloud(profile);
    }
  } catch(e){ console.error('Error syncing profile:', e); }

  startApp(profile);
}

function resetProfile(){
  if(!confirm('¿Reconfigurar perfil? Tus datos de progreso se mantienen.')) return;
  P={}; MEALS_CACHE=[];
  document.getElementById('app').style.display='none';
  document.getElementById('onboarding').style.display='flex';
}

/* ══════════════════════════════════
   APP STATE & DATA
══════════════════════════════════ */
let P={}; // profile
let wkOff=0,editMode=false,wkData={},selKey=null;
let pType=null,pSub=null,mCtx=null,pMultiMode=false;
let customWorkouts={};
try{customWorkouts=JSON.parse(localStorage.getItem('fp_cwk')||'{}');}catch(e){}

function getActivities(key,i){
  const raw=wkData[key];
  if(raw){if(Array.isArray(raw))return raw;if(raw.type)return[raw];}
  const days=buildDefaultPlan(P);
  return[days[i]||{type:'descanso',sub:'Descanso activo',time:''}];
}
function setActivities(key,arr){wkData[key]=arr;persist();}
function persistCWK(){localStorage.setItem('fp_cwk',JSON.stringify(customWorkouts));}
let checks=JSON.parse(localStorage.getItem('fp_checks')||'{}');
let wlog=JSON.parse(localStorage.getItem('fp_wlog')||'[]');
let exWeights=JSON.parse(localStorage.getItem('fp_exw')||'{}');
let exChecks=JSON.parse(localStorage.getItem('fp_exc')||'{}');
let cardioChecks=JSON.parse(localStorage.getItem('fp_cc')||'{}');
let chartI=null;
try{wkData=JSON.parse(localStorage.getItem('fp_wkd')||'{}');}catch(e){}

let _persistTimer=null;
let _cloudTimer=null;

function persist(){
  // Debounce localStorage writes — 300ms after last call
  if(_persistTimer) clearTimeout(_persistTimer);
  _persistTimer = setTimeout(()=>{
    localStorage.setItem('fp_checks', JSON.stringify(checks));
    localStorage.setItem('fp_wlog',   JSON.stringify(wlog));
    localStorage.setItem('fp_wkd',    JSON.stringify(wkData));
    localStorage.setItem('fp_exw',    JSON.stringify(exWeights));
    localStorage.setItem('fp_exc',    JSON.stringify(exChecks));
    localStorage.setItem('fp_cc',     JSON.stringify(cardioChecks));
    localStorage.setItem('fp_cwk',    JSON.stringify(customWorkouts));
  }, 300);
  // Debounce Supabase sync — 2s after last call
  if(_cloudTimer) clearTimeout(_cloudTimer);
  _cloudTimer = setTimeout(syncToCloud, 2000);
}

// Flush immediately before page unload so no data is lost
window.addEventListener('beforeunload', ()=>{
  if(_persistTimer){
    clearTimeout(_persistTimer);
    localStorage.setItem('fp_checks', JSON.stringify(checks));
    localStorage.setItem('fp_wlog',   JSON.stringify(wlog));
    localStorage.setItem('fp_wkd',    JSON.stringify(wkData));
    localStorage.setItem('fp_exw',    JSON.stringify(exWeights));
    localStorage.setItem('fp_exc',    JSON.stringify(exChecks));
    localStorage.setItem('fp_cc',     JSON.stringify(cardioChecks));
    localStorage.setItem('fp_cwk',    JSON.stringify(customWorkouts));
  }
});

const DAYS=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MON=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

const FD={
  'Tren superior':{kcal:'~450 kcal',dur:'60–75 min',ex:[
    {n:'Press banca',s:'4×10–12'},{n:'Remo con barra',s:'4×10–12'},
    {n:'Press militar',s:'4×10–12'},{n:'Jalones al pecho',s:'4×10–12'},
    {n:'Curl de bíceps',s:'3×12'},{n:'Tríceps en polea',s:'3×12'}]},
  'Tren inferior':{kcal:'~540 kcal',dur:'60–75 min',ex:[
    {n:'Sentadilla goblet',s:'4×10–12'},{n:'Peso muerto rumano',s:'4×10'},
    {n:'Prensa de piernas',s:'4×12'},{n:'Curl femoral',s:'3×12'},
    {n:'Extensiones cuádriceps',s:'3×12'},{n:'Gemelos de pie',s:'4×15'}]},
  'Full body':{kcal:'~460 kcal',dur:'50–60 min',ex:[
    {n:'Sentadilla con barra',s:'3×12–15'},{n:'Hip thrust',s:'3×12–15'},
    {n:'Remo en polea baja',s:'3×12–15'},{n:'Press inclinado',s:'3×12–15'},
    {n:'Face pull',s:'3×15'},{n:'Plancha',s:'3×30–45 seg'}]},
};
const CARDIO_OPTS=[
  {id:'c_cinta',name:'Cinta (marcha rápida / carrera)',dur:'30 min'},
  {id:'c_bici',name:'Bicicleta estática o elíptica',dur:'30 min'},
  {id:'c_remo',name:'Remo ergométrico',dur:'30 min'},
  {id:'c_libre',name:'Cardio libre (HIIT / saltos / etc.)',dur:'30 min'},
];

/* Generate weekly plan from profile */
function buildDefaultPlan(profile){
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  let plan=Array(7).fill(null).map(()=>({type:'descanso',sub:'Descanso activo',time:''}));
  const trains=profile.trains||[];
  const hasPadel=trains.includes('padel');
  const hasFuerza=trains.includes('fuerza');
  const padelDays=profile.padelDays||3;
  const fuerzaDays=profile.fuerzaDays||3;
  const fuerzaRots=['Tren superior','Tren inferior','Full body'];
  let pi=0,fi=0;
  // Distribute padel on weekdays+weekend
  const padelSlots=[1,3,5,6,0,2,4];
  const fuerzaSlots=[0,2,4,1,3,6,5];
  if(hasPadel){
    for(let i=0;i<padelDays&&i<padelSlots.length;i++){
      const d=padelSlots[i];
      plan[d]={type:'padel',sub:'Partido 90 min',time:d>=5?'mañana':'18–19 h'};
    }
  }
  if(hasFuerza){
    const fuSlots=hasPadel?[0,2,4,6,1,3,5]:[0,1,2,3,4,5,6];
    for(let i=0;i<fuerzaDays&&i<fuSlots.length;i++){
      const d=fuSlots[i];
      if(plan[d].type==='descanso'){
        plan[d]={type:'fuerza',sub:fuerzaRots[i%3],time:d>=5?'mañana':'18–19 h'};
      }
    }
  }
  return plan;
}

function entry(key,i){
  if(wkData[key]) return wkData[key];
  const days=buildDefaultPlan(P);
  return days[i]||{type:'descanso',sub:'Descanso activo',time:''};
}

/* Generate meals from profile */
function buildMeals(profile){
  const meals=[];
  const cfg=profile.mealConfig||{};
  const allMeals=[
    {id:'desayuno',name:'Desayuno',time:'07:30 h',ico:'☀️',icoBg:'#e8eef8',kcalCol:'#2e5fa3'},
    {id:'almuerzo',name:'Media mañana',time:'10:30 h',ico:'🍎',icoBg:'#e8f2ec',kcalCol:'#3d7a5c'},
    {id:'comida',name:'Comida',time:'14:00 h',ico:'🍽️',icoBg:'#f2ece0',kcalCol:'#7a6040'},
    {id:'merienda',name:'Merienda',time:'17:30 h',ico:'🥤',icoBg:'#fdf3e3',kcalCol:'#c08030'},
    {id:'cena',name:'Cena',time:'21:00 h',ico:'🥗',icoBg:'#e8f2ec',kcalCol:'#3d7a5c'},
    {id:'postcena',name:'Post-cena',time:'22:30 h',ico:'🌙',icoBg:'#eeebf8',kcalCol:'#6b4fa3'},
  ];
  // Only include meals the user actually selected
  const active=allMeals.filter(m=>(cfg[m.id]&&cfg[m.id].on));
  // If somehow none are active (old profile), fall back to first 3
  const useActive=active.length>0?active:allMeals.slice(0,3);
  const totalKcal=profile.kcalTarget||2000;
  const weightMap={desayuno:1,almuerzo:0.5,comida:2,merienda:0.8,cena:1.5,postcena:0.5};
  const wSum=useActive.reduce((a,m)=>a+(weightMap[m.id]||1),0);
  useActive.forEach((m)=>{
    const mc=cfg[m.id]||{prot:true,carb:true,fat:true,supp:false};
    const kcal=Math.round(totalKcal*((weightMap[m.id]||1)/wSum));
    const prot=mc.prot?Math.round(kcal*0.35/4):0;
    const carb=mc.carb?Math.round(kcal*0.40/4):0;
    const fat=mc.fat?Math.round(kcal*0.25/9):0;
    const items=buildMealItems(m.id,mc,profile,kcal);
    meals.push({...m,kcal,prot,carb,fat,items,note:getMealNote(m.id,mc,profile)});
  });
  return meals;
}

// Build meals for any arbitrary set of slot IDs (used by slot picker)
function buildMealsFromSlots(profile, slotIds){
  const cfg=profile.mealConfig||{};
  const allMeta={
    desayuno:{name:'Desayuno',      time:'07:30 h',ico:'☀️', icoBg:'#e8eef8',kcalCol:'#2e5fa3'},
    almuerzo:{name:'Media mañana',  time:'10:30 h',ico:'🍎', icoBg:'#e8f2ec',kcalCol:'#3d7a5c'},
    comida:  {name:'Comida',        time:'14:00 h',ico:'🍽️', icoBg:'#f2ece0',kcalCol:'#7a6040'},
    merienda:{name:'Merienda',      time:'17:30 h',ico:'🥤', icoBg:'#fdf3e3',kcalCol:'#c08030'},
    cena:    {name:'Cena',          time:'21:00 h',ico:'🌙', icoBg:'#e8f2ec',kcalCol:'#3d7a5c'},
    postcena:{name:'Post-cena',     time:'22:30 h',ico:'⭐', icoBg:'#eeebf8',kcalCol:'#6b4fa3'},
  };
  const weightMap={desayuno:1,almuerzo:0.5,comida:2,merienda:0.8,cena:1.5,postcena:0.5};
  const totalKcal=profile.kcalTarget||2000;
  const wSum=slotIds.reduce((a,id)=>a+(weightMap[id]||1),0);
  return slotIds.map(id=>{
    const meta=allMeta[id]||{name:id,time:'',ico:'🍽️',icoBg:'#f2ece0',kcalCol:'#7a6040'};
    const mc=cfg[id]||{prot:true,carb:true,fat:true,supp:false};
    const kcal=Math.round(totalKcal*((weightMap[id]||1)/wSum));
    const prot=mc.prot?Math.round(kcal*0.35/4):0;
    const carb=mc.carb?Math.round(kcal*0.40/4):0;
    const fat=mc.fat?Math.round(kcal*0.25/9):0;
    const items=buildMealItems(id,mc,profile,kcal);
    return {id,...meta,kcal,prot,carb,fat,items,note:getMealNote(id,mc,profile)};
  });
}

function buildMealItems(mealId,cfg,profile,kcal){
  const items=[];
  if(cfg.supp&&profile.prot){
    items.push({id:mealId+'_supp',name:'Batido de proteínas (1 scoop) con agua',kcal:120,prot:25,carb:4,fat:2});
  }
  if(mealId==='desayuno'){
    items.push({id:'d_cafe',name:'Café solo sin azúcar',kcal:5,prot:0,carb:1,fat:0});
    if(!cfg.supp) items.push({id:'d_fruta',name:'Fruta de temporada (1 pieza)',kcal:70,prot:1,carb:17,fat:0});
    if(cfg.carb&&!cfg.supp) items.push({id:'d_tostada',name:'Tostada integral con AOVE',kcal:120,prot:3,carb:20,fat:5});
  } else if(mealId==='comida'||mealId==='cena'){
    if(cfg.prot) items.push({id:mealId+'_prot',name:'Proteína (200–250 g) — pollo / pescado / ternera',kcal:Math.round(kcal*0.35),prot:Math.round(kcal*0.35*0.8/4),carb:0,fat:Math.round(kcal*0.35*0.2/9)});
    if(cfg.carb&&mealId==='comida') items.push({id:mealId+'_carb',name:'Hidratos (150–200 g) — arroz integral / pasta',kcal:Math.round(kcal*0.35),prot:5,carb:Math.round(kcal*0.35*0.85/4),fat:1});
    if(cfg.fat) items.push({id:mealId+'_fat',name:'Verduras + 1 cda. aceite de oliva virgen',kcal:Math.round(kcal*0.15),prot:3,carb:8,fat:Math.round(kcal*0.15*0.6/9)});
    items.push({id:mealId+'_agua',name:'Agua (500 ml)',kcal:0,prot:0,carb:0,fat:0});
  } else {
    if(cfg.prot&&!cfg.supp) items.push({id:mealId+'_prot',name:'Fuente de proteína (yogur / queso cottage / huevo)',kcal:Math.round(kcal*0.5),prot:20,carb:5,fat:5});
    if(cfg.carb) items.push({id:mealId+'_carb',name:'Fruta o snack saludable',kcal:Math.round(kcal*0.4),prot:1,carb:18,fat:1});
    if(cfg.fat) items.push({id:mealId+'_fat',name:'Frutos secos (20–25 g)',kcal:Math.round(kcal*0.3),prot:4,carb:3,fat:12});
    items.push({id:mealId+'_agua2',name:'Agua',kcal:0,prot:0,carb:0,fat:0});
  }
  return items;
}

function getMealNote(id,cfg,profile){
  const notes={
    desayuno:'Empieza el día con proteína para reducir el hambre a lo largo del día.',
    almuerzo:'Snack ligero para llegar con control a la comida principal.',
    comida:'Tu ingesta más importante del día. No te la saltes.',
    merienda:profile.trains.includes('fuerza')||profile.trains.includes('padel')?'Tómala especialmente si entrenas por la tarde.':'Opcional si llegas bien a la cena.',
    cena:'Cena temprano si puedes. Prioriza proteína y verduras sobre hidratos.',
    postcena:'Solo si hay hambre real. Mantén la ración pequeña.',
  };
  return notes[id]||'';
}

/* ─── UTILS ─── */
function fmt(d){return d.toISOString().split('T')[0];}
function monday(off){
  const t=new Date();t.setHours(0,0,0,0);
  const dow=t.getDay(),diff=dow===0?-6:1-dow;
  const m=new Date(t);m.setDate(t.getDate()+diff+off*7);return m;
}
function weekDays(off){
  const m=monday(off);
  return Array.from({length:7},(_,i)=>{const d=new Date(m);d.setDate(m.getDate()+i);return d;});
}
function wkStr(days){
  const s=days[0],e=days[6];
  return `${s.getDate()} ${MON[s.getMonth()]} — ${e.getDate()} ${MON[e.getMonth()]}`;
}
function curWkLabel(){const d=weekDays(0)[0];return `Sem. ${d.getDate()}/${d.getMonth()+1}`;}
function exId(sub,n){return (sub+'_'+n).replace(/[^a-zA-Z0-9]/g,'_');}
function getLastW(eid){const h=exWeights[eid];return h&&h.length?h[h.length-1].kg:'';}
function getPR(eid){const h=exWeights[eid];return h&&h.length?Math.max(...h.map(e=>parseFloat(e.kg)||0)):null;}
function saveExW(eid,kg){
  if(!kg||isNaN(parseFloat(kg)))return;
  const today=fmt(new Date());
  if(!exWeights[eid])exWeights[eid]=[];
  const idx=exWeights[eid].findIndex(e=>e.date===today);
  if(idx>=0)exWeights[eid][idx].kg=parseFloat(kg);
  else exWeights[eid].push({date:today,kg:parseFloat(kg)});
  if(exWeights[eid].length>20)exWeights[eid]=exWeights[eid].slice(-20);
  persist();
  // Trigger adaptive engine update
  refreshAdaptiveInsights();
}

/* ══════════════════════════════════
   MOTOR DE ADAPTACIÓN INTELIGENTE
   Analiza cambio de peso corporal + progresión
   de cargas y genera recomendaciones dinámicas
══════════════════════════════════ */

// Fase de entrenamiento basada en peso corporal actual
function getTrainingPhase(){
  const curKg=wlog.length?wlog[wlog.length-1].kg:(P.weight||80);
  const startKg=P.weight||80;
  const targetKg=P.target||70;
  const totalLoss=startKg-targetKg;
  const achieved=startKg-curKg;
  const pct=totalLoss>0?Math.min(achieved/totalLoss,1):0;
  if(pct<0.25) return {phase:1,label:'Fase 1 — Adaptación',color:'var(--amber)',pct};
  if(pct<0.60) return {phase:2,label:'Fase 2 — Pérdida activa',color:'var(--moss)',pct};
  if(pct<0.85) return {phase:3,label:'Fase 3 — Consolidación',color:'var(--fuerza)',pct};
  return {phase:4,label:'Fase 4 — Mantenimiento',color:'var(--coral)',pct};
}

// Recomendación de series/reps según fase
function getVolumeByPhase(phase){
  const v={
    1:{series:'3–4',reps:'12–15',desc:'Volumen moderado, técnica primero',rest:'90 seg'},
    2:{series:'4',reps:'10–12',desc:'Volumen alto, déficit calórico activo',rest:'75 seg'},
    3:{series:'4–5',reps:'8–10',desc:'Mayor intensidad, carga progresiva',rest:'90 seg'},
    4:{series:'3–4',reps:'8–12',desc:'Mantenimiento muscular, variedad',rest:'60–90 seg'},
  };
  return v[phase]||v[1];
}

// Analiza la progresión de carga de un ejercicio
function analyzeExProgression(eid){
  const h=exWeights[eid];
  if(!h||h.length<2) return null;
  const recent=h.slice(-4);
  const first=recent[0].kg, last=recent[recent.length-1].kg;
  const delta=last-first;
  const weeks=recent.length;
  const rate=delta/weeks;

  // Detecta estancamiento (sin subida en 3+ semanas)
  const stuck=h.length>=3 && h.slice(-3).every(e=>e.kg===h[h.length-1].kg);
  // Detecta progresión buena (>2.5% por semana)
  const goodProgress=rate>0 && (rate/first)>0.015;
  // PR reciente
  const pr=getPR(eid);
  const isPR=last>=pr;

  return {delta:+delta.toFixed(1),rate:+rate.toFixed(1),stuck,goodProgress,isPR,last,pr};
}

// Genera recomendación de peso para próxima sesión
function getNextWeightRec(eid){
  const h=exWeights[eid];
  if(!h||!h.length) return null;
  const last=h[h.length-1].kg;
  const {phase}=getTrainingPhase();
  // Fases 1–2: subidas pequeñas (2.5kg en compuestos, 1.25kg en aislamiento)
  // Fase 3–4: subidas más agresivas cuando hay estancamiento
  const isCompound=['Press_banca','Remo_con_barra','Sentadilla','Peso_muerto','Hip_thrust','Prensa'].some(k=>eid.includes(k));
  const increment=phase<=2?(isCompound?2.5:1.25):(isCompound?5:2.5);
  const {stuck}=analyzeExProgression(eid)||{stuck:false};

  if(stuck) return {rec:last+increment,reason:'Estancamiento detectado — sube '+increment+' kg'};
  const sessions=h.length;
  if(sessions>=2&&h[h.length-1].kg===h[h.length-2].kg){
    return {rec:last+increment,reason:'Mismo peso 2 sesiones — momento de subir'};
  }
  return {rec:last,reason:'Mantén el peso actual y completa todas las series'};
}

// Genera todos los insights de la semana actual
function generateWeeklyInsights(){
  const {phase,label,color,pct}=getTrainingPhase();
  const vol=getVolumeByPhase(phase);
  const curKg=wlog.length?wlog[wlog.length-1].kg:(P.weight||80);
  const insights=[];

  // 1. Insight de fase de entrenamiento
  insights.push({
    type:'phase',
    icon:'🎯',
    title:label,
    body:`Progreso hacia objetivo: ${Math.round(pct*100)}%. ${vol.desc}.`,
    color,
    detail:`Series recomendadas: ${vol.series} · Reps: ${vol.reps} · Descanso: ${vol.rest}`
  });

  // 2. Insight de cambio de peso corporal
  if(wlog.length>=2){
    const prev=wlog[wlog.length-2].kg;
    const diff=+(curKg-prev).toFixed(1);
    const weeklyLoss=diff;
    let wIcon,wTitle,wBody,wColor;
    if(weeklyLoss<=-0.8&&weeklyLoss>=-1.2){
      wIcon='✅';wTitle='Ritmo de pérdida óptimo';
      wBody=`Bajaste ${Math.abs(weeklyLoss)} kg esta semana. Déficit ideal: conservas músculo y pierdes grasa.`;
      wColor='var(--moss)';
    } else if(weeklyLoss<-1.2){
      wIcon='⚠️';wTitle='Pérdida muy rápida';
      wBody=`Bajaste ${Math.abs(weeklyLoss)} kg. Riesgo de perder músculo. Considera añadir 200–300 kcal/día o reducir cardio.`;
      wColor='var(--coral)';
    } else if(weeklyLoss<0&&weeklyLoss>-0.8){
      wIcon='📉';wTitle='Ritmo suave — bien encaminado';
      wBody=`Bajaste ${Math.abs(weeklyLoss)} kg. Podría acelerarse añadiendo una sesión de fuerza o pádel.`;
      wColor='var(--amber)';
    } else if(weeklyLoss===0){
      wIcon='➡️';wTitle='Sin cambio de peso';
      wBody='Puede ser retención de agua o stall. Mantén el plan 1–2 semanas antes de hacer ajustes.';
      wColor='var(--amber)';
    } else {
      wIcon='📈';wTitle='Subida de peso';
      wBody=`+${weeklyLoss} kg. Revisa si hay exceso calórico o retención. Ajusta la ingesta o aumenta actividad.`;
      wColor='var(--coral)';
    }
    insights.push({type:'weight',icon:wIcon,title:wTitle,body:wBody,color:wColor,detail:null});
  }

  // 3. Insights de ejercicios con estancamiento o PR
  const stuckExs=[], prExs=[], readyToProgressExs=[];
  Object.entries(exWeights).forEach(([eid,h])=>{
    if(!h||h.length<2)return;
    const ana=analyzeExProgression(eid);
    if(!ana)return;
    const name=eid.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase());
    if(ana.stuck) stuckExs.push({eid,name,last:ana.last});
    if(ana.isPR&&h.length>2) prExs.push({eid,name,pr:ana.pr});
    if(!ana.stuck&&ana.delta>0&&h.length>=2) readyToProgressExs.push({eid,name,last:ana.last});
  });

  if(prExs.length){
    insights.push({
      type:'pr',
      icon:'🏆',
      title:`${prExs.length > 1 ? prExs.length+' récords personales' : 'Récord personal'} esta semana`,
      body:prExs.slice(0,3).map(e=>`${e.name}: ${e.pr} kg`).join(' · '),
      color:'var(--coral)',
      detail:null
    });
  }

  if(stuckExs.length){
    insights.push({
      type:'stuck',
      icon:'🔄',
      title:`${stuckExs.length} ejercicio${stuckExs.length>1?'s':''} estancado${stuckExs.length>1?'s':''}`,
      body:stuckExs.slice(0,3).map(e=>`${e.name} (${e.last} kg)`).join(' · '),
      color:'var(--amber)',
      detail:'Aumenta el peso en la próxima sesión o cambia el ejercicio por una variante del mismo músculo.'
    });
  }

  // 4. Recomendación de ajuste de entrenamiento según fase
  if(phase>=3){
    insights.push({
      type:'adjust',
      icon:'⬆️',
      title:'Aumenta la intensidad',
      body:`Llevas un ${Math.round(pct*100)}% del camino. Es momento de reducir reps y aumentar carga.`,
      color:'var(--fuerza)',
      detail:'Pasa a rangos de 8–10 reps con cargas mayores. Añade una serie extra en ejercicios compuestos.'
    });
  }

  // 5. Ajuste de volumen si el déficit es muy grande
  const days=weekDays(wkOff);let padS=0,fuS=0;
  days.forEach((d,i)=>{const e=entry(fmt(d),i);if(e.type==='padel')padS++;else if(e.type==='fuerza')fuS++;});
  if(fuS>=4&&phase===1){
    insights.push({
      type:'volume',
      icon:'🧘',
      title:'Mucho volumen en fase inicial',
      body:`Con ${fuS} sesiones de fuerza en fase 1, el cuerpo puede sobrecargarse. Considera bajar a 3 sesiones.`,
      color:'var(--amber)',
      detail:'En la fase de adaptación, menos es más. Prioriza la calidad técnica sobre el volumen.'
    });
  }

  return {phase,label,color,pct,vol,insights};
}

function refreshAdaptiveInsights(){
  // Refresh results page if visible
  const rPage=document.getElementById('page-results');
  if(rPage&&rPage.classList.contains('active')){
    renderAdaptivePanel();
  }
}

function renderAdaptivePanel(){
  const container=document.getElementById('adaptive-panel');
  if(!container)return;
  const {phase,label,color,pct,vol,insights}=generateWeeklyInsights();

  container.innerHTML=`
    <div class="rcard-title">Análisis inteligente del plan</div>

    <!-- Fase actual -->
    <div style="background:var(--surf2);border-radius:var(--rs);padding:12px 14px;margin-bottom:14px;border:1px solid var(--brd);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="font-size:13px;font-weight:600;color:${color}">${label}</div>
        <div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--ink3)">${Math.round(pct*100)}% del objetivo</div>
      </div>
      <div style="height:5px;background:var(--surf3);border-radius:3px;overflow:hidden;margin-bottom:8px;">
        <div style="height:5px;background:${color};width:${Math.round(pct*100)}%;border-radius:3px;transition:width .5s ease;"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;">
        <div style="background:var(--surf);border-radius:7px;padding:7px 4px;border:1px solid var(--brd);">
          <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--ink3);text-transform:uppercase;margin-bottom:2px">Series</div>
          <div style="font-size:13px;font-weight:700;color:var(--fuerza)">${vol.series}</div>
        </div>
        <div style="background:var(--surf);border-radius:7px;padding:7px 4px;border:1px solid var(--brd);">
          <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--ink3);text-transform:uppercase;margin-bottom:2px">Reps</div>
          <div style="font-size:13px;font-weight:700;color:var(--fuerza)">${vol.reps}</div>
        </div>
        <div style="background:var(--surf);border-radius:7px;padding:7px 4px;border:1px solid var(--brd);">
          <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--ink3);text-transform:uppercase;margin-bottom:2px">Descanso</div>
          <div style="font-size:12px;font-weight:700;color:var(--fuerza)">${vol.rest}</div>
        </div>
      </div>
    </div>

    <!-- Insights -->
    ${insights.map(ins=>`
      <div style="padding:12px 0;border-bottom:1px solid var(--brd);">
        <div style="display:flex;align-items:flex-start;gap:10px;">
          <div style="font-size:18px;flex-shrink:0;margin-top:1px">${ins.icon}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:${ins.color};margin-bottom:3px">${ins.title}</div>
            <div style="font-size:12px;color:var(--ink2);line-height:1.5">${ins.body}</div>
            ${ins.detail?`<div style="font-size:11px;color:var(--ink3);margin-top:4px;font-style:italic">${ins.detail}</div>`:''}
          </div>
        </div>
      </div>
    `).join('')}

    <!-- Próximas cargas recomendadas -->
    ${renderNextWeightRecs()}
  `;
}

function renderNextWeightRecs(){
  const recs=[];
  Object.keys(exWeights).forEach(eid=>{
    const rec=getNextWeightRec(eid);
    if(rec){
      const name=eid.replace(/Tren_superior_|Tren_inferior_|Full_body_/g,'').replace(/_/g,' ');
      recs.push({name,rec:rec.rec,reason:rec.reason,current:exWeights[eid][exWeights[eid].length-1].kg});
    }
  });
  if(!recs.length) return '';
  return `
    <div style="padding-top:14px">
      <div style="font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--ink3);margin-bottom:10px">Próxima sesión — cargas recomendadas</div>
      ${recs.slice(0,6).map(r=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--brd);">
          <div>
            <div style="font-size:13px;font-weight:500;color:var(--ink)">${r.name}</div>
            <div style="font-size:11px;color:var(--ink3)">${r.reason}</div>
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:10px">
            <div style="font-family:'DM Mono',monospace;font-size:14px;font-weight:700;color:${r.rec>r.current?'var(--moss)':r.rec<r.current?'var(--coral)':'var(--fuerza)'}">${r.rec} kg</div>
            ${r.rec!==r.current?`<div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--ink3)">${r.rec>r.current?'↑':'↓'} ${Math.abs(+(r.rec-r.current).toFixed(1))} kg</div>`:''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// También muestra un mini-insight en el detalle del día de fuerza
function getDetailInsights(sub,dateKey){
  const {phase,vol}=generateWeeklyInsights();
  const fd=FD[sub]||FD['Tren superior'];
  const recs=fd.ex.map(x=>{
    const eid=exId(sub,x.n);
    const rec=getNextWeightRec(eid);
    return rec?{name:x.n,...rec}:null;
  }).filter(Boolean);
  if(!recs.length&&phase===1) return '';
  return `
    <div style="background:var(--fuerza-bg);border:1px solid var(--fuerza-br);border-radius:var(--rs);padding:12px 14px;margin-bottom:12px;">
      <div style="font-size:12px;font-weight:600;color:var(--fuerza);margin-bottom:6px">🎯 Plan adaptado · ${vol.series} series × ${vol.reps} reps</div>
      ${recs.slice(0,3).map(r=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--fuerza-br);">
          <div style="font-size:12px;color:var(--ink2)">${r.name}</div>
          <div style="font-family:'DM Mono',monospace;font-size:12px;font-weight:600;color:${r.rec>r.current?'var(--moss)':'var(--fuerza)'}">
            ${r.rec} kg ${r.rec>r.current?'↑':''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ─── NAV ─── */
function goPage(id,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.bn-btn').forEach(b=>b.classList.remove('active'));
  if(id==='admin'){
    document.getElementById('page-admin').classList.add('active');
    if(btn)btn.classList.add('active');
    if(typeof renderAdminPanel==='function')renderAdminPanel();
    return;
  }
  document.getElementById('page-'+id).classList.add('active');
  if(btn)btn.classList.add('active');
  if(id==='diet')renderDiet();
  if(id==='ejercicios')renderEjercicios();
  if(id==='inicio')renderHome();
  if(id==='supl')renderSuplPage();
  if(id==='results'){updateProj();renderWlog();renderChart();renderMS();renderAdaptivePanel();}
}

/* ════════════════════════════════════
   PANTALLA INICIO
════════════════════════════════════ */
function renderHome(){
  const now = new Date();
  const h = now.getHours();
  const greet = h<12?'Buenos días':h<18?'Buenas tardes':'Buenas noches';

  // Greeting
  const days=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  document.getElementById('home-greeting-sub').textContent =
    `${days[now.getDay()]} ${now.getDate()} de ${months[now.getMonth()]}`;
  document.getElementById('home-greeting-name').textContent =
    `${greet}, ${(P.name||'').split(' ')[0]}`;

  // Calculate day score from actual data
  const tk = fmt(now);
  const kcalTarget = P.kcalTarget||2000;

  // Nutrition score: kcal logged vs target
  let kcalDone=0;
  MEALS_CACHE.forEach(m=>{
    const items=[...m.items,...getCustomItems(m.id)];
    items.forEach(it=>{ if((checks[tk]||{})[it.id]) kcalDone+=it.kcal||0; });
  });
  const nutPct = Math.min(Math.round(kcalDone/kcalTarget*100),100);

  // Protein score
  const protTarget = getProteinTarget ? getProteinTarget() : Math.round((P.weight||80)*2);
  let protDone=0;
  MEALS_CACHE.forEach(m=>{
    const items=[...m.items,...getCustomItems(m.id)];
    items.forEach(it=>{ if((checks[tk]||{})[it.id]) protDone+=it.prot||0; });
  });
  const protPct = Math.min(Math.round(protDone/protTarget*100),100);

  // Training score: exercises done today
  const days7 = weekDays(wkOff);
  const todayIdx = days7.findIndex(d=>fmt(d)===tk);
  let trainPct=0, trainLabel='Sin entreno hoy', trainDone=0, trainTotal=0;
  if(todayIdx>=0){
    const e = entry(tk,todayIdx);
    if(e.type==='fuerza'&&e.sub){
      const fd=FD[e.sub]||FD['Tren superior'];
      trainTotal=fd.ex.length;
      trainDone=fd.ex.filter(x=>(exChecks[tk]||{})[exId(e.sub,x.n)]).length;
      trainPct=Math.round(trainDone/trainTotal*100);
      trainLabel=`${trainDone} / ${trainTotal} ejercicios`;
    } else if(e.type==='padel'){
      trainPct=100; trainLabel='Partido de pádel';
    } else if(e.type==='descanso'){
      trainPct=100; trainLabel='Día de descanso';
    }
  }

  // Supplements score
  const suplItems = getSuplPlanItems();
  const suplTotal = suplItems.length;
  const suplDone = suplItems.filter(s=>(suplChecks[tk]||{})[s.id]).length;
  const suplPct = suplTotal>0?Math.round(suplDone/suplTotal*100):0;

  // Overall score (weighted)
  const score = Math.round(nutPct*0.35 + protPct*0.25 + trainPct*0.25 + suplPct*0.15);

  // Update ring
  const circ = 201.06;
  const offset = circ - (circ * score/100);
  const arc = document.getElementById('home-ring-arc');
  if(arc){ arc.setAttribute('stroke-dashoffset', offset.toFixed(2)); }
  const numEl = document.getElementById('home-ring-num');
  if(numEl) numEl.textContent = score;
  const bigEl = document.getElementById('home-score-big');
  if(bigEl) bigEl.innerHTML = `${score}<span style="font-size:14px;color:var(--ink3);font-weight:600"> / 100</span>`;

  // Score message
  let msg='';
  if(score>=85) msg='¡Día excelente! Todo bajo control.';
  else if(score>=60){
    const pends=[];
    if(nutPct<80) pends.push('registrar más comidas');
    if(protPct<70) pends.push('completar proteína');
    if(trainPct<80) pends.push('terminar el entreno');
    if(suplPct<50) pends.push('tomar suplementos');
    msg=`Bien encaminado. Falta: <strong>${pends.slice(0,2).join(' y ')}</strong>.`;
  } else {
    msg='El día acaba de empezar. ¡A por ello!';
  }
  const msgEl=document.getElementById('home-score-msg');
  if(msgEl) msgEl.innerHTML=msg;

  // Progress bars
  const progs=[
    {ico:'🥗',label:'Nutrición',    sub:`${kcalDone} / ${kcalTarget} kcal`,  pct:nutPct,   col:'var(--fuerza)', dest:'diet'},
    {ico:'💪',label:'Proteína',     sub:`${protDone} / ${protTarget} g`,     pct:protPct,  col:'var(--coral)',  dest:'diet'},
    {ico:'🏋️',label:'Entrenamiento',sub:trainLabel,                          pct:trainPct, col:'var(--moss)',   dest:'training'},
    {ico:'💊',label:'Suplementos',  sub:`${suplDone} / ${suplTotal} tomas`,  pct:suplPct,  col:'var(--cardio)', dest:'supl'},
  ];
  const grid=document.getElementById('home-prog-grid');
  if(grid) grid.innerHTML=progs.map(p=>`
    <div onclick="goPage('${p.dest}',document.getElementById('bn-${p.dest}'))"
      style="background:var(--surf);border:1px solid var(--brd);border-radius:14px;padding:13px 15px;
      cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent;position:relative;"
      onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='rgba(100,80,50,.22)'"
      onmouseout="this.style.transform='';this.style.borderColor=''">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:9px;">
          <div style="width:28px;height:28px;border-radius:8px;background:var(--surf2);display:flex;align-items:center;justify-content:center;font-size:14px;">${p.ico}</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--ink);letter-spacing:-.1px">${p.label}</div>
            <div style="font-size:11px;color:var(--ink3);font-weight:500;margin-top:1px">${p.sub}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="font-size:13px;font-weight:700;color:${p.col}">${p.pct}%</div>
          <div style="width:20px;height:20px;border-radius:20px;background:var(--surf2);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--ink3);flex-shrink:0;">→</div>
        </div>
      </div>
      <div style="height:6px;background:var(--surf3);border-radius:3px;overflow:hidden;">
        <div style="height:6px;background:${p.col};width:${p.pct}%;border-radius:3px;transition:width .6s ease;"></div>
      </div>
    </div>
  `).join('');

  // Mini stats: kcal quemadas, agua (placeholder), sueño (placeholder)
  const kcalBurned = trainPct>0 && entry(tk,todayIdx||0).type==='fuerza' ? 480 : trainPct>0?800:0;
  const miniGrid=document.getElementById('home-mini-grid');
  if(miniGrid) miniGrid.innerHTML=[
    {ico:'🔥',val:kcalBurned||'—',lbl:'kcal quem.',col:'var(--coral)'},
    {ico:'💧',val:wlog.length?wlog[wlog.length-1].kg+'kg':'—',lbl:'últ. peso',col:'var(--fuerza)'},
    {ico:'🏆',val:Object.keys(exWeights).length,lbl:'ejercicios log.',col:'var(--amber)'},
  ].map(m=>`
    <div style="background:var(--surf);border:1px solid var(--brd);border-radius:14px;padding:12px 10px;text-align:center;">
      <div style="font-size:18px;margin-bottom:4px;">${m.ico}</div>
      <div style="font-size:20px;font-weight:800;letter-spacing:-.5px;color:${m.col}">${m.val}</div>
      <div style="font-size:10px;color:var(--ink3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-top:2px">${m.lbl}</div>
    </div>
  `).join('');

  // Next session
  const nextCard=document.getElementById('home-next-card');
  if(nextCard){
    // Find today or next training day
    let nextEntry=null, nextLabel='';
    for(let i=0;i<7;i++){
      const d=new Date(); d.setDate(d.getDate()+i); d.setHours(0,0,0,0);
      const k=fmt(d);
      const idx=weekDays(wkOff).findIndex(wd=>fmt(wd)===k);
      if(idx>=0){
        const e=entry(k,idx);
        if(e.type!=='descanso'){
          nextEntry=e;
          nextLabel=i===0?'hoy':i===1?'mañana':days[d.getDay()].toLowerCase();
          break;
        }
      }
    }
    if(nextEntry){
      const typeColor={padel:'var(--padel)',fuerza:'var(--fuerza)',cardio:'var(--cardio)',libre:'var(--libre)'}[nextEntry.type]||'var(--fuerza)';
      const typeBg={padel:'var(--padel-bg)',fuerza:'var(--fuerza-bg)',cardio:'var(--cardio-bg)',libre:'var(--libre-bg)'}[nextEntry.type]||'var(--fuerza-bg)';
      const typeIco={padel:'🎾',fuerza:'🏋️',cardio:'🏃',libre:'⭐'}[nextEntry.type]||'🏋️';
      nextCard.innerHTML=`
        <div onclick="goPage('training',document.getElementById('bn-training'))"
          style="background:${typeBg};border:1px solid rgba(0,0,0,.06);border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent;"
          onmouseover="this.style.transform='translateY(-2px)'"
          onmouseout="this.style.transform=''">
          <div style="width:40px;height:40px;border-radius:12px;background:${typeColor};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${typeIco}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:${typeColor};letter-spacing:-.1px">${nextEntry.sub||nextEntry.type} — ${nextLabel}</div>
            <div style="font-size:11px;color:var(--ink3);font-weight:500;margin-top:2px">Toca para abrir la sesión → ${nextEntry.time||''}</div>
          </div>
        </div>`;
    } else {
      nextCard.innerHTML='';
    }
  }
}

/* ════════════════════════════════════
   SUPLEMENTACIÓN
════════════════════════════════════ */
// Persistent storage for supplement state
let suplChecks = JSON.parse(localStorage.getItem('fp_supl_checks')||'{}');
let suplMine   = JSON.parse(localStorage.getItem('fp_supl_mine')||'["proteina","multivit","creatina"]');
let suplExtra  = JSON.parse(localStorage.getItem('fp_supl_extra')||'[]'); // suggestions added to plan

function persistSupl(){
  localStorage.setItem('fp_supl_checks', JSON.stringify(suplChecks));
  localStorage.setItem('fp_supl_mine',   JSON.stringify(suplMine));
  localStorage.setItem('fp_supl_extra',  JSON.stringify(suplExtra));
  if(typeof syncTimeout!=='undefined'){
    if(syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(syncToCloud,2000);
  }
}

// Master catalogue of all possible supplements
const SUPL_CATALOGUE = [
  {id:'proteina',  name:'Proteína whey',            ico:'🥛', desc:'Base para recuperación muscular'},
  {id:'multivit',  name:'Multivitaminas',            ico:'🫐', desc:'Micronutrientes esenciales diarios'},
  {id:'creatina',  name:'Creatina monohidrato',      ico:'⚡', desc:'Fuerza y volumen muscular'},
  {id:'omega3',    name:'Omega-3',                   ico:'🐟', desc:'Antiinflamatorio articular'},
  {id:'magnesio',  name:'Magnesio',                  ico:'🌙', desc:'Sueño y recuperación muscular'},
  {id:'cafeina',   name:'Cafeína / pre-entreno',     ico:'☕', desc:'Rendimiento en sesiones'},
  {id:'vitd',      name:'Vitamina D3',               ico:'🫀', desc:'Función muscular e inmunidad'},
  {id:'zinc',      name:'Zinc',                      ico:'💊', desc:'Testosterona y recuperación'},
  {id:'collageno', name:'Colágeno + Vit C',          ico:'🦴', desc:'Salud articular, clave en pádel'},
];

// Generate daily plan items from owned supplements
function getSuplPlanItems(){
  const all = [...suplMine, ...suplExtra];
  const hasFuerza = P.trains&&P.trains.includes('fuerza');
  const hasPadel  = P.trains&&P.trains.includes('padel');
  const items = [];
  const tk = fmt(new Date());

  all.forEach(id => {
    const cat = SUPL_CATALOGUE.find(c=>c.id===id);
    if(!cat) return;
    switch(id){
      case 'proteina':
        items.push({id:`supl_${tk}_prot_man`, suplId:'proteina', name:`${cat.ico} Proteína whey · 1 scoop`, when:'Desayuno · con agua o leche', timing:'manana'});
        if(hasFuerza||hasPadel)
          items.push({id:`supl_${tk}_prot_post`, suplId:'proteina', name:`${cat.ico} Proteína whey · 1 scoop`, when:'Post-entreno · máx. 30 min', timing:'post'});
        break;
      case 'multivit':
        items.push({id:`supl_${tk}_multi`, suplId:'multivit', name:`${cat.ico} Multivitaminas · 1 cápsula`, when:'Con el desayuno', timing:'manana'});
        break;
      case 'creatina':
        items.push({id:`supl_${tk}_crea`, suplId:'creatina', name:`${cat.ico} Creatina · 5g`, when:'Con el desayuno · todos los días', timing:'manana'});
        break;
      case 'omega3':
        items.push({id:`supl_${tk}_omega`, suplId:'omega3', name:`${cat.ico} Omega-3 · 2g`, when:'Con la cena', timing:'noche'});
        break;
      case 'magnesio':
        items.push({id:`supl_${tk}_mag`, suplId:'magnesio', name:`${cat.ico} Magnesio · 300mg`, when:'Con la cena', timing:'noche'});
        break;
      case 'cafeina':
        if(hasFuerza||hasPadel)
          items.push({id:`supl_${tk}_caf`, suplId:'cafeina', name:`${cat.ico} Cafeína · 200mg`, when:'30 min antes del entreno', timing:'pre'});
        break;
      case 'vitd':
        items.push({id:`supl_${tk}_vitd`, suplId:'vitd', name:`${cat.ico} Vitamina D3 · 2000 UI`, when:'Con el desayuno', timing:'manana'});
        break;
      case 'zinc':
        items.push({id:`supl_${tk}_zinc`, suplId:'zinc', name:`${cat.ico} Zinc · 15mg`, when:'Con la cena', timing:'noche'});
        break;
      case 'collageno':
        items.push({id:`supl_${tk}_coll`, suplId:'collageno', name:`${cat.ico} Colágeno + Vit C · 10g`, when:'En ayunas o post-entreno', timing:'manana'});
        break;
    }
  });
  return items;
}

// Suggestions catalogue with profile-based reasoning
function getSuplSuggestions(){
  const owned = [...suplMine,...suplExtra];
  const hasPadel  = P.trains&&P.trains.includes('padel');
  const hasFuerza = P.trains&&P.trains.includes('fuerza');
  const goal = P.goal||'loss';

  const all = [
    {id:'omega3',    priority:hasPadel?3:1,    tag:hasPadel?'Alta prioridad · pádel':'Media',  reason:hasPadel?'Reduce inflamación articular, clave con pádel 3×/sem. Mejora recuperación entre sesiones.':'Antiinflamatorio general, mejora recuperación.'},
    {id:'magnesio',  priority:2,                tag:'Media prioridad',                           reason:'Mejora calidad del sueño y recuperación muscular con alta carga de entrenamiento.'},
    {id:'cafeina',   priority:hasFuerza?2:1,    tag:'Opcional',                                  reason:'Mejora rendimiento en fuerza y pádel. Solo días de entreno, no después de las 15h.'},
    {id:'vitd',      priority:2,                tag:'Temporal (oct–abr)',                        reason:'Relevante en España en meses de baja exposición solar. Apoya función muscular e inmunidad.'},
    {id:'collageno', priority:hasPadel?3:1,     tag:hasPadel?'Alta prioridad · articulaciones':'Opcional', reason:'Salud articular. Muy recomendado si juegas pádel regularmente por el impacto repetitivo.'},
    {id:'zinc',      priority:goal==='muscle'?2:1, tag:'Opcional',                               reason:'Apoya niveles de testosterona y recuperación. Relevante en déficit calórico prolongado.'},
  ];

  return all
    .filter(s => !owned.includes(s.id))
    .sort((a,b)=>b.priority-a.priority);
}

function renderSuplPage(){
  renderMisSupl();
  renderSuplPlanList();
  renderSuplSugList();
  suplTab('plan');
}

function suplTab(tab){
  ['mis','plan','sug'].forEach(t=>{
    const el=document.getElementById('supl-'+t);
    const btn=document.getElementById('stab-'+t);
    if(el) el.style.display = t===tab?'block':'none';
    if(btn){ btn.classList.toggle('on',t===tab); }
  });
  if(tab==='plan') renderSuplPlanList();
  if(tab==='sug')  renderSuplSugList();
}

function renderMisSupl(){
  const list=document.getElementById('mis-supl-list');
  if(!list) return;
  list.innerHTML = SUPL_CATALOGUE.map(cat=>{
    const owned=suplMine.includes(cat.id);
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--brd);">
      <div onclick="toggleMiSupl('${cat.id}')" style="width:22px;height:22px;border-radius:7px;border:2px solid var(--brd2);flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;background:${owned?'var(--moss)':'transparent'};border-color:${owned?'var(--moss)':'var(--brd2)'};">${owned?'<span style="font-size:12px;color:#fff;font-weight:800">✓</span>':''}</div>
      <div style="width:34px;height:34px;border-radius:9px;background:var(--surf2);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${cat.ico}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--ink);letter-spacing:-.1px">${cat.name}</div>
        <div style="font-size:11px;color:var(--ink3);font-weight:500;margin-top:1px">${cat.desc}</div>
      </div>
      <span style="font-size:10px;font-weight:700;padding:2px 9px;border-radius:20px;background:${owned?'var(--moss-l)':'var(--surf2)'};color:${owned?'var(--moss)':'var(--ink3)'}">${owned?'Tengo':'No tengo'}</span>
    </div>`;
  }).join('');
  updateMisSuplCount();
}

function toggleMiSupl(id){
  if(suplMine.includes(id)) suplMine=suplMine.filter(x=>x!==id);
  else suplMine.push(id);
  persistSupl();
  renderMisSupl();
  renderSuplPlanList();
}

function updateMisSuplCount(){
  const el=document.getElementById('mis-supl-count');
  if(el) el.textContent=suplMine.length+' seleccionado'+(suplMine.length!==1?'s':'');
}

function renderSuplPlanList(){
  // Date nav bar
  const bar=document.getElementById('supl-date-bar');
  if(bar){
    const d=new Date(dietViewDate+'T12:00:00');
    const isToday=dietViewDate===fmt(new Date());
    const fwd=isToday?'opacity:.3;pointer-events:none':'';
    const suplTodayBtn = !isToday ? '<button onclick="dietViewDate=fmt(new Date());renderSuplPlanList()" style="font-size:10px;padding:3px 9px;border-radius:20px;border:1px solid var(--brd2);background:var(--coral-l);color:var(--coral);cursor:pointer;font-weight:700;">hoy</button>' : '';
    var suplDateLabel = isToday ? 'hoy' : DAYS[d.getDay()].toLowerCase()+' '+d.getDate()+' '+MON[d.getMonth()];
    bar.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;background:var(--surf);border:1px solid var(--brd);border-radius:12px;padding:8px 12px;">'
      +'<button onclick="suplNav(-1)" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--brd2);background:var(--surf2);cursor:pointer;font-size:13px;">←</button>'
      +'<div style="flex:1;text-align:center;font-size:11px;font-weight:700;color:var(--ink2)">'+suplDateLabel+'</div>'
      +'<button onclick="suplNav(1)" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--brd2);background:var(--surf2);cursor:pointer;font-size:13px;'+fwd+'">→</button>'
      +suplTodayBtn
      +'</div>';
  }
  const list=document.getElementById('supl-plan-list');
  if(!list) return;
  const items=getSuplPlanItems();
  const tk=dietViewDate;
  if(!items.length){
    list.innerHTML='<div style="font-size:13px;color:var(--ink3);padding:12px 0;font-style:italic">Selecciona tus suplementos en la pestaña anterior.</div>';
    return;
  }
  list.innerHTML=items.map(item=>{
    const done=(suplChecks[tk]||{})[item.id];
    const timingColors={manana:'var(--moss)',pre:'var(--amber)',post:'var(--coral)',noche:'var(--cardio)'};
    const timingBg={manana:'var(--moss-l)',pre:'var(--amber-l)',post:'var(--coral-l)',noche:'var(--cardio-bg)'};
    const timingLabel={manana:'Mañana',pre:'Pre-entreno',post:'Post-entreno',noche:'Noche'};
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--brd);" data-timing="${item.timing}">
      <div onclick="toggleSuplCheck('${item.id}')" style="width:22px;height:22px;border-radius:7px;border:2px solid var(--brd2);flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;background:${done?'var(--moss)':'transparent'};border-color:${done?'var(--moss)':'var(--brd2)'};">${done?'<span style="font-size:12px;color:#fff;font-weight:800">✓</span>':''}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:${done?'var(--ink3)':'var(--ink)'};${done?'text-decoration:line-through':''}">${item.name}</div>
        <div style="font-size:11px;color:var(--ink3);margin-top:1px">${item.when}</div>
      </div>
      <span style="font-size:10px;font-weight:700;padding:2px 9px;border-radius:20px;background:${done?'var(--moss-l)':timingBg[item.timing]};color:${done?'var(--moss)':timingColors[item.timing]};flex-shrink:0">${done?'✓ Hecho':timingLabel[item.timing]}</span>
    </div>`;
  }).join('');
  updateSuplPct();
}

function toggleSuplCheck(id){
  const tk=fmt(new Date());
  if(!suplChecks[tk]) suplChecks[tk]={};
  suplChecks[tk][id]=!suplChecks[tk][id];
  persistSupl();
  renderSuplPlanList();
  // Refresh home score if visible
  if(document.getElementById('page-inicio').classList.contains('active')) renderHome();
}

function updateSuplPct(){
  const items=getSuplPlanItems();
  const tk=fmt(new Date());
  const done=items.filter(s=>(suplChecks[tk]||{})[s.id]).length;
  const pct=items.length?Math.round(done/items.length*100):0;
  const el=document.getElementById('supl-plan-pct');
  if(el) el.textContent=pct+'%';
}

function filterSuplPlan(btn,timing){
  document.querySelectorAll('#supl-plan-list [data-timing]').forEach(row=>{
    row.style.display=(timing==='all'||row.dataset.timing===timing)?'flex':'none';
  });
  document.querySelectorAll('#supl-plan-list').length;
  // Update button styles
  ['stf-all','stf-man','stf-pre','stf-post','stf-noche'].forEach(id=>{
    const b=document.getElementById(id);
    if(b) b.classList.remove('on');
  });
  btn.classList.add('on');
}

function renderSuplSugList(){
  const list=document.getElementById('supl-sug-list');
  if(!list) return;
  const sugs=getSuplSuggestions();
  if(!sugs.length){
    list.innerHTML='<div style="text-align:center;padding:24px;font-size:13px;color:var(--ink3);font-style:italic">¡Tienes todos los suplementos recomendados para tu rutina!</div>';
    return;
  }
  list.innerHTML=sugs.map((s,i)=>{
    const cat=SUPL_CATALOGUE.find(c=>c.id===s.id);
    const isTop=s.priority>=3;
    const added=suplExtra.includes(s.id);
    return `<div style="background:var(--surf);border:${isTop?'1.5px solid rgba(46,95,163,.25)':'1px solid var(--brd)'};border-radius:16px;padding:14px 15px;margin-bottom:8px;${isTop?'background:var(--fuerza-bg);':''}">
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <div style="width:38px;height:38px;border-radius:10px;background:var(--surf2);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0">${cat.ico}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px;">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--ink);letter-spacing:-.1px">${cat.name}</div>
              <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${isTop?'var(--fuerza-bg)':'var(--surf2)'};color:${isTop?'var(--fuerza)':'var(--ink3)'};border:1px solid ${isTop?'var(--fuerza-br)':'var(--brd)'};display:inline-block;margin-top:3px">${s.tag}</span>
            </div>
            <button onclick="addSuplSuggestion('${s.id}',this)" ${added?'disabled':''} style="padding:6px 12px;border-radius:20px;border:1px solid var(--brd2);background:${added?'var(--moss-l)':'var(--surf)'};color:${added?'var(--moss)':'var(--ink2)'};font-size:12px;font-weight:600;cursor:${added?'default':'pointer'};flex-shrink:0;transition:all .15s;">${added?'✓ Añadido':'+ Añadir'}</button>
          </div>
          <div style="font-size:12px;color:var(--ink2);line-height:1.5">${s.reason}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function addSuplSuggestion(id, btn){
  if(!suplExtra.includes(id)) suplExtra.push(id);
  persistSupl();
  btn.textContent='✓ Añadido';
  btn.disabled=true;
  btn.style.background='var(--moss-l)';
  btn.style.color='var(--moss)';
  // Refresh suggestions and plan
  renderSuplSugList();
  renderSuplPlanList();
}

/* ════ TRAINING ════ */
function renderTraining(){
  const today=new Date();today.setHours(0,0,0,0);
  const days=weekDays(wkOff);
  document.getElementById('wn-label').textContent=wkStr(days);
  document.getElementById('train-sub').textContent=wkOff===0?'semana actual':wkOff>0?`+${wkOff} sem`:`${wkOff} sem`;
  let pad=0,fu=0,de=0;
  days.forEach((d,i)=>{const e=entry(fmt(d),i);if(e.type==='padel')pad++;else if(e.type==='fuerza')fu++;else de++;});
  const hasCardio=P.trains&&P.trains.includes('cardio');
  document.getElementById('stat-strip').innerHTML=`
    <div class="sc2"><div class="sc2-lbl">Pádel</div><div class="sc2-val green">${pad}</div><div class="sc2-note">partidos</div></div>
    <div class="sc2"><div class="sc2-lbl">Fuerza</div><div class="sc2-val blue">${fu}</div><div class="sc2-note">sesiones</div></div>
    ${hasCardio?`<div class="sc2"><div class="sc2-lbl">Cardio</div><div class="sc2-val purple">7</div><div class="sc2-note">30 min/día</div></div>`:'<div class="sc2"><div class="sc2-lbl">Descanso</div><div class="sc2-val coral">'+de+'</div><div class="sc2-note">días</div></div>'}
    <div class="sc2"><div class="sc2-lbl">Kcal obj.</div><div class="sc2-val amber">${(P.kcalTarget||0).toLocaleString()}</div><div class="sc2-note">kcal/día</div></div>
  `;
  const g=document.getElementById('week-grid');g.innerHTML='';
  days.forEach((d,i)=>{
    const key=fmt(d);
    const acts=getActivities(key,i);
    const e=acts[0]; // primary activity for legacy compat
    const isT=d.getTime()===today.getTime(),isSel=selKey===key;
    const c=document.createElement('div');
    c.className='day-card'+(isSel?' sel':'')+(isT?' today-c':'');
    c.onclick=()=>cardClick(key,i,d,e);
    const tCls={padel:'at-padel',fuerza:'at-fuerza',descanso:'at-descanso',libre:'at-libre',custom:'at-libre'};
    const tTxt={padel:'Pádel',fuerza:'Fuerza',descanso:'Descanso',libre:'Libre',custom:'Libre'};
    const hasC=P.trains&&P.trains.includes('cardio');
    const cardioDone=hasC?CARDIO_OPTS.filter(o=>(cardioChecks[key]||{})[o.id]).length:0;
    // Progress bar from first fuerza/custom activity
    let prog='';
    const fuAct=acts.find(a=>a.type==='fuerza');
    const cuAct=acts.find(a=>a.type==='custom');
    if(fuAct){
      const fd=FD[fuAct.sub]||FD['Tren superior'];
      const done=fd.ex.filter(x=>(exChecks[key]||{})[exId(fuAct.sub,x.n)]).length;
      prog=`<div class="dc-prog"><div class="dc-prog-fill" style="width:${Math.round(done/fd.ex.length*100)}%"></div></div>`;
    } else if(cuAct){
      const cwk=customWorkouts[key]||{exercises:[]};
      const total=cwk.exercises.length;
      const done=total?cwk.exercises.filter(x=>(exChecks[key]||{})[exId('custom',x.n)]).length:0;
      if(total) prog=`<div class="dc-prog"><div class="dc-prog-fill" style="width:${Math.round(done/total*100)}%"></div></div>`;
    }
    // Build activity tags (max 2 visible + dots indicator)
    const actTags = acts.map(a=>`<div class="atag ${tCls[a.type]||'at-descanso'}">${tTxt[a.type]||a.type}</div>`).join('');
    c.innerHTML=`
      <div class="dc-name">${DS[i===6?0:i+1]}</div>
      <div class="dc-num${isT?' tn':''}">${d.getDate()}</div>
      ${actTags}
      ${hasC&&acts.some(a=>a.type!=='descanso')?`<div class="atag at-cardio">🏃 Cardio${cardioDone?' ✓':''}</div>`:''}
      <div class="dc-sub">${e.time||''}</div>
      ${prog}
    `;
    g.appendChild(c);
  });
}

function cardClick(key,i,date,e){
  if(editMode){openModal(key,i,date);return;}
  if(selKey===key){selKey=null;document.getElementById('detail-panel').classList.remove('show');renderTraining();return;}
  selKey=key;renderTraining();showDetailMulti(key,i,date);
}

/* ── Store swapped exercise names per session key ── */
if(!window.exSwaps) window.exSwaps = {};

function buildExRow(x, sub, dateKey){
  const swapKey = sub + '_slot_' + x.n;
  const activeName = (window.exSwaps[swapKey]) || x.n;
  const activeEid = exId(sub, activeName);
  const ck = (exChecks[dateKey]||{})[activeEid];
  const lastKg = getLastW(activeEid);
  const pr = getPR(activeEid);
  const showPR = pr && lastKg && parseFloat(lastKg) >= pr && (exWeights[activeEid]||[]).length > 1;
  const isSwapped = activeName !== x.n;
  const altPanelId = 'alt_' + exId(sub, x.n);

  // Build alt panel HTML if EX_DB has this exercise
  const exData = EX_DB[x.n];
  const altBtn = exData
    ? `<button class="ex-hist" onclick="event.stopPropagation();toggleAltPanel('${altPanelId}','${x.n}','${sub}','${dateKey}')" title="Cambiar ejercicio">⇄</button>`
    : '';

  const altPanel = exData ? `<div id="${altPanelId}" style="display:none;background:var(--surf2);border-radius:10px;margin:4px 0 6px;padding:8px;border:1px solid var(--brd2);">
    <div style="font-size:10px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px;">Alternativas · ${x.n}</div>
    ${(()=>{
      // Store alts in a registry so onclick can use index safely
      const regKey = 'alts_' + altPanelId;
      window._altReg = window._altReg || {};
      window._altReg[regKey] = {alts: exData.alts, swapKey, sub, dateKey, panelId: altPanelId};
      return exData.alts.map((a,i)=>{
        const altEid = exId(sub, a.n);
        const altLastKg = getLastW(altEid);
        const isActive = activeName === a.n;
        const borderCol = isActive ? 'var(--fuerza)' : 'var(--brd)';
        const nameCol   = isActive ? 'var(--fuerza)' : 'var(--ink)';
        const activeBadge = isActive ? '<span style="font-size:9px;background:var(--fuerza-bg);color:var(--fuerza);padding:1px 5px;border-radius:4px;font-weight:700;margin-left:4px;">activo</span>' : '';
        const weightHtml = altLastKg
          ? '<div style="font-size:12px;font-weight:700;color:var(--moss);">'+altLastKg+' kg</div><div style="font-size:9px;color:var(--ink3);">últ. reg.</div>'
          : '<div style="font-size:10px;color:var(--ink4);">sin registro</div>';
        // Use data attributes to avoid any quoting issues in onclick
        return '<div data-rk="'+regKey+'" data-ai="'+i+'" class="_alt-pick" style="display:flex;align-items:center;gap:8px;padding:7px 8px;background:var(--surf);border:1px solid '+borderCol+';border-radius:9px;margin-bottom:5px;cursor:pointer;">'
          + '<div style="flex:1;min-width:0;">'
          + '<div style="font-size:12px;font-weight:600;color:'+nameCol+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + a.n + activeBadge + '</div>'
          + '<div style="font-size:10px;color:var(--ink3);margin-top:1px;">' + a.d + '</div>'
          + '</div>'
          + '<div style="text-align:right;flex-shrink:0;">' + weightHtml + '</div>'
          + '</div>';
      }).join('');
    })()}
    ${isSwapped ? (()=>{
      const rk = 'reset_'+altPanelId;
      window._altReg = window._altReg||{};
      window._altReg[rk] = {swapKey, sub, dateKey, panelId: altPanelId};
      return '<div style="margin-top:6px;"><button data-rk="'+rk+'" class="_alt-reset" style="font-size:10px;padding:4px 10px;border-radius:20px;border:1px solid var(--coral-br);background:var(--coral-l);color:var(--coral);cursor:pointer;font-weight:600;">↩ Restaurar ('+x.n+')</button></div>';
    })() : ''}
  </div>` : '';

  return '<div>'
    + `<div class="ex-row">
    <div class="ex-chk${ck?' on':''}" onclick="toggleExChk('${activeEid}','${dateKey}')"></div>
    <div class="ex-info">
      <div class="ex-n${ck?' done':''}${isSwapped?' style="color:var(--fuerza)"':''}">
        ${activeName}${isSwapped?` <span style="font-size:9px;background:var(--fuerza-bg);color:var(--fuerza);border-radius:4px;padding:1px 5px;font-weight:700;">alt</span>`:''}
      </div>
      <div class="ex-s">${x.s}${lastKg?' · últ: '+lastKg+' kg':''}</div>
    </div>
    <div class="ex-right">
      ${showPR?`<span class="ex-pr">PR</span>`:''}
      <input class="ex-w-inp" type="number" min="0" max="500" step="0.5" inputmode="decimal"
        placeholder="${lastKg||'kg'}" value="${lastKg||''}"
        ${(dateKey!==fmt(new Date())&&lastKg&&ck)?'readonly style="opacity:.5;cursor:not-allowed;background:var(--surf3);" title="Registro bloqueado"':''}
        onchange="saveExW('${activeEid}',this.value)" onclick="event.stopPropagation()"/>
      <span class="ex-w-unit">kg</span>
      ${altBtn}
      <button class="ex-hist" onclick="event.stopPropagation();openHist('${activeEid}','${activeName}')">hist.</button>
    </div>
  </div>`
    + altPanel
    + '</div>';
}

function toggleAltPanel(panelId, exName, sub, dateKey){
  const panel = document.getElementById(panelId);
  if(!panel) return;
  const isOpen = panel.style.display !== 'none';
  // Close all other open panels first
  document.querySelectorAll('[id^="alt_"]').forEach(p => p.style.display = 'none');
  panel.style.display = isOpen ? 'none' : 'block';
}

function _selectAltByIdx(regKey, idx){
  const reg = (window._altReg||{})[regKey];
  if(!reg) return;
  const a = reg.alts[idx];
  selectAltEx(reg.swapKey, a.n, reg.sub, reg.dateKey, reg.panelId);
}

function selectAltEx(swapKey, newName, sub, dateKey, panelId){
  window.exSwaps[swapKey] = newName;
  const days = weekDays(wkOff);
  const idx = days.findIndex(d => fmt(d) === dateKey);
  if(idx >= 0) showDetailMulti(dateKey, idx, days[idx]);
  const lastKg = getLastW(exId(sub, newName));
  const msg = lastKg
    ? newName + ' seleccionado · último peso: ' + lastKg + ' kg cargado'
    : newName + ' seleccionado · primera vez con este ejercicio';
  showExSwapToast(msg);
}

function _resetAltByKey(rk){
  const reg = (window._altReg||{})[rk];
  if(!reg) return;
  resetAltEx(reg.swapKey, reg.sub, reg.dateKey, reg.panelId);
}

// Delegated events for alt picker rows (avoids inline onclick quoting issues)
document.addEventListener('click', function(e){
  const pick = e.target.closest('._alt-pick');
  if(pick){
    e.stopPropagation();
    const rk = pick.dataset.rk;
    const ai = parseInt(pick.dataset.ai);
    _selectAltByIdx(rk, ai);
    return;
  }
  const reset = e.target.closest('._alt-reset');
  if(reset){
    e.stopPropagation();
    _resetAltByKey(reset.dataset.rk);
    return;
  }
  const libItem = e.target.closest('._lib-day-item');
  if(libItem){
    const sheet = document.getElementById('hist-sheet');
    const dk = sheet ? sheet.dataset.libDk : null;
    if(dk) addLibExToDay(dk, libItem.dataset.n);
    return;
  }
  const favRow = e.target.closest('._fe-fav-row');
  if(favRow && favRow.dataset.fid){
    _feAddFav(favRow.dataset.fid);
  }
});

function resetAltEx(swapKey, sub, dateKey, panelId){
  delete window.exSwaps[swapKey];
  const days = weekDays(wkOff);
  const idx = days.findIndex(d => fmt(d) === dateKey);
  if(idx >= 0) showDetailMulti(dateKey, idx, days[idx]);
}

let _exToastTimer = null;
function showExSwapToast(msg){
  let t = document.getElementById('ex-swap-toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'ex-swap-toast';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#eaf3de;border:1px solid rgba(59,109,17,.2);border-radius:12px;padding:9px 14px;font-size:12px;font-weight:600;color:#27500a;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.12);max-width:320px;text-align:center;transition:opacity .3s;';
    document.body.appendChild(t);
  }
  t.textContent = '✓ ' + msg;
  t.style.opacity = '1';
  clearTimeout(_exToastTimer);
  _exToastTimer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

function toggleExChk(eid,dk){
  const isPastDay = dk!==fmt(new Date());
  // Past day: can ADD (check unchecked) but cannot REMOVE (uncheck checked)
  if(isPastDay && (exChecks[dk]||{})[eid]===true){return;}
  if(!exChecks[dk])exChecks[dk]={};
  exChecks[dk][eid]=!exChecks[dk][eid];persist();
  const days=weekDays(wkOff);const idx=days.findIndex(d=>fmt(d)===selKey);
  if(idx>=0)showDetailMulti(selKey,idx,days[idx]);
  renderTraining();
}
function toggleCardioChk(optId,dk){
  // Past day: can add but not remove
  if(dk!==fmt(new Date()) && (cardioChecks[dk]||{})[optId]===true){return;}
  if(!cardioChecks[dk])cardioChecks[dk]={};
  cardioChecks[dk][optId]=!cardioChecks[dk][optId];persist();
  const days=weekDays(wkOff);const idx=days.findIndex(d=>fmt(d)===selKey);
  if(idx>=0)showDetailMulti(selKey,idx,days[idx]);
  renderTraining();
}

/* ════ MULTI-ACTIVITY DETAIL ════ */
function showDetailMulti(key, i, date){
  const acts = getActivities(key, i);
  // Build a combined detail panel with one block per activity
  const ds = DAYS[i===6?0:i+1]+', '+date.getDate()+' de '+MON[date.getMonth()];
  const dk = fmt(date);
  const hasCardio = P.trains && P.trains.includes('cardio');
  const cardioDone = hasCardio ? CARDIO_OPTS.filter(o=>(cardioChecks[dk]||{})[o.id]).length : 0;

  // Cardio block (always shown if user trains cardio)
  const cardioBlock = hasCardio ? (()=>{
    const rows = CARDIO_OPTS.map(o=>{
      const ck=(cardioChecks[dk]||{})[o.id];
      return '<div class="cardio-row">'
        +'<div class="cardio-chk'+(ck?' on':'')+'" data-oid="'+o.id+'" data-dk="'+dk+'" onclick="toggleCardioChk(this.dataset.oid,this.dataset.dk)"></div>'
        +'<div class="cardio-name'+(ck?' done':'')+'">'+o.name+'</div>'
        +'<div class="cardio-dur">'+o.dur+'</div>'
        +'</div>';
    }).join('');
    return '<div class="cardio-block">'
      +'<div class="cardio-block-title">🏃 Cardio · 30 min <span style="font-size:11px;font-weight:400;opacity:.7">('+cardioDone+'/'+CARDIO_OPTS.length+')</span></div>'
      +rows
      +'</div>';
  })() : '';

  // Build one HTML block per activity
  let blocksHtml = acts.map((act, ai) => buildActivityBlock(act, ai, dk, date)).join('');

  // "Añadir actividad" button
  const addActBtn = `<button onclick="addActivityToDay('${key}',${i})" style="width:100%;margin-top:10px;padding:10px;border-radius:12px;border:1px dashed rgba(100,80,50,.25);background:transparent;font-size:12px;font-weight:600;color:var(--ink3);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;">＋ Añadir otra actividad</button>`;

  const p = document.getElementById('detail-panel');
  p.innerHTML = `<div class="dp-hd"><div><div class="dp-title">Entrenamiento</div><div class="dp-date">${ds}</div></div><button class="dp-x" onclick="closeDetail()">×</button></div>${blocksHtml}${cardioBlock}${addActBtn}`;
  p.classList.add('show');
  p.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function buildActivityBlock(act, idx, dk, date){
  const typeIco = {padel:'🎾',fuerza:'🏋️',descanso:'🌿',libre:'✦',custom:'✏️'}[act.type]||'•';
  const typeCol = {padel:'var(--padel)',fuerza:'var(--fuerza)',descanso:'var(--moss)',libre:'var(--amber)',custom:'var(--moss)'}[act.type]||'var(--ink)';
  const typeBg  = {padel:'var(--padel-bg)',fuerza:'var(--fuerza-bg)',descanso:'var(--moss-l)',libre:'var(--amber-l)',custom:'var(--moss-l)'}[act.type]||'var(--surf2)';

  // Collapsible header
  const blockId = 'act-block-'+idx;
  const isPast = dk !== fmt(new Date());
  let body = '';

  if(act.type === 'fuerza'){
    const fd = FD[act.sub]||FD['Tren superior'];
    const done = fd.ex.filter(x=>(exChecks[dk]||{})[exId(act.sub,x.n)]).length;
    const pct = Math.round(done/fd.ex.length*100);
    body = getDetailInsights(act.sub,dk)
      + '<div class="ex-section-title"><span>Ejercicios — pesos</span><span style="color:var(--fuerza)">'+pct+'%</span></div>'
      + '<div class="ex-prog-bar"><div class="ex-prog-fill" style="width:'+pct+'%"></div></div>'
      + fd.ex.map(x=>buildExRow(x,act.sub,dk)).join('')
      + '<div class="dp-note-b" style="margin-top:12px">Sube el peso cuando completes todas las series con buena técnica 2 semanas seguidas.</div>';
  } else if(act.type === 'custom'){
    body = buildCustomWorkoutBlock(dk);
  } else if(act.type === 'padel'){
    const durBtns = ['60 min','90 min','120 min'].map(dur=>{
      const isOn = act.sub === dur;
      return '<button data-dur="'+dur+'" data-dk="'+dk+'" onclick="setPadelDur(this.dataset.dk,this.dataset.dur)" style="font-size:10px;padding:3px 9px;border-radius:20px;border:1px solid var(--brd2);background:'+(isOn?'var(--padel-bg)':'var(--surf)')+';color:'+(isOn?'var(--padel)':'var(--ink3)')+';cursor:pointer;font-weight:'+(isOn?'700':'400')+';">'+dur+'</button>';
    }).join('');
    body = '<div style="padding:10px 0;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
      + '<div style="font-size:12px;color:var(--ink2);">Duración</div>'
      + '<div style="display:flex;gap:5px;">'+durBtns+'</div></div>'
      + '<div style="display:flex;justify-content:space-between;"><div style="font-size:12px;color:var(--ink2);">Gasto estimado</div><div style="font-size:13px;font-weight:700;color:var(--ink);">~800 kcal</div></div>'
      + '</div>';
  } else if(act.type === 'descanso'){
    body = '<div class="dp-note-b">Caminata, movilidad o estiramientos. El músculo crece y se repara hoy.</div>';
  } else {
    body = '<div class="dp-note-b">Actividad registrada.</div>';
  }

  // Remove activity button (only if more than 1 activity)
  return '<div style="background:var(--surf);border:1px solid var(--brd);border-radius:16px;margin-bottom:10px;overflow:hidden;">'
    + '<div style="background:'+typeBg+';padding:11px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;" data-bid="'+blockId+'" onclick="toggleActBlock(this.dataset.bid)">'
    + '<span style="font-size:16px;">'+typeIco+'</span>'
    + '<div style="flex:1;font-size:13px;font-weight:700;color:'+typeCol+';">'+(act.sub||({padel:'Pádel',fuerza:'Fuerza',descanso:'Descanso',custom:'Entreno libre'}[act.type]||act.type))+'</div>'
    + (isPast?'<span style="font-size:9px;background:var(--surf3);color:var(--ink3);padding:1px 7px;border-radius:10px;margin-right:4px;">🔒</span>':'')
    + '<span style="font-size:10px;color:'+typeCol+';opacity:.7;" id="arr-'+blockId+'">▾</span>'
    + '</div>'
    + '<div id="'+blockId+'" style="padding:12px 14px;">'+body+'</div>'
    + '</div>';
}

function toggleActBlock(id){
  const el=document.getElementById(id);
  const arr=document.getElementById('arr-'+id);
  if(!el)return;
  const open=el.style.display!=='none';
  el.style.display=open?'none':'block';
  if(arr)arr.textContent=open?'▸':'▾';
}

function setPadelDur(dk, dur){
  const i=weekDays(wkOff).findIndex(d=>fmt(d)===dk);
  const acts=getActivities(dk, i);
  const p=acts.find(a=>a.type==='padel');
  if(p) p.sub=dur;
  setActivities(dk, acts);
  showDetailMulti(dk, i, weekDays(wkOff)[i]);
}

function addActivityToDay(key, i){
  pMultiMode = true;
  openModal(key, i, weekDays(wkOff)[i]);
}

/* ════ CUSTOM WORKOUT BUILDER ════ */
function buildCustomWorkoutBlock(dk){
  const cwk = customWorkouts[dk] || {name:'Entreno libre', exercises:[]};
  const exRows = cwk.exercises.map((x,xi)=>{
    const eid = exId('custom', x.n);
    const ck = (exChecks[dk]||{})[eid];
    const lastKg = getLastW(eid);
    return '<div class="ex-row">'
      + '<div class="ex-chk'+(ck?' on':'')+'" data-eid="'+eid+'" data-dk="'+dk+'" onclick="toggleExChk(this.dataset.eid,this.dataset.dk)"></div>'
      + '<div class="ex-info"><div class="ex-n'+(ck?' done':'')+'">'+x.n+'</div><div class="ex-s">'+x.s+'</div></div>'
      + '<div class="ex-right">'
      + '<input class="ex-w-inp" type="number" min="0" max="500" step="0.5" inputmode="decimal" placeholder="'+(lastKg||'kg')+'" value="'+(lastKg||'')+'" data-eid="'+eid+'" onchange="saveExW(this.dataset.eid,this.value)" onclick="event.stopPropagation()"/>'
      + '<span class="ex-w-unit">kg</span>'
      + '<button class="ex-hist" data-dk="'+dk+'" data-xi="'+xi+'" onclick="event.stopPropagation();removeCustomEx(this.dataset.dk,parseInt(this.dataset.xi))">✕</button>'
      + '</div></div>';
  }).join('');

  return '<div class="ex-section-title">Ejercicios libres</div>'
    + exRows
    + '<div style="margin-top:10px;display:flex;gap:6px;">'
    + '<input id="cwk-add-inp-'+dk+'" type="text" placeholder="A\u00f1adir ejercicio..." style="flex:1;background:var(--surf);border:1px solid var(--brd2);border-radius:8px;padding:7px 10px;font-size:12px;color:var(--ink);outline:none;">'
    + '<button data-dk="'+dk+'" onclick="addCustomExToDay(this.dataset.dk)" style="padding:7px 12px;border-radius:8px;border:none;background:var(--moss);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">+ A\u00f1adir</button>'
    + '</div>'
    + '<div style="margin-top:8px;"><button data-dk="'+dk+'" onclick="openLibraryForDay(this.dataset.dk)" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--brd2);background:var(--surf2);font-size:11px;font-weight:600;color:var(--ink2);cursor:pointer;">📚 A\u00f1adir desde biblioteca</button></div>';
}

function removeCustomEx(dk, idx){
  if(!customWorkouts[dk]) return;
  customWorkouts[dk].exercises.splice(idx, 1);
  persistCWK();
  showDetailMulti(dk, weekDays(wkOff).findIndex(d=>fmt(d)===dk), weekDays(wkOff).find(d=>fmt(d)===dk));
}

function addCustomExToDay(dk){
  const inp = document.getElementById('cwk-add-inp-'+dk);
  if(!inp) return;
  const name = inp.value.trim();
  if(!name) return;
  if(!customWorkouts[dk]) customWorkouts[dk] = {name:'Entreno libre', exercises:[]};
  customWorkouts[dk].exercises.push({n:name, s:'3×12'});
  persistCWK();
  inp.value = '';
  showDetailMulti(dk, weekDays(wkOff).findIndex(d=>fmt(d)===dk), weekDays(wkOff).find(d=>fmt(d)===dk));
}

function openLibraryForDay(dk){
  const names = Object.keys(EX_DB);
  // Use data-n only, dk stored on the sheet — no inline onclick quoting issue
  const list = names.map(n=>{
    const safe = n.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
    return '<div class="_lib-day-item" data-n="'+safe+'" style="padding:8px 12px;border-bottom:1px solid var(--brd);cursor:pointer;font-size:13px;color:var(--ink);">'+safe+'</div>';
  }).join('');
  document.getElementById('hs-title').textContent = 'Ejercicios · biblioteca';
  document.getElementById('hs-body').innerHTML =
    '<div style="margin-bottom:8px;"><input id="lib-day-search" type="text" placeholder="Buscar ejercicio..." oninput="filterLibDay(this.value)" style="width:100%;background:var(--surf);border:1px solid var(--brd2);border-radius:8px;padding:8px 10px;font-size:12px;outline:none;"/></div>'
    + '<div id="lib-day-list">'+list+'</div>';
  document.getElementById('hist-sheet').dataset.libDk = dk;
  document.getElementById('hist-sheet').classList.add('show');
}

function filterLibDay(q){
  const list = document.getElementById('lib-day-list');
  if(!list) return;
  list.querySelectorAll('div[data-n]').forEach(el=>{
    el.style.display = el.dataset.n.toLowerCase().includes(q.toLowerCase()) ? 'block' : 'none';
  });
}

function addLibExToDay(dk, name){
  if(!customWorkouts[dk]) customWorkouts[dk] = {name:'Entreno libre', exercises:[]};
  if(!customWorkouts[dk].exercises.find(x=>x.n===name)){
    customWorkouts[dk].exercises.push({n:name, s:'3×12'});
    persistCWK();
  }
  document.getElementById('hist-sheet').classList.remove('show');
  showDetailMulti(dk, weekDays(wkOff).findIndex(d=>fmt(d)===dk), weekDays(wkOff).find(d=>fmt(d)===dk));
}

/* ── Also update openModal to add "Entreno libre" as option ── */

function showDetail(key,i,date,e){
  const type=e.type,sub=e.sub||'';
  const ds=`${DAYS[i===6?0:i+1]}, ${date.getDate()} de ${MON[date.getMonth()]}`;
  const dk=fmt(date);
  const hasCardio=P.trains&&P.trains.includes('cardio');
  const cardioDone=CARDIO_OPTS.filter(o=>(cardioChecks[dk]||{})[o.id]).length;
  const cardioBlock=hasCardio?`<div class="cardio-block">
    <div class="cardio-block-title">🏃 Cardio · 30 min <span style="font-size:11px;font-weight:400;opacity:.7">(${cardioDone}/${CARDIO_OPTS.length})</span></div>
    ${CARDIO_OPTS.map(o=>{const ck=(cardioChecks[dk]||{})[o.id];return `<div class="cardio-row"><div class="cardio-chk${ck?' on':''}" onclick="toggleCardioChk('${o.id}','${dk}')"></div><div class="cardio-name${ck?' done':''}">${o.name}</div><div class="cardio-dur">${o.dur}</div></div>`;}).join('')}
  </div>`:'';
  let main='';
  if(type==='padel'){
    main=`<div class="dp-meta"><div class="dp-b-sm"><div class="dp-bl">Duración</div><div class="dp-bv">90 min</div></div><div class="dp-b-sm"><div class="dp-bl">Gasto</div><div class="dp-bv">~800 kcal</div></div></div>
    <div class="dp-note-b">Hidratación extra: +500–750 ml. Toma la merienda si llevas más de 3 h sin comer.</div>`;
  } else if(type==='fuerza'){
    const fd=FD[sub]||FD['Tren superior'];
    const done=fd.ex.filter(x=>(exChecks[dk]||{})[exId(sub,x.n)]).length;
    const pct=Math.round(done/fd.ex.length*100);
    main=`<div class="dp-meta"><div class="dp-b-sm"><div class="dp-bl">Duración</div><div class="dp-bv">${fd.dur}</div></div><div class="dp-b-sm"><div class="dp-bl">Completado</div><div class="dp-bv" style="color:var(--fuerza)">${done}/${fd.ex.length}</div></div></div>
    ${getDetailInsights(sub,dk)}
    <div class="ex-section-title"><span>Ejercicios — pesos</span><span style="color:var(--fuerza)">${pct}%</span></div>
    <div class="ex-prog-bar"><div class="ex-prog-fill" style="width:${pct}%"></div></div>
    ${fd.ex.map(x=>buildExRow(x,sub,dk)).join('')}
    <div class="dp-note-b" style="margin-top:12px">Sube el peso cuando completes todas las series con buena técnica 2 semanas seguidas.</div>`;
  } else if(type==='descanso'){
    main=`<div class="dp-meta"><div class="dp-b-sm"><div class="dp-bl">Actividad</div><div class="dp-bv">Suave</div></div><div class="dp-b-sm"><div class="dp-bl">Duración</div><div class="dp-bv">30–45 min</div></div></div>
    <div class="dp-note-b">Caminata, movilidad o estiramientos. El músculo crece y se repara hoy.</div>`;
  } else {
    main=`<div class="dp-note-b">Descanso total. Ideal para meal prep. Prioriza el sueño (7–8 h).</div>`;
  }
  const titles={padel:'Partido de pádel',fuerza:'Fuerza · '+sub,descanso:'Descanso activo',libre:'Día libre'};
  const p=document.getElementById('detail-panel');
  p.innerHTML=`<div class="dp-hd"><div><div class="dp-title">${titles[type]}</div><div class="dp-date">${ds}</div></div><button class="dp-x" onclick="closeDetail()">×</button></div>${main}${cardioBlock}`;
  p.classList.add('show');p.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function closeDetail(){selKey=null;document.getElementById('detail-panel').classList.remove('show');renderTraining();}
function toggleEdit(){
  editMode=!editMode;
  const b=document.getElementById('edit-btn');
  b.textContent=editMode?'✓ Editando':'✦ Editar días';
  b.classList.toggle('on',editMode);
  document.getElementById('edit-hint').classList.toggle('show',editMode);
  if(!editMode)closeDetail();
}
function changeWeek(d){wkOff+=d;closeDetail();renderTraining();}
function resetWeek(){weekDays(wkOff).forEach(d=>delete wkData[fmt(d)]);persist();closeDetail();renderTraining();}

/* ─── MODAL ─── */
function openModal(key,i,date){
  mCtx={key,i};pType=null;pSub=null;
  document.getElementById('modal-lbl').textContent=`${DAYS[i===6?0:i+1]}, ${date.getDate()} de ${MON[date.getMonth()]}`;
  // Build type grid from profile trains
  const grid=document.getElementById('modal-type-grid');
  const opts=[
    {t:'padel',ico:'🎾',lbl:'Pádel',cls:'sp'},
    {t:'fuerza',ico:'🏋️',lbl:'Fuerza',cls:'sf'},
    {t:'cardio',ico:'🏃',lbl:'Cardio',cls:'sl'},
    {t:'custom',ico:'✏️',lbl:'Entreno libre',cls:'sl'},
    {t:'descanso',ico:'🌿',lbl:'Descanso',cls:'sd'},
  ];
  grid.innerHTML=opts.map(o=>`<button class="topt" id="op-${o.t}" onclick="pickType('${o.t}')"><span class="tico">${o.ico}</span>${o.lbl}</button>`).join('');
  ['sup','inf','fb'].forEach(s=>document.getElementById('sub-'+s).classList.remove('chosen'));
  document.getElementById('btn-apply').classList.remove('ready');
  document.getElementById('ms1').style.display='block';
  document.getElementById('ms2').style.display='none';
  document.getElementById('modal').classList.add('show');
}
function closeModal(){document.getElementById('modal').classList.remove('show');pType=null;pSub=null;}
function pickType(t){
  pType=t;
  document.querySelectorAll('#modal-type-grid .topt').forEach(x=>x.className='topt');
  const cls={padel:'sp',fuerza:'sf',descanso:'sd',libre:'sl',cardio:'sl',custom:'sl'}[t];
  const el=document.getElementById('op-'+t);if(el)el.classList.add(cls);
  if(t==='fuerza'){
    document.getElementById('ms1').style.display='none';
    document.getElementById('ms2').style.display='block';
    document.getElementById('btn-apply').classList.remove('ready');
  }else{
    pSub=null;
    document.getElementById('ms1').style.display='block';
    document.getElementById('ms2').style.display='none';
    document.getElementById('btn-apply').classList.add('ready');
  }
}
function backStep(){
  pType=null;pSub=null;
  document.querySelectorAll('#modal-type-grid .topt').forEach(x=>x.className='topt');
  document.getElementById('ms1').style.display='block';
  document.getElementById('ms2').style.display='none';
  document.getElementById('btn-apply').classList.remove('ready');
}
function pickSub(s){
  pSub=s;
  ['sup','inf','fb'].forEach(x=>document.getElementById('sub-'+x).classList.remove('chosen'));
  const m={'Tren superior':'sub-sup','Tren inferior':'sub-inf','Full body':'sub-fb'};
  document.getElementById(m[s]).classList.add('chosen');
  document.getElementById('btn-apply').classList.add('ready');
}
function applyModal(){
  if(!pType||!mCtx)return;
  if(pType==='fuerza'&&!pSub)return;
  if(pType==='custom'){
    if(!customWorkouts[mCtx.key]) customWorkouts[mCtx.key]={name:'Entreno libre',exercises:[]};
    persistCWK();
  }
  const{key,i}=mCtx,we=i>=5;
  const sm={padel:'Partido 90 min',descanso:'Descanso activo',libre:'',cardio:'Cardio 30 min',custom:'Entreno libre'};
  const sub=pType==='fuerza'?pSub:(sm[pType]||'')
  const newAct={type:pType,sub,time:['padel','fuerza','custom','cardio'].includes(pType)?(we?'ma\u00f1ana':'18\u201319 h'):''};  
  if(pMultiMode){
    const existing=getActivities(key,i).filter(a=>a.type!=='descanso');
    const dup=existing.some(a=>a.type===pType&&(pType!=='fuerza'||a.sub===sub));
    if(!dup) existing.push(newAct);
    setActivities(key,existing.length?existing:[newAct]);
  } else {
    setActivities(key,[newAct]);
  }
  pMultiMode=false;
  closeModal();closeDetail();renderTraining();
}

/* ─── HIST ─── */
function openHist(eid,exName){
  const h=exWeights[eid]||[];
  document.getElementById('hs-title').textContent=exName;
  let rows='';
  if(!h.length){rows='<div class="hs-empty">Sin registros aún.</div>';}
  else{[...h].reverse().slice(0,10).forEach((e,ri)=>{
    const prev=h[h.length-2-ri];let delta='';
    if(prev){const d=+(e.kg-prev.kg).toFixed(1);if(d>0)delta=`<span class="hs-delta hs-up">+${d}</span>`;else if(d<0)delta=`<span class="hs-delta hs-dn">${d}</span>`;}
    const pr=getPR(eid);const isPR=parseFloat(e.kg)>=pr&&ri===0&&h.length>1;
    rows+=`<div class="hs-row"><span class="hs-date">${e.date}</span><span class="hs-kg">${e.kg} kg</span>${delta}${isPR?'<span style="font-size:9px;color:var(--coral)">PR</span>':''}</div>`;
  });}
  document.getElementById('hs-body').innerHTML=rows;
  document.getElementById('hist-sheet').classList.add('show');
}
function closeHist(ev){if(ev.target===document.getElementById('hist-sheet'))document.getElementById('hist-sheet').classList.remove('show');}

/* ════ DIET ════ */
let MEALS_CACHE=[];
// Active date for diet and supplements (defaults to today, navigable)
let dietViewDate = fmt(new Date());

function todayKey(){ return dietViewDate; }

function dietNav(dir){
  const d = new Date(dietViewDate + 'T12:00:00');
  d.setDate(d.getDate() + dir);
  // Don't go into the future
  if(fmt(d) > fmt(new Date())) return;
  dietViewDate = fmt(d);
  renderDiet();
}

function suplNav(dir){
  const d = new Date(dietViewDate + 'T12:00:00');
  d.setDate(d.getDate() + dir);
  if(fmt(d) > fmt(new Date())) return;
  dietViewDate = fmt(d);
  renderSuplPlanList();
  updateSuplPct();
  renderSuplDateBar();
}

function renderSuplDateBar(){
  const el = document.getElementById('supl-date-bar');
  if(!el) return;
  const d = new Date(dietViewDate + 'T12:00:00');
  const isToday = dietViewDate === fmt(new Date());
  el.innerHTML = renderDateNavBar(isToday, d);
}

function renderDateNavBar(isToday, d){
  const label = isToday ? 'hoy' : DAYS[d.getDay()].toLowerCase()+' '+d.getDate()+' '+MON[d.getMonth()];
  const fwd = isToday ? 'opacity:.3;pointer-events:none' : '';
  const todayBtn = !isToday ? '<button onclick="dietViewDate=fmt(new Date());renderDiet()" style="font-size:10px;padding:3px 9px;border-radius:20px;border:1px solid var(--brd2);background:var(--coral-l);color:var(--coral);cursor:pointer;font-weight:700;">hoy</button>' : '';
  const midStyle = 'flex:1;text-align:center;font-family:var(--font-mono,monospace);font-size:11px;font-weight:700;color:var(--ink2)';
  return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;background:var(--surf);border:1px solid var(--brd);border-radius:12px;padding:8px 12px;">'
    +'<button onclick="dietNav(-1)" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--brd2);background:var(--surf2);cursor:pointer;font-size:13px;">←</button>'
    +'<div style="'+midStyle+'">'+label+'</div>'
    +'<button onclick="dietNav(1)" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--brd2);background:var(--surf2);cursor:pointer;font-size:13px;'+fwd+'">→</button>'
    +todayBtn
    +'</div>';
}

function renderDiet(){
  MEALS_CACHE=buildMealsFromSlots(P, getActiveSlotIds());
  const t=new Date(dietViewDate+'T12:00:00');
  const isToday = dietViewDate===fmt(new Date());
  const n=getActiveSlotIds().length;
  document.getElementById('diet-sub').textContent=`${DAYS[t.getDay()]} ${t.getDate()} ${MON[t.getMonth()]} · ${n} tomas · ${(P.kcalTarget||0).toLocaleString()} kcal`;
  const col=document.getElementById('meals-col');
  col.innerHTML = renderDateNavBar(isToday, t) + '';
  MEALS_CACHE.forEach(m=>buildMealCard(m,col));
  updateDietSummary();
}
function buildMealCard(meal,col){
  const tk=todayKey();const card=document.createElement('div');card.className='meal-card';
  const customItems=getCustomItems(meal.id);
  const hiddenIds=getHiddenBaseItems(meal.id);
  const allItems=[...meal.items.filter(it=>!hiddenIds.includes(it.id)),...customItems];
  const done=allItems.filter(it=>(checks[tk]||{})[it.id]).length;
  const pct=allItems.length?Math.round(done/allItems.length*100):0;
  card.innerHTML=`
    <div class="meal-hd" onclick="toggleBody('${meal.id}')">
      <div class="mhd-l"><div class="mhd-ico" style="background:${meal.icoBg}">${meal.ico}</div><div><div class="mhd-name">${meal.name}</div><div class="mhd-time">${meal.time}</div></div></div>
      <div style="display:flex;align-items:center;gap:7px">
        <div class="kcal-chip" style="background:${meal.icoBg};color:${meal.kcalCol}">${meal.kcal} kcal</div>
        <button onclick="event.stopPropagation();openFoodEditor('${meal.id}')" style="background:var(--surf2);border:1px solid var(--brd2);border-radius:7px;padding:4px 9px;font-size:11px;color:var(--ink3);cursor:pointer;font-family:'DM Mono',monospace;">✏️</button>
      </div>
    </div>
    <div class="mprog" style="background:var(--surf3)"><div class="mprog-fill" style="width:${pct}%;background:${meal.kcalCol}"></div></div>
    <div class="meal-body" id="mb-${meal.id}">
      ${allItems.map(it=>{
        const ck=(checks[tk]||{})[it.id];
        const isCustom=it.id.startsWith('custom_');
        return `<div class="food-row" onclick="toggleItem('${it.id}')">
          <div class="food-chk${ck?' on':''}"></div>
          <div class="food-nm${ck?' done':''}" style="flex:1">${it.name}${isCustom?` <span style="font-size:9px;color:var(--ink4);font-family:'DM Mono',monospace">tuyo</span>`:''}
          </div>
          ${it.kcal>0?`<div class="food-kc">${it.kcal}</div>`:''}
        </div>`;
      }).join('')}
      <div class="meal-note-row">${meal.note}</div>
    </div>`;
  col.appendChild(card);
}
function toggleBody(id){const b=document.getElementById('mb-'+id);b.style.display=b.style.display==='none'?'block':'none';}
function toggleItem(itemId){
  const tk=todayKey();if(!checks[tk])checks[tk]={};
  checks[tk][itemId]=!checks[tk][itemId];persist();renderDiet();
}
function updateDietSummary(){
  const tk=todayKey();let kc=0,pr=0,ca=0,fa=0;
  MEALS_CACHE.forEach(m=>{
    const allItems=[...m.items,...getCustomItems(m.id)];
    allItems.forEach(it=>{if((checks[tk]||{})[it.id]){kc+=it.kcal||0;pr+=it.prot||0;ca+=it.carb||0;fa+=it.fat||0;}});
  });
  const tKcal=P.kcalTarget||2000;
  const tProt=Math.round(tKcal*0.30/4);const tCarb=Math.round(tKcal*0.40/4);const tFat=Math.round(tKcal*0.30/9);
  const pct=Math.min(kc/tKcal,1);const circ=238.76;const off=circ-(circ*pct);
  document.getElementById('diet-summary').innerHTML=`
    <div class="ds-top">
      <div class="ring-wrap">
        <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="40" r="34" fill="none" stroke="#e8e2d6" stroke-width="7"/><circle cx="40" cy="40" r="34" fill="none" stroke="${pct>0.97?'#c08030':'#4a7c59'}" stroke-width="7" stroke-dasharray="${circ}" stroke-dashoffset="${off}" stroke-linecap="round" style="transition:stroke-dashoffset .5s ease;"/></svg>
        <div class="ring-inner">${Math.round(pct*100)}%</div>
      </div>
      <div><div class="ds-kcal">${kc} <span style="font-size:14px;color:var(--ink3)">kcal</span></div><div class="ds-of">de ${tKcal.toLocaleString()} kcal objetivo</div></div>
    </div>
    <div class="mc-row"><div class="mc-top"><span class="mc-name">Proteína</span><span class="mc-val">${pr} / ${tProt} g</span></div><div class="bar-bg"><div class="bar-fill" style="width:${Math.min(pr/tProt*100,100)}%;background:var(--fuerza)"></div></div></div>
    <div class="mc-row"><div class="mc-top"><span class="mc-name">Carbohidratos</span><span class="mc-val">${ca} / ${tCarb} g</span></div><div class="bar-bg"><div class="bar-fill" style="width:${Math.min(ca/tCarb*100,100)}%;background:var(--moss)"></div></div></div>
    <div class="mc-row"><div class="mc-top"><span class="mc-name">Grasas</span><span class="mc-val">${fa} / ${tFat} g</span></div><div class="bar-bg"><div class="bar-fill" style="width:${Math.min(fa/tFat*100,100)}%;background:var(--amber)"></div></div></div>
  `;
}

/* ── CUSTOM FOOD ITEMS (persisted per meal) ── */
function getCustomItems(mealId){
  try{return JSON.parse(localStorage.getItem('fp_custom_'+mealId)||'[]');}catch(e){return [];}
}
function saveCustomItems(mealId,items){
  localStorage.setItem('fp_custom_'+mealId,JSON.stringify(items));
}

/* ── DIET SLOT PICKER ── */
// ALL possible tomas catalogue
const ALL_SLOTS=[
  {id:'desayuno', name:'Desayuno',      time:'07:30 h', ico:'☀️'},
  {id:'almuerzo', name:'Media mañana',  time:'10:30 h', ico:'🍎'},
  {id:'comida',   name:'Comida',        time:'14:00 h', ico:'🍽️'},
  {id:'merienda', name:'Merienda',      time:'17:30 h', ico:'🥤'},
  {id:'cena',     name:'Cena',          time:'21:00 h', ico:'🌙'},
  {id:'postcena', name:'Post-cena',     time:'22:30 h', ico:'⭐'},
];

// Active slots state — initialized from profile mealConfig
let activeSlotIds=null;
function getActiveSlotIds(){
  if(activeSlotIds) return activeSlotIds;
  try{
    const saved=localStorage.getItem('fp_active_slots');
    if(saved){ activeSlotIds=JSON.parse(saved); return activeSlotIds; }
  }catch(e){}
  // Fallback: use profile mealConfig
  const cfg=P.mealConfig||{};
  activeSlotIds=ALL_SLOTS.filter(s=>cfg[s.id]&&cfg[s.id].on).map(s=>s.id);
  if(!activeSlotIds.length) activeSlotIds=['desayuno','comida','cena'];
  return activeSlotIds;
}
function saveActiveSlotIds(ids){
  activeSlotIds=ids;
  localStorage.setItem('fp_active_slots',JSON.stringify(ids));
}

function openDietSlotSheet(){
  const cur=getActiveSlotIds();
  const list=document.getElementById('diet-slot-list');
  list.innerHTML=ALL_SLOTS.map(s=>{
    const on=cur.includes(s.id);
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--brd);">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:22px">${s.ico}</span>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--ink)">${s.name}</div>
          <div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--ink3)">${s.time}</div>
        </div>
      </div>
      <button id="slot-tog-${s.id}" onclick="toggleSlotDraft('${s.id}')"
        style="width:44px;height:26px;border-radius:13px;background:${on?'var(--moss)':'var(--surf3)'};
        border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;">
        <span style="position:absolute;top:3px;left:${on?'21px':'3px'};width:20px;height:20px;border-radius:50%;
          background:var(--surf);box-shadow:0 1px 4px rgba(0,0,0,.2);transition:left .2s;display:block;"></span>
      </button>
    </div>`;
  }).join('');
  document.getElementById('diet-slot-sheet').classList.add('show');
}

// Temporary draft while user picks
let slotDraft=null;
function toggleSlotDraft(id){
  if(!slotDraft) slotDraft=[...getActiveSlotIds()];
  const idx=slotDraft.indexOf(id);
  if(idx>=0){
    if(slotDraft.length<=1) return; // min 1
    slotDraft.splice(idx,1);
  } else {
    slotDraft.push(id);
    // keep order
    slotDraft.sort((a,b)=>ALL_SLOTS.findIndex(s=>s.id===a)-ALL_SLOTS.findIndex(s=>s.id===b));
  }
  const btn=document.getElementById('slot-tog-'+id);
  const on=slotDraft.includes(id);
  btn.style.background=on?'var(--moss)':'var(--surf3)';
  btn.querySelector('span').style.left=on?'21px':'3px';
}
function applyDietSlots(){
  if(slotDraft&&slotDraft.length){
    saveActiveSlotIds(slotDraft);
    slotDraft=null;
    MEALS_CACHE=[]; // force rebuild with new slots
  }
  document.getElementById('diet-slot-sheet').classList.remove('show');
  renderDiet();
}
function closeDietSlotSheet(ev){
  if(ev.target===document.getElementById('diet-slot-sheet')){
    slotDraft=null;
    document.getElementById('diet-slot-sheet').classList.remove('show');
  }
}

/* ── FOOD EDITOR ── */
let feCurrentMealId=null;
/* ══ BASE DE DATOS DE ALIMENTOS ══
   Cada alimento: {kcal, prot, carb, fat} por ración estándar
   Las cantidades se ajustan al perfil del usuario */
const FOOD_DB = {
  // Proteínas
  'Batido de proteínas (1 scoop)':     {kcal:120, prot:25, carb:4,  fat:2,  cat:'prot', emoji:'🥛'},
  'Batido de proteínas (2 scoops)':    {kcal:240, prot:50, carb:8,  fat:4,  cat:'prot', emoji:'🥛'},
  'Pechuga de pollo (150g)':           {kcal:165, prot:31, carb:0,  fat:3,  cat:'prot', emoji:'🍗'},
  'Pechuga de pollo (200g)':           {kcal:220, prot:41, carb:0,  fat:4,  cat:'prot', emoji:'🍗'},
  'Salmón (150g)':                     {kcal:280, prot:30, carb:0,  fat:17, cat:'prot', emoji:'🐟'},
  'Atún al natural (1 lata)':          {kcal:120, prot:26, carb:0,  fat:1,  cat:'prot', emoji:'🐟'},
  'Huevos (2 unidades)':               {kcal:140, prot:12, carb:1,  fat:10, cat:'prot', emoji:'🥚'},
  'Claras de huevo (4 unidades)':      {kcal:68,  prot:14, carb:1,  fat:0,  cat:'prot', emoji:'🥚'},
  'Yogur griego natural (200g)':       {kcal:130, prot:12, carb:6,  fat:6,  cat:'prot', emoji:'🫙'},
  'Queso cottage (150g)':              {kcal:120, prot:14, carb:4,  fat:5,  cat:'prot', emoji:'🫙'},
  'Ternera magra (150g)':              {kcal:225, prot:30, carb:0,  fat:11, cat:'prot', emoji:'🥩'},
  'Tofu (150g)':                       {kcal:120, prot:13, carb:3,  fat:7,  cat:'prot', emoji:'🫘'},
  // Carbohidratos
  'Arroz integral cocido (150g)':      {kcal:165, prot:4,  carb:35, fat:1,  cat:'carb', emoji:'🍚'},
  'Arroz blanco cocido (150g)':        {kcal:195, prot:4,  carb:43, fat:0,  cat:'carb', emoji:'🍚'},
  'Pasta integral cocida (150g)':      {kcal:175, prot:7,  carb:35, fat:1,  cat:'carb', emoji:'🍝'},
  'Avena (60g en crudo)':              {kcal:228, prot:8,  carb:39, fat:4,  cat:'carb', emoji:'🌾'},
  'Pan integral (2 rebanadas)':        {kcal:160, prot:6,  carb:30, fat:2,  cat:'carb', emoji:'🍞'},
  'Batata/boniato (200g)':             {kcal:180, prot:4,  carb:42, fat:0,  cat:'carb', emoji:'🍠'},
  'Patata cocida (200g)':              {kcal:160, prot:4,  carb:37, fat:0,  cat:'carb', emoji:'🥔'},
  'Plátano (1 unidad)':                {kcal:100, prot:1,  carb:25, fat:0,  cat:'carb', emoji:'🍌'},
  'Fruta de temporada (1 pieza)':      {kcal:70,  prot:1,  carb:17, fat:0,  cat:'carb', emoji:'🍎'},
  // Grasas saludables
  'Aguacate (½ unidad)':               {kcal:120, prot:1,  carb:3,  fat:11, cat:'fat',  emoji:'🥑'},
  'Aceite de oliva (1 cda)':           {kcal:90,  prot:0,  carb:0,  fat:10, cat:'fat',  emoji:'🫒'},
  'Frutos secos mixtos (30g)':         {kcal:180, prot:5,  carb:6,  fat:15, cat:'fat',  emoji:'🥜'},
  'Almendras (25g)':                   {kcal:145, prot:5,  carb:4,  fat:13, cat:'fat',  emoji:'🥜'},
  // Verduras
  'Ensalada mixta (200g)':             {kcal:35,  prot:2,  carb:5,  fat:1,  cat:'veg',  emoji:'🥗'},
  'Brócoli cocido (200g)':             {kcal:70,  prot:6,  carb:11, fat:1,  cat:'veg',  emoji:'🥦'},
  'Espinacas (100g)':                  {kcal:23,  prot:3,  carb:3,  fat:0,  cat:'veg',  emoji:'🌿'},
  'Verduras salteadas (200g)':         {kcal:80,  prot:4,  carb:12, fat:3,  cat:'veg',  emoji:'🥦'},
  // Bebidas
  'Café solo sin azúcar':              {kcal:5,   prot:0,  carb:1,  fat:0,  cat:'bev',  emoji:'☕'},
  'Leche semidesnatada (250ml)':       {kcal:115, prot:8,  carb:12, fat:4,  cat:'bev',  emoji:'🥛'},
  'Agua (500ml)':                      {kcal:0,   prot:0,  carb:0,  fat:0,  cat:'bev',  emoji:'💧'},
  // Snacks
  'Tostada integral con AOVE':         {kcal:130, prot:3,  carb:22, fat:5,  cat:'snack',emoji:'🍞'},
  'Barrita proteica':                  {kcal:200, prot:20, carb:20, fat:6,  cat:'snack',emoji:'🍫'},
};

/* Calcula la cantidad recomendada de proteína diaria según perfil */
function getProteinTarget(){
  const w = P.weight||80;
  const goal = P.goal||'loss';
  // 1.6–2.2g/kg según objetivo
  const factor = goal==='muscle' ? 2.2 : goal==='loss' ? 2.0 : 1.8;
  return Math.round(w * factor);
}

/* Ajusta las macros del batido según el perfil */
function getProteinShakeData(){
  const protTarget = getProteinTarget();
  const meals = P.meals||3;
  // Distribuye proteína entre tomas. Batido suele ser 1 toma
  const protPerMeal = Math.round(protTarget / meals);
  // Un scoop estándar = 25g proteína, 2 scoops = 50g
  const scoops = protPerMeal > 35 ? 2 : 1;
  return {
    name: `Batido de proteínas (${scoops} scoop${scoops>1?'s':''}) con agua`,
    kcal: scoops * 120,
    prot: scoops * 25,
    carb: scoops * 4,
    fat:  scoops * 2,
    hint: `${scoops} scoop${scoops>1?'s':''} recomendado para ${protPerMeal}g proteína por toma (objetivo: ${protTarget}g/día)`
  };
}

/* Sugerencias inteligentes por toma y perfil */
function getMealSuggestions(mealId){
  const goal = P.goal||'loss';
  const hasFuerza = P.trains && P.trains.includes('fuerza');
  const protTarget = getProteinTarget();

  const suggestions = {
    desayuno: [
      goal==='muscle'
        ? {...FOOD_DB['Avena (60g en crudo)'],    name:'Avena (60g en crudo)'}
        : {...FOOD_DB['Café solo sin azúcar'],     name:'Café solo sin azúcar'},
      P.prot
        ? getProteinShakeData()
        : {...FOOD_DB['Claras de huevo (4 unidades)'], name:'Claras de huevo (4 unidades)'},
      {...FOOD_DB['Fruta de temporada (1 pieza)'], name:'Fruta de temporada (1 pieza)'},
    ],
    almuerzo: [
      {...FOOD_DB['Fruta de temporada (1 pieza)'], name:'Fruta de temporada (1 pieza)'},
      {...FOOD_DB['Yogur griego natural (200g)'],  name:'Yogur griego natural (200g)'},
      {...FOOD_DB['Almendras (25g)'],              name:'Almendras (25g)'},
    ],
    comida: [
      goal==='muscle'
        ? {...FOOD_DB['Arroz integral cocido (150g)'], name:'Arroz integral cocido (150g)'}
        : {...FOOD_DB['Brócoli cocido (200g)'],        name:'Brócoli cocido (200g)'},
      {...FOOD_DB['Pechuga de pollo (200g)'],  name:'Pechuga de pollo (200g)'},
      {...FOOD_DB['Aceite de oliva (1 cda)'],  name:'Aceite de oliva (1 cda)'},
    ],
    merienda: [
      hasFuerza && P.prot
        ? getProteinShakeData()
        : {...FOOD_DB['Yogur griego natural (200g)'], name:'Yogur griego natural (200g)'},
      {...FOOD_DB['Fruta de temporada (1 pieza)'], name:'Fruta de temporada (1 pieza)'},
    ],
    cena: [
      {...FOOD_DB['Salmón (150g)'],           name:'Salmón (150g)'},
      {...FOOD_DB['Ensalada mixta (200g)'],   name:'Ensalada mixta (200g)'},
      {...FOOD_DB['Batata/boniato (200g)'],   name:'Batata/boniato (200g)'},
    ],
    postcena: [
      {...FOOD_DB['Queso cottage (150g)'],    name:'Queso cottage (150g)'},
      {...FOOD_DB['Almendras (25g)'],         name:'Almendras (25g)'},
    ],
  };
  return suggestions[mealId]||[];
}

function renderFoodSuggestions(mealId){
  const sugs = getMealSuggestions(mealId);
  const container = document.getElementById('fe-suggestions');
  if(!sugs.length){container.innerHTML='';return;}

  container.innerHTML = `
    <div style="font-size:11px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;font-family:'DM Mono',monospace;">
      💡 Sugeridos para tu perfil
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:7px;">
      ${sugs.map((s,i)=>`
        <button onclick="fillFoodFromSuggestion(${i},'${mealId}')"
          style="display:flex;align-items:center;gap:6px;background:var(--surf2);border:1px solid var(--brd2);
          border-radius:20px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;
          color:var(--ink2);-webkit-tap-highlight-color:transparent;white-space:nowrap;">
          <span>${FOOD_DB[s.name]?.emoji||'🍽️'}</span>
          <span>${s.name.split('(')[0].trim()}</span>
          <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--ink3)">${s.kcal}k</span>
        </button>
      `).join('')}
    </div>
    <div style="font-size:11px;color:var(--ink3);margin-top:8px;font-style:italic;">
      Objetivo proteína: ${getProteinTarget()}g/día · ${Math.round(getProteinTarget()/( P.meals||3))}g por toma
    </div>
  `;
  // Store suggestions for quick fill
  window._feSuggestions = sugs;
}

function fillFoodFromSuggestion(idx, mealId){
  const s = (window._feSuggestions||[])[idx];
  if(!s) return;
  document.getElementById('fe-new-name').value = s.name;
  document.getElementById('fe-new-kcal').value = s.kcal;
  document.getElementById('fe-new-prot').value = s.prot;
  document.getElementById('fe-new-carb').value = s.carb;
  document.getElementById('fe-new-fat').value  = s.fat||0;
  _feBase = {kcal: s.kcal, prot: s.prot, carb: s.carb, fat: s.fat||0};
  const qtyEl = document.getElementById('fe-qty');
  if(qtyEl) qtyEl.value = 100;
  const live = document.getElementById('fe-qty-kcal-live');
  if(live) live.textContent = s.kcal + ' kcal';
  recalcFoodMacros();
  const hint = document.getElementById('fe-macro-hint');
  if(s.hint){hint.textContent='💡 '+s.hint;hint.style.display='block';}
  else hint.style.display='none';
}

// Debounce timer for API calls
let _acTimer = null;

function foodAutocomplete(q){
  const box = document.getElementById('fe-autocomplete');
  if(!q || q.length < 2){ box.style.display='none'; clearTimeout(_acTimer); return; }

  // 1. Show local DB results instantly
  const qLow = q.toLowerCase();
  const localMatches = Object.entries(FOOD_DB)
    .filter(([name]) => name.toLowerCase().includes(qLow))
    .slice(0, 4);

  renderAutocompleteResults(localMatches.map(([name,d]) => ({
    name, kcal: d.kcal, prot: d.prot, carb: d.carb, fat: d.fat||0, emoji: d.emoji||'🍽️', source:'local'
  })), true);

  // 2. Query Open Food Facts after 400ms debounce
  clearTimeout(_acTimer);
  _acTimer = setTimeout(() => searchOpenFoodFacts(q), 250);
}

let _offController = null;
async function searchOpenFoodFacts(q){
  const box = document.getElementById('fe-autocomplete');
  // Cancel any in-flight request
  if(_offController) _offController.abort();
  _offController = new AbortController();
  try {
    // Show loading indicator
    const loadingEl = document.getElementById('fe-ac-loading');
    if(loadingEl) loadingEl.style.display = 'flex';

    const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(q)}&page_size=6&lc=es&cc=es&fields=product_name,product_name_es,brands,nutriments_estimated`;
    const res = await fetch(url, { signal: _offController.signal });
    const data = await res.json();

    if(!data.products || !data.products.length) return;

    // Filter and clean results — only include ones with valid kcal data
    const apiResults = data.products
      .filter(p => p.product_name && (p.nutriments_estimated?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal_100g']))
      .slice(0, 6)
      .map(p => ({
        name: (p.product_name_es || p.product_name || '').split(',')[0].trim() + (p.brands ? ` (${p.brands.split(',')[0].trim()})` : ''),
        kcal: Math.round((p.nutriments_estimated?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal_100g'] || 0)),
        prot: Math.round(((p.nutriments_estimated?.proteins_100g || p.nutriments?.proteins_100g)||0) * 10) / 10,
        carb: Math.round(((p.nutriments_estimated?.carbohydrates_100g || p.nutriments?.carbohydrates_100g)||0) * 10) / 10,
        fat:  Math.round(((p.nutriments_estimated?.fat_100g || p.nutriments?.fat_100g)||0) * 10) / 10,
        emoji: '🏷️',
        source: 'off',
        per: 'por 100g'
      }));

    // Merge: local first, then API (no duplicates)
    const qLow = q.toLowerCase();
    const localMatches = Object.entries(FOOD_DB)
      .filter(([name]) => name.toLowerCase().includes(qLow))
      .slice(0, 3)
      .map(([name,d]) => ({name, kcal:d.kcal, prot:d.prot, carb:d.carb, fat:d.fat||0, emoji:d.emoji||'🍽️', source:'local'}));

    renderAutocompleteResults([...localMatches, ...apiResults], false);
  } catch(e) {
    if(e.name !== 'AbortError'){
      // API failed silently — local results already shown
    }
  }
}

function renderAutocompleteResults(items, isLoading){
  const box = document.getElementById('fe-autocomplete');
  if(!items.length){ box.style.display='none'; return; }

  window._acItems = items;
  box.style.display = 'block';
  box.innerHTML = items.map((item, i) => {
    const safe = item.name.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
    const badge = item.source === 'off'
      ? '<span style="font-size:9px;background:#f0f7ff;color:#2e5fa3;border-radius:4px;padding:1px 5px;margin-left:5px;font-family:DM Mono,monospace">OFF</span>'
      : '';
    const per = item.per ? `<span style="font-size:9px;color:var(--ink4);margin-left:3px">${item.per}</span>` : '';
    return `<div onclick="fillFoodFromIndex(${i})"
      style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;
      cursor:pointer;border-bottom:1px solid var(--brd);font-size:13px;"
      onmouseover="this.style.background='var(--surf2)'"
      onmouseout="this.style.background=''">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
          <span>${item.emoji} ${safe}</span>${badge}
        </div>
        ${per}
      </div>
      <div style="font-family:DM Mono,monospace;font-size:10px;color:var(--ink3);flex-shrink:0;margin-left:8px;text-align:right">
        ${item.kcal} kcal<br>${item.prot}g P
      </div>
    </div>`;
  }).join('') + (isLoading ? `<div id="fe-ac-loading" style="padding:8px 12px;font-size:11px;color:var(--ink4);font-family:DM Mono,monospace;display:flex;align-items:center;gap:6px;"><span style="animation:spin .8s linear infinite;display:inline-block">⟳</span> Buscando en base de datos...</div>` : '');
}

function fillFoodFromIndex(i){
  const item = (window._acItems||[])[i];
  if(!item) return;
  document.getElementById('fe-new-name').value = item.name;
  document.getElementById('fe-new-kcal').value = item.kcal;
  document.getElementById('fe-new-prot').value = item.prot;
  document.getElementById('fe-new-carb').value = item.carb;
  document.getElementById('fe-new-fat').value  = item.fat||0;
  document.getElementById('fe-autocomplete').style.display = 'none';
  // Store base macros per 100g for recalculation
  _feBase = {kcal: item.kcal, prot: item.prot, carb: item.carb, fat: item.fat||0};
  // Reset quantity to 100g
  const qtyEl = document.getElementById('fe-qty');
  if(qtyEl) qtyEl.value = 100;
  const live = document.getElementById('fe-qty-kcal-live');
  if(live) live.textContent = Math.round(item.kcal) + ' kcal';
  recalcFoodMacros();
  // Show hint
  const hint = document.getElementById('fe-macro-hint');
  if(item.source === 'off'){
    hint.textContent = '📋 Datos por 100g · ajusta la cantidad arriba si es necesario.';
    hint.style.display = 'block';
    hint.style.background = 'var(--fuerza-bg)';
    hint.style.color = 'var(--fuerza)';
  } else {
    hint.style.display = 'none';
  }
}

function fillFoodFromDB(name){
  const realName = name.replace(/&apos;/g,"'");
  const d = FOOD_DB[realName] || FOOD_DB[name];
  if(!d) return;
  document.getElementById('fe-new-name').value = realName||name;
  document.getElementById('fe-new-kcal').value = d.kcal;
  document.getElementById('fe-new-prot').value = d.prot;
  document.getElementById('fe-new-carb').value = d.carb;
  document.getElementById('fe-new-fat').value  = d.fat||0;
  document.getElementById('fe-autocomplete').style.display='none';
  document.getElementById('fe-macro-hint').style.display='none';
  _feBase = {kcal: d.kcal, prot: d.prot, carb: d.carb, fat: d.fat||0};
  const qtyEl = document.getElementById('fe-qty');
  if(qtyEl) qtyEl.value = 100;
  const live = document.getElementById('fe-qty-kcal-live');
  if(live) live.textContent = d.kcal + ' kcal';
  recalcFoodMacros();
}

function openFoodEditor(mealId){
  feCurrentMealId=mealId;
  const meal=MEALS_CACHE.find(m=>m.id===mealId);
  if(!meal) return;
  document.getElementById('fe-title').textContent='Editar: '+meal.name;
  document.getElementById('fe-sub').textContent=meal.time;
  _feAIResult=null; _feBase=null;
  const aiText=document.getElementById('fe-ai-text'); if(aiText) aiText.value='';
  const aiRes=document.getElementById('fe-ai-result'); if(aiRes) aiRes.style.display='none';
  const aiLoad=document.getElementById('fe-ai-loading'); if(aiLoad) aiLoad.style.display='none';
  ['fe-new-name','fe-new-kcal','fe-new-prot','fe-new-carb','fe-new-fat'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  const qtyEl=document.getElementById('fe-qty'); if(qtyEl) qtyEl.value=1;
  const liveEl=document.getElementById('fe-qty-kcal-live'); if(liveEl) liveEl.textContent='—';
  const mh=document.getElementById('fe-macro-hint'); if(mh) mh.style.display='none';
  const ac=document.getElementById('fe-autocomplete'); if(ac) ac.style.display='none';
  feTab('ia');
  renderFoodSuggestions(mealId);
  renderFoodEditorList(meal);
  document.getElementById('food-editor-sheet').classList.add('show');
}
function renderFoodEditorList(meal){
  const customItems=getCustomItems(meal.id);
  const list=document.getElementById('fe-items-list');
  const hidden=getHiddenBaseItems(meal.id);
  const allItems=[...meal.items,...customItems];
  list.innerHTML=allItems.map(it=>{
    const isCustom=it.id.startsWith('custom_');
    const isHidden=!isCustom&&hidden.includes(it.id);
    const opacity=isHidden?'opacity:.4;':'';
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--brd);${opacity}">
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:${isCustom?'600':'500'};color:var(--ink);">${it.name}
          ${isCustom?`<span style="font-size:9px;background:var(--padel-bg);color:var(--padel);border-radius:10px;padding:1px 6px;margin-left:4px;">tuyo</span>`:''}
          ${isHidden?`<span style="font-size:9px;background:var(--surf3);color:var(--ink4);border-radius:10px;padding:1px 6px;margin-left:4px;">oculto</span>`:''}
        </div>
        <div style="font-size:10px;color:var(--ink3);margin-top:1px;">
          ${it.kcal>0?it.kcal+' kcal':'sin kcal'}${it.prot?' · '+it.prot+'g P':''}${it.carb?' · '+it.carb+'g C':''}${it.fat?' · '+it.fat+'g G':''}
        </div>
      </div>
      ${isCustom
        ?`<button onclick="removeCustomItem('${meal.id}','${it.id}')" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--coral-br);background:var(--coral-l);color:var(--coral);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">×</button>`
        :isHidden
          ?`<button onclick="restoreBaseItem('${meal.id}','${it.id}')" style="font-size:10px;padding:3px 9px;border-radius:20px;border:1px solid var(--moss-l);background:var(--moss-l);color:var(--moss);cursor:pointer;font-weight:700;white-space:nowrap;">Restaurar</button>`
          :`<button onclick="hideBaseItem('${meal.id}','${it.id}')" style="font-size:10px;padding:3px 9px;border-radius:20px;border:1px solid var(--brd2);background:var(--surf2);color:var(--ink3);cursor:pointer;white-space:nowrap;">✕ Quitar</button>`
      }
    </div>`;
  }).join('')||'<div style="font-size:12px;color:var(--ink3);padding:8px 0;">Sin alimentos en esta toma.</div>';
}

/* ════ FOOD EDITOR · 3 MODOS ════ */
let favFoods=[];
try{favFoods=JSON.parse(localStorage.getItem('fp_fav_foods')||'[]');}catch(e){}
let _feAIResult=null;

function feTab(tab){
  ['ia','fav','buscar'].forEach(t=>{
    const pane=document.getElementById('fe-pane-'+t);
    const btn=document.getElementById('fe-tab-'+t);
    if(!pane||!btn)return;
    const on=t===tab;
    pane.style.display=on?'block':'none';
    btn.style.background=on?'var(--fuerza-bg)':'var(--surf2)';
    btn.style.borderColor=on?'var(--fuerza-br)':'var(--brd2)';
    btn.style.color=on?'var(--fuerza)':'var(--ink3)';
    btn.style.fontWeight=on?'700':'600';
  });
  if(tab==='fav') feRenderFavList();
}

function feSetEx(text){
  const ta=document.getElementById('fe-ai-text');
  if(ta) ta.value=text;
}

/* Macro DB por 100g para estimación local sin API */
const MACRO_DB={
  pollo:{k:165,p:31,c:0,f:3.6},pechuga:{k:165,p:31,c:0,f:3.6},
  ternera:{k:215,p:26,c:0,f:12},cerdo:{k:242,p:27,c:0,f:14},
  'salmon':{k:208,p:20,c:0,f:13},'salmón':{k:208,p:20,c:0,f:13},
  'atun':{k:130,p:28,c:0,f:1},'atún':{k:130,p:28,c:0,f:1},
  huevo:{k:155,p:13,c:1,f:11},huevos:{k:155,p:13,c:1,f:11},
  arroz:{k:130,p:2.7,c:28,f:0.3},pasta:{k:160,p:5.5,c:31,f:1.3},
  patata:{k:77,p:2,c:17,f:0.1},batata:{k:90,p:2,c:21,f:0.1},boniato:{k:90,p:2,c:21,f:0.1},
  avena:{k:389,p:17,c:66,f:7},pan:{k:265,p:9,c:49,f:3.2},tostada:{k:265,p:9,c:49,f:3.2},
  leche:{k:42,p:3.4,c:5,f:1},yogur:{k:61,p:3.5,c:4.7,f:3.3},
  queso:{k:350,p:25,c:1.3,f:28},aceite:{k:884,p:0,c:0,f:100},
  ensalada:{k:20,p:1.5,c:3,f:0.2},lechuga:{k:15,p:1.4,c:2.9,f:0.2},
  tomate:{k:18,p:0.9,c:3.9,f:0.2},pepino:{k:15,p:0.65,c:3.6,f:0.11},
  zanahoria:{k:41,p:0.9,c:10,f:0.2},'brocoli':{k:34,p:2.8,c:7,f:0.4},'brócoli':{k:34,p:2.8,c:7,f:0.4},
  lentejas:{k:116,p:9,c:20,f:0.4},garbanzos:{k:364,p:19,c:61,f:6},
  whey:{k:370,p:80,c:6,f:4},proteina:{k:370,p:80,c:6,f:4},'proteína':{k:370,p:80,c:6,f:4},
  'platano':{k:89,p:1.1,c:23,f:0.3},'plátano':{k:89,p:1.1,c:23,f:0.3},
  manzana:{k:52,p:0.3,c:14,f:0.2},naranja:{k:47,p:0.9,c:12,f:0.1},
  almendras:{k:579,p:21,c:22,f:50},nueces:{k:654,p:15,c:14,f:65},
  mayonesa:{k:680,p:1,c:2,f:75},mantequilla:{k:717,p:0.9,c:0.1,f:81},
  pizza:{k:266,p:11,c:33,f:10},hamburguesa:{k:295,p:17,c:24,f:14},
};

function feParseText(raw){
  const txt=raw.toLowerCase();
  let totalK=0,totalP=0,totalC=0,totalF=0;
  const found=[];

  // Special full-dish shortcuts
  if(txt.includes('menu')||txt.includes('men\u00fa')) return {title:'Men\u00fa del d\u00eda (estimado)',k:780,p:48,c:85,f:22};
  if(txt.includes('bocadillo')) return {title:'Bocadillo (estimado)',k:450,p:22,c:55,f:14};

  for(const [food,m] of Object.entries(MACRO_DB)){
    if(!txt.includes(food)) continue;
    const pos=txt.indexOf(food);
    const ctx=txt.slice(Math.max(0,pos-12),pos+food.length+12);
    const nmG=ctx.match(/(\d+(?:[.,]\d+)?)\s*(?:g|gr|gramos)/);
    const nmU=ctx.match(/(\d+(?:[.,]\d+)?)\s*(?:unidad|unidades)/);
    const nmN=ctx.match(/(\d+(?:[.,]\d+)?)/);
    let g=100;
    if(nmG){
      g=parseFloat(nmG[1].replace(',','.'));
      if(ctx.includes('kg')) g*=1000;
    } else if(nmU){
      // explicit units — use 1 unit = 100g default
      g=parseFloat(nmU[1])*100;
    } else if(nmN){
      const n=parseFloat(nmN[1].replace(',','.'));
      // small numbers (1-5) without unit = portions/units × 100g
      if(n>=1&&n<=10&&!ctx.match(/\d{3}/)) g=n*100;
      else g=n;
    }
    const factor=g/100;
    totalK+=m.k*factor; totalP+=m.p*factor; totalC+=m.c*factor; totalF+=m.f*factor;
    found.push(food+' '+Math.round(g)+'g');
  }

  if(!found.length) return {title:raw.slice(0,40),k:350,p:20,c:40,f:10};
  return {
    title:found.slice(0,3).join(' + '),
    k:Math.round(totalK),
    p:Math.round(totalP*10)/10,
    c:Math.round(totalC*10)/10,
    f:Math.round(totalF*10)/10,
  };
}

function feAnalyzeAI(){
  const text=(document.getElementById('fe-ai-text')?.value||'').trim();
  if(!text)return;
  const loading=document.getElementById('fe-ai-loading');
  const result=document.getElementById('fe-ai-result');
  const btn=document.getElementById('fe-ai-btn');
  const errDiv=document.getElementById('fe-ai-error');
  if(loading)loading.style.display='flex';
  if(result)result.style.display='none';
  if(btn)btn.style.display='none';
  if(errDiv)errDiv.style.display='none';
  setTimeout(()=>{
    try{
      const parsed=feParseText(text);
      _feAIResult=parsed;
      feRenderAIResult(parsed,1);
      if(result)result.style.display='block';
    }catch(e){
      if(errDiv){errDiv.textContent='No se pudo analizar. Prueba con el modo Buscar.';errDiv.style.display='block';}
    }
    if(loading)loading.style.display='none';
    if(btn)btn.style.display='block';
  },500);
}


function feRenderAIResult(r,qty){
  const titleEl=document.getElementById('fe-ai-res-title');
  const macrosEl=document.getElementById('fe-ai-res-macros');
  const liveEl=document.getElementById('fe-qty-kcal-live');
  if(titleEl) titleEl.textContent=r.title||'Comida analizada';
  const kcal=Math.round(((r.kcal||r.k)||0)*qty);
  const prot=Math.round(((r.prot||r.p)||0)*qty*10)/10;
  const carb=Math.round(((r.carb||r.c)||0)*qty*10)/10;
  const fat=Math.round(((r.fat||r.f)||0)*qty*10)/10;
  if(macrosEl) macrosEl.innerHTML=[
    {l:'kcal',v:kcal,c:'var(--coral)'},
    {l:'prot',v:prot+'g',c:'var(--fuerza)'},
    {l:'carb',v:carb+'g',c:'var(--amber)'},
    {l:'grasas',v:fat+'g',c:'var(--ink3)'},
  ].map(m=>'<div style="flex:1;background:var(--surf);border-radius:8px;padding:6px;text-align:center;">'
    +'<div style="font-size:14px;font-weight:800;color:'+m.c+';">'+m.v+'</div>'
    +'<div style="font-size:9px;color:var(--ink3);text-transform:uppercase;margin-top:1px;">'+m.l+'</div></div>').join('');
  if(liveEl) liveEl.textContent=kcal+' kcal';
}

function feRecalcAI(){
  if(!_feAIResult)return;
  const qty=parseFloat(document.getElementById('fe-qty')?.value)||1;
  feRenderAIResult(_feAIResult,qty);
}

function feSetQtyMult(mult){
  const inp=document.getElementById('fe-qty');
  if(inp) inp.value=mult;
  feRecalcAI();
}

function feAddFromAI(){
  if(!_feAIResult||!feCurrentMealId)return;
  const qty=parseFloat(document.getElementById('fe-qty')?.value)||1;
  const kcal=Math.round(((_feAIResult.kcal||_feAIResult.k)||0)*qty);
  const prot=Math.round(((_feAIResult.prot||_feAIResult.p)||0)*qty*10)/10;
  const carb=Math.round(((_feAIResult.carb||_feAIResult.c)||0)*qty*10)/10;
  const fat=Math.round(((_feAIResult.fat||_feAIResult.f)||0)*qty*10)/10;
  const label=_feAIResult.title+(qty!==1?' ('+qty+' rac.)':'');
  const item={id:'custom_'+feCurrentMealId+'_'+Date.now(),name:label,kcal,prot,carb,fat};
  const existing=getCustomItems(feCurrentMealId);
  existing.push(item);
  saveCustomItems(feCurrentMealId,existing);
  document.getElementById('fe-ai-text').value='';
  document.getElementById('fe-ai-result').style.display='none';
  _feAIResult=null;
  const meal=MEALS_CACHE.find(m=>m.id===feCurrentMealId);
  if(meal) renderFoodEditorList(meal);
  renderDiet();
}

function feSaveHabitual(){
  if(!_feAIResult)return;
  const qty=parseFloat(document.getElementById('fe-qty')?.value)||1;
  const entry={id:'fav_'+Date.now(),name:_feAIResult.title,
    kcal:Math.round(((_feAIResult.kcal||_feAIResult.k)||0)*qty),
    prot:Math.round(((_feAIResult.prot||_feAIResult.p)||0)*qty*10)/10,
    carb:Math.round(((_feAIResult.carb||_feAIResult.c)||0)*qty*10)/10,
    fat:Math.round(((_feAIResult.fat||_feAIResult.f)||0)*qty*10)/10};
  favFoods.unshift(entry);
  if(favFoods.length>20) favFoods=favFoods.slice(0,20);
  localStorage.setItem('fp_fav_foods',JSON.stringify(favFoods));
  const btn=event.target;
  btn.textContent='★ Guardado';
  btn.style.color='var(--amber)';
}

function feRenderFavList(){
  const list=document.getElementById('fe-fav-list');
  if(!list)return;
  if(!favFoods.length){
    list.innerHTML='<div style="font-size:12px;color:var(--ink3);text-align:center;padding:12px 0;">Aun no tienes habituales guardados.<br>Analiza con IA y guardalos.</div>';
    return;
  }
  list.innerHTML=favFoods.map(f=>
    '<div class="_fav-item" data-fid="'+f.id+'" style="display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--brd);cursor:pointer;">'
    +'<div style="flex:1;">'
    +'<div style="font-size:13px;font-weight:600;color:var(--ink);">'+f.name+'</div>'
    +'<div style="font-size:10px;color:var(--ink3);margin-top:1px;">'+f.kcal+' kcal &middot; '+f.prot+'g P &middot; '+f.carb+'g C &middot; '+f.fat+'g G</div>'
    +'</div>'
    +'<div style="font-size:16px;color:var(--moss);font-weight:700;">+</div>'
    +'</div>'
  ).join('');
}

document.addEventListener('click',function(e){
  const fi=e.target.closest('._fav-item');
  if(fi){
    const fid=fi.dataset.fid;
    const f=favFoods.find(x=>x.id===fid);
    if(!f||!feCurrentMealId)return;
    const item={id:'custom_'+feCurrentMealId+'_'+Date.now(),name:f.name,kcal:f.kcal,prot:f.prot,carb:f.carb,fat:f.fat};
    const existing=getCustomItems(feCurrentMealId);
    existing.push(item);
    saveCustomItems(feCurrentMealId,existing);
    const meal=MEALS_CACHE.find(m=>m.id===feCurrentMealId);
    if(meal) renderFoodEditorList(meal);
    renderDiet();
  }
});

function removeCustomItem(mealId,itemId){
  const items=getCustomItems(mealId).filter(i=>i.id!==itemId);
  saveCustomItems(mealId,items);
  const meal=MEALS_CACHE.find(m=>m.id===mealId);
  if(meal) renderFoodEditorList(meal);
  renderDiet();
}

function hideBaseItem(mealId,itemId){
  const key='fp_hidden_'+mealId;
  const hidden=JSON.parse(localStorage.getItem(key)||'[]');
  if(!hidden.includes(itemId)) hidden.push(itemId);
  localStorage.setItem(key,JSON.stringify(hidden));
  const meal=MEALS_CACHE.find(m=>m.id===mealId);
  if(meal) renderFoodEditorList(meal);
  renderDiet();
}

function restoreBaseItem(mealId,itemId){
  const key='fp_hidden_'+mealId;
  const hidden=JSON.parse(localStorage.getItem(key)||'[]').filter(id=>id!==itemId);
  localStorage.setItem(key,JSON.stringify(hidden));
  const meal=MEALS_CACHE.find(m=>m.id===mealId);
  if(meal) renderFoodEditorList(meal);
  renderDiet();
}

function getHiddenBaseItems(mealId){
  try{ return JSON.parse(localStorage.getItem('fp_hidden_'+mealId)||'[]'); }catch(e){ return []; }
}
function closeFoodEditorSheet(ev){
  if(ev.target===document.getElementById('food-editor-sheet'))
    document.getElementById('food-editor-sheet').classList.remove('show');
}

/* ════ RESULTS ════ */
function saveWeight(){
  const inp=document.getElementById('wl-inp');const kg=parseFloat(inp.value);
  if(isNaN(kg)||kg<40||kg>300)return;
  const wk=curWkLabel();const idx=wlog.findIndex(w=>w.week===wk);
  if(idx>=0)wlog[idx].kg=kg;else wlog.push({week:wk,kg,date:fmt(new Date())});
  wlog.sort((a,b)=>a.date.localeCompare(b.date));
  inp.value='';inp.blur();persist();renderWlog();renderChart();renderMS();updateProj();renderAdaptivePanel();
  trackEvent('weight_logged', {kg, week:curWkLabel()});
}
function renderWlog(){
  document.getElementById('wl-cur-week').textContent=curWkLabel();
  const c=document.getElementById('wl-entries');
  if(!wlog.length){c.innerHTML='<div style="font-family:var(--font-mono,monospace);font-size:12px;color:var(--ink4);padding:6px 0">Sin registros — introduce tu peso cada lunes.</div>';return;}
  c.innerHTML=wlog.slice().reverse().map((w,ri)=>{
    const prev=wlog[wlog.length-2-ri];let dH='';
    if(prev){const d=+(w.kg-prev.kg).toFixed(1);const cls=d<=0?'diff-down':'diff-up';dH=`<span class="wle-diff ${cls}">${d>0?'+':''}${d} kg</span>`;}
    return `<div class="wl-entry"><div><div class="wle-wk">${w.week}</div></div><div style="display:flex;align-items:center;gap:8px"><div class="wle-kg">${w.kg} kg</div>${dH}<button class="wle-del" onclick="delW('${w.week}')">✕</button></div></div>`;
  }).join('');
}
function delW(wk){wlog=wlog.filter(w=>w.week!==wk);persist();renderWlog();renderChart();renderMS();updateProj();}
function renderChart(){
  const ctx=document.getElementById('wchart').getContext('2d');
  if(chartI){chartI.destroy();chartI=null;}
  const rL=wlog.map(w=>w.week),rK=wlog.map(w=>w.kg);
  const startKg=rK.length?rK[rK.length-1]:(P.weight||80);
  const days=weekDays(0);let pad=0,fu=0;
  days.forEach((d,i)=>{const e=entry(fmt(d),i);if(e.type==='padel')pad++;else if(e.type==='fuerza')fu++;});
  const hasCardio=P.trains&&P.trains.includes('cardio');
  const deficit=(P.tmb*7+pad*800+fu*480+(hasCardio?7*250:0))-P.kcalTarget*7;
  const lossW=deficit/7700;
  const pL=[],pK=[];
  for(let i=0;i<=18;i++){const d=new Date();d.setDate(d.getDate()+i*7);pL.push(`Sem.${d.getDate()}/${d.getMonth()+1}`);pK.push(Math.round((startKg-lossW*i)*10)/10);}
  const allL=[...rL];pL.forEach(l=>{if(!allL.includes(l))allL.push(l);});
  const rd=allL.map(l=>{const i=rL.indexOf(l);return i>=0?rK[i]:null;});
  const pd=allL.map(l=>{const i=pL.indexOf(l);return i>=0?pK[i]:null;});
  const minY=Math.max(40,Math.floor(Math.min(...(rK.length?rK:[P.weight||80]),P.target||60,...pK)-3));
  const maxY=Math.ceil(Math.max(...(rK.length?rK:[P.weight||80]))+3);
  chartI=new Chart(ctx,{type:'line',data:{labels:allL,datasets:[
    {label:'Peso real',data:rd,borderColor:'#4a7c59',backgroundColor:'rgba(74,124,89,0.08)',borderWidth:2.5,pointBackgroundColor:'#4a7c59',pointBorderColor:'#fff',pointBorderWidth:2,pointRadius:4,tension:0.35,spanGaps:false},
    {label:'Proyección',data:pd,borderColor:'rgba(212,96,58,0.5)',borderDash:[5,5],backgroundColor:'rgba(212,96,58,0.04)',borderWidth:1.5,pointRadius:3,tension:0.35,spanGaps:false},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#faf8f3',borderColor:'rgba(100,80,50,.15)',borderWidth:1,titleColor:'#2c2418',bodyColor:'#6b5d48',callbacks:{label:c=>`${c.dataset.label}: ${c.parsed.y} kg`}}},scales:{x:{grid:{color:'rgba(100,80,50,.06)'},ticks:{color:'#a89880',font:{size:9},maxRotation:45,maxTicksLimit:7}},y:{grid:{color:'rgba(100,80,50,.06)'},ticks:{color:'#a89880',font:{size:10},callback:v=>v+' kg'},min:minY,max:maxY}}}});
}
function renderMS(){
  const curKg=wlog.length?wlog[wlog.length-1].kg:(P.weight||80);
  const startKg=P.weight||80;const targetKg=P.target||70;
  const diff=startKg-targetKg;
  const steps=4;
  const ms=Array.from({length:steps+1},(_,i)=>{
    const kg=Math.round((startKg-diff*(i/steps))*2)/2;
    const labels=['Inicio','25% del camino','Mitad del objetivo','75% del camino','¡Objetivo conseguido! 🎉'];
    return {kg,lbl:labels[i]};
  });
  document.getElementById('ms-list').innerHTML=ms.map(m=>{
    const done=curKg<=m.kg;const nxt=!done&&(curKg-m.kg)>0&&(curKg-m.kg)<=4;
    const cls=done?'done':nxt?'next':'future';
    const bdg=done?`<div class="ms-badge">✓</div>`:nxt?`<div class="ms-nbadge">próximo</div>`:'';
    return `<div class="ms-item"><div class="ms-dot ${cls}"></div><div class="ms-info"><div class="ms-kg">${m.kg} kg</div><div class="ms-lbl">${m.lbl}</div></div>${bdg}</div>`;
  }).join('');
}
function updateProj(){
  const days=weekDays(wkOff);let pad=0,fu=0;
  days.forEach((d,i)=>{const e=entry(fmt(d),i);if(e.type==='padel')pad++;else if(e.type==='fuerza')fu++;});
  const hasCardio=P.trains&&P.trains.includes('cardio');
  const gasto=P.tmb*7+pad*800+fu*480+(hasCardio?7*250:0);
  const deficit=gasto-P.kcalTarget*7;
  const lossW=deficit/7700;
  const months=P.months||6;
  const weeks=months*4.33;
  const lossTotal=lossW*weeks;
  const wtFinal=Math.round((P.weight-lossTotal)*10)/10;
  document.getElementById('pr-def').textContent=Math.round(deficit).toLocaleString('es-ES')+' kcal';
  document.getElementById('pr-def-n').textContent=`Gasto diario ~${Math.round(gasto/7).toLocaleString('es-ES')} kcal`;
  document.getElementById('pr-loss').textContent=lossW.toFixed(2).replace('.',',')+' kg / sem';
  document.getElementById('pr-loss-n').textContent=`${pad} pádel · ${fu} fuerza${hasCardio?' · cardio diario':''}`;
  document.getElementById('pr-wt').textContent='~'+wtFinal.toFixed(1).replace('.',',')+' kg';
  document.getElementById('pr-wt-n').textContent=`Objetivo: ${P.target} kg en ${months} meses`;
  const ratio=Math.min(lossW/1,1);
  let pc,pt,ac,at;
  if(lossW<0.1){pc='var(--coral)';pt='Déficit muy bajo';ac='a-bad';at='Casi sin déficit. Revisa tu actividad o reduce un poco las calorías.';}
  else if(lossW<0.35){pc='var(--amber)';pt='Ritmo suave';ac='a-warn';at='Pérdida lenta pero sostenible. Puedes añadir más actividad para acelerar.';}
  else if(lossW<=0.9){pc='var(--moss)';pt='Ritmo óptimo ✓';ac='a-ok';at='Déficit ideal. Pérdida de grasa sin riesgo de perder músculo. ¡Mantén!';}
  else{pc='var(--coral)';pt='Déficit excesivo';ac='a-bad';at='Riesgo de perder masa muscular. Sube ligeramente las calorías.';}
  document.getElementById('pace-fill').style.cssText=`width:${Math.max(4,Math.round(ratio*100))}%;background:${pc}`;
  document.getElementById('pace-lbl').textContent=pt;
  const ab=document.getElementById('alert-box');ab.className='alert-box '+ac;ab.textContent=at;
}

/* ════ EJERCICIOS ════ */
const EX_DB={
  'Press banca':{muscle:'Pecho (pectoral mayor)',icon:'💪',alts:[
    {n:'Press banca inclinado',d:'Énfasis en pecho alto. Barra o mancuernas a 30–45°.'},
    {n:'Press banca declinado',d:'Zona baja del pecho. Menos estrés en el hombro.'},
    {n:'Press de mancuernas plano',d:'Mayor rango de movimiento. Más estabilización.'},
    {n:'Press en máquina (chest press)',d:'Guiado. Ideal con molestias articulares.'},
    {n:'Fondos en paralelas (dips)',d:'Peso corporal. Inclinarse adelante enfatiza el pecho.'},
    {n:'Crossover en polea',d:'Tensión constante. Excelente para definición del pecho.'},
  ]},
  'Press inclinado':{muscle:'Pecho alto (clavicular)',icon:'💪',alts:[
    {n:'Press banca plano',d:'Menos énfasis en pecho alto pero más carga posible.'},
    {n:'Press de mancuernas inclinado',d:'Mayor rango, mejor contracción.'},
    {n:'Aperturas en banco inclinado',d:'Aislamiento del pecho alto.'},
    {n:'Crossover polea alta',d:'Simula el ángulo inclinado con tensión constante.'},
  ]},
  'Remo con barra':{muscle:'Espalda (dorsal, trapecio, romboides)',icon:'🏋️',alts:[
    {n:'Remo con mancuerna un brazo',d:'Unilateral. Mejor rango y menos estrés lumbar.'},
    {n:'Remo en polea baja',d:'Tensión constante. Ideal si hay molestias lumbares.'},
    {n:'Remo en máquina sentado',d:'Guiado. Perfecto para principiantes.'},
    {n:'Remo Pendlay',d:'Explosivo desde el suelo. Mayor activación de espalda alta.'},
    {n:'Remo T-bar',d:'Permite más carga que el remo con mancuerna.'},
    {n:'Face pull',d:'Trapecio medio y manguito. Salud del hombro.'},
  ]},
  'Jalones al pecho':{muscle:'Dorsal ancho',icon:'🏋️',alts:[
    {n:'Dominadas (pull-ups)',d:'Peso corporal. Máxima activación del dorsal.'},
    {n:'Jalones con agarre neutro',d:'Menos tensión en el hombro.'},
    {n:'Pull-over con mancuerna',d:'Estiramiento del dorsal. Complementa jalones.'},
    {n:'Dominadas con asistencia',d:'Para quien aún no puede hacer dominadas libres.'},
  ]},
  'Face pull':{muscle:'Trapecio medio, deltoides posterior, manguito',icon:'🏋️',alts:[
    {n:'Remo al cuello en polea',d:'Similar activación, más carga posible.'},
    {n:'Remo con banda elástica',d:'Ligero, ideal para calentamiento y movilidad.'},
    {n:'Reverse fly con mancuernas',d:'Aislamiento del deltoides posterior en banco.'},
    {n:'Remo en máquina agarre alto',d:'Simula el movimiento del face pull con máquina.'},
  ]},
  'Remo en polea baja':{muscle:'Espalda media, dorsal',icon:'🏋️',alts:[
    {n:'Remo con mancuerna un brazo',d:'Más rango y énfasis unilateral.'},
    {n:'Remo con barra',d:'Versión libre, más carga total.'},
    {n:'Remo en máquina sentado',d:'Más estable, ideal con fatiga lumbar.'},
    {n:'Jalones al pecho',d:'Cambia el ángulo hacia el dorsal alto.'},
  ]},
  'Press militar':{muscle:'Deltoides (hombro), tríceps',icon:'💪',alts:[
    {n:'Press militar con mancuernas',d:'Mayor rango y activación unilateral.'},
    {n:'Press Arnold',d:'Trabaja todas las cabezas del deltoides.'},
    {n:'Press en máquina de hombros',d:'Guiado. Reduce carga en la columna.'},
    {n:'Press de hombros sentado',d:'Reduce la tensión lumbar respecto a la versión de pie.'},
    {n:'Elevaciones laterales',d:'Deltoides medio. Ideal como complemento del press.'},
  ]},
  'Curl de bíceps':{muscle:'Bíceps braquial',icon:'💪',alts:[
    {n:'Curl martillo',d:'Agarre neutro. Más énfasis en el braquial.'},
    {n:'Curl predicador (Scott)',d:'Elimina el impulso del cuerpo. Aislamiento total.'},
    {n:'Curl en polea baja',d:'Tensión constante durante todo el recorrido.'},
    {n:'Curl concentrado',d:'Máximo aislamiento. Ideal para la contracción final.'},
    {n:'Curl inclinado con mancuernas',d:'Estiramiento máximo al inicio del movimiento.'},
    {n:'Curl con barra Z',d:'Menos estrés en muñecas que la barra recta.'},
  ]},
  'Tríceps en polea':{muscle:'Tríceps braquial',icon:'💪',alts:[
    {n:'Press francés (skull crusher)',d:'Trabaja la cabeza larga del tríceps.'},
    {n:'Fondos en banco (dips tríceps)',d:'Peso corporal, énfasis en las 3 cabezas.'},
    {n:'Patada de tríceps (kickback)',d:'Aislamiento con mancuerna. Buena contracción.'},
    {n:'Extensión de tríceps sobre la cabeza',d:'Máxima elongación de la cabeza larga.'},
    {n:'Press cerrado con barra',d:'Compuesto. Tríceps + pecho. Más carga total.'},
  ]},
  'Sentadilla goblet':{muscle:'Cuádriceps, glúteos, core',icon:'🦵',alts:[
    {n:'Sentadilla con barra (back squat)',d:'Versión más cargada. Requiere buena técnica.'},
    {n:'Sentadilla frontal',d:'Mayor énfasis en cuádriceps, menos en espalda baja.'},
    {n:'Sentadilla búlgara (split squat)',d:'Unilateral. Corrige desequilibrios.'},
    {n:'Prensa de piernas',d:'Guiada. Más carga con menor riesgo lumbar.'},
    {n:'Hack squat en máquina',d:'Énfasis en cuádriceps, menos tensión en espalda.'},
    {n:'Zancadas (lunges)',d:'Unilateral. Mejora equilibrio y trabaja glúteo.'},
  ]},
  'Sentadilla con barra':{muscle:'Cuádriceps, glúteos, isquiotibiales',icon:'🦵',alts:[
    {n:'Sentadilla goblet',d:'Versión más sencilla con mancuerna o kettlebell.'},
    {n:'Sentadilla frontal',d:'Mayor énfasis en cuádriceps.'},
    {n:'Prensa de piernas',d:'Guiada. Más carga, menos riesgo lumbar.'},
    {n:'Sentadilla búlgara',d:'Unilateral. Gran activación glútea.'},
    {n:'Hack squat',d:'Máquina que simula la sentadilla.'},
  ]},
  'Prensa de piernas':{muscle:'Cuádriceps, glúteos',icon:'🦵',alts:[
    {n:'Sentadilla goblet',d:'Funcional. Activa más el core y glúteos.'},
    {n:'Sentadilla con barra',d:'Versión libre, más demanda de estabilización.'},
    {n:'Hack squat',d:'Muy similar a la prensa pero más vertical.'},
    {n:'Extensiones de cuádriceps',d:'Aislamiento puro del cuádriceps.'},
  ]},
  'Extensiones cuádriceps':{muscle:'Cuádriceps (aislamiento)',icon:'🦵',alts:[
    {n:'Sentadilla (cualquier variante)',d:'Compuesto. Más activación general.'},
    {n:'Patada hacia delante en polea',d:'Versión de pie, más funcional.'},
    {n:'Step-up con mancuernas',d:'Funcional, activa también glúteo y estabilizadores.'},
  ]},
  'Peso muerto rumano':{muscle:'Isquiotibiales, glúteos, espalda baja',icon:'🦵',alts:[
    {n:'Peso muerto convencional',d:'Mayor activación de espalda y trapecio. Más carga.'},
    {n:'Peso muerto sumo',d:'Mayor apertura de caderas. Énfasis en glúteos.'},
    {n:'Buenos días (good mornings)',d:'Similar pero con barra en los hombros.'},
    {n:'Curl femoral tumbado',d:'Aislamiento de isquiotibiales. Sin carga lumbar.'},
    {n:'Peso muerto a una pierna',d:'Unilateral. Mayor activación de glúteo y equilibrio.'},
  ]},
  'Curl femoral':{muscle:'Isquiotibiales (aislamiento)',icon:'🦵',alts:[
    {n:'Nordic curl (curl nórdico)',d:'Peso corporal. Muy efectivo. Alta dificultad.'},
    {n:'Curl femoral de pie',d:'Unilateral, mayor activación del bíceps femoral.'},
    {n:'Peso muerto rumano',d:'Compuesto. Isquiotibiales + glúteos + lumbar.'},
    {n:'Curl con fitball',d:'Versión funcional sin máquina. Activa también el core.'},
  ]},
  'Hip thrust':{muscle:'Glúteo mayor (máxima activación)',icon:'🦵',alts:[
    {n:'Puente de glúteos en suelo',d:'Versión sin banco. Menor rango, útil en casa.'},
    {n:'Hip thrust con mancuerna',d:'Versión ligera si no hay barra disponible.'},
    {n:'Patada de glúteo en polea',d:'Aislamiento del glúteo mayor de pie.'},
    {n:'Sentadilla búlgara',d:'Gran activación glútea unilateral.'},
    {n:'Step-up elevado con mancuernas',d:'Funcional, activa glúteo en rango superior.'},
  ]},
  'Gemelos de pie':{muscle:'Gastrocnemio (gemelo)',icon:'🦵',alts:[
    {n:'Gemelos sentado (máquina)',d:'Énfasis en el sóleo (músculo profundo). Rodilla flexionada.'},
    {n:'Elevación de talones unilateral',d:'Peso corporal, mayor rango de movimiento.'},
    {n:'Prensa de piernas (gemelos)',d:'Con los pies en el borde inferior de la prensa.'},
    {n:'Saltos a la comba',d:'Cardio y gemelos a la vez. Variante funcional.'},
  ]},
  'Plancha':{muscle:'Core (transverso, recto abdominal, oblicuos)',icon:'💪',alts:[
    {n:'Plancha lateral',d:'Mayor énfasis en oblicuos. 20–45 seg por lado.'},
    {n:'Plancha con elevación de brazo',d:'Mayor inestabilidad, más activación del core.'},
    {n:'Rueda abdominal (ab wheel)',d:'Más exigente. Gran activación del serrato y dorsal.'},
    {n:'Dead bug',d:'Estabilización lumbo-pélvica. Ideal con dolor de espalda.'},
    {n:'Crunch en polea',d:'Carga progresiva en el recto abdominal.'},
    {n:'Hollow body',d:'Gimnasia. Máxima activación del core extendido.'},
  ]},
};

function renderEjercicios(){
  const body=document.getElementById('ejercicios-body');
  if(!body)return;
  const groups={};
  Object.entries(EX_DB).forEach(([exName,data])=>{
    if(!groups[data.muscle])groups[data.muscle]=[];
    groups[data.muscle].push({name:exName,...data});
  });
  body.innerHTML=Object.entries(groups).map(([muscle,exList])=>`
    <div style="margin-bottom:18px;">
      <div style="font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--ink3);margin-bottom:8px;">${muscle}</div>
      ${exList.map(ex=>`
        <div onclick="openAltSheet('${ex.name.replace(/'/g,'\\\'')}')"
          style="display:flex;align-items:center;justify-content:space-between;
          background:var(--surf);border:1px solid var(--brd);border-radius:var(--r);
          padding:13px 15px;margin-bottom:8px;cursor:pointer;box-shadow:var(--sh);
          -webkit-tap-highlight-color:transparent;">
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">${ex.icon} ${ex.name}</div>
            <div style="font-size:11px;color:var(--ink3);">${ex.alts.length} variantes · mismo músculo</div>
          </div>
          <div style="font-size:12px;color:var(--coral);font-weight:600;flex-shrink:0;margin-left:10px;">Ver →</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function openAltSheet(exName){
  const data=EX_DB[exName];if(!data)return;
  document.getElementById('alt-sheet-title').textContent='Alternativas a: '+exName;
  document.getElementById('alt-sheet-muscle').textContent='Músculo principal: '+data.muscle;
  document.getElementById('alt-sheet-body').innerHTML=data.alts.map((a,i)=>`
    <div style="padding:12px 0;border-bottom:1px solid var(--brd);">
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <div style="background:var(--fuerza-bg);color:var(--fuerza);border-radius:20px;padding:2px 9px;
          font-family:'DM Mono',monospace;font-size:10px;font-weight:600;flex-shrink:0;margin-top:2px;">${i+1}</div>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:3px;">${a.n}</div>
          <div style="font-size:12px;color:var(--ink2);line-height:1.5;">${a.d}</div>
        </div>
      </div>
    </div>
  `).join('')+'<div style="height:8px"></div>';
  document.getElementById('alt-sheet').classList.add('show');
}
function closeAltSheet(ev){
  if(ev.target===document.getElementById('alt-sheet'))
    document.getElementById('alt-sheet').classList.remove('show');
}

/* ══════════════════════════════════

/* ══════════════════════════════════
   SUPABASE CONFIG
══════════════════════════════════ */
const SUPA_URL    = 'https://xjmwmxbegdvcazslqwxp.supabase.co';
const SUPA_KEY    = 'sb_publishable_ybvr_fIqvTXN9UgDdN8kFw_7Jb3ap13';
const ADMIN_EMAIL = 'aperfecto.apv@gmail.com';
const sb = supabase.createClient(SUPA_URL, SUPA_KEY);
let currentUser = null;
let syncTimeout = null;

function showAuthErr(msg){const e=document.getElementById('auth-error');e.textContent=msg;e.style.display='block';document.getElementById('auth-ok').style.display='none';}
function showAuthOk(msg){const e=document.getElementById('auth-ok');e.textContent=msg;e.style.display='block';document.getElementById('auth-error').style.display='none';}
function clearAuthMsg(){document.getElementById('auth-error').style.display='none';document.getElementById('auth-ok').style.display='none';}

function authTab(tab){
  const isLogin=(tab==='login');
  const on='flex:1;padding:8px;border-radius:8px;border:none;font-size:13px;font-weight:600;cursor:pointer;background:var(--surf);color:var(--ink);box-shadow:var(--sh);font-family:Plus Jakarta Sans,sans-serif;';
  const off='flex:1;padding:8px;border-radius:8px;border:none;font-size:13px;font-weight:500;cursor:pointer;background:transparent;color:var(--ink2);font-family:Plus Jakarta Sans,sans-serif;';
  document.getElementById('tab-login').style.cssText=isLogin?on:off;
  document.getElementById('tab-registro').style.cssText=!isLogin?on:off;
  document.getElementById('auth-name-wrap').style.display=isLogin?'none':'block';
  document.getElementById('auth-rgpd-wrap').style.display=isLogin?'none':'block';
  document.getElementById('forgot-wrap').style.display=isLogin?'block':'none';
  const btn=document.getElementById('auth-btn');
  btn.textContent=isLogin?'Entrar':'Crear cuenta';
  btn.dataset.mode=tab;
  clearAuthMsg();
}

async function authAction(){
  const btn=document.getElementById('auth-btn');
  const mode=btn.dataset.mode||'login';
  const email=document.getElementById('auth-email').value.trim();
  const pass=document.getElementById('auth-pass').value;
  clearAuthMsg();
  if(!email||!pass){showAuthErr('Introduce email y contrase\u00f1a.');return;}
  const orig=btn.textContent;
  btn.disabled=true;btn.textContent='...';btn.style.opacity='0.6';
  try{
    if(mode==='login'){
      const {data,error}=await sb.auth.signInWithPassword({email,password:pass});
      if(error)showAuthErr(error.message==='Invalid login credentials'?'Email o contrase\u00f1a incorrectos.':error.message);
      else{await onLogin(data.user);return;}
    }else{
      if(!document.getElementById('auth-rgpd').checked){showAuthErr('Debes aceptar la pol\u00edtica de privacidad.');btn.disabled=false;btn.textContent=orig;btn.style.opacity='1';return;}
      const name=document.getElementById('auth-name').value.trim()||'Usuario';
      const {data,error}=await sb.auth.signUp({email,password:pass,options:{data:{name}}});
      if(error)showAuthErr(error.message);
      else if(data.session){await onLogin(data.user);return;}
      else{showAuthOk('\u00a1Cuenta creada! Inicia sesi\u00f3n con tu email y contrase\u00f1a.');authTab('login');}
    }
  }catch(err){showAuthErr('Error: '+(err.message||'int\u00e9ntalo de nuevo'));}
  btn.disabled=false;btn.textContent=orig;btn.style.opacity='1';
}

async function forgotPassword(){
  const email=document.getElementById('auth-email').value.trim();
  if(!email){showAuthErr('Introduce tu email primero.');return;}
  const {error}=await sb.auth.resetPasswordForEmail(email);
  if(error)showAuthErr(error.message);
  else showAuthOk('Email de recuperaci\u00f3n enviado.');
}

async function signOut(){
  await sb.auth.signOut();
  currentUser=null;
  document.getElementById('app').style.display='none';
  document.getElementById('auth-screen').style.display='flex';
  P={};MEALS_CACHE=[];wlog=[];checks={};exWeights={};exChecks={};cardioChecks={};wkData={};activeSlotIds=null;
}

function hideSplash(){const s=document.getElementById('splash-screen');if(s)s.style.display='none';}

async function onLogin(user){
  currentUser=user;
  document.getElementById('auth-screen').style.display='none';
  if(user.email===ADMIN_EMAIL)document.getElementById('admin-btn').style.display='inline-block';
  // Try loading profile with retry
  let pd=null;
  try{const {data}=await sb.from('profiles').select('*').eq('id',user.id).single();pd=data;}catch(e){}
  if(!pd){
    await new Promise(r=>setTimeout(r,800));
    try{const {data}=await sb.from('profiles').select('*').eq('id',user.id).single();pd=data;}catch(e){}
  }
  hideSplash();
  if(pd&&pd.name){
    const profile={name:pd.name,age:pd.age||30,weight:pd.weight,height:pd.height,target:pd.target_weight,months:pd.months,goal:pd.goal,sex:pd.sex,act:pd.act,trains:pd.trains||[],padelDays:pd.padel_days||3,fuerzaDays:pd.fuerza_days||3,meals:pd.meals||3,mealConfig:pd.meal_config||{},kcalTarget:pd.kcal_target,tmb:pd.tmb||2000};
    await loadUserData(user.id);
    startApp(profile);
  }else{
    document.getElementById('onboarding').style.display='flex';
  }
}

async function loadUserData(userId){
  const {data}=await sb.from('user_data').select('key,value').eq('user_id',userId);
  if(!data)return;
  data.forEach(row=>{try{
    if(row.key==='wlog')wlog=row.value||[];
    if(row.key==='checks')checks=row.value||{};
    if(row.key==='exWeights')exWeights=row.value||{};
    if(row.key==='exChecks')exChecks=row.value||{};
    if(row.key==='cardioChecks')cardioChecks=row.value||{};
    if(row.key==='wkData')wkData=row.value||{};
    if(row.key==='activeSlots')activeSlotIds=row.value||null;
    if(row.key==='customFoods'){const cf=row.value||{};Object.entries(cf).forEach(([id,items])=>localStorage.setItem('fp_custom_'+id,JSON.stringify(items)));}
  }catch(e){}});
}

async function syncToCloud(){
  if(!currentUser)return;
  const uid=currentUser.id;
  const cf={};
  ['desayuno','almuerzo','comida','merienda','cena','postcena'].forEach(id=>{try{cf[id]=JSON.parse(localStorage.getItem('fp_custom_'+id)||'[]');}catch(e){}});
  await sb.from('user_data').upsert([
    {user_id:uid,key:'wlog',value:wlog},{user_id:uid,key:'checks',value:checks},
    {user_id:uid,key:'exWeights',value:exWeights},{user_id:uid,key:'exChecks',value:exChecks},
    {user_id:uid,key:'cardioChecks',value:cardioChecks},{user_id:uid,key:'wkData',value:wkData},
    {user_id:uid,key:'activeSlots',value:activeSlotIds},{user_id:uid,key:'customFoods',value:cf},
  ],{onConflict:'user_id,key'});
}

async function syncProfileToCloud(profile){
  if(!currentUser)return;
  const payload = {
    id:currentUser.id, name:profile.name, age:profile.age,
    weight:profile.weight, height:profile.height,
    target_weight:profile.target, months:profile.months,
    goal:profile.goal, sex:profile.sex, act:profile.act,
    trains:profile.trains, padel_days:profile.padelDays,
    fuerza_days:profile.fuerzaDays, meals:profile.meals,
    meal_config:profile.mealConfig, kcal_target:profile.kcalTarget,
    tmb:profile.tmb,
  };
  const {error} = await sb.from('profiles').upsert(payload);
  if(error){
    console.error('Error guardando perfil:', error.message);
    // Show visible error to user
    alert('Error guardando perfil: ' + error.message + '\n\nContacta soporte.');
  } else {
    console.log('Perfil guardado correctamente');
  }
  try{await sb.from('user_events').insert({user_id:currentUser.id,event_type:'profile_updated',event_data:{goal:profile.goal,weight:profile.weight}});}catch(e){}
}

async function trackEvent(type,data={}){
  if(!currentUser)return;
  try{await sb.from('user_events').insert({user_id:currentUser.id,event_type:type,event_data:data});}catch(e){}
}

async function renderAdminPanel(){
  const body=document.getElementById('admin-body');if(!body)return;
  body.innerHTML='<div style="font-size:13px;color:var(--ink3)">Cargando...</div>';
  const {data:profiles,error}=await sb.from('profiles').select('*').order('created_at',{ascending:false});
  if(error){body.innerHTML='<div style="color:var(--coral)">Error: '+error.message+'</div>';return;}
  const {data:events}=await sb.from('user_events').select('user_id,created_at');
  const evMap={};(events||[]).forEach(e=>{if(!evMap[e.user_id])evMap[e.user_id]={count:0};evMap[e.user_id].count++;});
  const {data:udata}=await sb.from('user_data').select('user_id,key,value').eq('key','wlog');
  const wlogMap={};(udata||[]).forEach(r=>{wlogMap[r.user_id]=r.value||[];});
  body.innerHTML='<div class="rcard" style="margin-bottom:14px"><div class="rcard-title">Resumen global</div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:8px">'
    +'<div style="background:var(--surf2);border-radius:10px;padding:12px;text-align:center"><div style="font-family:DM Mono,monospace;font-size:10px;color:var(--ink3);text-transform:uppercase;margin-bottom:4px">Usuarios</div><div style="font-family:Lora,serif;font-size:28px;font-weight:500;color:var(--fuerza)">'+profiles.length+'</div></div>'
    +'<div style="background:var(--surf2);border-radius:10px;padding:12px;text-align:center"><div style="font-family:DM Mono,monospace;font-size:10px;color:var(--ink3);text-transform:uppercase;margin-bottom:4px">Eventos</div><div style="font-family:Lora,serif;font-size:28px;font-weight:500;color:var(--moss)">'+(events||[]).length+'</div></div>'
    +'<div style="background:var(--surf2);border-radius:10px;padding:12px;text-align:center"><div style="font-family:DM Mono,monospace;font-size:10px;color:var(--ink3);text-transform:uppercase;margin-bottom:4px">Con datos</div><div style="font-family:Lora,serif;font-size:28px;font-weight:500;color:var(--coral)">'+Object.values(wlogMap).filter(w=>w.length>0).length+'</div></div>'
    +'</div></div>'
    +'<div class="rcard"><div class="rcard-title">Usuarios registrados</div>'
    +(profiles||[]).map(p=>{
      const ev=evMap[p.id]||{count:0};
      const wl=wlogMap[p.id]||[];
      const diff=wl.length?+((p.weight||0)-(wl[wl.length-1].kg)).toFixed(1):null;
      return '<div style="padding:12px 0;border-bottom:1px solid var(--brd)">'
        +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px">'
        +'<div><div style="font-size:14px;font-weight:600">'+(p.name||'Sin nombre')+'</div>'
        +'<div style="font-family:DM Mono,monospace;font-size:10px;color:var(--ink3)">'+new Date(p.created_at).toLocaleDateString('es-ES')+' &middot; '+(p.goal||'&mdash;')+'</div></div>'
        +(diff!==null?'<div style="font-family:DM Mono,monospace;font-size:12px;font-weight:600;color:'+(diff>=0?'var(--moss)':'var(--coral)')+'">'+( diff>=0?'&minus;'+diff:'+'+Math.abs(diff))+' kg</div>':'')
        +'</div>'
        +'<div style="display:flex;gap:7px;flex-wrap:wrap">'
        +'<span style="font-size:11px;background:var(--fuerza-bg);color:var(--fuerza);border-radius:20px;padding:2px 9px">'+(p.weight||'?')+'&rarr;'+(p.target_weight||'?')+' kg</span>'
        +'<span style="font-size:11px;background:var(--padel-bg);color:var(--padel);border-radius:20px;padding:2px 9px">'+ev.count+' eventos &middot; '+wl.length+' pesajes</span>'
        +'</div></div>';
    }).join('')
    +'</div>';
}

function startApp(profile){
  P=profile; MEALS_CACHE=[]; activeSlotIds=null;
  // Load supplement state from localStorage
  suplChecks = JSON.parse(localStorage.getItem('fp_supl_checks')||'{}');
  suplMine   = JSON.parse(localStorage.getItem('fp_supl_mine')||'["proteina","multivit","creatina"]');
  suplExtra  = JSON.parse(localStorage.getItem('fp_supl_extra')||'[]');
  document.getElementById('onboarding').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('user-name-chip').textContent=profile.name;
  try{trackEvent('app_open',{platform:window.innerWidth>860?'desktop':'mobile'});}catch(e){}
  renderTraining();
  renderEjercicios();
}

(async function boot(){
  mealConfig['desayuno'].on=true;
  mealConfig['comida'].on=true;
  mealConfig['cena'].on=true;
  document.getElementById('f-meals').value=3;
  document.getElementById('padel-days-grp').style.display='block';
  authTab('login');
  // Safety: if Supabase takes >5s, show login anyway
  const safetyTimer=setTimeout(()=>{hideSplash();document.getElementById('auth-screen').style.display='flex';},5000);
  try{
    const {data:{session}}=await sb.auth.getSession();
    clearTimeout(safetyTimer);
    if(session&&session.user){
      await onLogin(session.user);
    }else{
      hideSplash();
      document.getElementById('auth-screen').style.display='flex';
    }
  }catch(e){
    clearTimeout(safetyTimer);
    hideSplash();
    document.getElementById('auth-screen').style.display='flex';
  }
  sb.auth.onAuthStateChange(async(event,session)=>{
    if(event==='SIGNED_IN'&&session&&!currentUser){await onLogin(session.user);}
    if(event==='SIGNED_OUT'){
         hideSplash();
        document.getElementById('app').style.display='none';
      document.getElementById('onboarding').style.display='none';
    }
  });
})();
