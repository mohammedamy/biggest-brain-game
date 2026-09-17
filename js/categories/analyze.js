/**
 * Analyze category logic
 */

let anaSeen = {};

/** Generate analyze question */
const gAna = function(d){var c=document.getElementById('gCard');var ans,ss;var tries=0;
  if(S.qn===1)anaSeen={}; // reset at start of category
  do{var pt=ri(1,Math.min(d,4));
    if(pt===1){var st=ri(2,20),sp=ri(2,5+d);var sq=[];var v=st;for(var i=0;i<4;i++){sq.push(v);v+=sp}ans=v;ss=sq.join(', ')+', ?'}
    else if(pt===2){var st=ri(2,4),ml=ri(2,3);var sq=[];var v=st;for(var i=0;i<4;i++){sq.push(v);v*=ml}ans=v;ss=sq.join(', ')+', ?'}
    else if(pt===3){var st=ri(1,10),b2=ri(1,3);var sq=[st];var v=st;for(var i=0;i<4;i++){v+=b2+i;sq.push(v)}ans=v+b2+4;ss=sq.join(', ')+', ?'}
    else{var o2=ri(0,5);var sq=[];for(var i=1;i<=5;i++)sq.push(i*i+o2);ans=36+o2;ss=sq.join(', ')+', ?'}
    tries++}while(anaSeen[ss]&&tries<30);
  anaSeen[ss]=true;
  c.innerHTML='<div class="ins">What next?</div><div class="cd2" style="font-size:clamp(1.2rem,3.8vw,1.7rem)">'+ss+'</div>'+mkO(genO(ans,4),ans)}
