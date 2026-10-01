/* Memory-First Search prototype. DATA and IMGS are injected above this script. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const h=(tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs||{})){if(k==='class')e.className=v;else if(k==='style')e.style.cssText=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(v!==false&&v!=null)e.setAttribute(k,v===true?'':v);}for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c));}return e;};
const svg=(d,s=24)=>{const e=document.createElementNS('http://www.w3.org/2000/svg','svg');e.setAttribute('viewBox','0 0 24 24');e.setAttribute('width',s);e.setAttribute('height',s);e.setAttribute('fill','currentColor');e.innerHTML=d;return e;};
const I={
 search:'<path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/>',
 back:'<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/>',
 plus:'<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>',
 bell:'<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2m6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1z"/>',
 photo:'<path d="M19 5v14H5V5zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-4.86 8.86-3 3.87L9 13.14 6 17h12z"/>',
 play:'<path d="M8 5v14l11-7z"/>',
 share:'<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92"/>',
 edit:'<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/>',
 lens:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 9V6a2 2 0 0 1 2-2h3V2H6a4 4 0 0 0-4 4v3zm16-3v3h2V6a4 4 0 0 0-4-4h-3v2h3a2 2 0 0 1 2 2M6 20a2 2 0 0 1-2-2v-3H2v3a4 4 0 0 0 4 4h3v-2zm14-2a2 2 0 0 1-2 2h-3v2h3a4 4 0 0 0 4-4v-3h-2z"/>',
 del:'<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/>',
 spark:'<path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 14l.95 2.55L22.5 17.5l-2.55.95L19 21l-.95-2.55-2.55-.95 2.55-.95z"/>',
 close:'<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
};
const LIB=window.DATA, IMG={}, BYID={}; LIB.forEach(x=>{BYID[x.id]=x;IMG[x.id]='img/'+x.id+'.jpg';});
const MONTHS=['january','february','march','april','may','june','july','august','september','october','november','december'];
const MON3=MONTHS.map(m=>m.slice(0,3));
const fmtMonth=d=>{const[y,m]=d.split('-');return MONTHS[+m-1][0].toUpperCase()+MONTHS[+m-1].slice(1)+' '+y;};
const fmtDay=d=>new Date(d+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
const TODAY_YEAR=2026;

/* ---------------- study design ---------------- */
const TASKS={
 A:[{id:'A1',cue:'flash',target:'p003'},
    {id:'A2',cue:'story',target:'p065',text:'Last year you had a bad fever. You remember taking a photo of the medicine strip so you could buy it again.'},
    {id:'A3',cue:'fragment',target:'p034',crop:[.32,.08,.78,.62]},
    {id:'A4',cue:'flash',target:'p060'},
    {id:'A5',cue:'story',target:'d01',text:'You need the flight ticket from the beach holiday you took with friends.'}],
 B:[{id:'B1',cue:'flash',target:'p014'},
    {id:'B2',cue:'fragment',target:'p081',crop:[.18,0,1,.62]},
    {id:'B3',cue:'story',target:'p032',text:'Your friends threw a surprise birthday dinner at night, right by the sea. Everyone was clapping when she walked in.'},
    {id:'B4',cue:'flash',target:'p055'},
    {id:'B5',cue:'story',target:'d07',text:'On your first day at the office, you saved the WiFi password somewhere on your phone.'}]
};
const MODE_NAME={C:'Version 1',M:'Version 2'};
const PLACEHOLDERS_M=['Describe a scene or a feeling','Try: the day we got caught in the rain','Try: getting ready before the wedding','Try: that lazy Sunday at home'];
const PLACEHOLDER_C='Search your photos';
const TASK_LIMIT=180, GIVEUP_AFTER=20, CUE_SECONDS=5;

/* ---------------- capabilities ---------------- */
/* Streamlit bridge: talks to app.py through the Streamlit component protocol.
   One request at a time; Python answers by re-rendering with args.resp = {reqId, ...}. */
const Bridge=(()=>{
  const inStreamlit=window.parent!==window;
  let ready=false, cfg={ai:false,log:false}, queue=[], inflight=null, seq=0;
  const post=m=>window.parent.postMessage(Object.assign({isStreamlitMessage:true},m),'*');
  function setHeight(){
    let hgt=900;
    try{ if(window.matchMedia('(max-width:500px)').matches) hgt=Math.max(560,(window.parent.innerHeight||844)-8); }catch(e){}
    post({type:'streamlit:setFrameHeight',height:hgt});
    document.documentElement.style.height=hgt+'px';
  }
  function pump(){
    if(inflight||!queue.length||!ready)return;
    inflight=queue.shift();
    post({type:'streamlit:setComponentValue',value:{reqId:inflight.reqId,kind:inflight.kind,payload:inflight.payload},dataType:'json'});
    inflight.timer=setTimeout(()=>{const f=inflight;inflight=null;f.resolve(null);pump();},f_timeout(inflight.kind));
  }
  const f_timeout=k=>k==='ai'?25000:15000;
  window.addEventListener('message',ev=>{
    const d=ev.data; if(!d||d.type!=='streamlit:render')return;
    const a=d.args||{}; cfg={ai:!!a.ai_enabled,log:!!a.log_enabled};
    if(!ready){ready=true;setHeight();}
    const r=a.resp;
    if(inflight&&r&&r.reqId===inflight.reqId){clearTimeout(inflight.timer);const f=inflight;inflight=null;f.resolve(r);}
    pump();
  });
  if(inStreamlit){post({type:'streamlit:componentReady',apiVersion:1});window.addEventListener('resize',setHeight);}
  return{
    get ai(){return ready&&cfg.ai;}, get log(){return ready&&cfg.log;},
    call(kind,payload){ if(!inStreamlit)return Promise.resolve(null);
      return new Promise(resolve=>{ // logs replace any older queued log for the same session
        if(kind==='log')queue=queue.filter(q=>{if(q.kind==='log'&&q.payload.sid===payload.sid){q.resolve(null);return false;}return true;});
        queue.push({reqId:'r'+(++seq)+'_'+Date.now().toString(36),kind,payload,resolve});pump();});}
  };
})();
let aiOk=true;

