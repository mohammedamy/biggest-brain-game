/**
 * Weigh category logic
 */

/** Generate weigh question */
const gWeigh = function(d){var c=document.getElementById('gCard');var p=shuf(OBJ).slice(0,d<=1?3:d<=3?4:5);var hv,clues;
  if(d<=1){var A=ri(35,55),B=ri(18,A-6),C=ri(5,B-4);p[0].w=A;p[1].w=B;p[2].w=C;hv=p[0];clues=[mk1(p[0],p[1]),mk1(p[1],p[2])]}
  else if(d===2){var A=ri(42,60),C2=ri(25,A-6),B2=ri(12,C2-4),D2=ri(5,B2-2);p[0].w=A;p[1].w=B2;p[2].w=C2;p[3].w=D2;hv=p[0];clues=[mk1(p[0],p[2]),mk1(p[2],p[1]),mk1(p[2],p[3])]}
  else if(d===3){var A=ri(45,65),D3=ri(28,A-8),B3=ri(15,D3-5),C3=ri(8,B3-2);while(C3+A<=D3+B3)A+=ri(2,5);p[0].w=A;p[1].w=B3;p[2].w=C3;p[3].w=D3;hv=p[0];clues=[mk1(p[3],p[1]),mk1(p[3],p[2]),mkG([p[2],p[0]],[p[3],p[1]])]}
  else if(d===4){var A=ri(52,72),B4=ri(34,A-10),C4=ri(24,B4-4),D4=ri(15,C4-4),E4=ri(5,D4-4);while(A+E4<=B4+D4)A+=ri(2,5);p[0].w=A;p[1].w=B4;p[2].w=C4;p[3].w=D4;p[4].w=E4;hv=p[0];clues=[mk1(p[1],p[2]),mk1(p[2],p[3]),mk1(p[3],p[4]),mkG([p[0],p[4]],[p[1],p[3]])]}
  else{var A=ri(58,80),B5=ri(36,A-14),C5=ri(25,B5-4),D5=ri(17,C5-3),E5=ri(6,D5-4);while(C5+D5<=B5)C5+=ri(1,3);while(A+E5<=B5+C5)A+=ri(2,5);p[0].w=A;p[1].w=B5;p[2].w=C5;p[3].w=D5;p[4].w=E5;hv=p[0];clues=[mkG([p[2],p[3]],[p[1]]),mk1(p[1],p[2]),mk1(p[3],p[4]),mkG([p[0],p[4]],[p[1],p[2]])]}
  clues=shuf(clues.map(function(cl){return Math.random()>.5?flipCl(cl):cl}));
  var bh='<div style="font-family:Fredoka,sans-serif;font-weight:700;font-size:clamp(1.4rem,4.3vw,1.8rem);color:var(--yellow);text-align:center;margin-bottom:50px;text-shadow:0 2px 8px rgba(240,215,43,.3)">⚖️ Which is the heaviest?</div><div class="bwrap">';
  clues.forEach(function(cl,idx){bh+='<div class="bitem" id="bi'+idx+'"><div class="bbeam"><div class="bside bl"><div class="btray">'+cl.l.map(function(o){return o.e}).join(' ')+'</div><div class="brope"></div></div><div class="bbar"></div><div class="bful"></div><div class="bside br"><div class="btray">'+cl.r.map(function(o){return o.e}).join(' ')+'</div><div class="brope"></div></div></div></div>'});
  bh+='</div>';var op=shuf(p);var cls2=op.length>4?'og3':'';var oh='<div class="og '+cls2+'">';
  op.forEach(function(o,i){oh+='<button class="ob ob-'+i+'" style="font-size:1.8rem" dv="'+o.e+'" onclick="chkS(this,\''+o.e+'\',\''+hv.e+'\')">'+o.e+'</button>'});oh+='</div>';
  c.innerHTML=bh+oh;setTimeout(function(){clues.forEach(function(cl,idx){var tc=cl.rs==='left'?'tl':cl.rs==='right'?'tr':'te';var el=document.getElementById('bi'+idx);if(el)el.classList.add(tc)})},250)}

/** Make single item clue */
const mk1 = function(a,b){return{l:[a],r:[b],rs:a.w>b.w?'left':a.w<b.w?'right':'equal'}}

/** Make grouped item clue */
const mkG = function(la,ra){var lw=0,rw=0;la.forEach(function(o){lw+=o.w});ra.forEach(function(o){rw+=o.w});return{l:la,r:ra,rs:lw>rw?'left':lw<rw?'right':'equal'}}

/** Flip clue sides */
const flipCl = function(cl){return{l:cl.r,r:cl.l,rs:cl.rs==='left'?'right':cl.rs==='right'?'left':'equal'}}
