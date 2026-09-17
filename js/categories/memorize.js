/**
 * Memorize category logic
 */

let memS = [];
let memI = 0;
let memKB = false;
let memTimer = null;
let memLen = 0;

/** Generate memorize question */
const gMem = function(d){var c=document.getElementById('gCard');var len=3+Math.min(d,4);memS=[];memI=0;memKB=false;memLen=len;
  for(var i=0;i<len;i++)memS.push(ri(1,9));
  c.innerHTML='<div class="ins">Memorize!</div><div class="cd2">'+memS.join('  ')+'</div><div style="font-size:12px;opacity:.35;margin-top:8px;text-align:center">Tap screen when ready</div>';
  // #7 Improved timing: 800ms per digit + 1200ms base (allows short sequences to be faster)
  var displayTime=1200+len*800;
  memTimer=setTimeout(function(){if(!S.ap)return;memTimer=null;showMI(len)},displayTime);
  // Tap/click anywhere on card to skip to input immediately
  c.onclick=function(){if(memTimer){clearTimeout(memTimer);memTimer=null;c.onclick=null;showMI(memLen)}}}

/** Show memorize input */
const showMI = function(len){var c=document.getElementById('gCard');c.onclick=null;memI=0;memKB=true;
  var bx='';for(var i=0;i<len;i++)bx+='<div id="mb'+i+'" style="width:38px;height:42px;border-radius:7px;border:2px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);display:inline-flex;align-items:center;justify-content:center;font-family:Fredoka;font-size:1.2rem;font-weight:700"></div>';
  c.innerHTML='<div class="ins">Enter sequence</div><div class="pi2">'+bx+'</div><div class="numpad"><div class="nk" onclick="nT(1)">1</div><div class="nk" onclick="nT(2)">2</div><div class="nk" onclick="nT(3)">3</div><div class="nk" onclick="nT(4)">4</div><div class="nk" onclick="nT(5)">5</div><div class="nk" onclick="nT(6)">6</div><div class="nk" onclick="nT(7)">7</div><div class="nk" onclick="nT(8)">8</div><div class="nk" onclick="nT(9)">9</div><div class="nk nk-del" onclick="nD()">⌫</div><div class="nk" onclick="nT(0)">0</div><div class="nk nk-del" onclick="nD()">⌫</div></div>';hlM()}

/** Numpad tap */
const nT = function(n){if(!S.ap||memI>=memS.length)return;var b=document.getElementById('mb'+memI);b.textContent=n;b.setAttribute('dv',n);memI++;hlM();if(memI>=memS.length)subM()}

/** Numpad delete */
const nD = function(){if(!S.ap||memI<=0)return;memI--;var b=document.getElementById('mb'+memI);b.textContent='';b.removeAttribute('dv');hlM()}

/** Highlight memory input */
const hlM = function(){for(var i=0;i<memS.length;i++){var b=document.getElementById('mb'+i);if(b)b.style.borderColor=i===memI?'var(--teal)':'rgba(255,255,255,.18)'}}

/** Submit memory */
const subM = function(){if(!S.ap)return;S.ap=false;memKB=false;var m=0;
  for(var i=0;i<memS.length;i++){var b=document.getElementById('mb'+i);if(parseInt(b.getAttribute('dv'))===memS[i]){b.style.borderColor='var(--green)';b.style.background='rgba(91,200,160,.2)';m++}else{b.style.borderColor='#ff5050';b.style.background='rgba(255,80,80,.12)'}}
  var allOk=(m===memS.length);
  trackAnswer(allOk);
  if(allOk){var p=aw(25);showFly('+'+p,true);showRx(true);playOk()}
  else{S.sc+=Math.floor(8*m/memS.length);
    if(S.wrongs.length<10)S.wrongs.push({cat:'memorize',q:memS.join(' '),correct:memS.join(' '),picked:m+'/'+memS.length+' digits'});
    showFly('✗',false);showRx(false);playNo()}
  setTimeout(nxt,650)}