/* ---------------- text engines ---------------- */
const STOP=new Set('a an the of in on at to for from with and or my me i we our us is was were it its this that those these there their they them some any photo photos pic pics picture pictures image images find show where when what which who one time took taken had have has of about like just really very can cant could do did get got been be am are by as into near up out remember kind sort maybe something someday day'.split(' '));
const stem=w=>{if(w.length>4&&w.endsWith('ies'))return w.slice(0,-3)+'y';if(w.length>5&&w.endsWith('ing'))return w.slice(0,-3);if(w.length>4&&w.endsWith('ed'))return w.slice(0,-2);if(w.length>3&&w.endsWith('es')&&!w.endsWith('ses'))return w.slice(0,-2);if(w.length>3&&w.endsWith('s')&&!w.endsWith('ss'))return w.slice(0,-1);return w;};
const words=s=>(s||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);
const toks=s=>words(s).filter(w=>!STOP.has(w)).map(stem);
const SYNRAW={
 cafe:'coffee restaurant brunch breakfast',coffee:'cafe',restaurant:'cafe dinner dining',sick:'fever illness medicine doctor hospital tablet',ill:'sick fever illness medicine',fever:'sick medicine tablet temperature doctor',illness:'sick fever',
 medicine:'tablet pill strip dolo prescription paracetamol',medicines:'medicine',tablet:'medicine pill strip',pill:'tablet medicine',doctor:'prescription clinic hospital',hospital:'patient nurse ward',
 ticket:'boarding flight bus movie booking',flight:'boarding airline plane airport',plane:'flight boarding airline',airport:'flight boarding',
 beach:'sea seaside sand shore ocean',sea:'beach seaside ocean water',ocean:'sea beach',seaside:'beach sea',sunset:'evening golden orange sun',evening:'sunset night',night:'evening late dark',
 rain:'rainy monsoon umbrella wet downpour',rainy:'rain monsoon',monsoon:'rain',cake:'birthday candle',birthday:'cake candle party celebration balloon',party:'celebration balloon dance birthday',celebration:'party festival birthday',
 wedding:'bride groom mehendi sangeet reception marriage',marriage:'wedding',bride:'wedding',mountain:'hill himachal valley trek snow',hill:'mountain',trek:'hike mountain',hike:'trek',snow:'snowy mountain',
 car:'suv vehicle driving',vehicle:'car bike',bike:'motorbike',motorcycle:'motorbike bike',scooter:'bike motorbike',new:'delivery first purchase',
 dog:'puppy retriever pet',puppy:'dog pet',pet:'dog puppy',cat:'pet',wifi:'password network',password:'wifi login',internet:'wifi',
 office:'work workplace colleague desk',work:'office',job:'office work',gym:'workout fitness dumbbell',workout:'gym fitness',exercise:'gym workout fitness',
 festival:'diwali holi onam janmashtami',diwali:'diya lamp sparkler',lamp:'diya diwali light',light:'lamp diya fairy',holi:'color gulal',color:'holi colorful',
 happy:'laughing smiling joy fun celebration',laugh:'laughing happy',fun:'happy party',joy:'happy laughing',cozy:'warm relaxing home',sad:'sick',
 friend:'gang group',family:'mom dad relative',mom:'mother',mother:'mom',dad:'father',father:'dad',sister:'ananya',nephew:'vihaan kid',kid:'child baby boy girl nephew',child:'kid',baby:'kid',
 food:'meal lunch dinner breakfast',meal:'food lunch dinner',lunch:'meal food',dinner:'meal food restaurant',clap:'clapping surprise',surprise:'party',
 purple:'lavender',misty:'mist fog cloud foggy',foggy:'fog mist misty',fog:'mist cloud',cloud:'mist fog',trip:'vacation holiday travel',vacation:'trip holiday',holiday:'trip vacation',travel:'trip',
 graduation:'convocation degree graduate',college:'campus university convocation',university:'college campus',bill:'receipt payment',receipt:'bill',payment:'upi paid',insurance:'policy',rent:'rental agreement lease',
 recipe:'cooking',movie:'cinema theatre film',film:'movie cinema',selfie:'mirror',screenshot:'screen',document:'paper',dress:'kurta saree lehenga outfit',kurta:'dress',saree:'dress',sweet:'cake',sparkle:'sparkler',firework:'sparkler',
 road:'highway drive',drive:'driving road',home:'house kitchen',crown:'cake',candle:'cake birthday'
};
const SYN={};for(const[k,v]of Object.entries(SYNRAW)){SYN[stem(k)]=toks(v);}
// per-item indexes
const CTRL_VOCAB=new Set();
LIB.forEach(it=>{
  const ocr=(it.kind==='screenshot'||it.kind==='document')?it.desc:'';
  const ctrlText=[it.labels,it.place,it.people.join(' '),ocr].join(' ');
  it.ctrl=new Set(toks(ctrlText)); it.ctrl.forEach(t=>CTRL_VOCAB.add(t));
  const sem=new Map(); const add=(s,w)=>toks(s).forEach(t=>sem.set(t,Math.max(sem.get(t)||0,w)));
  add(it.desc,1); add(it.labels,1); add(it.tags,.9); add(it.event+' '+it.place+' '+it.people.join(' '),1.1); add(it.kind,.8);
  it.sem=sem; it.year=+it.date.slice(0,4); it.month=+it.date.slice(5,7);
  it.city=(it.place||'').split(',').pop().trim()||'Unknown';
});
const DF=new Map();LIB.forEach(it=>it.sem.forEach((_,t)=>DF.set(t,(DF.get(t)||0)+1)));
const idf=t=>Math.log(1+LIB.length/((DF.get(t)||0)+1));
function parseDate(q){
  const w=words(q), years=new Set(), months=new Set(); let used=new Set();
  const s=' '+w.join(' ')+' ';
  if(s.includes(' last year '))years.add(TODAY_YEAR-1),'last year'.split(' ').forEach(x=>used.add(x));
  if(s.includes(' this year '))years.add(TODAY_YEAR),['this','year'].forEach(x=>used.add(x));
  if(s.includes(' two years ago ')||s.includes(' 2 years ago '))years.add(TODAY_YEAR-2),['two','2','years','ago'].forEach(x=>used.add(x));
  w.forEach(x=>{if(/^20(2[2-6])$/.test(x)){years.add(+x);used.add(x);} const mi=MONTHS.indexOf(x)>=0?MONTHS.indexOf(x):MON3.indexOf(x); if(mi>=0&&x!=='may'){months.add(mi+1);used.add(x);} });
  if(s.includes(' winter '))[11,12,1,2].forEach(m=>months.add(m)),used.add('winter');
  if(s.includes(' summer '))[3,4,5,6].forEach(m=>months.add(m)),used.add('summer');
  return{years,months,used};
}
function controlSearch(q){
  const d=parseDate(q); const t=toks(q).filter(x=>!d.used.has(x));
  // keyword search: every word must match a label, place, face name or text in the image
  if(!t.length&&!d.years.size&&!d.months.size)return[];
  return LIB.filter(it=>t.every(k=>it.ctrl.has(k))&&(!d.years.size||d.years.has(it.year))&&(!d.months.size||d.months.has(it.month)));
}
function memorySearch(q){
  const d=parseDate(q); const t=[...new Set(toks(q).filter(x=>!d.used.has(x)))];
  const scored=[];
  for(const it of LIB){
    let score=0,hit=0;
    for(const tok of t){
      let best=0; const cands=[[tok,1],...(SYN[tok]||[]).map(c=>[c,.75])];
      for(const[c,w]of cands){const v=it.sem.get(c); if(v)best=Math.max(best,v*w*idf(c));}
      if(!best&&tok.length>=4){for(const[k,v]of it.sem){if(k.length>=4&&(k.startsWith(tok)||tok.startsWith(k))){best=Math.max(best,.55*v*idf(k));}}}
      if(best){score+=best;hit++;}
    }
    if(t.length)score*= .4+ hit/t.length; else score=1;
    if(d.years.size)score*=d.years.has(it.year)?1.7:.45;
    if(d.months.size)score*=d.months.has(it.month)?1.4:.7;
    if(score>0&&(hit||!t.length))scored.push([score,it]);
  }
  scored.sort((a,b)=>b[0]-a[0]);
  if(!scored.length)return[];
  const top=scored[0][0];
  return scored.filter(s=>s[0]>=top*.33).slice(0,36).map(s=>s[1]);
}
async function aiSearch(q){
  if(!Bridge.ai||!aiOk)return null;
  const r=await Bridge.call('ai',{q});
  if(!r||!r.ok||!Array.isArray(r.ids)){ if(r&&r.error==='rate_limited')aiOk=false; return null; }
  const ids=r.ids.filter(id=>BYID[id]);
  return{items:ids.map(id=>BYID[id]),question:(r.question||'').trim(),options:Array.isArray(r.options)?r.options.slice(0,4).map(String):[]};
}
function localFollowup(items){
  if(!items.length)return{question:'What was happening in it?',options:['A trip','A celebration','At home','A ticket or document'],kind:'query',map:{'A trip':'trip travel','A celebration':'birthday wedding festival party','At home':'home family','A ticket or document':'ticket document screenshot'}};
  const pool=items.slice(0,20); const facets=[['event','Which occasion was it?'],['year','Roughly when was it?'],['city','Where was it?']];
  let best=null;
  for(const[f,qq]of facets){const c={};pool.forEach(it=>{const v=String(it[f]);c[v]=(c[v]||0)+1;});const n=Object.keys(c).length;if(n>=2&&n<=6&&(!best||n>best.n))best={f,qq,c,n};}
  if(!best)return null;
  const options=Object.entries(best.c).sort((a,b)=>b[1]-a[1]).slice(0,4).map(e=>e[0]);
  return{question:best.qq,options,kind:'facet',facet:best.f};
}

