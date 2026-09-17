/**
 * React category logic
 */

/** Generate react question */
const gReact = function(d){var c=document.getElementById('gCard');
  var cols=[{n:'Red',c:'#ff4444',p:'●'},{n:'Blue',c:'#4488ff',p:'■'},{n:'Green',c:'#44cc44',p:'▲'},{n:'Yellow',c:'#ffcc00',p:'★'},{n:'Purple',c:'#bb44ff',p:'◆'},{n:'Orange',c:'#ff8833',p:'✦'},{n:'Pink',c:'#ff66aa',p:'♥'}];
  // Pick 4 unique colors for choices
  var four=shuf(cols).slice(0,4);
  // Assign roles: ink (answer), word text, bg color — all from the 4 choices
  var inkObj=four[0];// the actual ink color = correct answer
  var wordObj=S.qn>=2?four[1]:four[0];// word text (mismatch from Q2)
  var bgObj=S.qn>=3?four[2]:null;// bg color from Q3
  var ans=inkObj.n;var bgCol=bgObj?bgObj.c+'55':'transparent';
  var on=shuf(four.map(function(x){return x.n}));
  // Choices get random ink colors and bg colors from the pool
  var oh='<div class="og">';
  on.forEach(function(name,i){
    var cObj=cols.filter(function(x){return x.n===name})[0];
    // Each choice button: text in one random color, bg in another
    var btnInk=four[(i+1)%4].c;var btnBg=four[(i+2)%4].c+'22';
    oh+='<button class="ob" style="font-size:clamp(1.5rem,4.5vw,2rem);font-weight:700;color:'+btnInk+';background:'+btnBg+';border-color:'+btnInk+'44" dv="'+name+'" onclick="chkS(this,\''+name+'\',\''+ans+'\')">'+name+'</button>'});
  oh+='</div>';
  c.innerHTML='<div class="ins" style="font-size:clamp(.95rem,3vw,1.2rem)">What COLOR is the ink?</div><div class="cw" style="color:'+inkObj.c+';background:'+bgCol+'">'+wordObj.n+'</div>'+oh}
