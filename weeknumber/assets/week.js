(function(){'use strict';
var d=document,$=function(s){return d.querySelector(s)},W=window.WeekCal={};
var GM=["January","February","March","April","May","June","July","August","September","October","November","December"],DW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function day(y,m,dd){return Math.round(Date.UTC(y,m-1,dd)/864e5)}
function ymd(n){var x=new Date(n*864e5);return {y:x.getUTCFullYear(),m:x.getUTCMonth()+1,d:x.getUTCDate(),w:x.getUTCDay()}}
// ISO 8601: weeks start on Monday, week 1 is the week with the year's first Thursday.
W.iso=function(y,m,dd){var n=day(y,m,dd),wd=(ymd(n).w+6)%7,th=n-wd+3,ty=ymd(th).y,j1=day(ty,1,1);return {year:ty,week:Math.floor((th-j1)/7)+1,wd:wd+1}};
W.weeks=function(y){return W.iso(y,12,28).week};
W.monday=function(y,w){var j4=day(y,1,4),wd=(ymd(j4).w+6)%7;return j4-wd+(w-1)*7};
function f(n){var x=ymd(n);return DW[x.w]+' '+x.d+' '+GM[x.m-1]+' '+x.y}
function run(){
 var t=new Date(),o=$('#w-now');
 if(o){var r=W.iso(t.getFullYear(),t.getMonth()+1,t.getDate()),m=W.monday(r.year,r.week);o.innerHTML='<p class="w3-big">Week '+r.week+'</p><p>ISO week '+r.week+' of '+r.year+' ('+W.weeks(r.year)+' weeks in the year). Today is day '+r.wd+' of the week. This week runs from '+f(m)+' to '+f(m+6)+'.</p>'}
 var i=$('#w-d'),out=$('#w-out');
 if(i){i.value=t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);
  var go=function(){var q=i.value.split('-').map(Number);if(!q[0]){out.textContent='';return}var r=W.iso(q[0],q[1],q[2]),m=W.monday(r.year,r.week);out.innerHTML='<p class="w3-big">Week '+r.week+' of '+r.year+'</p><p>'+f(day(q[0],q[1],q[2]))+' is day '+r.wd+' of ISO week '+r.week+', which runs from '+f(m)+' to '+f(m+6)+'.</p>'};
  i.addEventListener('input',go);i.addEventListener('change',go);go()}
 var wy=$('#w-y'),ww=$('#w-w'),wo=$('#w-wout');
 if(wy){wy.value=t.getFullYear();var g2=function(){var y=+wy.value,w=+ww.value;if(!y||!w){wo.textContent='';return}var max=W.weeks(y);if(w<1||w>max){wo.innerHTML='<p>Year '+y+' has only '+max+' ISO weeks.</p>';return}var m=W.monday(y,w);wo.innerHTML='<p class="w3-big">'+f(m)+' to '+f(m+6)+'</p><p>ISO week '+w+' of '+y+' (Monday to Sunday).</p>'};
  [wy,ww].forEach(function(e){e.addEventListener('input',g2)});g2()}
}
run();
})();
