/**
 * Calculate category logic
 */

/** Generate calculate question */
const gCalc = function(d){var c=document.getElementById('gCard');var pool=d<=2?['add','sub','mul','op1']:d<=3?['sub','mul','mix','op1']:['mul','mix','miss','op1','op2'];var t=pool[ri(0,pool.length-1)];
  if(t==='add'){var x=ri(10,50+d*20),y=ri(10,50+d*20);c.innerHTML='<div class="ins">Solve</div><div class="cd2">'+x+' + '+y+'</div>'+mkO(genO(x+y,4),x+y)}
  else if(t==='sub'){var x=ri(30,100+d*20),y=ri(10,x);c.innerHTML='<div class="ins">Solve</div><div class="cd2">'+x+' − '+y+'</div>'+mkO(genO(x-y,4),x-y)}
  else if(t==='mul'){var x=ri(3,9+d),y=ri(3,12+d);c.innerHTML='<div class="ins">Solve</div><div class="cd2">'+x+' × '+y+'</div>'+mkO(genO(x*y,4),x*y)}
  else if(t==='mix'){var x=ri(10,50),y=ri(2,9),z=ri(5,30);c.innerHTML='<div class="ins">Solve</div><div class="cd2">'+x+'+'+y+'×'+z+'</div>'+mkO(genO(x+y*z,4),x+y*z)}
  else if(t==='miss'){var x=ri(3,12),y=ri(3,12);c.innerHTML='<div class="ins">Solve</div><div class="cd2">?×'+y+'='+(x*y)+'</div>'+mkO(genO(x,4),x)}
  else if(t==='op1'){genOp1(d,c)}else{genOp2(d,c)}}

/** Generate op1 question */
const genOp1 = function(d,c){var ops=[{s:'+',f:function(a,b){return a+b}},{s:'−',f:function(a,b){return a-b}},{s:'×',f:function(a,b){return a*b}},{s:'/',f:function(a,b){return a/b}}];var ci2=ri(0,3);var co=ops[ci2];var a,b;
  if(ci2===0){a=ri(5,30+d*10);b=ri(5,30+d*10)}else if(ci2===1){a=ri(15,50+d*10);b=ri(3,a-2)}else if(ci2===2){a=ri(3,9+d);b=ri(3,9+d)}else{b=ri(2,9+d);var r=ri(2,9+d);a=b*r}
  c.innerHTML='<div class="ins">Which operation?</div><div class="cd2" style="font-size:clamp(1.4rem,4.5vw,2rem)">'+a+' <span style="color:var(--teal)">?</span> '+b+' = '+co.f(a,b)+'</div><div class="og">'+ops.map(function(op,i){return'<button class="ob ob-'+i+'" style="font-size:1.5rem" dv="'+op.s+'" onclick="chkS(this,\''+op.s+'\',\''+co.s+'\')">'+op.s+'</button>'}).join('')+'</div>'}

/** Generate op2 question */
const genOp2 = function(d,c){var ops=[{s:'+',f:function(a,b){return a+b}},{s:'−',f:function(a,b){return a-b}},{s:'×',f:function(a,b){return a*b}}];var i1=ri(0,2),i2=ri(0,2);var o1=ops[i1],o2=ops[i2];var a,b2,c2,res,sf=0;
  do{a=ri(3,20);b2=ri(2,12);c2=ri(2,10);if(i2===2)res=o1.f(a,b2*c2);else if(i1===2)res=o2.f(a*b2,c2);else res=o2.f(o1.f(a,b2),c2);sf++}while((res<=0||res>200||res!==Math.floor(res))&&sf<50);
  if(sf>=50){genOp1(d,c);return}var ak=o1.s+' '+o2.s;var ch=[ak];var ap=[];
  for(var i=0;i<3;i++)for(var j=0;j<3;j++){var p=ops[i].s+' '+ops[j].s;if(p!==ak)ap.push(p)}ap=shuf(ap);for(var i=0;ch.length<4;i++)ch.push(ap[i]);ch=shuf(ch);
  c.innerHTML='<div class="ins">Which two ops?</div><div class="cd2" style="font-size:clamp(1.2rem,4vw,1.7rem)">'+a+' <span style="color:var(--teal)">?</span> '+b2+' <span style="color:var(--teal)">?</span> '+c2+' = '+res+'</div><div class="og">'+ch.map(function(x,i){return'<button class="ob ob-'+i+'" style="font-size:1.1rem" dv="'+x+'" onclick="chkS(this,\''+x+'\',\''+ak+'\')">'+x+'</button>'}).join('')+'</div>'}