/* ---------------- session + logging ---------------- */
let S=null, T=null; // session, current task run
const now=()=>Date.now();
function newSession(name,answers,order){
  return{sid:'s'+now().toString(36)+Math.random().toString(36).slice(2,6),name,answers,order,startedAt:new Date().toISOString(),tasks:[],ratings:{},ai:Bridge.ai,device:navigator.userAgent.slice(0,120)};
}
function log(type,data={}){ if(!T)return; T.events.push(Object.assign({t:now()-T.t0,type},data)); }
function localStore(){try{const all=JSON.parse(localStorage.getItem('mfs_sessions')||'{}');all[S.sid]=S;localStorage.setItem('mfs_sessions',JSON.stringify(all));}catch(e){}}
async function save(){
  localStore();
  if(Bridge.log){const r=await Bridge.call('log',JSON.parse(JSON.stringify(S)));S.savedRemote=!!(r&&r.ok);}
}

/* ---------------- shell ---------------- */
const body=$('#body');
let toastTimer;
function toast(msg,good){const old=$('.toast');if(old)old.remove();const t=h('div',{class:'toast'+(good?' good':''),role:'status'},msg);$('#phone').append(t);clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.remove(),2200);}
const inactive=what=>()=>{log('inactive_tap',{what});toast('Not part of this prototype');};
function show(el){body.innerHTML='';body.append(el);}
function logoEl(){return h('div',{class:'logo'},h('div',{class:'mark','aria-hidden':'true'},h('i',{style:'left:0;top:0;background:var(--g-blue)'}),h('i',{style:'right:0;top:0;background:var(--g-red)'}),h('i',{style:'left:0;bottom:0;background:var(--g-green)'}),h('i',{style:'right:0;bottom:0;background:var(--g-yellow)'})),h('div',{},'Photos',h('small',{style:'display:block;margin-top:-2px'},'Concept prototype')));}

