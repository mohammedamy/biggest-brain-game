/**
 * Visualize category logic
 */

let legoAns = 0;
let legoIn = '';
let legoKB = false;

/** Generate visualize question */
const gVis = function(d){var c=document.getElementById('gCard');legoIn='';legoKB=true;
  var useTwoPiles=S.qn>=5;
  // Build one or two piles, max 28 total cubes
  function makePile(gW,gD,mH){
    var grid=[];var tot=0;
    for(var r=0;r<gD;r++){grid[r]=[];for(var cc=0;cc<gW;cc++){
      // Strictly: back rows (r=0) tallest, front rows shortest
      var rowMax=Math.max(1,mH-r*2);
      var rowMin=r===0?1:0; // back row always has at least 1
      var h=ri(rowMin,rowMax);grid[r][cc]=h;tot+=h}}
    if(tot===0){grid[0][0]=1;tot=1}
    // Ensure every column's top cube is visible: no front column taller than back
    for(var cc=0;cc<gW;cc++){for(var r=1;r<gD;r++){
      if(grid[r][cc]>=grid[r-1][cc]&&grid[r-1][cc]>0){
        grid[r][cc]=Math.max(0,grid[r-1][cc]-1);
        tot=0;for(var rr=0;rr<gD;rr++)for(var c2=0;c2<gW;c2++)tot+=grid[rr][c2]}}}
    if(tot===0){grid[0][0]=1;tot=1}
    return{grid:grid,gW:gW,gD:gD,tot:tot}}
  var piles=[];
  if(!useTwoPiles){
    var gW=2+Math.min(Math.floor(d/2)+1,3),gD=2+Math.min(Math.floor(d/3),1),mH=2+Math.min(d,3);
    var p1=makePile(gW,gD,mH);
    // Cap at 28
    while(p1.tot>28){for(var r=0;r<p1.gD&&p1.tot>28;r++)for(var cc=0;cc<p1.gW&&p1.tot>28;cc++){if(p1.grid[r][cc]>1){p1.grid[r][cc]--;p1.tot--}}}
    piles.push(p1);
  } else {
    // Two piles side by side
    var gW1=ri(2,3),gD1=2,mH1=2+Math.min(d,3);
    var gW2=ri(2,3),gD2=2,mH2=2+Math.min(d,2);
    var p1=makePile(gW1,gD1,mH1),p2=makePile(gW2,gD2,mH2);
    while(p1.tot+p2.tot>28){
      if(p1.tot>=p2.tot){for(var r=0;r<p1.gD&&p1.tot+p2.tot>28;r++)for(var cc=0;cc<p1.gW&&p1.tot+p2.tot>28;cc++){if(p1.grid[r][cc]>1){p1.grid[r][cc]--;p1.tot--}}}
      else{for(var r=0;r<p2.gD&&p1.tot+p2.tot>28;r++)for(var cc=0;cc<p2.gW&&p1.tot+p2.tot>28;cc++){if(p2.grid[r][cc]>1){p2.grid[r][cc]--;p2.tot--}}}}
    piles.push(p1);piles.push(p2);
  }
  legoAns=0;piles.forEach(function(p){legoAns+=p.tot});

  // Render SVG with TEXTURED cubes (wood grain, cheese holes, stone, fabric)
  var CW=34,CH=20,CV=24;
  var oy; // will be set after computing maxH
  // Pick a single texture theme for this question
  var textures=['wood','cheese','stone','brick','fabric','candy','marble','denim'];
  var theme=textures[ri(0,textures.length-1)];

  // Color palettes per theme
  var themeCols={
    wood:[['#D4A574','#A67341','#7A4F1E'],['#C4996F','#8F6630','#6B3F15'],['#E0B284','#B57E3D','#8B5420']],
    cheese:[['#FFE066','#FFB830','#C89000'],['#FFDB4D','#FFA41A','#AB7700'],['#FFE580','#FFC04D','#D89B1A']],
    stone:[['#B8B8B8','#808080','#4D4D4D'],['#A0A0A0','#6E6E6E','#3D3D3D'],['#C4C4C4','#8A8A8A','#555555']],
    brick:[['#D97757','#A84728','#6B2D18'],['#C4654A','#8F3A20','#5A2610'],['#E08970','#B85535','#7A3418']],
    fabric:[['#9B7EBD','#6B4E8F','#3E2B5B'],['#B49CD1','#7D5FA3','#4A3670'],['#8869A8','#5A3F7D','#2F1F4A']],
    candy:[['#FF90B3','#E84A7F','#9E2854'],['#FFAABC','#E66D96','#B23D6A'],['#FFB3CD','#EC7A9F','#C14A78']],
    marble:[['#E8E0D8','#B0A898','#7A7268'],['#D5CEC6','#9E958C','#686058'],['#F0EAE2','#C4BAB0','#8A7E74']],
    denim:[['#5B7FAE','#3A5A88','#1E3A62'],['#6B8FBE','#4A6A98','#2E4A72'],['#4B6F9E','#2A4A78','#0E2A52']]
  };

  function renderPile(pile,offX){
    var s='';var gW=pile.gW,gD=pile.gD,grid=pile.grid;
    var pal=themeCols[theme];
    for(var r=0;r<gD;r++)for(var cc=0;cc<gW;cc++){var h=grid[r][cc];var cl=pal[(r*gW+cc)%pal.length];
      for(var hh=0;hh<h;hh++){var bx=offX+(cc-r)*CW,by=oy+(cc+r)*CH-hh*CV;
        var gi='g'+offX+'_'+r+'_'+cc+'_'+hh;
        // Gradient fills (base)
        s+='<defs>';
        s+='<linearGradient id="'+gi+'t" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="'+cl[0]+'"/><stop offset="100%" stop-color="'+cl[1]+'"/></linearGradient>';
        s+='<linearGradient id="'+gi+'l" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="'+cl[1]+'"/><stop offset="100%" stop-color="'+cl[2]+'"/></linearGradient>';
        s+='<linearGradient id="'+gi+'r" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="'+cl[1]+'"/><stop offset="100%" stop-color="'+cl[2]+'"/></linearGradient>';
        // Texture pattern overlay
        if(theme==='wood'){
          // Wood grain: horizontal wavy lines
          s+='<pattern id="'+gi+'p" patternUnits="userSpaceOnUse" width="'+(CW*2)+'" height="6" patternTransform="rotate(0)"><path d="M0,2 Q'+(CW/2)+',0 '+CW+',2 T'+(CW*2)+',2" stroke="rgba(80,40,10,.35)" stroke-width="0.6" fill="none"/><path d="M0,5 Q'+(CW/2)+',3 '+CW+',5 T'+(CW*2)+',5" stroke="rgba(100,55,20,.25)" stroke-width="0.4" fill="none"/></pattern>';
        } else if(theme==='cheese'){
          // Cheese holes: circles of varying size
          s+='<pattern id="'+gi+'p" patternUnits="userSpaceOnUse" width="'+CW+'" height="'+CW+'"><circle cx="'+(CW*0.3)+'" cy="'+(CW*0.3)+'" r="3" fill="rgba(140,90,0,.45)"/><circle cx="'+(CW*0.7)+'" cy="'+(CW*0.6)+'" r="2" fill="rgba(140,90,0,.35)"/><circle cx="'+(CW*0.2)+'" cy="'+(CW*0.8)+'" r="2.5" fill="rgba(140,90,0,.4)"/><circle cx="'+(CW*0.8)+'" cy="'+(CW*0.2)+'" r="1.5" fill="rgba(140,90,0,.3)"/></pattern>';
        } else if(theme==='stone'){
          // Stone speckles
          s+='<pattern id="'+gi+'p" patternUnits="userSpaceOnUse" width="'+CW+'" height="'+CW+'"><circle cx="'+(CW*0.2)+'" cy="'+(CW*0.15)+'" r=".8" fill="rgba(0,0,0,.4)"/><circle cx="'+(CW*0.5)+'" cy="'+(CW*0.4)+'" r="1.2" fill="rgba(0,0,0,.3)"/><circle cx="'+(CW*0.75)+'" cy="'+(CW*0.7)+'" r=".9" fill="rgba(0,0,0,.35)"/><circle cx="'+(CW*0.3)+'" cy="'+(CW*0.85)+'" r=".7" fill="rgba(255,255,255,.25)"/><circle cx="'+(CW*0.85)+'" cy="'+(CW*0.3)+'" r=".6" fill="rgba(255,255,255,.2)"/></pattern>';
        } else if(theme==='brick'){
          // Brick pattern: offset rectangles
          s+='<pattern id="'+gi+'p" patternUnits="userSpaceOnUse" width="'+CW+'" height="'+(CW/2)+'"><path d="M0,0 L'+CW+',0 M0,'+(CW/4)+' L'+(CW/2)+','+(CW/4)+' M'+(CW/2)+','+(CW/4)+' L'+CW+','+(CW/4)+' M0,'+(CW/2)+' L'+CW+','+(CW/2)+' M'+(CW/2)+',0 L'+(CW/2)+','+(CW/4)+' M0,'+(CW/4)+' L0,'+(CW/2)+' M'+CW+','+(CW/4)+' L'+CW+','+(CW/2)+'" stroke="rgba(60,20,10,.4)" stroke-width=".8" fill="none"/></pattern>';
        } else if(theme==='fabric'){
          // Fabric weave: crosshatch
          s+='<pattern id="'+gi+'p" patternUnits="userSpaceOnUse" width="5" height="5"><path d="M0,0 L5,5 M5,0 L0,5" stroke="rgba(255,255,255,.18)" stroke-width=".5"/><path d="M2.5,0 L2.5,5 M0,2.5 L5,2.5" stroke="rgba(0,0,0,.15)" stroke-width=".4"/></pattern>';
        } else if(theme==='candy'){
          // Candy: swirls
          s+='<pattern id="'+gi+'p" patternUnits="userSpaceOnUse" width="'+(CW)+'" height="'+(CW)+'"><path d="M'+(CW*0.5)+','+(CW*0.2)+' Q'+(CW*0.8)+','+(CW*0.5)+' '+(CW*0.5)+','+(CW*0.8)+' Q'+(CW*0.2)+','+(CW*0.5)+' '+(CW*0.5)+','+(CW*0.2)+'" stroke="rgba(255,255,255,.35)" stroke-width="1.2" fill="none"/><circle cx="'+(CW*0.5)+'" cy="'+(CW*0.5)+'" r="2" fill="rgba(255,255,255,.3)"/></pattern>';
        } else if(theme==='marble'){
          // Marble: veined cracks
          s+='<pattern id="'+gi+'p" patternUnits="userSpaceOnUse" width="'+(CW*2)+'" height="'+(CW*2)+'"><path d="M0,'+(CW*0.4)+' Q'+(CW*0.6)+','+(CW*0.2)+' '+(CW)+','+(CW*0.5)+' T'+(CW*2)+','+(CW*0.3)+'" stroke="rgba(100,90,80,.3)" stroke-width=".7" fill="none"/><path d="M'+(CW*0.3)+',0 Q'+(CW*0.8)+','+(CW*0.7)+' '+(CW*0.5)+','+(CW*1.5)+'" stroke="rgba(120,110,100,.25)" stroke-width=".5" fill="none"/><circle cx="'+(CW*0.6)+'" cy="'+(CW*0.8)+'" r="1" fill="rgba(80,70,60,.2)"/></pattern>';
        } else {
          // Denim: diagonal twill weave
          s+='<pattern id="'+gi+'p" patternUnits="userSpaceOnUse" width="6" height="6"><path d="M0,0 L6,6" stroke="rgba(255,255,255,.2)" stroke-width=".6"/><path d="M3,0 L6,3 M0,3 L3,6" stroke="rgba(200,220,255,.15)" stroke-width=".4"/><path d="M0,6 L6,0" stroke="rgba(0,0,0,.12)" stroke-width=".3"/></pattern>';
        }
        s+='</defs>';
        // Left face
        s+='<polygon points="'+(bx-CW)+','+(by-CV+CH)+' '+bx+','+(by-CV+2*CH)+' '+bx+','+(by+2*CH)+' '+(bx-CW)+','+(by+CH)+'" fill="url(#'+gi+'l)" stroke="rgba(0,0,0,.2)" stroke-width="1"/>';
        s+='<polygon points="'+(bx-CW)+','+(by-CV+CH)+' '+bx+','+(by-CV+2*CH)+' '+bx+','+(by+2*CH)+' '+(bx-CW)+','+(by+CH)+'" fill="url(#'+gi+'p)" opacity=".55"/>';
        // Right face
        s+='<polygon points="'+bx+','+(by-CV+2*CH)+' '+(bx+CW)+','+(by-CV+CH)+' '+(bx+CW)+','+(by+CH)+' '+bx+','+(by+2*CH)+'" fill="url(#'+gi+'r)" stroke="rgba(0,0,0,.25)" stroke-width="1"/>';
        s+='<polygon points="'+bx+','+(by-CV+2*CH)+' '+(bx+CW)+','+(by-CV+CH)+' '+(bx+CW)+','+(by+CH)+' '+bx+','+(by+2*CH)+'" fill="url(#'+gi+'p)" opacity=".4"/>';
        // Top face
        s+='<polygon points="'+bx+','+(by-CV)+' '+(bx+CW)+','+(by-CV+CH)+' '+bx+','+(by-CV+2*CH)+' '+(bx-CW)+','+(by-CV+CH)+'" fill="url(#'+gi+'t)" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>';
        s+='<polygon points="'+bx+','+(by-CV)+' '+(bx+CW)+','+(by-CV+CH)+' '+bx+','+(by-CV+2*CH)+' '+(bx-CW)+','+(by-CV+CH)+'" fill="url(#'+gi+'p)" opacity=".6"/>';
      }}
    return s}

  var maxGW=0,maxGD=0,maxH=0;
  piles.forEach(function(p){if(p.gW>maxGW)maxGW=p.gW;if(p.gD>maxGD)maxGD=p.gD;
    for(var r=0;r<p.gD;r++)for(var cc=0;cc<p.gW;cc++){if(p.grid[r][cc]>maxH)maxH=p.grid[r][cc]}});

  // Compute actual SVG dimensions from isometric math
  var pad=30;
  var oy=pad+maxH*CV; // origin Y: enough room above for tallest stack

  if(useTwoPiles){
    // Compute each pile's extent
    var p1=piles[0],p2=piles[1];
    var ox1=p1.gD*CW+pad;
    var gap=3*CW; // gap between piles
    var ox2=ox1+(p1.gW+p1.gD)*CW+gap;
    // Rightmost point: ox2 + p2.gW*CW
    var rightEdge=ox2+p2.gW*CW+pad;
    // Bottom: max of both piles
    var bot1=oy+(p1.gW+p1.gD-2)*CH+2*CH+pad;
    var bot2=oy+(p2.gW+p2.gD-2)*CH+2*CH+pad;
    var svgH=Math.max(bot1,bot2);
    var totalW=rightEdge;
    var svg='<svg class="cube-svg" viewBox="0 0 '+totalW+' '+svgH+'" style="width:100%;flex-shrink:1;max-height:100%;max-width:100%">';
    svg+=renderPile(p1,ox1);svg+=renderPile(p2,ox2);
  } else {
    var p1=piles[0];
    var ox=p1.gD*CW+pad;
    var rightEdge=ox+p1.gW*CW+pad;
    var leftEdge=ox-p1.gD*CW;
    var totalW=Math.max(rightEdge,rightEdge-leftEdge+pad);
    var svgH=oy+(p1.gW+p1.gD-2)*CH+2*CH+pad;
    var svg='<svg class="cube-svg" viewBox="'+(leftEdge<0?leftEdge-5:0)+' 0 '+(totalW-Math.min(0,leftEdge)+10)+' '+svgH+'" style="width:100%;flex-shrink:1;max-height:100%;max-width:100%">';
    svg+=renderPile(p1,ox);
  }
  svg+='</svg>';
  // Compact layout: SVG shrinks to fit, answer+numpad always visible
  c.innerHTML='<div class="ins">Count ALL cubes (hidden too)</div>'+
    '<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;width:100%">'+svg+'</div>'+
    '<div style="flex-shrink:0;width:100%;padding-top:3px">'+
      '<div style="font-family:Fredoka;font-size:1.5rem;font-weight:700;color:var(--yellow);text-align:center;margin:1px 0;line-height:1.3" id="lD">_</div>'+
      '<div class="numpad" style="max-width:200px;gap:3px">'+
        '<div class="nk" onclick="lT(1)">1</div><div class="nk" onclick="lT(2)">2</div><div class="nk" onclick="lT(3)">3</div>'+
        '<div class="nk" onclick="lT(4)">4</div><div class="nk" onclick="lT(5)">5</div><div class="nk" onclick="lT(6)">6</div>'+
        '<div class="nk" onclick="lT(7)">7</div><div class="nk" onclick="lT(8)">8</div><div class="nk" onclick="lT(9)">9</div>'+
        '<div class="nk nk-del" onclick="lDl()">⌫</div><div class="nk" onclick="lT(0)">0</div>'+
        '<div class="nk" style="background:rgba(91,200,160,.1);border-color:var(--green)" onclick="lSb()">✓</div>'+
      '</div>'+
    '</div>'}

/** Numpad tap for visualize */
const lT = function(n){if(!S.ap||legoIn.length>=3)return;legoIn+=n;document.getElementById('lD').textContent=legoIn}

/** Numpad delete for visualize */
const lDl = function(){if(!S.ap||!legoIn.length)return;legoIn=legoIn.slice(0,-1);document.getElementById('lD').textContent=legoIn||'_'}

/** Submit for visualize */
const lSb = function(){if(!S.ap||!legoIn.length)return;S.ap=false;legoKB=false;var v=parseInt(legoIn),d=document.getElementById('lD');
  var correct=(v===legoAns);trackAnswer(correct);
  if(correct){d.style.color='var(--green)';d.textContent='✓ '+legoAns;var p=aw(20);showFly('+'+p,true);showRx(true);playOk()}
  else{d.style.color='#ff5050';d.textContent='✗→'+legoAns;
    if(S.wrongs.length<10)S.wrongs.push({cat:'visualize',q:'Count cubes',correct:String(legoAns),picked:legoIn});
    showFly('✗',false);showRx(false);playNo()}
  setTimeout(nxt,550)}
