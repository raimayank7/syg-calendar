(function(){'use strict';
var C=window.Cal={};
var fl=Math.floor;
C.GM=["January","February","March","April","May","June","July","August","September","October","November","December"];
C.DW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
// ---- Julian day number (integer, noon) for the Gregorian and Julian calendars
C.gToJd=function(y,m,d){var a=fl((14-m)/12),yy=y+4800-a,mm=m+12*a-3;return d+fl((153*mm+2)/5)+365*yy+fl(yy/4)-fl(yy/100)+fl(yy/400)-32045};
C.jdToG=function(j){var a=j+32044,b=fl((4*a+3)/146097),c=a-fl(146097*b/4),d=fl((4*c+3)/1461),e=c-fl(1461*d/4),m=fl((5*e+2)/153);return [100*b+d-4800+fl(m/10),m+3-12*fl(m/10),e-fl((153*m+2)/5)+1]};
C.juToJd=function(y,m,d){var a=fl((14-m)/12),yy=y+4800-a,mm=m+12*a-3;return d+fl((153*mm+2)/5)+365*yy+fl(yy/4)-32083};
C.jdToJu=function(j){var c=j+32082,d=fl((4*c+3)/1461),e=c-fl(1461*d/4),m=fl((5*e+2)/153);return [d-4800+fl(m/10),m+3-12*fl(m/10),e-fl((153*m+2)/5)+1]};
// ---- Coptic (and Ethiopian = Coptic year minus 276, same months)
var CE=1825030;
C.coToJd=function(y,m,d){return d+(m-1)*30+(y-1)*365+fl(y/4)+CE-1};
C.jdToCo=function(j){var y=fl((4*(j-CE)+1463)/1461),yd=j-C.coToJd(y,1,1),m=fl(yd/30)+1;return [y,m,yd-(m-1)*30+1]};
// ---- Hebrew (months numbered Nisan=1 ... Elul=6, Tishri=7 ... Adar=12, Adar II=13 in leap years)
var HE=347998;
function lp(y){return (7*y+1)%19<7}
function d1(y){var mo=fl((235*y-234)/19),p=12084+13753*mo,day=mo*29+fl(p/25920);if((3*(day+1))%7<3)day++;return day}
function d2(y){var l=d1(y-1),p=d1(y),n=d1(y+1);if(n-p===356)return 2;if(p-l===382)return 1;return 0}
function ny(y){return HE+d1(y)+d2(y)}
C.heLeap=lp;
C.heYearDays=function(y){return ny(y+1)-ny(y)};
C.heNewYear=ny;
C.heMonthLen=function(y,m){var yd=ny(y+1)-ny(y);switch(m){case 1:case 3:case 5:case 7:case 11:return 30;case 2:case 4:case 6:case 10:case 13:return 29;case 8:return yd%10===5?30:29;case 9:return yd%10===3?29:30;case 12:return lp(y)?30:29}};
C.heOrder=function(y){return lp(y)?[7,8,9,10,11,12,13,1,2,3,4,5,6]:[7,8,9,10,11,12,1,2,3,4,5,6]};
C.heToJd=function(y,m,d){var j=ny(y),o=C.heOrder(y);for(var i=0;i<o.length;i++){if(o[i]===m)break;j+=C.heMonthLen(y,o[i])}return j+d-1};
C.jdToHe=function(j){var y=fl((j-HE)*98496/35975351)+1;while(ny(y+1)<=j)y++;while(ny(y)>j)y--;var r=j-ny(y),o=C.heOrder(y);for(var i=0;i<o.length;i++){var l=C.heMonthLen(y,o[i]);if(r<l)return [y,o[i],r+1];r-=l}};
C.heName=function(y,m){return ["","Nisan","Iyyar","Sivan","Tammuz","Av","Elul","Tishri","Heshvan","Kislev","Tevet","Shevat",lp(y)?"Adar I":"Adar","Adar II"][m]};
// ---- Indian national calendar (Saka): Chaitra 1 is 22 March, or 21 March in a Gregorian leap year
function gl(y){return (y%4===0&&y%100!==0)||y%400===0}
C.skToJd=function(y,m,d){var g=y+78,l=gl(g)?1:0,s=C.gToJd(g,3,22-l),ch=30+l,off;if(m===1)off=0;else{off=ch+Math.min(m-2,5)*31;if(m>=8)off+=(m-7)*30}return s+off+d-1};
C.jdToSk=function(j){var g=C.jdToG(j)[0],y=g-78;if(j<C.skToJd(y,1,1))y--;else if(j>=C.skToJd(y+1,1,1))y++;var m=1;while(m<12&&C.skToJd(y,m+1,1)<=j)m++;return [y,m,j-C.skToJd(y,m,1)+1]};
C.skName=function(m){return ["","Chaitra","Vaisakha","Jyaistha","Asadha","Sravana","Bhadra","Asvina","Kartika","Agrahayana","Pausa","Magha","Phalguna"][m]};
C.coName=function(m){return ["","Thout","Paopi","Hathor","Koiak","Tobi","Meshir","Paremhat","Paremoude","Pashons","Paoni","Epip","Mesori","Pi Kogi Enavot"][m]};
C.etName=function(m){return ["","Meskerem","Tikimt","Hidar","Tahsas","Tir","Yekatit","Megabit","Miazia","Genbot","Sene","Hamle","Nehase","Pagume"][m]};
C.era=function(y,m,d){var n=y*10000+m*100+d;if(n>=20190501)return 'Reiwa '+(y-2018);if(n>=19890108)return 'Heisei '+(y-1988);if(n>=19261225)return 'Showa '+(y-1925);if(n>=19120730)return 'Taisho '+(y-1911);if(n>=18680125)return 'Meiji '+(y-1867);return ''};
C.all=function(y,m,d){var j=C.gToJd(y,m,d),ju=C.jdToJu(j),he=C.jdToHe(j),co=C.jdToCo(j),sk=C.jdToSk(j);
 return {jd:j,g:[y,m,d],ju:ju,he:he,co:co,et:[co[0]+276,co[1],co[2]],sk:sk,th:y+543,mg:y-1911,era:C.era(y,m,d),wd:(j+1)%7}};
function el(i){return document.querySelector(i)}
function run(){var inp=el('#c-d'),o=el('#c-out');if(!inp)return;
 var t=new Date();inp.value=t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);
 function go(){var p=inp.value.split('-');if(p.length<3||!(+p[0]>=1900&&+p[0]<=2200)){o.innerHTML='<p>Please choose a date from 1900 to 2200.</p>';return}
  var a=C.all(+p[0],+p[1],+p[2]);function f(x,n){return x[2]+' '+n+' '+x[0]}
  var rows=[['Gregorian',a.g[2]+' '+C.GM[a.g[1]-1]+' '+a.g[0]+' ('+C.DW[a.wd]+')'],['Julian',a.ju[2]+' '+C.GM[a.ju[1]-1]+' '+a.ju[0]],['Hebrew',f(a.he,C.heName(a.he[0],a.he[1]))],['Coptic',f(a.co,C.coName(a.co[1]))],['Ethiopian',f(a.et,C.etName(a.et[1]))],['Indian national (Saka)',f(a.sk,C.skName(a.sk[1]))],['Thai Buddhist era',a.g[2]+' '+C.GM[a.g[1]-1]+' '+a.th],['Republic of China (Minguo)',a.g[2]+' '+C.GM[a.g[1]-1]+' '+(a.mg>0?'year '+a.mg:'year '+(1-a.mg)+' before Minguo')]];
  if(a.era)rows.push(['Japanese era',a.era]);
  o.innerHTML='<table class="w3"><tbody>'+rows.map(function(r){return '<tr><th scope="row">'+r[0]+'</th><td>'+r[1]+'</td></tr>'}).join('')+'</tbody></table>'}
 inp.addEventListener('input',go);inp.addEventListener('change',go);go()}
run();
})();