/* ---------------- welcome ---------------- */
function nextOrder(){try{const n=+(localStorage.getItem('mfs_count')||0);return n%2===0?'CM':'MC';}catch(e){return Math.random()<.5?'CM':'MC';}}
function welcome(){
  const ans={};
  const q=(key,label,opts,onpick)=>{const row=h('div',{class:'opts',role:'radiogroup','aria-label':label});opts.forEach(o=>row.append(h('button',{class:'chip',role:'radio','aria-checked':'false',onclick:e=>{ans[key]=o;row.querySelectorAll('.chip').forEach(c=>{c.classList.remove('on');c.setAttribute('aria-checked','false');});e.currentTarget.classList.add('on');e.currentTarget.setAttribute('aria-checked','true');onpick&&onpick(o);check();}},o)));return h('div',{class:'field'},h('div',{class:'qlabel'},label),row);};
  const name=h('input',{id:'pname',autocomplete:'off',placeholder:'First name or code, e.g. P1',oninput:()=>check()});
  const q3=q('usesAI','Do you use it?',['Yes','No'],v=>{q4.classList.toggle('hidden',v!=='Yes');});
  const q4=q('permissions','Have you turned on the permissions it needs (Face Groups, location estimates)?',['Yes','No','Not sure']);
  q3.classList.add('hidden');q4.classList.add('hidden');
  const order=h('select',{id:'order'},h('option',{value:'CM'},'Version 1 first'),h('option',{value:'MC'},'Version 2 first'));order.value=nextOrder();
  const start=h('button',{class:'btn wide',disabled:true,onclick:begin},'Start');
  function check(){start.disabled=!(name.value.trim()&&ans.habit&&ans.awareAI&&(ans.awareAI==='No'||ans.usesAI));}
  async function begin(){
    start.disabled=true;
    S=newSession(name.value.trim(),Object.assign({},ans),order.value); S.blocks=[{mode:S.order[0],set:'A'},{mode:S.order[1],set:'B'}];
    try{localStorage.setItem('mfs_count',String(+(localStorage.getItem('mfs_count')||0)+1));}catch(e){}
    save(); intro();
  }
  show(h('div',{class:'screen study'},
    h('div',{class:'brandrow'},logoEl()),
    h('h1',{},'Finding old photos'),
    h('p',{},'A short study on how people find photos they remember but can’t quite describe. It takes about 10 minutes.'),
    h('div',{class:'field'},h('label',{for:'pname'},'Participant'),name),
    q('habit','When you want an old photo, what do you usually do first?',['Scroll through photos','Use search','Open an album','Ask someone to send it']),
    q('awareAI','Did you know Google Photos has an AI search that understands natural sentences?',['Yes','No'],v=>{q3.classList.toggle('hidden',v!=='Yes');if(v!=='Yes'){q4.classList.add('hidden');delete ans.usesAI;}}),
    q3,q4,
    h('div',{class:'field'},h('label',{for:'order'},'Order (set by the facilitator)'),order),
    h('div',{class:'spacer'}),start,
    h('button',{class:'btn text',onclick:()=>{location.hash='dashboard';}},'Results on this device')
  ));
}
function intro(){
  show(h('div',{class:'screen study'},
    h('h1',{},'How it works'),
    h('p',{},'You’ll try two versions of a photos app, with 5 photos to find in each.'),
    h('p',{},'Before each one you’ll get a memory: a photo shown for 5 seconds, a part of a photo, or a short story. Then find it in the library however you normally would.'),
    h('p',{},'When you open the right photo, tap “This is the one”. If you can’t find it, you can give up. There’s no wrong way to do this.'),
    h('div',{class:'spacer'}),
    h('button',{class:'btn wide',onclick:()=>{S.bi=0;S.ti=0;blockStart();}},'Begin Version '+(S.blocks[0].mode==='C'?'1':'2'))
  ));
}
function blockStart(){
  const b=S.blocks[S.bi];
  TASKS[b.set].forEach(t=>{const p=new Image();p.src=IMG[t.target];});
  show(h('div',{class:'screen study'},
    h('h1',{},MODE_NAME[b.mode]),
    h('p',{},'5 photos to find. Use the app the way you normally would.'),
    h('div',{class:'spacer'}),
    h('button',{class:'btn wide',onclick:()=>{S.ti=0;cue();}},'Start')
  ));
}

/* ---------------- memory cue ---------------- */
function cue(){
  const b=S.blocks[S.bi], task=TASKS[b.set][S.ti], it=BYID[task.target];
  const meta=h('div',{class:'meta'},h('span',{},MODE_NAME[b.mode]),h('span',{},'Photo '+(S.ti+1)+' of 5'));
  const go=h('button',{class:'btn wide',disabled:task.cue!=='story',onclick:()=>startTask(task,b.mode)},'Start finding');
  let frame;
  if(task.cue==='story'){
    frame=h('div',{class:'frame',style:'align-items:flex-start;background:#fef7e0'},h('div',{class:'story'},task.text));
  }else{
    frame=h('div',{class:'frame'});
    const loading=h('div',{class:'gone'},'Loading photo…'); frame.append(loading);
    const im=new Image();
    im.onload=()=>{
      loading.remove();
      if(task.cue==='flash'){const img=h('img',{src:im.src,alt:'Photo to remember',style:'width:100%;height:100%;object-fit:contain'});frame.append(img);}
      else{
        const[x0,y0,x1,y1]=task.crop; const sx=x0*im.naturalWidth, sy=y0*im.naturalHeight, sw=(x1-x0)*im.naturalWidth, sh=(y1-y0)*im.naturalHeight;
        const scale=Math.max(1,Math.min(4,600/sw)); const c=document.createElement('canvas'); c.width=Math.round(sw*scale); c.height=Math.round(sh*scale);
        const ctx=c.getContext('2d'); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; ctx.drawImage(im,sx,sy,sw,sh,0,0,c.width,c.height);
        c.style.cssText='width:100%;height:100%;object-fit:contain;filter:blur(1px)'; c.setAttribute('aria-label','Part of the photo to remember'); frame.append(c);
      }
      startRing();
    };
    im.onerror=()=>{loading.textContent='Photo could not load. Tap Start finding to continue.';go.disabled=false;};
    im.src=IMG[it.id];
    function startRing(){
      const r=document.createElementNS('http://www.w3.org/2000/svg','svg');r.setAttribute('class','ring');r.setAttribute('viewBox','0 0 44 44');
      r.innerHTML='<circle class="t" cx="22" cy="22" r="18"/><circle class="p" cx="22" cy="22" r="18" stroke-dasharray="113" stroke-dashoffset="0"/><text x="22" y="27" text-anchor="middle">5</text>';
      frame.append(r);
      const p=r.querySelector('.p'),tx=r.querySelector('text'); const t0=now();
      const tick=setInterval(()=>{const el=(now()-t0)/1000;p.setAttribute('stroke-dashoffset',String(113*Math.min(1,el/CUE_SECONDS)));tx.textContent=String(Math.max(0,Math.ceil(CUE_SECONDS-el)));
        if(el>=CUE_SECONDS){clearInterval(tick);frame.innerHTML='';frame.append(h('div',{class:'gone'},task.cue==='flash'?'The photo is hidden now. You remember seeing it.':'That’s all you remember of it.'));go.disabled=false;}},100);
    }
  }
  const lead=task.cue==='flash'?'Remember this photo.':task.cue==='fragment'?'You only remember part of this photo.':'You remember this moment.';
  show(h('div',{class:'screen cue'},meta,h('h2',{},lead),frame,go));
}

