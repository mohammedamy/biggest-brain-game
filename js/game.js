/**
 * Core game loop and logic
 */

/** Return home */
const goHome = function(){
  // #11 confirm leave if in middle of category
  if(S.ap&&S.qn>0&&S.m!=='practice'){if(!confirm('Leave this category? Your progress will be lost.'))return}
  clearInterval(S.ti);S.ap=false;streak=0;updR();show('homeScreen');if(musicOk)startHomeMusic()}

/** Update rank display */
const updR = function(){var r=gR(S.best);document.getElementById('hRI').textContent=r.i;document.getElementById('hRN').textContent=r.n;document.getElementById('hRS').textContent=S.best>0?'Best: '+S.best:'Play to get ranked!'}

/** Ask name */
const askName = function(){compSeed=null;seedRand=null;show('nameScreen');var inp=document.getElementById('nameInput');inp.value=S.name||'';setTimeout(function(){inp.focus()},150);inp.onkeydown=function(e){if(e.key==='Enter')confirmName()}}

/** Ask competition code */
const askCompCode = function(){var code=prompt('Enter Competition Code\n(all players must use the same code):','EIS2026');if(!code)return;compSeed=hashCode(code.trim().toUpperCase());askName()}

/** Confirm name */
const confirmName = function(){var n=document.getElementById('nameInput').value.trim();if(!n){document.getElementById('nameInput').style.borderColor='#ff5050';return}S.name=n;var g=document.getElementById('groupInput');S.group=g?g.value.trim():'';if(compSeed)seedRand=makeSeededRng(compSeed);initMusic();startFull()}

/** Start full mode */
const startFull = function(){S.m=compSeed?'comp':'full';S.ci=0;S.cs={};streak=0;S.wrongs=[];S.catStats={};startC(0)}

/** Show practice menu */
const showPractice = function(){compSeed=null;seedRand=null;var l=document.getElementById('catList');l.innerHTML='';
  // #13 Sample difficulty previews per category
  var samples={
    calculate:'e.g. 14 + 27 • 8 × 9 • 72 / 8',
    memorize:'Remember 3-7 digits in sequence',
    analyze:'e.g. 2, 5, 8, 11, ? (pattern)',
    visualize:'Count 3D cubes including hidden',
    weigh:'Find heaviest via balance scales',
    countup:'Tap 3-8 numbers in ascending order',
    react:'Say ink color — not the word'
  };
  CATS.forEach(function(c,i){var b=S.cb[c.id]||0;
    l.innerHTML+='<button class="btn bcat" onclick="startPr('+i+')"><div class="ci">'+c.icon+'</div><div style="flex:1"><div class="cn">'+c.name+'</div><div class="cd">'+c.desc+'</div><div style="font-size:.6rem;opacity:.55;margin-top:2px;font-style:italic">'+(samples[c.id]||'')+'</div>'+(b?'<div class="cb">Best:'+b+'</div>':'')+'</div></button>'});
  show('practiceScreen')}

/** Start practice category */
const startPr = function(i){S.m='practice';S.ci=i;S.cs={};S.name=S.name||'Practice';streak=0;S.wrongs=[];S.catStats={};initMusic();startC(i)}

/** Start category */
const startC = function(i){showCD(i,function(){beginC(i)})}

/** Begin category play */
const beginC = function(i){S.qn=0;S.sc=0;S.st=Date.now();S.correct=0;S.wrong=0;S.catStartTime=Date.now();
  // #15 progress indicator: show "Cat X of 7" for full mode
  var catLabel=CATS[i].icon+' '+CATS[i].name;
  if(S.m==='full'||S.m==='comp')catLabel+=' <span style="opacity:.5;font-size:.75rem">('+(i+1)+'/'+CATS.length+')</span>';
  document.getElementById('ghC').innerHTML=catLabel;show('gameScreen');startGameMusic(CATS[i].id);nxt()}

/** Show countdown */
const showCD = function(ci,cb){var cat=CATS[ci];var ov=document.createElement('div');ov.className='countdown-overlay';
  ov.innerHTML='<div class="countdown-cat-icon">'+cat.icon+'</div><div class="countdown-cat">'+cat.name+'</div><div class="countdown-num cd-3">3</div>';
  document.body.appendChild(ov);var n=ov.querySelector('.countdown-num');
  startCdMusic();playCd(3);
  setTimeout(function(){n.className='countdown-num cd-2';n.textContent='2';n.style.animation='none';n.offsetHeight;n.style.animation='cdP .4s ease';playCd(2)},1000);
  setTimeout(function(){n.className='countdown-num cd-1';n.textContent='1';n.style.animation='none';n.offsetHeight;n.style.animation='cdP .4s ease';playCd(1)},2000);
  setTimeout(function(){n.className='countdown-go';n.textContent='GO!';n.style.animation='none';n.offsetHeight;n.style.animation='cdP .3s ease';playGo()},3000);
  setTimeout(function(){ov.remove();cb()},3350)}

