(function(){'use strict';
var d=document,$=function(s){return d.querySelector(s)},E=window.EasterCal={};
var GM=["January","February","March","April","May","June","July","August","September","October","November","December"],DW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function day(y,m,dd){return Math.round(Date.UTC(y,m-1,dd)/864e5)}
function fromDay(n){var x=new Date(n*864e5);return {y:x.getUTCFullYear(),m:x.getUTCMonth()+1,d:x.getUTCDate(),w:x.getUTCDay()}}
// Western Easter: Gregorian computus (Meeus/Jones/Butcher), valid for every Gregorian year
E.western=function(y){var a=y%19,b=Math.floor(y/100),c=y%100,dd=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-dd-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;return day(y,mo,da)};
// Orthodox Easter: Julian computus (Meeus), then +13 days to the Gregorian calendar (valid 1900 to 2099)
E.orthodox=function(y){var a=y%4,b=y%7,c=y%19,dd=(19*c+15)%30,e=(2*a+4*b-dd+34)%7,mo=Math.floor((dd+e+114)/31),da=(dd+e+114)%31+1;return day(y,mo,da)+13};
function fmt(n){var x=fromDay(n);return DW[x.w]+', '+x.d+' '+GM[x.m-1]+' '+x.y}
E.fmt=fmt;
function run(){var i=$('#e-y'),o=$('#e-out');if(!i)return;i.value=new Date().getFullYear();
 function go(){var y=+i.value;if(!(y>=1900&&y<=2099)){o.innerHTML='<p>Please type a year from 1900 to 2099.</p>';return}var w=E.western(y),r=E.orthodox(y);
  o.innerHTML='<p class="w3-big">Western Easter: '+fmt(w)+'</p><p class="w3-big">Orthodox Easter: '+fmt(r)+'</p><p>'+(w===r?'Both fall on the same day in '+y+'.':'Orthodox Easter is '+(r-w)+' days '+(r>w?'after':'before')+' Western Easter in '+y+'.')+'</p><ul class="w3-chips"><li><b>'+fmt(w-46).split(', ')[1]+'</b><small>Ash Wednesday (Western)</small></li><li><b>'+fmt(w-2).split(', ')[1]+'</b><small>Good Friday (Western)</small></li><li><b>'+fmt(w+49).split(', ')[1]+'</b><small>Pentecost (Western)</small></li><li><b>'+fmt(r-48).split(', ')[1]+'</b><small>Clean Monday (Orthodox)</small></li></ul>'}
 i.addEventListener('input',go);i.addEventListener('change',go);go()}
run();
})();