/* ---------------- task runtime ---------------- */
let clockTimer, phTimer, fuTimer;
function startTask(task,mode){
  T={taskId:task.id,set:task.id[0],cue:task.cue,target:task.target,mode,t0:now(),startedAt:new Date().toISOString(),events:[],wrongPicks:0,nudge:{shown:false,tapped:false},scroll:{dist:0,bursts:0,last:0}};
  log('task_start');
  renderApp();
  clearInterval(clockTimer);
  clockTimer=setInterval(()=>{const s=Math.floor((now()-T.t0)/1000);const c=$('#clock');if(c)c.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');const g=$('#giveup');if(g)g.classList.toggle('hidden',s<GIVEUP_AFTER);if(s>=TASK_LIMIT)endTask('time_up');},500);
}
function endTask(result){
  if(!T)return; clearInterval(clockTimer);clearInterval(phTimer);clearTimeout(fuTimer);
  log(result); T.result=result; T.timeMs=now()-T.t0; T.endedAt=new Date().toISOString();
  const ev=T.events;
  T.summary={searched:ev.some(e=>e.type==='search_open'),queries:ev.filter(e=>e.type==='query').length,
    queriesWithResults:ev.filter(e=>e.type==='query'&&e.n>0).length,openedFromResults:ev.some(e=>e.type==='photo_open'&&e.from==='results'),
    found:result==='found',foundVia:result==='found'?(ev.filter(e=>e.type==='photo_open').pop()||{}).from:null,
    nudgeShown:T.nudge.shown,nudgeTapped:T.nudge.tapped,followupShown:ev.some(e=>e.type==='followup_shown'),followupUsed:ev.some(e=>e.type==='followup_option'),wrongPicks:T.wrongPicks};
  S.tasks.push(T); T=null; save();
  const done=result==='found';
  show(h('div',{class:'screen study',style:'justify-content:center;text-align:center'},
    h('h1',{},done?'Found it':'Moving on'),h('p',{},done?'Nice. On to the next one.':'No problem. That happens with real libraries too.'),
    h('div',{style:'height:24px'}),
    h('button',{class:'btn',onclick:next},'Next')));
}
function next(){
  S.ti++;
  if(S.ti<5)return cue();
  rating();
}
function rating(){
  const b=S.blocks[S.bi], r={};
  const scale=(key,label,lo,hi)=>{const row=h('div',{class:'scale'});[1,2,3,4,5].forEach(n=>row.append(h('button',{'aria-label':label+' '+n,onclick:e=>{r[key]=n;row.querySelectorAll('button').forEach(x=>x.classList.remove('on'));e.currentTarget.classList.add('on');ok.disabled=!(r.ease&&r.trust);}},String(n))));return h('div',{class:'field'},h('div',{class:'qlabel'},label),row,h('div',{class:'scale-l'},h('span',{},lo),h('span',{},hi)));};
  const comment=h('textarea',{rows:3,placeholder:'Anything that helped or got in the way? (optional)',style:'border:1px solid var(--outline);border-radius:8px;padding:12px;font-size:15px;resize:none'});
  const ok=h('button',{class:'btn wide',disabled:true,onclick:()=>{r.comment=comment.value.trim();S.ratings[b.mode]=r;save();S.bi++;if(S.bi<2)blockStart();else finish();}},'Continue');
  show(h('div',{class:'screen study'},h('h1',{},MODE_NAME[b.mode]+' done'),
    scale('ease','How easy was it to find photos in this version?','Very hard','Very easy'),
    scale('trust','How confident were you that search would understand what you typed?','Not at all','Completely'),
    h('div',{class:'field'},h('div',{class:'qlabel'},'Comments'),comment),h('div',{class:'spacer'}),ok));
}
function finish(){
  S.finishedAt=new Date().toISOString(); save();
  const found=S.tasks.filter(t=>t.result==='found').length;
  const copy=h('button',{class:'btn tonal wide',onclick:async()=>{try{await navigator.clipboard.writeText(JSON.stringify(S));toast('Results copied',true);}catch(e){toast('Copy failed. Use Facilitator results instead.');}}},'Copy results');
  show(h('div',{class:'screen study'},h('h1',{},'Thank you'),h('p',{},`You found ${found} of 10 photos. Your answers help us understand where photo search breaks down.`),
    h('p',{class:'note'},Bridge.log?'Your results are saved.':'Results are saved on this device only. Tap Copy results and send them to the researcher.'),
    h('div',{class:'spacer'}),copy,h('button',{class:'btn wide',onclick:welcome},'New participant')));
}

/* ---------------- Photos app UI ---------------- */
function taskbar(){
  return h('div',{class:'taskbar'},h('b',{},'Photo '+(S.ti+1)+' of 5'),h('span',{},'·'),h('span',{class:'clock',id:'clock'},'0:00'),
    h('button',{class:'gu hidden',id:'giveup',onclick:e=>{const b=e.currentTarget;if(b.dataset.arm){endTask('gave_up');return;}b.dataset.arm='1';b.textContent='Tap again to give up';setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent='Give up';}},3000);}},'Give up'));
}
function tile(it,from){
  const t=h('button',{class:'tile','aria-label':(it.kind==='photo'?'Photo':it.kind[0].toUpperCase()+it.kind.slice(1))+', '+fmtDay(it.date),onclick:()=>openViewer(it,from)},h('img',{src:IMG[it.id],alt:'',decoding:'async'}));
  if(it.kind==='video')t.append(h('div',{class:'vid'},'0:'+String(it.dur).padStart(2,'0'),svg(I.play,22)));
  return t;
}
function renderApp(){
  const wrap=h('div',{class:'screen'});
  wrap.append(taskbar());
  const home=h('div',{class:'layer',id:'home'});
  const top=h('div',{class:'topbar'},logoEl(),h('div',{class:'grow'}),
    h('button',{class:'iconbtn','aria-label':'Create',onclick:inactive('plus')},svg(I.plus)),
    h('button',{class:'iconbtn','aria-label':'Notifications',onclick:inactive('bell')},svg(I.bell),h('span',{class:'dot'})),
    h('button',{class:'avatar','aria-label':'Account',onclick:inactive('avatar')},'A'));
  const sc=h('div',{class:'scroller',id:'homescroll'});
  const mem=h('div',{class:'memories'});
  [['p006','Goa with the gang'],['p022','Riya & Arjun’s wedding'],['p013','Into the mountains']].forEach(([id,label])=>mem.append(h('button',{class:'mem',style:`background-image:url(${IMG[id]})`,onclick:inactive('memories')},h('span',{},label))));
  sc.append(mem);
  let cur=null,grid=null;
  LIB.forEach(it=>{const m=it.date.slice(0,4);if(m!==cur){cur=m;sc.append(h('div',{class:'month'},m));grid=h('div',{class:'grid'});sc.append(grid);}grid.append(tile(it,'grid'));});
  sc.append(h('div',{class:'endpad'}));
  sc.addEventListener('scroll',onScroll,{passive:true});
  const fab=h('button',{class:'searchfab',id:'fab','aria-label':'Search',onclick:()=>openSearch('fab')},h('span',{class:'glow','aria-hidden':'true'}),svg(I.search,26));
  const nav=h('div',{class:'navwrap'},h('div',{class:'navpill'},
    h('button',{class:'on'},svg(I.photo,22),'Photos'),h('button',{onclick:inactive('collections')},'Collections'),h('button',{onclick:inactive('create')},'Create')),fab);
  home.append(top,sc,nav);
  wrap.append(home);
  show(wrap);
}
let lastScrollTop=0,scrollLogTimer;
function onScroll(e){
  if(!T)return; const el=e.currentTarget; const st=el.scrollTop; const d=Math.abs(st-lastScrollTop); lastScrollTop=st;
  const t=now(); if(t-T.scroll.last>1200)T.scroll.bursts++; T.scroll.last=t; T.scroll.dist+=d;
  clearTimeout(scrollLogTimer); scrollLogTimer=setTimeout(()=>log('scroll',{dist:Math.round(T?T.scroll.dist:0),bursts:T?T.scroll.bursts:0}),800);
  // Glow nudge: aimless pattern = scroll, pause, scroll again, over more than ~1.5 screens, without opening search
  if(T.scroll.dist>el.clientHeight*0.8&&(t-T.t0)>3000)maybeGlow('scroll');
}

