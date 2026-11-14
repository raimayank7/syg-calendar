(function(){'use strict';
var d=document,$=function(s){return d.querySelector(s)},L=window.LifeCal={};
var GM=["January","February","March","April","May","June","July","August","September","October","November","December"],DW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
// orbital periods in Earth days (NASA Planetary Fact Sheet) and surface gravity m/s2 (same sheet)
var P=[["Mercury",88.0,3.7],["Venus",224.7,8.9],["Earth",365.2,9.8],["Mars",687.0,3.7],["Jupiter",4331,23.1],["Saturn",10747,9.0],["Uranus",30589,8.7],["Neptune",59800,11.0]];
L.planets=P;
function day(y,m,dd){return Math.round(Date.UTC(y,m-1,dd)/864e5)}
function dim(y,m){return new Date(Date.UTC(y,m,0)).getUTCDate()}
// years, months, days between two dates (a <= b): the same borrowing rule as Python's dateutil relativedelta
L.diff=function(a,b){var tot=(b[0]-a[0])*12+(b[1]-a[1]);function add(k){var y=a[0]+Math.floor((a[1]-1+k)/12),m=(a[1]-1+k)%12+1;if(m<1)m+=12;var dd=Math.min(a[2],dim(y,m));return day(y,m,dd)}
 var nb=day(b[0],b[1],b[2]);if(add(tot)>nb)tot--;return {y:Math.floor(tot/12),m:tot%12,d:nb-add(tot),days:nb-day(a[0],a[1],a[2])}};
L.nextBirthday=function(a,t){var y=t[0],m=a[1],dd=a[2];if(m===2&&dd===29&&dim(y,2)!==29)dd=28;var n=day(y,m,dd);if(n<day(t[0],t[1],t[2])){y++;dd=a[2];if(m===2&&dd===29&&dim(y,2)!==29)dd=28;n=day(y,m,dd)}return {n:n,y:y,days:n-day(t[0],t[1],t[2])}};
// day-count milestones: the date that is exactly N days after the date of birth (so the day of birth is day 0)
L.milestones=[[1000,'1,000 days'],[5000,'5,000 days'],[10000,'10,000 days'],[15000,'15,000 days'],[20000,'20,000 days'],[25000,'25,000 days'],[30000,'30,000 days'],[11574.074074,'1 billion seconds (11,574 days)']];
L.after=function(a,n){return day(a[0],a[1],a[2])+Math.floor(n)};
function wd(n){return DW[new Date(n*864e5).getUTCDay()]}
function fmt(n){var x=new Date(n*864e5);return wd(n)+', '+x.getUTCDate()+' '+GM[x.getUTCMonth()]+' '+x.getUTCFullYear()}
function num(x,p){return x.toLocaleString('en-IN',{maximumFractionDigits:p||0})}
function run(){
 var i=$('#l-d'),t=$('#l-t'),o=$('#l-out');if(!i)return;var n=new Date(),today=n.getFullYear()+'-'+('0'+(n.getMonth()+1)).slice(-2)+'-'+('0'+n.getDate()).slice(-2);t.value=today;
 function go(){var a=i.value.split('-').map(Number),b=t.value.split('-').map(Number);if(!a[0]||!b[0]){o.textContent='';return}
  if(day(a[0],a[1],a[2])>day(b[0],b[1],b[2])){o.innerHTML='<p>The date of birth is after the other date.</p>';return}
  var r=L.diff(a,b),nb=L.nextBirthday(a,b),days=r.days,rows='';
  P.forEach(function(p){rows+='<tr><td>'+p[0]+'</td><td class="w3-n">'+num(days/p[1],2)+'</td></tr>'});
  o.innerHTML='<p class="w3-big">'+r.y+' years, '+r.m+' months, '+r.d+' days</p><ul class="w3-chips"><li><b>'+num(days)+'</b><small>days</small></li><li><b>'+num(days/7,1)+'</b><small>weeks</small></li><li><b>'+num(days*24)+'</b><small>hours</small></li><li><b>'+num(days*1440)+'</b><small>minutes</small></li></ul>'+
   '<p>Born on a '+wd(day(a[0],a[1],a[2]))+'. Your next birthday is on '+fmt(nb.n)+', in '+nb.days+' day'+(nb.days===1?'':'s')+', and you will turn '+(nb.y-a[0])+'.</p>'+
   '<h3>Milestone days</h3><ul class="w3-chips">'+L.milestones.map(function(m){var n=L.after(a,m[0]),past=n<=day(b[0],b[1],b[2]);return '<li><b>'+m[1]+'</b><small>'+fmt(n)+(past?' (done)':'')+'</small></li>'}).join('')+'</ul>'+
   '<p>If your heart beats 70 times a minute on average (an assumption, not a measurement), it has beaten about '+num(days*1440*70/1e6,1)+' million times.</p>'+
   '<div class="tbl"><table class="stack w3"><thead><tr><th>Planet</th><th class="w3-n">Your age in planet years</th></tr></thead><tbody>'+rows+'</tbody></table></div>'}
 [i,t].forEach(function(e){e.addEventListener('input',go);e.addEventListener('change',go)});go();
 var w=$('#l-kg'),wo=$('#l-wout');
 if(w){var gw=function(){var k=+w.value;if(!(k>0)){wo.textContent='';return}var h='';P.forEach(function(p){h+='<tr><td>'+p[0]+'</td><td class="w3-n">'+num(k*p[2]/9.8,1)+' kg</td></tr>'});wo.innerHTML='<div class="tbl"><table class="stack w3"><thead><tr><th>Where</th><th class="w3-n">What the scale would show</th></tr></thead><tbody>'+h+'</tbody></table></div>'};w.addEventListener('input',gw);gw()}
}
run();
})();