/** Start timer */
const stTm = function(){clearInterval(S.ti);S.tm=CAT_TIME;uTm();S.ti=setInterval(function(){if(pausedForHidden)return;S.tm--;uTm();document.getElementById('pF').style.width=(S.tm/CAT_TIME*100)+'%';if(S.tm<=0){clearInterval(S.ti);S.ap=false;setTimeout(endC,400)}},1000)}

/** Update timer */
const uTm = function(){var e=document.getElementById('ghT');e.textContent=S.tm;e.className='gt'+(S.tm<=5?' warn':'');updateTimerRing()}

/** Next question */
const nxt = function(){S.ap=true;S.qn++;S.st=Date.now();document.getElementById('ghR').textContent='Q:'+S.qn+'|'+S.sc;
  var d=Math.min(Math.ceil(S.qn/2),5);var c=CATS[S.ci];if(S.qn===1)stTm();
  switch(c.id){case'calculate':gCalc(d);break;case'memorize':gMem(d);break;case'analyze':gAna(d);break;case'visualize':gVis(d);break;case'weigh':gWeigh(d);break;case'countup':gCU(d);break;case'react':gReact(d);break}
  // #6 Speak instruction + main question content for categories where it helps
  setTimeout(function(){
    if(!ttsOn)return;
    var ins=document.querySelector('#gCard .ins');
    var cd=document.querySelector('#gCard .cd2');
    var txt='';if(ins)txt+=ins.textContent.trim()+'. ';
    if(cd&&['calculate','analyze'].indexOf(c.id)>=0)txt+=cd.textContent.trim();
    if(txt&&txt!==lastSpokenText){lastSpokenText=txt;speak(txt)}
  },150)}

/** Award points */
const aw = function(b){var el=(Date.now()-S.st)/1000;var m=el<2?3:el<4?2:el<7?1.5:1;var p=Math.round(b*m);S.sc+=p;document.getElementById('ghR').textContent='Q:'+S.qn+'|'+S.sc;return p}

/** End category */
const endC = function(){clearInterval(S.ti);var c=CATS[S.ci];S.cs[c.id]=S.sc;
  // Save per-category stats for tie-breaking and analysis (#2, #3, #16)
  var avgRx=S.rxTimes.length?(S.rxTimes.reduce(function(a,b){return a+b},0)/S.rxTimes.length):0;
  S.catStats[c.id]={correct:S.correct,wrong:S.wrong,questions:S.qn,maxStreak:S.maxStreak,avgRx:avgRx,totalTime:(Date.now()-S.catStartTime)/1000};
  S.rxTimes=[];S.maxStreak=0;
  if(!S.cb[c.id]||S.sc>S.cb[c.id]){S.cb[c.id]=S.sc;localStorage.setItem('e8c',JSON.stringify(S.cb))}
  var acc=S.qn>0?Math.round((S.correct/S.qn)*100):0;
  document.getElementById('catResCard').innerHTML='<div style="font-size:1.8rem">'+c.icon+'</div><div style="font-family:Fredoka;font-size:1rem;font-weight:600;margin:2px 0">'+c.name+' — Time Up!</div><div class="sr2">'+(['💫','⭐','⭐⭐','⭐⭐⭐'])[Math.min(3,Math.floor(S.sc/40))]+'</div><div class="sb">'+S.sc+'</div><div class="sl">pts</div><div class="sbd"><div class="srow"><span class="srl">Answered</span><span class="srv">'+S.qn+'</span></div><div class="srow"><span class="srl">✅ Correct</span><span class="srv" style="color:var(--green)">'+S.correct+'</span></div><div class="srow"><span class="srl">❌ Wrong</span><span class="srv" style="color:#ff6b6b">'+S.wrong+'</span></div><div class="srow"><span class="srl">Accuracy</span><span class="srv">'+acc+'%</span></div><div class="srow"><span class="srl">Best Streak</span><span class="srv">🔥 '+S.catStats[c.id].maxStreak+'</span></div><div class="srow"><span class="srl">Avg Time</span><span class="srv">'+avgRx.toFixed(1)+'s</span></div><div class="srow"><span class="srl">Best Score</span><span class="srv">'+S.cb[c.id]+'</span></div></div>';
  var nb=document.getElementById('catResNext');if((S.m==='full'||S.m==='comp')&&S.ci<CATS.length-1){nb.textContent='Next →';nb.onclick=function(){S.ci++;startC(S.ci)}}else if(S.m==='full'||S.m==='comp'){nb.textContent='Results 🏆';nb.onclick=showF}else{nb.textContent='🏠';nb.onclick=goHome}show('catResScreen')}

