/**
 * Leaderboard rendering and CSV export
 */

/** Show leaderboard screen */
const showLB = function(){var lb=document.getElementById('lbContent');var so=S.all.slice().sort(function(a,b){return b.total-a.total||(a.avgTime||99)-(b.avgTime||99)});
  // #17 Gather unique groups for filter
  var groups={};so.forEach(function(s){if(s.group)groups[s.group]=true});
  var gKeys=Object.keys(groups);
  var filterHtml='';
  if(gKeys.length>0){
    filterHtml='<div style="display:flex;gap:4px;flex-wrap:wrap;margin:4px 0"><button class="btn bs" style="padding:4px 8px;font-size:.7rem;width:auto;flex:0 0 auto" onclick="filterLB(\'\')">All</button>';
    gKeys.forEach(function(g){filterHtml+='<button class="btn bs" style="padding:4px 8px;font-size:.7rem;width:auto;flex:0 0 auto" onclick="filterLB(\''+g.replace(/'/g,"\\'")+'\')">'+g+'</button>'});
    filterHtml+='</div>';
  }
  var h=filterHtml+'<div class="lb-title">All Time (Top 20)</div>';
  if(!so.length)h+='<div style="opacity:.3;text-align:center;margin:10px 0;font-size:.8rem">No scores yet</div>';
  else so.slice(0,20).forEach(function(s,i){
    var meta=(s.accuracy!==undefined?' • '+s.accuracy+'%':'')+(s.maxStreak?' • 🔥'+s.maxStreak:'')+(s.group?' • '+s.group:'');
    h+='<div class="lb-row"><span class="lbn">'+(i+1)+'. '+s.name+'<span style="font-size:.6rem;opacity:.5">'+meta+'</span></span><span class="lbs">'+s.total+'</span></div>'});
  h+='<div class="lb-title">Category Bests</div>';CATS.forEach(function(c){h+='<div class="lb-row"><span class="lbn">'+c.icon+' '+c.name+'</span><span class="lbs">'+(S.cb[c.id]||0)+'</span></div>'});
  lb.innerHTML=h;show('lbScreen')}

/** Filter leaderboard by group */
const filterLB = function(group){
  var lb=document.getElementById('lbContent');
  var filtered=S.all.filter(function(s){return !group||s.group===group}).sort(function(a,b){return b.total-a.total||(a.avgTime||99)-(b.avgTime||99)});
  var h='<button class="btn bs" style="padding:4px 8px;font-size:.7rem;width:auto;margin-bottom:5px" onclick="showLB()">← All</button><div class="lb-title">'+(group||'All')+' (Top 20)</div>';
  if(!filtered.length)h+='<div style="opacity:.3;text-align:center;margin:10px 0;font-size:.8rem">No scores</div>';
  else filtered.slice(0,20).forEach(function(s,i){
    var meta=(s.accuracy!==undefined?' • '+s.accuracy+'%':'')+(s.maxStreak?' • 🔥'+s.maxStreak:'');
    h+='<div class="lb-row"><span class="lbn">'+(i+1)+'. '+s.name+'<span style="font-size:.6rem;opacity:.5">'+meta+'</span></span><span class="lbs">'+s.total+'</span></div>'});
  lb.innerHTML=h;
}

/** Export scores to CSV */
const exportCSV = function(){
  // #18 Tab-separated for easy paste into Google Sheets + detailed stats
  var headers=['Rank','Name','Group','Total','Correct','Wrong','Questions','Accuracy%','MaxStreak','AvgTime(s)','Mode','Date'];
  CATS.forEach(function(c){headers.push(c.name)});
  var csv=headers.join(',')+'\n';
  var sorted=S.all.slice().sort(function(a,b){return b.total-a.total||(a.avgTime||99)-(b.avgTime||99)});
  sorted.forEach(function(s,i){
    var row=[i+1,'"'+s.name+'"','"'+(s.group||'')+'"',s.total,s.correct||0,s.wrong||0,s.questions||0,(s.accuracy!==undefined?s.accuracy:''),s.maxStreak||0,(s.avgTime||0).toFixed(2),s.mode||'full',s.date];
    CATS.forEach(function(c){row.push(s.cats[c.id]||0)});
    csv+=row.join(',')+'\n';
  });
  var b=new Blob([csv],{type:'text/csv'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='EIS_Scores_'+new Date().toISOString().slice(0,10)+'.csv';a.click()
}
