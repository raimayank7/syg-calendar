(function(){'use strict';
var d=document,$=function(s){return d.querySelector(s)};
var MN=["Muharram","Safar","Rabi\u2019 al-awwal","Rabi\u2019 al-thani","Jumada al-awwal","Jumada al-thani","Rajab","Sha\u2019ban","Ramadan","Shawwal","Dhu al-Qa\u2019dah","Dhu al-Hijjah"];
var AR=["\u0645\u062d\u0631\u0645","\u0635\u0641\u0631","\u0631\u0628\u064a\u0639 \u0627\u0644\u0623\u0648\u0644","\u0631\u0628\u064a\u0639 \u0627\u0644\u0622\u062e\u0631","\u062c\u0645\u0627\u062f\u0649 \u0627\u0644\u0623\u0648\u0644\u0649","\u062c\u0645\u0627\u062f\u0649 \u0627\u0644\u0622\u062e\u0631\u0629","\u0631\u062c\u0628","\u0634\u0639\u0628\u0627\u0646","\u0631\u0645\u0636\u0627\u0646","\u0634\u0648\u0627\u0644","\u0630\u0648 \u0627\u0644\u0642\u0639\u062f\u0629","\u0630\u0648 \u0627\u0644\u062d\u062c\u0629"];
var GM=["January","February","March","April","May","June","July","August","September","October","November","December"],DW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var T=null,H=window.HijriCal={};
function day(y,m,dd){return Math.round(Date.UTC(y,m-1,dd)/864e5)}
function greg(n){var x=new Date(n*864e5);return {y:x.getUTCFullYear(),m:x.getUTCMonth()+1,d:x.getUTCDate(),w:x.getUTCDay()}}
H.load=function(cb){if(T)return cb();fetch('/hijri/data/uq.json').then(function(r){return r.json()}).then(function(j){T=j;cb()})};
H.toHijri=function(y,m,dd){var n=day(y,m,dd),s=T.s;if(n<s[0]||n>=s[s.length-1])return null;var lo=0,hi=s.length-1;while(hi-lo>1){var mid=(lo+hi)>>1;if(s[mid]<=n)lo=mid;else hi=mid}return {y:T.y0+Math.floor(lo/12),m:lo%12+1,d:n-s[lo]+1}};
H.toGreg=function(y,m,dd){var i=(y-T.y0)*12+m-1;if(i<0||i>=T.s.length-1)return null;var len=T.s[i+1]-T.s[i];if(dd<1||dd>len)return {err:'In '+MN[m-1]+' '+y+' AH the month has '+len+' days.'};return greg(T.s[i]+dd-1)};
function fmtH(h,w){return DW[w]+', '+h.d+' '+MN[h.m-1]+' '+h.y+' AH'}
function fmtG(g){return DW[g.w]+', '+g.d+' '+GM[g.m-1]+' '+g.y}
function run(){
 var t=new Date(),h=H.toHijri(t.getFullYear(),t.getMonth()+1,t.getDate()),box=$('#h-today');
 if(box&&h)box.innerHTML='<h2>Today in the Hijri calendar</h2><p class="w3-big">'+fmtH(h,t.getDay())+'</p><p lang="ar" dir="rtl">'+h.d+' '+AR[h.m-1]+' '+h.y+'</p><p class="hint">Gregorian: '+fmtG({w:t.getDay(),d:t.getDate(),m:t.getMonth()+1,y:t.getFullYear()})+'. After sunset the Islamic day has already changed: add one day to the Hijri date in the evening.</p>';
 var gd=$('#g-d'),go=$('#g-out');
 function a(){var v=gd.value;if(!v){go.textContent='';return}var p=v.split('-').map(Number),h=H.toHijri(p[0],p[1],p[2]);go.innerHTML=h?fmtH(h,new Date(Date.UTC(p[0],p[1]-1,p[2])).getUTCDay())+'<br><span lang="ar" dir="rtl">'+h.d+' '+AR[h.m-1]+' '+h.y+'</span>':'Outside the table (1356 to 1500 AH).'}
 if(gd){gd.value=t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);gd.addEventListener('input',a);gd.addEventListener('change',a);a()}
 var hd=$('#h-d'),hm=$('#h-m'),hy=$('#h-y'),ho=$('#h-out');
 function b(){var g=H.toGreg(+hy.value,+hm.value,+hd.value);ho.innerHTML=!g?'Outside the table (1356 to 1500 AH).':g.err?g.err:fmtG(g)}
 if(hd){[hd,hm,hy].forEach(function(e){e.addEventListener('input',b);e.addEventListener('change',b)});b()}
}
if($('#g-d'))H.load(run);
})();
