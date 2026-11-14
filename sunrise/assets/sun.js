(function(){'use strict';
var d=document,$=function(s){return d.querySelector(s)},R=Math.PI/180;
var S=window.SunCalc={};
function eq(jc){var L0=(280.46646+jc*(36000.76983+jc*0.0003032))%360,M=357.52911+jc*(35999.05029-0.0001537*jc),e=0.016708634-jc*(0.000042037+0.0000001267*jc),mr=M*R;
 var C=Math.sin(mr)*(1.914602-jc*(0.004817+0.000014*jc))+Math.sin(2*mr)*(0.019993-0.000101*jc)+Math.sin(3*mr)*0.000289,tr=L0+C,om=125.04-1934.136*jc,ap=tr-0.00569-0.00478*Math.sin(om*R);
 var e0=23+(26+(21.448-jc*(46.815+jc*(0.00059-jc*0.001813)))/60)/60,ep=e0+0.00256*Math.cos(om*R);
 var decl=Math.asin(Math.sin(ep*R)*Math.sin(ap*R))/R,y=Math.pow(Math.tan(ep*R/2),2),L0r=L0*R;
 var et=4*(y*Math.sin(2*L0r)-2*e*Math.sin(mr)+4*e*y*Math.sin(mr)*Math.cos(2*L0r)-0.5*y*y*Math.sin(4*L0r)-1.25*e*e*Math.sin(2*mr))/R;return [et,decl]}
function ord(y,m,dd){return Date.UTC(y,m-1,dd)/864e5+719163}
S.times=function(y,m,dd,lat,lon){var jd=ord(y,m,dd)+1721424.5,o={},noon=720-4*lon,t,r,c,ha;
 for(var i=0;i<2;i++){r=eq((jd+noon/1440-2451545)/36525);noon=720-4*lon-r[0]}
 r=eq((jd+noon/1440-2451545)/36525);o.noon=noon;o.alt=90-Math.abs(lat-r[1]);
 [['rise',90.833,1],['set',90.833,-1],['dawn',96,1],['dusk',96,-1]].forEach(function(q){t=noon;for(var i=0;i<3;i++){r=eq((jd+t/1440-2451545)/36525);
  c=(Math.cos(q[1]*R)-Math.sin(lat*R)*Math.sin(r[1]*R))/(Math.cos(lat*R)*Math.cos(r[1]*R));if(c>1||c<-1){t=null;break}ha=Math.acos(c)/R;t=720-4*(lon+q[2]*ha)-r[0]}o[q[0]]=t});
 if(o.rise===null||o.set===null)o.rise=o.set=null;if(o.dawn===null||o.dusk===null)o.dawn=o.dusk=null;
 if(o.rise===null)o.polar=o.alt>-0.833?'day':'night';return o};
S.offset=function(tz,y,m,dd){try{var s=new Intl.DateTimeFormat('en-US',{timeZone:tz,timeZoneName:'longOffset'}).formatToParts(new Date(Date.UTC(y,m-1,dd,12))).filter(function(p){return p.type==='timeZoneName'})[0].value;
 var q=s.match(/GMT([+−-])(\d\d):?(\d\d)?/);if(!q)return s==='GMT'?0:null;return (q[1]==='+'?1:-1)*(+q[2]*60+(+q[3]||0))}catch(e){return null}};
S.hm=function(min){if(min===null||isNaN(min))return '—';var m=Math.round(min)%1440;if(m<0)m+=1440;return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)};
S.len=function(t){if(t.rise===null)return t.polar==='day'?'24 h 0 min':'0 h 0 min';var m=Math.round(t.set-t.rise);return Math.floor(m/60)+' h '+m%60+' min'};
function run(){
 var box=$('#sc-form');if(!box)return;
 var q=$('#sc-q'),list=$('#sc-list'),dt=$('#sc-date'),out=$('#sc-out'),cur=null,C=[],fx=box.getAttribute('data-city');if(fx){try{cur=JSON.parse(fx)}catch(e){}}
 function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
 function calc(){if(!cur){out.innerHTML='<p class="w3-empty">Choose a city or use your location.</p>';return}
  var p=(dt.value||'').split('-').map(Number);if(p.length<3||!p[0]){var n=new Date();p=[n.getFullYear(),n.getMonth()+1,n.getDate()]}
  var off=cur.tz?S.offset(cur.tz,p[0],p[1],p[2]):Math.round(cur.lon/15)*60;if(off===null)off=Math.round(cur.lon/15)*60;
  var t=S.times(p[0],p[1],p[2],cur.lat,cur.lon);
  var rows=t.rise===null?'<tr><td colspan="2">'+(t.polar==='day'?'The sun does not set on this date (midnight sun).':'The sun does not rise on this date (polar night).')+'</td></tr>':
   '<tr><td>Sunrise</td><td class="w3-n">'+S.hm(t.rise+off)+'</td></tr><tr><td>Sunset</td><td class="w3-n">'+S.hm(t.set+off)+'</td></tr><tr><td>Day length</td><td class="w3-n">'+S.len(t)+'</td></tr>';
  rows+=(t.dawn!==null?'<tr><td>First light (civil twilight begins)</td><td class="w3-n">'+S.hm(t.dawn+off)+'</td></tr><tr><td>Last light (civil twilight ends)</td><td class="w3-n">'+S.hm(t.dusk+off)+'</td></tr>':'')+'<tr><td>Solar noon (sun highest)</td><td class="w3-n">'+S.hm(t.noon+off)+'</td></tr>';
  out.innerHTML='<h2>'+cur.name+(cur.cc?', '+cur.cc:'')+': '+p[2]+'/'+p[1]+'/'+p[0]+'</h2><div class="tbl"><table class="w3"><tbody>'+rows+'</tbody></table></div><p class="hint">Local time (UTC'+(off>=0?'+':'−')+Math.floor(Math.abs(off)/60)+(Math.abs(off)%60?':'+('0'+Math.abs(off)%60).slice(-2):'')+'), worked out in your browser. Accurate to about a minute.'+(cur.url?' <a href="'+cur.url+'">Open the page for '+cur.name+'</a>.':'')+'</p>'}
 function pick(c){cur=c;q.value=c.name;list.innerHTML='';calc()}
 if(fx){var n0=new Date();dt.value=n0.getFullYear()+'-'+('0'+(n0.getMonth()+1)).slice(-2)+'-'+('0'+n0.getDate()).slice(-2);dt.addEventListener('input',calc);dt.addEventListener('change',calc);calc();return}
 fetch('/sunrise/data/cities.json').then(function(r){return r.json()}).then(function(j){C=j.c.map(function(a){return {name:a[0],cc:a[1],url:'/sunrise/city/'+a[2]+'/',lat:a[3],lon:a[4],tz:j.z[a[5]],k:norm(a[0]+' '+a[1])}});calc()});
 q.addEventListener('input',function(){var v=norm(q.value.trim());list.innerHTML='';if(v.length<2)return;var n=0;C.forEach(function(c){if(n<8&&c.k.indexOf(v)>-1){n++;var b=d.createElement('button');b.type='button';b.className='btn sm ghost';b.textContent=c.name+', '+c.cc;b.onclick=function(){pick(c)};list.appendChild(b)}})});
 dt.addEventListener('input',calc);dt.addEventListener('change',calc);
 var n=new Date();dt.value=n.getFullYear()+'-'+('0'+(n.getMonth()+1)).slice(-2)+'-'+('0'+n.getDate()).slice(-2);
 $('#sc-loc').addEventListener('click',function(){if(!navigator.geolocation){out.innerHTML='<p class="w3-empty">Your browser cannot share its location.</p>';return}
  navigator.geolocation.getCurrentPosition(function(p){var tz;try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){}cur={name:'Your location',cc:'',lat:p.coords.latitude,lon:p.coords.longitude,tz:tz};q.value='Your location';calc()},function(){out.innerHTML='<p class="w3-empty">Location was not shared. Type a city instead.</p>'})});
 var m=location.hash.match(/c=([a-z0-9-]+)/);if(m)setTimeout(function(){C.forEach(function(c){if(c.url==='/sunrise/city/'+m[1]+'/')pick(c)})},400);
 calc()}
if(d.readyState!=='loading')run();else d.addEventListener('DOMContentLoaded',run);
})();