/** Show final results */
const showF = function(){var tot=0;for(var k in S.cs)tot+=S.cs[k];if(tot>S.best){S.best=tot;localStorage.setItem('e8b',tot)}
  // Build summary stats
  var totCorrect=0,totWrong=0,totQs=0,maxS=0;
  for(var k in S.catStats){totCorrect+=S.catStats[k].correct||0;totWrong+=S.catStats[k].wrong||0;totQs+=S.catStats[k].questions||0;if(S.catStats[k].maxStreak>maxS)maxS=S.catStats[k].maxStreak}
  var totAcc=totQs>0?Math.round((totCorrect/totQs)*100):0;
  var avgTimeAll=0,rxCount=0;for(var k in S.catStats){if(S.catStats[k].avgRx){avgTimeAll+=S.catStats[k].avgRx;rxCount++}}
  avgTimeAll=rxCount?avgTimeAll/rxCount:0;
  S.all.push({name:S.name,total:tot,cats:JSON.parse(JSON.stringify(S.cs)),stats:JSON.parse(JSON.stringify(S.catStats)),correct:totCorrect,wrong:totWrong,questions:totQs,accuracy:totAcc,maxStreak:maxS,avgTime:avgTimeAll,mode:S.m,group:S.group||'',date:new Date().toISOString().slice(0,16)});
  saveScores();
  try{window.storage&&window.storage.set('sc8',JSON.stringify(S.all))}catch(e){}
  var rk=gR(tot);var ch='';CATS.forEach(function(c){var s=S.cs[c.id]||0;ch+='<div class="csr"><div class="ci3">'+c.icon+'</div><div class="cn3">'+c.name+'</div><div class="cb3"><div class="cbf" style="width:'+Math.min(s/60*100,100)+'%"></div></div><div class="cs3">'+s+'</div></div>'});
  var reviewBtn=S.wrongs.length>0?'<button class="btn bs" style="margin-top:6px" onclick="showReview()">📖 Review '+S.wrongs.length+' Wrong Answers</button>':'';
  document.getElementById('finalCard').innerHTML='<div style="font-size:.65rem;text-transform:uppercase;letter-spacing:1px;opacity:.4">'+S.name+'</div><div class="fri">'+rk.i+'</div><div class="frn">'+rk.n+'</div><div class="frt">'+tot+' pts</div><div style="font-size:.8rem;opacity:.7;margin:4px 0">'+totCorrect+'/'+totQs+' correct ('+totAcc+'%) • 🔥 '+maxS+' streak • ⏱ '+avgTimeAll.toFixed(1)+'s avg</div><div class="cscs">'+ch+'</div>'+reviewBtn;updR();show('finalScreen')}

/** Show review */
const showReview = function(){var h='<div style="font-family:Fredoka;font-size:1rem;font-weight:600;margin:4px 0;color:var(--yellow)">📖 Review Wrong Answers</div>';
  S.wrongs.forEach(function(w,i){var cat=CATS.filter(function(c){return c.id===w.cat})[0];
    h+='<div style="background:rgba(255,255,255,.05);border-radius:8px;padding:6px 10px;margin:4px 0;font-size:.8rem"><div style="opacity:.6;font-size:.7rem">'+(cat?cat.icon+' '+cat.name:w.cat)+'</div><div style="margin:3px 0">'+w.q+'</div><div style="color:#ff6b6b">You: '+w.picked+'</div><div style="color:var(--green)">Correct: '+w.correct+'</div></div>'});
  h+='<button class="btn bs" style="margin-top:6px" onclick="show(\'finalScreen\')">← Back</button>';
  document.getElementById('lbContent').innerHTML=h;show('lbScreen')}

