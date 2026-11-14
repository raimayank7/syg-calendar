(function(){'use strict';
var T=window.TS={};
var fl=Math.floor;
function p(n,w){n=String(n);while(n.length<(w||2))n='0'+n;return n}
// seconds since 1970-01-01T00:00:00Z -> parts in UTC (proleptic Gregorian)
T.parts=function(sec){var d=new Date(sec*1000);return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),h:d.getUTCHours(),i:d.getUTCMinutes(),s:d.getUTCSeconds(),w:d.getUTCDay()}};
T.iso=function(sec){var a=T.parts(sec);return a.y+'-'+p(a.m)+'-'+p(a.d)+'T'+p(a.h)+':'+p(a.i)+':'+p(a.s)+'Z'};
T.jd=function(sec){return sec/86400+2440587.5};
T.doy=function(sec){var a=T.parts(sec);return fl((Date.UTC(a.y,a.m-1,a.d)-Date.UTC(a.y,0,1))/864e5)+1};
T.fromParts=function(y,m,d,h,i,s){var t=new Date(0);t.setUTCFullYear(y,m-1,d);t.setUTCHours(h||0,i||0,s||0,0);return t.getTime()/1000};
T.DW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function $(s){return document.querySelector(s)}
function run(){var a=$('#t-ts'),b=$('#t-dt'),o=$('#t-out');if(!a)return;
 a.value=Math.floor(Date.now()/1000);
 var n=new Date();b.value=n.getUTCFullYear()+'-'+p(n.getUTCMonth()+1)+'-'+p(n.getUTCDate())+'T'+p(n.getUTCHours())+':'+p(n.getUTCMinutes());
 function show(sec,ms){var a2=T.parts(sec);var loc=new Date(sec*1000);
  o.innerHTML='<table class="w3"><tbody><tr><th scope="row">Unix time (seconds)</th><td>'+sec+'</td></tr><tr><th scope="row">Milliseconds</th><td>'+sec*1000+'</td></tr><tr><th scope="row">UTC (ISO 8601)</th><td>'+T.iso(sec)+'</td></tr><tr><th scope="row">Weekday (UTC)</th><td>'+T.DW[a2.w]+'</td></tr><tr><th scope="row">Day of the year</th><td>'+T.doy(sec)+'</td></tr><tr><th scope="row">Julian date</th><td>'+T.jd(sec).toFixed(5)+'</td></tr><tr><th scope="row">Your time zone</th><td>'+loc.toLocaleString(undefined,{dateStyle:'full',timeStyle:'long'})+'</td></tr></tbody></table>'}
 function fromTs(){var v=a.value.trim().replace(/[, ]/g,'');if(!/^-?\d+$/.test(v)){o.innerHTML='<p>Please type a whole number.</p>';return}var x=+v;if(Math.abs(x)>9e10)x=Math.floor(x/1000);if(Math.abs(x)>8.64e12){o.innerHTML='<p>That number is too large.</p>';return}show(x)}
 function fromDt(){var m=b.value.match(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/);if(!m){o.innerHTML='<p>Please choose a date and time.</p>';return}var s=T.fromParts(+m[1],+m[2],+m[3],+m[4],+m[5],0);a.value=s;show(s)}
 a.addEventListener('input',fromTs);b.addEventListener('input',fromDt);fromTs()}
run();
})();
