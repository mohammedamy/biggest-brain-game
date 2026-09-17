/**
 * Count up category logic
 */

let cuNums = [];
let cuNext = 0;

/** Generate countup question */
const gCU = function(d){var c=document.getElementById('gCard');var count=3+Math.min(S.qn-1,5);
  var minV,maxV;
  if(S.qn<=2){minV=1;maxV=9}
  else if(S.qn<=4){minV=10;maxV=99}
  else{minV=100;maxV=999}
  cuNums=[];var used={};
  for(var i=0;i<count;i++){var n;do{n=ri(minV,maxV)}while(used[n]);used[n]=true;cuNums.push(n)}
  cuNums.sort(function(a,b){return a-b});cuNext=0;
  c.innerHTML='<div class="ins">Tap ascending (smallest first)</div><div class="cu-arena" id="cuA"></div>';
  var ar=document.getElementById('cuA');var aw2=ar.offsetWidth||280,ah=ar.offsetHeight||220;
  // #8 Responsive sizing: shrink circles if arena is narrow (< 320px)
  var sizeMin=80,sizeMax=110;
  if(aw2<320){sizeMin=Math.max(48,Math.floor(aw2*0.18));sizeMax=Math.max(62,Math.floor(aw2*0.24))}
  else if(aw2<380){sizeMin=64;sizeMax=92}
  var sf=shuf(cuNums.map(function(n,i){return{n:n,i:i}}));
  // 50% transparent, vivid base colors
  var cCols=['rgba(255,77,106,.5)','rgba(255,217,61,.5)','rgba(107,203,119,.5)','rgba(77,150,255,.5)','rgba(255,136,75,.5)','rgba(199,128,250,.5)','rgba(255,107,138,.5)','rgba(42,191,191,.5)'];
  var placed=[];var PAD=aw2<320?8:16;
  sf.forEach(function(item,idx){
    var sz=ri(sizeMin,sizeMax);var rad=sz/2;var px,py,ok,tries=0;
    // Account for dance animation range (~18px now) in padding
    var effPad=PAD+(aw2<320?10:20);
    do{px=ri(rad+10,aw2-sz-10);py=ri(rad+10,ah-sz-10);ok=true;
      for(var j=0;j<placed.length;j++){var dx=(px+rad)-(placed[j].x+placed[j].r);var dy=(py+rad)-(placed[j].y+placed[j].r);if(Math.sqrt(dx*dx+dy*dy)<rad+placed[j].r+effPad){ok=false;break}}tries++}while(!ok&&tries<300);
    if(!ok){sz=Math.max(50,sz-22);rad=sz/2;
      for(var t=0;t<120;t++){px=ri(rad+6,aw2-sz-6);py=ri(rad+6,ah-sz-6);ok=true;
        for(var j=0;j<placed.length;j++){var dx2=(px+rad)-(placed[j].x+placed[j].r);var dy2=(py+rad)-(placed[j].y+placed[j].r);if(Math.sqrt(dx2*dx2+dy2*dy2)<rad+placed[j].r+PAD){ok=false;break}}if(ok)break}}
    placed.push({x:px,y:py,r:rad});var col=cCols[item.i%cCols.length];
    // Textured fill patterns for circles
    var fillTextures=[
      'repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,255,255,.15) 3px,rgba(255,255,255,.15) 5px)',
      'radial-gradient(circle at 30% 30%,rgba(255,255,255,.3) 0%,transparent 50%)',
      'repeating-conic-gradient(from 0deg,transparent 0deg,rgba(255,255,255,.12) 15deg,transparent 30deg)',
      'linear-gradient(135deg,rgba(255,255,255,.2) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.2) 75%,transparent 75%)',
      'radial-gradient(circle at 70% 70%,rgba(0,0,0,.15) 0%,transparent 40%),radial-gradient(circle at 25% 25%,rgba(255,255,255,.25) 0%,transparent 35%)',
      'repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(255,255,255,.1) 4px,rgba(255,255,255,.1) 6px),repeating-linear-gradient(90deg,transparent,transparent 4px,rgba(255,255,255,.1) 4px,rgba(255,255,255,.1) 6px)',
      'conic-gradient(from 0deg at 50% 50%,rgba(255,255,255,.15) 0deg,transparent 60deg,rgba(255,255,255,.1) 120deg,transparent 180deg,rgba(255,255,255,.15) 240deg,transparent 300deg)',
      'radial-gradient(ellipse at 50% 50%,rgba(255,255,255,.2) 0%,transparent 60%)'
    ];
    var tex=fillTextures[item.i%fillTextures.length];
    var dur=(ri(30,60)/10)+'s';var del=(ri(0,20)/10)+'s';
    var rotDur=ri(4,12)+'s';var rotDir=Math.random()>.5?'normal':'reverse';
    var el=document.createElement('div');el.className='cu-circle';el.id='cu'+item.i;el.onclick=function(){cuTap(item.i)};
    el.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+px+'px;top:'+py+'px;background:'+col+','+tex+';font-size:clamp(1.6rem,5vw,2.2rem);color:#fff;text-decoration:underline;text-underline-offset:3px;animation:cuDance '+dur+' ease-in-out '+del+' infinite alternate, cuSpin '+rotDur+' linear 0s infinite '+rotDir;
    el.textContent=item.n;ar.appendChild(el)});
  if(!document.getElementById('cuSt')){var st=document.createElement('style');st.id='cuSt';
    st.textContent='@keyframes cuDance{0%{transform:translate(0,0)}25%{transform:translate(14px,-18px)}50%{transform:translate(-12px,14px)}75%{transform:translate(18px,10px)}100%{transform:translate(-10px,-15px)}}@keyframes cuSpin{from{rotate:0deg}to{rotate:360deg}}';
    document.head.appendChild(st)}}

/** Handle countup tap */
const cuTap = function(idx){if(!S.ap)return;
  if(idx===cuNext){var el=document.getElementById('cu'+idx);el.classList.add('cu-done');cuNext++;playOk();
    if(cuNext>=cuNums.length){S.ap=false;var p=aw(25);showFly('+'+p,true);showRx(true);setTimeout(nxt,400)}}
  else{var el=document.getElementById('cu'+idx);el.classList.add('cu-wrong');setTimeout(function(){el.classList.remove('cu-wrong')},350);playNo()}}
