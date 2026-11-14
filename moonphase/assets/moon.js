(function(){'use strict';
var d=document,$=function(s){return d.querySelector(s)},M=window.MoonCal={},T=null;
var GM=["January","February","March","April","May","June","July","August","September","October","November","December"],DW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var NAMES=["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"];
M.load=function(cb){if(T)return cb();fetch('/moonphase/data/nm.json').then(function(r){return r.json()}).then(function(j){var a=[j.t0],t=j.t0;j.d.forEach(function(x){t+=x;a.push(t)});T=a;cb()})};
// t = minutes since 1970-01-01 UTC. T holds every quarter phase in turn (new, first quarter, full, last quarter, new ...); the phase angle between two of them is taken as linear.
M.at=function(t){var lo=0,hi=T.length-1;if(t<T[0]||t>=T[hi])return null;while(hi-lo>1){var m=(lo+hi)>>1;if(T[m]<=t)lo=m;else hi=m}
 var q=(t-T[lo])/(T[lo+1]-T[lo]),ang=((lo%4)+q)*90,f=ang/360,nm=lo-lo%4;
 return {age:(t-T[nm])/1440,f:f,ill:(1-Math.cos(ang*Math.PI/180))/2*100,name:NAMES[Math.floor(f*8+.5)%8],len:(T[nm+4]-T[nm])/1440}};
M.noon=function(y,m,dd){return Date.UTC(y,m-1,dd,12)/6e4};
function fmt(y,m,dd){var x=new Date(Date.UTC(y,m-1,dd));return DW[x.getUTCDay()]+', '+dd+' '+GM[m-1]+' '+y}
function show(p,out,label){if(!p){out.innerHTML='<p>Outside the table (1900 to 2060).</p>';return}
 out.innerHTML='<p class="w3-big">'+p.name+'</p><ul class="w3-chips"><li><b>'+Math.round(p.ill)+'%</b><small>of the disc lit</small></li><li><b>'+p.age.toFixed(1)+' days</b><small>since new moon</small></li><li><b>'+Math.round(p.f*100)+'%</b><small>through the lunation</small></li></ul>'+(label?'<p class="hint">'+label+'</p>':'')}
function run(){
 var n=new Date(),o=$('#m-now');
 if(o){var p=M.at(Date.now()/6e4);show(p,o,'Right now ('+n.toUTCString().slice(5,22)+' UTC). The moon looks the same everywhere on Earth, tilted differently north and south of the equator.')}
 var i=$('#m-d'),r=$('#m-out');
 if(i){i.value=n.getFullYear()+'-'+('0'+(n.getMonth()+1)).slice(-2)+'-'+('0'+n.getDate()).slice(-2);
  var go=function(){var v=i.value;if(!v){r.textContent='';return}var q=v.split('-').map(Number);show(M.at(M.noon(q[0],q[1],q[2])),r,fmt(q[0],q[1],q[2])+', at 12:00 UTC.')};
  i.addEventListener('input',go);i.addEventListener('change',go);go()}
}
if($('#m-now')||$('#m-d'))M.load(run);
})();