/** Track non-MCQ answer */
const trackAnswer = function(correct){
  S.rxTimes.push((Date.now()-S.st)/1000);
  if(correct){S.correct++;streak++;if(streak>S.maxStreak)S.maxStreak=streak;
    var bonus=0;if(streak===3)bonus=5;else if(streak===5)bonus=15;else if(streak===10)bonus=30;else if(streak>10&&streak%5===0)bonus=20;
    if(bonus>0){S.sc+=bonus;setTimeout(function(){showFly('🔥+'+bonus+' STREAK!',true)},300)}}
  else{S.wrong++;streak=0}
  flashCard(correct);
}

/** Track answer */
const handleAnswer = function(correct,btn,cor,questionText){
  // #3/#14 tracking
  var rxTime=(Date.now()-S.st)/1000;
  S.rxTimes.push(rxTime);
  if(correct){
    S.correct++;
    streak++;
    if(streak>S.maxStreak)S.maxStreak=streak;
    var base=20;var p=aw(base);
    // Streak bonuses: 3 = +5, 5 = +15, 10 = +30
    var bonus=0;
    if(streak===3)bonus=5;else if(streak===5)bonus=15;else if(streak===10)bonus=30;
    else if(streak>10&&streak%5===0)bonus=20;
    if(bonus>0){S.sc+=bonus;setTimeout(function(){showFly('🔥+'+bonus+' STREAK!',true)},300)}
    showFly('+'+p,true);showRx(true);playOk();
  } else {
    S.wrong++;streak=0;
    // Capture wrong answer for review (max 10 stored)
    if(S.wrongs.length<10&&questionText){
      S.wrongs.push({cat:CATS[S.ci].id,q:questionText,correct:String(cor),picked:btn?btn.textContent:'timeout'})}
    showFly('✗',false);showRx(false);playNo();
  }
}

/** Check answer */
const chk = function(btn,sel,cor){if(!S.ap)return;
  // #25 double-tap prevention
  var now=Date.now();if(now-lastClickTime<250)return;lastClickTime=now;
  S.ap=false;var bs=btn.parentNode.querySelectorAll('.ob');
  var correct=(sel===cor);
  if(correct){btn.classList.add('correct')}
  else{btn.classList.add('wrong');bs.forEach(function(b){if(parseInt(b.textContent)===cor)b.classList.add('correct')})}
  var qText=btn.parentNode.parentNode.querySelector('.cd2');qText=qText?qText.textContent:'';
  handleAnswer(correct,btn,cor,qText);
  flashCard(correct);
  bs.forEach(function(b){b.classList.add('disabled')});setTimeout(nxt,500)}

/** Check string answer */
const chkS = function(btn,sel,cor){if(!S.ap)return;
  // #25 double-tap prevention
  var now=Date.now();if(now-lastClickTime<250)return;lastClickTime=now;
  S.ap=false;var bs=btn.parentNode.querySelectorAll('.ob');
  var correct=(sel===cor);
  if(correct){btn.classList.add('correct')}
  else{btn.classList.add('wrong');bs.forEach(function(b){if(b.getAttribute('dv')===cor)b.classList.add('correct')})}
  var qText=btn.parentNode.parentNode.querySelector('.cd2');qText=qText?qText.textContent:'';
  handleAnswer(correct,btn,cor,qText);
  flashCard(correct);
  bs.forEach(function(b){b.classList.add('disabled')});setTimeout(nxt,500)}

// ===== KEYBOARD =====
document.addEventListener('keydown',function(e){
  if(memKB&&S.ap){if(e.key>='0'&&e.key<='9'){e.preventDefault();nT(parseInt(e.key));return}if(e.key==='Backspace'){e.preventDefault();nD();return}}
  if(legoKB&&S.ap){if(e.key>='0'&&e.key<='9'){e.preventDefault();lT(parseInt(e.key));return}if(e.key==='Backspace'){e.preventDefault();lDl();return}if(e.key==='Enter'){e.preventDefault();lSb();return}}});

// #10/#24 Tab visibility: pause timer and music when tab hidden
document.addEventListener('visibilitychange',function(){
  if(document.hidden){
    pausedForHidden=true;
    if(musicOk){try{Tone.Transport.pause()}catch(e){}}
  } else {
    pausedForHidden=false;
    if(musicOk&&sndOn){try{Tone.Transport.start()}catch(e){}}
  }
});

// INIT
(async function(){try{var r=await window.storage.get('sc8');if(r&&r.value){var d=JSON.parse(r.value);if(d.length>S.all.length)S.all=d}}catch(e){}})();
updR();
applyPrefs(); // Apply saved preferences (big text, cb mode, tts) on page load

// #27 Service Worker for offline support
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').catch(function(){});
}