function maybeGlow(reason){
  if(!T||T.mode!=='M'||T.nudge.shown||T.events.some(x=>x.type==='search_open'))return;
  T.nudge.shown=true; log('nudge_shown',{reason,dist:Math.round(T.scroll.dist)}); const f=$('#fab'); if(f)f.classList.add('glowing');
}
/* ---------------- search ---------------- */
let lastResults=[],lastQuery='',aiState=null,fuShown=false;
function openSearch(src){
  if(T){ if(T.nudge.shown&&!T.nudge.tapped&&src==='fab'){T.nudge.tapped=true;log('nudge_tap');} log('search_open',{via:src,glowing:!!($('#fab')&&$('#fab').classList.contains('glowing'))}); }
  const f=$('#fab'); if(f)f.classList.remove('glowing');
  const M=T&&T.mode==='M';
  const layer=h('div',{class:'layer',id:'search',style:'z-index:25'});
  const input=h('input',{type:'search',enterkeyhint:'search','aria-label':'Search your photos',autocomplete:'off'});
  const ph=h('div',{class:'ph'},M?PLACEHOLDERS_M[0]:PLACEHOLDER_C);
  const slot=h('div',{id:'fuslot',style:'display:flex'});
  const bar=h('div',{class:'sbar'},h('button',{class:'iconbtn','aria-label':'Back',onclick:closeSearch},svg(I.back)),h('div',{class:'sfield'},input,ph),slot);
  const sw=h('div',{class:'sbarwrap'},bar,h('div',{id:'fucard'}));
  const res=h('div',{class:'scroller',id:'results'});
  layer.append(sw,h('div',{class:'ai-line',id:'ailine'}),res);
  input.addEventListener('input',()=>{ph.style.opacity=input.value?'0':'1';});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();runQuery(input.value,'typed');input.blur();}});
  clearInterval(phTimer);
  if(M){let i=0;phTimer=setInterval(()=>{if(input.value)return;i=(i+1)%PLACEHOLDERS_M.length;ph.style.opacity='0';setTimeout(()=>{ph.textContent=PLACEHOLDERS_M[i];if(!input.value)ph.style.opacity='1';},350);},3200);}
  renderSuggestions(res);
  $('.screen').append(layer);
  setTimeout(()=>input.focus(),50);
  fuShown=false;
}
function closeSearch(){const l=$('#search');if(l)l.remove();clearInterval(phTimer);clearTimeout(fuTimer);log('search_close');}
function renderSuggestions(res){
  res.innerHTML='';
  const places=[['Goa','p004','goa'],['Himachal','p012','himachal'],['Jaipur','p024','jaipur'],['Hyderabad','p025','hyderabad'],['Chennai','p050','chennai'],['Bangalore','p078','bangalore']];
  const pg=h('div',{class:'places'});places.forEach(([n,id,q])=>pg.append(h('button',{class:'place',onclick:()=>{log('category_tap',{what:'place:'+n});setInput(n);runQuery(q,'place')}},h('div',{style:`background-image:url(${IMG[id]})`}),n)));
  const cats=h('div',{class:'cats'});[['Screenshots','screenshot'],['Documents','document'],['Videos','video'],['Selfies','selfie']].forEach(([n,q])=>cats.append(h('button',{class:'chip',onclick:()=>{log('category_tap',{what:n});setInput(n);runQuery(q,'category')}},n)));
  res.append(h('div',{class:'sect'},'Places'),pg,h('div',{class:'sect',style:'margin-top:12px'},'Categories'),cats);
}
function setInput(v){const i=$('#search input');if(i){i.value=v;const p=$('#search .ph');if(p)p.style.opacity='0';}}
async function runQuery(q,via,opts={}){
  q=(q||'').trim(); if(!q)return;
  const M=T&&T.mode==='M';
  lastQuery=q; clearTimeout(fuTimer); hideFollowup(true);
  let items=M?memorySearch(q):controlSearch(q);
  if(opts.filter)items=opts.filter(items);
  lastResults=items;
  log('query',{q,via,n:items.length,engine:M?'memory':'keyword',top:items.slice(0,5).map(x=>x.id),hasTarget:T?items.some(x=>x.id===T.target):undefined});
  renderResults(items);
  aiState=null;
  if(M&&Bridge.ai&&aiOk&&via!=='place'&&via!=='category'&&!opts.filter){
    const line=$('#ailine'); line.innerHTML=''; line.append(h('span',{class:'dots'},h('i'),h('i'),h('i')),'Finding better matches');
    const myQ=q; const r=await aiSearch(q);
    if(myQ!==lastQuery||!$('#search'))return;
    line.innerHTML='';
    if(r){aiState=r;
      if(r.items.length){const seen=new Set(r.items.map(x=>x.id));const merged=r.items.concat(lastResults.filter(x=>!seen.has(x.id))).slice(0,36);
        const same=merged.length===lastResults.length&&merged.every((x,i)=>x===lastResults[i]);
        lastResults=merged; if(!same)renderResults(merged); line.append('Improved with AI');}
      log('ai_results',{q,n:r.items.length,top:r.items.slice(0,5).map(x=>x.id),hasTarget:T?r.items.some(x=>x.id===T.target):undefined,question:r.question});
    } else log('ai_unavailable');
  }
  if(M)armFollowup(lastResults.length?7000:1200);
}
function renderResults(items){
  const res=$('#results'); if(!res)return; res.innerHTML='';
  if(!items.length){res.append(h('div',{class:'empty'},h('b',{},'No results'),T&&T.mode==='M'?'Try describing what was happening, who was there, or how it felt.':'Try a different search.'));return;}
  res.append(h('div',{class:'resinfo'},items.length+(items.length===1?' result':' results')));
  const g=h('div',{class:'grid',style:'grid-template-columns:repeat(4,1fr)'});items.forEach(it=>g.append(tile(it,'results')));res.append(g,h('div',{class:'endpad',style:'height:40px'}));
}
/* follow-up refinement (Solution 3) */
function armFollowup(ms){ if(!T||T.mode!=='M')return; clearTimeout(fuTimer); fuTimer=setTimeout(showFollowupPill,ms); }
function showFollowupPill(){
  if(!$('#search')||fuShown)return; fuShown=true;
  const slot=$('#fuslot'); slot.innerHTML='';
  slot.append(h('button',{class:'fu-pill',onclick:openFollowup},svg(I.spark,18),'Follow up?'));
  log('followup_shown',{q:lastQuery,n:lastResults.length});
}
function hideFollowup(resetShown){const s=$('#fuslot');if(s)s.innerHTML='';const c=$('#fucard');if(c)c.innerHTML='';if(resetShown)fuShown=false;}
function openFollowup(){
  log('followup_open');
  const card=$('#fucard'); card.innerHTML='';
  let fu=null;
  if(aiState&&aiState.question&&aiState.options.length>=2)fu={question:aiState.question,options:aiState.options,kind:'ai'};
  else fu=localFollowup(lastResults);
  const input=h('input',{placeholder:'Or add a detail you remember',style:'height:44px;border:1px solid var(--outline);border-radius:22px;padding:0 16px;font-size:15px',enterkeyhint:'search'});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&input.value.trim()){log('followup_option',{kind:'typed',value:input.value.trim()});const q=lastQuery+' '+input.value.trim();setInput(q);runQuery(q,'followup');}});
  const row=h('div',{class:'row'});
  (fu?fu.options:[]).forEach(o=>row.append(h('button',{class:'chip',onclick:()=>pickFollowup(fu,o)},o)));
  card.append(h('div',{class:'fucard'},h('div',{class:'q'},h('small',{},'Not finding it?'),fu?fu.question:'What else do you remember?'),row,input,
    h('button',{class:'close',onclick:()=>{log('followup_dismiss');card.innerHTML='';}},'Close')));
}
function pickFollowup(fu,o){
  log('followup_option',{kind:fu.kind,value:o});
  if(fu.kind==='facet'){const f=fu.facet;const base=lastResults;lastResults=base.filter(it=>String(it[f])===o);hideFollowup(false);renderResults(lastResults);log('query',{q:lastQuery+' ['+f+'='+o+']',via:'followup',n:lastResults.length,engine:'facet',top:lastResults.slice(0,5).map(x=>x.id),hasTarget:T?lastResults.some(x=>x.id===T.target):undefined});armFollowup(9000);fuShown=false;return;}
  const extra=fu.kind==='query'?fu.map[o]:o; const q=lastQuery+' '+extra; setInput(q); runQuery(q,'followup');
}

