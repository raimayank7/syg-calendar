(function(){'use strict';
var d=document,$=function(s){return d.querySelector(s)},C=window.PersianCal={},T=null;
var PM=["Farvardin","Ordibehesht","Khordad","Tir","Mordad","Shahrivar","Mehr","Aban","Azar","Dey","Bahman","Esfand"];
var GM=["January","February","March","April","May","June","July","August","September","October","November","December"],DW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function day(y,m,dd){return Math.round(Date.UTC(y,m-1,dd)/864e5)}
function greg(n){var x=new Date(n*864e5);return {y:x.getUTCFullYear(),m:x.getUTCMonth()+1,d:x.getUTCDate(),w:x.getUTCDay()}}
C.load=function(cb){if(T)return cb();fetch('/persian/data/nowruz.json').then(function(r){return r.json()}).then(function(j){T=j;cb()})};
function nw(gy){return T.d[gy-T.y0]}
function mlen(gy,m){if(m<12)return m<=6?31:30;return nw(gy+1)-nw(gy)-336}
C.toPersian=function(y,m,dd){var n=day(y,m,dd),gy=n>=nw(y)?y:y-1;if(gy<T.y0||gy>=T.y0+T.d.length-1)return null;var off=n-nw(gy);for(var i=1;i<=12;i++){var l=mlen(gy,i);if(off<l)return {y:gy-621,m:i,d:off+1};off-=l}};
C.toGreg=function(py,m,dd){var gy=py+621;if(gy<T.y0||gy>=T.y0+T.d.length-1)return null;if(m<1||m>12)return {err:'Month must be 1 to 12.'};var l=mlen(gy,m);if(dd<1||dd>l)return {err:PM[m-1]+' '+py+' has '+l+' days.'};var n=nw(gy);for(var i=1;i<m;i++)n+=mlen(gy,i);return greg(n+dd-1)};
function f(g){return DW[g.w]+', '+g.d+' '+GM[g.m-1]+' '+g.y}
function run(){
 var t=new Date(),h=C.toPersian(t.getFullYear(),t.getMonth()+1,t.getDate()),o=$('#p-now');
 if(o&&h)o.innerHTML='<p class="w3-big">'+h.d+' '+PM[h.m-1]+' '+h.y+'</p><p>Today, '+DW[t.getDay()]+' '+t.getDate()+' '+GM[t.getMonth()]+' '+t.getFullYear()+', in the Persian (Solar Hijri) calendar.</p>';
 var gd=$('#p-g'),go=$('#p-gout');
 if(gd){gd.value=t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);var a=function(){var p=gd.value.split('-').map(Number);if(!p[0]){go.textContent='';return}var r=C.toPersian(p[0],p[1],p[2]);go.innerHTML=r?'<p class="w3-big">'+r.d+' '+PM[r.m-1]+' '+r.y+'</p>':'Outside 1279 to 1478 SH.'};gd.addEventListener('input',a);gd.addEventListener('change',a);a()}
 var py=$('#p-y'),pm=$('#p-m'),pd=$('#p-d'),po=$('#p-out');
 if(py){var b=function(){var r=C.toGreg(+py.value,+pm.value,+pd.value);po.innerHTML=!r?'Outside 1279 to 1478 SH.':r.err?r.err:'<p class="w3-big">'+f(r)+'</p>'};[py,pm,pd].forEach(function(e){e.addEventListener('input',b);e.addEventListener('change',b)});b()}
}
C.load(run);
})();
