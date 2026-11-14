(function(){'use strict';
var L=window.LeapYear={};
L.isLeap=function(y){return (y%4===0&&y%100!==0)||y%400===0};
L.next=function(y){y++;while(!L.isLeap(y))y++;return y};
L.prev=function(y){y--;while(!L.isLeap(y))y--;return y};
function $(s){return document.querySelector(s)}
function run(){var i=$('#l-y'),o=$('#l-out');if(!i)return;i.value=new Date().getFullYear();
 function go(){var y=+i.value;if(!(y>=1&&y<=9999)||y!==Math.floor(y)){o.innerHTML='<p>Please type a whole year from 1 to 9999.</p>';return}
  var l=L.isLeap(y),why=l?(y%400===0?'divisible by 400':y%100===0?'':'divisible by 4 and not by 100'):(y%100===0?'divisible by 100 but not by 400':'not divisible by 4');
  o.innerHTML='<p class="w3-big">'+y+(l?' is a leap year':' is not a leap year')+'</p><p>It has '+(l?366:365)+' days and February has '+(l?29:28)+' days ('+why+').</p><ul class="w3-chips"><li><b>'+L.prev(y)+'</b><small>previous leap year</small></li><li><b>'+L.next(y)+'</b><small>next leap year</small></li></ul>'}
 i.addEventListener('input',go);i.addEventListener('change',go);go()}
run();
})();