/* ---------------- viewer ---------------- */
function openViewer(it,from){
  log('photo_open',{id:it.id,from,correct:T?it.id===T.target:undefined});
  clearTimeout(fuTimer);
  const v=h('div',{class:'layer viewer',id:'viewer'});
  const top=h('div',{class:'vtop'},h('button',{class:'iconbtn','aria-label':'Back',onclick:()=>{v.remove();log('photo_close',{id:it.id});if($('#search')&&T&&T.mode==='M')armFollowup(5000);else if(from==='grid')maybeGlow('opened_photo');}},svg(I.back)),
    h('div',{class:'vtitle'},fmtDay(it.date),h('small',{},it.place||'')),
    h('button',{class:'iconbtn','aria-label':'Share',onclick:inactive('share')},svg(I.share)));
  const img=h('div',{class:'vimg'},h('img',{src:IMG[it.id],alt:it.desc}));
  if(it.kind==='video')img.append(h('button',{class:'vplay','aria-label':'Play',onclick:inactive('play_video')},svg(I.play,36)));
  const confirm=h('div',{class:'confirm'},h('button',{class:'btn',onclick:()=>pick(it)},'This is the one'));
  const acts=h('div',{class:'vacts'},
    h('button',{onclick:inactive('share')},svg(I.share,22),'Share'),h('button',{onclick:inactive('edit')},svg(I.edit,22),'Edit'),
    h('button',{onclick:inactive('lens')},svg(I.lens,22),'Lens'),h('button',{onclick:inactive('delete')},svg(I.del,22),'Delete'));
  v.append(top,img,confirm,acts);
  $('.screen').append(v);
}
function pick(it){
  if(!T)return;
  if(it.id===T.target){toast('That’s the one',true);setTimeout(()=>endTask('found'),600);}
  else{T.wrongPicks++;log('wrong_pick',{id:it.id});toast('Not this one. Keep looking.');
    if(T.mode==='M'&&T.wrongPicks>=2&&$('#search')&&!fuShown){const v=$('#viewer');if(v)v.remove();showFollowupPill();}}
}

/* ---------------- dashboard ---------------- */
async function dashboard(){
  let sessions=[];
  try{const loc=JSON.parse(localStorage.getItem('mfs_sessions')||'{}');Object.values(loc).forEach(s=>{if(!sessions.some(x=>x.sid===s.sid))sessions.push(s);});}catch(e){}
  sessions.sort((a,b)=>(a.startedAt||'').localeCompare(b.startedAt||''));
  const tasks=sessions.flatMap(s=>(s.tasks||[]).map(t=>Object.assign({who:s.name},t)));
  const pct=(a,b)=>b?Math.round(100*a/b)+'%':'–';
  const med=a=>{if(!a.length)return'–';const s=[...a].sort((x,y)=>x-y);const m=s[Math.floor(s.length/2)];return Math.round(m/1000)+'s';};
  const stat=mode=>{const ts=tasks.filter(t=>t.mode===mode);const q=ts.flatMap(t=>t.events.filter(e=>e.type==='query'));
    return{n:ts.length,found:ts.filter(t=>t.result==='found').length,
      s1:pct(ts.filter(t=>t.summary.searched).length,ts.length),
      s2:pct(q.filter(e=>e.n>0).length,q.length),
      s3:pct(ts.filter(t=>t.summary.openedFromResults).length,ts.filter(t=>t.summary.queriesWithResults>0).length),
      success:pct(ts.filter(t=>t.result==='found').length,ts.length),
      viaSearch:pct(ts.filter(t=>t.summary.foundVia==='results').length,ts.filter(t=>t.result==='found').length),
      time:med(ts.filter(t=>t.result==='found').map(t=>t.timeMs)),
      nudge:pct(ts.filter(t=>t.summary.nudgeTapped).length,ts.filter(t=>t.summary.nudgeShown).length),
      fu:pct(ts.filter(t=>t.summary.followupUsed).length,ts.filter(t=>t.summary.followupShown).length),
      wrong:ts.reduce((a,t)=>a+(t.summary.wrongPicks||0),0)};};
  const C=stat('C'),M=stat('M');
  const kpi=(title,k,sub)=>h('div',{class:'kpi'},h('b',{},title),h('div',{class:'v'},h('span',{},C[k],h('small',{},'Version 1')),h('span',{},M[k],h('small',{},'Version 2'))),sub?h('div',{class:'note',style:'margin-top:6px'},sub):null);
  const rows=tasks.map(t=>h('tr',{},h('td',{},t.who),h('td',{},MODE_NAME[t.mode]),h('td',{},t.taskId+' · '+t.cue),
    h('td',{},h('span',{class:'pill '+(t.result==='found'?'yes':'no')},t.result.replace('_',' '))),h('td',{},Math.round(t.timeMs/1000)+'s'),
    h('td',{},t.summary.searched?'yes':'no'),h('td',{},t.events.filter(e=>e.type==='query').map(e=>`“${e.q}” (${e.n})`).join(', ')||'–'),
    h('td',{},t.mode==='M'?(t.summary.nudgeShown?(t.summary.nudgeTapped?'shown, tapped':'shown'):'not needed'):'–'),
    h('td',{},t.mode==='M'?(t.summary.followupShown?(t.summary.followupUsed?'shown, used':'shown'):'–'):'–'),h('td',{},String(t.summary.wrongPicks))));
  const ses=sessions.map(s=>h('tr',{},h('td',{},s.name),h('td',{},(s.startedAt||'').slice(0,16).replace('T',' ')),h('td',{},s.order==='CM'?'V1 then V2':'V2 then V1'),
    h('td',{},Object.entries(s.answers||{}).map(([k,v])=>k+': '+v).join(' · ')),
    h('td',{},['C','M'].map(m=>s.ratings&&s.ratings[m]?`${MODE_NAME[m]}: ease ${s.ratings[m].ease}, trust ${s.ratings[m].trust}${s.ratings[m].comment?' “'+s.ratings[m].comment+'”':''}`:'').filter(Boolean).join(' | ')||'–')));
  const d=h('div',{class:'dash'},
    h('div',{style:'display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap'},h('div',{},h('h1',{},'Study results'),h('div',{class:'note'},`Sessions run on this device: ${sessions.length} participants, ${tasks.length} tasks. All sessions are in the Google Sheet. Version 1 = keyword search, Version 2 = Memory-First Search.`)),
      h('div',{style:'display:flex;gap:8px'},h('button',{class:'btn tonal',onclick:async()=>{try{await navigator.clipboard.writeText(JSON.stringify(sessions,null,1));toast('Copied');}catch(e){}}},'Copy all data'),h('button',{class:'btn',onclick:()=>{location.hash='';}},'Back to study'))),
    h('div',{class:'kpis'},
      kpi('Session success','success','Photo confirmed as the target'),kpi('Median time to find','time'),
      kpi('S1 · Search attempted','s1','Tasks where search was opened'),kpi('S2 · Queries with results','s2','1 − zero result rate'),
      kpi('S3 · Opened a result','s3','Tasks with results where a result was opened'),kpi('Found through search','viaSearch','Share of finds that came from results, not scrolling'),
      kpi('Glow nudge tapped','nudge','Of tasks where it appeared'),kpi('Follow-up used','fu','Of tasks where it appeared'),kpi('Wrong picks','wrong','Total wrong photos confirmed')),
    h('h2',{style:'font-weight:400'},'Tasks'),h('div',{class:'tbl'},h('table',{},h('thead',{},h('tr',{},...['Participant','Version','Task','Result','Time','Searched','Queries (results)','Glow nudge','Follow-up','Wrong picks'].map(x=>h('th',{},x)))),h('tbody',{},rows))),
    h('h2',{style:'font-weight:400'},'Participants'),h('div',{class:'tbl'},h('table',{},h('thead',{},h('tr',{},...['Participant','Started','Order','Pre-survey','Ratings'].map(x=>h('th',{},x)))),h('tbody',{},ses))));
  document.body.append(d);
}
function route(){const d=$('.dash');if(d)d.remove();if(location.hash==='#dashboard')dashboard();}
window.addEventListener('hashchange',route);
welcome(); route();
})();
