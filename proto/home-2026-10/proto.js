(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function toast(m){var t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('on')},2200)}

/* mobile menu */
var mb=$('#mnuBtn'),nav=$('#mainNav');
if(mb)mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o)});

/* Top Things to Do tabs */
$$('[data-tabs=picks] button').forEach(function(b){b.addEventListener('click',function(){
 $$('[data-tabs=picks] button').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-selected',x===b)});
 $$('#picks .pane').forEach(function(p){p.classList.toggle('on',p.getAttribute('data-pane')===b.getAttribute('data-p'))});
})});

/* whole Eat & Drink card clickable (links inside keep their own job) */
$$('.ec').forEach(function(c){c.addEventListener('click',function(e){if(e.target.closest('a,button'))return;location.href=c.getAttribute('data-href')})});

/* schedule: day toggles, tabs, chips */
var W='week',C='all';
$$('.dayh').forEach(function(h){h.addEventListener('click',function(){var d=h.parentNode;if(d.classList.contains('m-closed')&&!d.classList.contains('u')&&matchMedia('(max-width:900px)').matches){d.classList.add('u','open');h.setAttribute('aria-expanded','true');return}d.classList.add('u');var o=d.classList.toggle('open');h.setAttribute('aria-expanded',o)})});
function filt(){
 var n=0;
 $$('.day').forEach(function(d,i){
  var k=d.getAttribute('data-day'),dayOk=W==='week'||(W==='today'&&k==='today')||(W==='tomorrow'&&k==='tomorrow')||(W==='weekend'&&(k==='today'||k==='tomorrow'));
  var m=0;
  $$('.ev',d).forEach(function(e){var ok=dayOk&&(C==='all'||(' '+e.getAttribute('data-tags')+' ').indexOf(' '+C+' ')>-1);e.hidden=!ok;if(ok)m++});
  d.hidden=!m;n+=m;
  if(W!=='week'&&m){d.classList.add('open','u');$('.dayh',d).setAttribute('aria-expanded','true')}
  var dc=$('.dc',d);if(dc)dc.textContent=m+(m===1?' event':' events');
 });
 var lab={week:'this week',today:'today',tomorrow:'tomorrow',weekend:'this weekend'}[W];
 $('#shown').textContent='Showing '+n+(n===1?' event ':' events ')+lab;
 $('#nomatch').hidden=n>0;
}
$$('[data-tabs=sched] button').forEach(function(b){b.addEventListener('click',function(){
 $$('[data-tabs=sched] button').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-selected',x===b)});W=b.getAttribute('data-w');filt()})});
$$('.chip').forEach(function(b){b.addEventListener('click',function(){$$('.chip').forEach(function(x){x.classList.toggle('on',x===b)});C=b.getAttribute('data-chip');filt()})});

/* VIP rotators: one banner at a time, 7s, dots */
$$('[data-rot]').forEach(function(r){
 var ads=$$('.ad',r),dots=$$('.dots button',r),i=0,t;
 function show(k){i=(k+ads.length)%ads.length;ads.forEach(function(a,j){a.classList.toggle('on',j===i)});dots.forEach(function(d,j){d.classList.toggle('on',j===i)});
  var im=$('img[data-src]',ads[i]);if(im){im.src=im.getAttribute('data-src');im.removeAttribute('data-src')}
  var nx=$('img[data-src]',ads[(i+1)%ads.length]);if(nx){nx.src=nx.getAttribute('data-src');nx.removeAttribute('data-src')}}
 function go(){clearInterval(t);t=setInterval(function(){if(!document.hidden)show(i+1)},7000)}
 dots.forEach(function(d,j){d.addEventListener('click',function(){show(j);go()})});
 show(0);go();
});

/* My Plans (this device only) */
var KEY='tvl_proto_plans',P={};
try{P=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){P={}}
function store(){try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}}
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function paint(){
 var ids=Object.keys(P);$('#plansN').textContent=ids.length;
 $$('.sv').forEach(function(b){var on=!!P[b.getAttribute('data-save')];b.setAttribute('aria-pressed',on);$('span',b).textContent=on?'Saved':'Save'});
 var l=$('#drList');
 l.innerHTML=ids.length?ids.map(function(k){var p=P[k];return '<div class="dri"><div><a href="'+esc(p.href)+'">'+esc(p.title)+'</a><small>'+esc(p.where)+'</small></div><button type="button" data-rm="'+esc(k)+'" aria-label="Remove">&times;</button></div>'}).join(''):'<p class="dr-e">Tap Save on anything that looks good. Your plan shows up here, and it stays on this device.</p>';
}
document.addEventListener('click',function(e){
 var b=e.target.closest('.sv');
 if(b){var k=b.getAttribute('data-save');if(P[k]){delete P[k];toast('Removed from My Plans')}else{P[k]={title:b.getAttribute('data-title'),start:b.getAttribute('data-start'),end:b.getAttribute('data-end'),where:b.getAttribute('data-where'),href:b.getAttribute('data-href')};toast('Saved to My Plans')}store();paint();return}
 var r=e.target.closest('[data-rm]');if(r){delete P[r.getAttribute('data-rm')];store();paint();return}
 var c=e.target.closest('.ca');if(c){ics([{title:c.getAttribute('data-title'),start:c.getAttribute('data-start'),end:c.getAttribute('data-end'),where:c.getAttribute('data-where')}]);return}
});
var dr=$('#drawer');
$('#plansBtn').addEventListener('click',function(){dr.hidden=false});
$('#drX').addEventListener('click',function(){dr.hidden=true});
dr.addEventListener('click',function(e){if(e.target===dr)dr.hidden=true});
document.addEventListener('keydown',function(e){if(e.key==='Escape')dr.hidden=true});
$('#calAll').addEventListener('click',function(){var a=Object.keys(P).map(function(k){return P[k]});if(!a.length){toast('Save something first');return}ics(a)});

function z(d){return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}
function ics(items){
 var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Three Village Local//EN'];
 items.forEach(function(it,i){var s=new Date(it.start),e=new Date(it.end||it.start);if(isNaN(s))return;if(isNaN(e)||e<=s)e=new Date(s.getTime()+3600000);
  L.push('BEGIN:VEVENT','UID:tvl-'+Date.now()+'-'+i+'@threevillagelocal.com','DTSTAMP:'+z(new Date()),'DTSTART:'+z(s),'DTEND:'+z(e),'SUMMARY:'+String(it.title||'').replace(/[,;]/g,' '),'LOCATION:'+String(it.where||'').replace(/[,;]/g,' '),'END:VEVENT')});
 L.push('END:VCALENDAR');
 var u=URL.createObjectURL(new Blob([L.join('\r\n')],{type:'text/calendar'})),a=document.createElement('a');a.href=u;a.download='three-village-plans.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);
}
function share(text){
 var url='https://www.threevillagelocal.com/';
 if(navigator.share){navigator.share({title:'Three Village Local',text:text,url:url}).catch(function(){});return}
 try{navigator.clipboard.writeText(text+' '+url);toast('Link copied')}catch(e){toast(url)}
}
function planText(){var a=Object.keys(P).map(function(k){return P[k].title});return a.length?'My Three Village plans: '+a.join(', '):'What is happening in Three Village this week'}
$('#shareSite').addEventListener('click',function(){share('Events, specials, weather and local news for Three Village')});
$('#sharePlan').addEventListener('click',function(){share(planText())});
$('#sharePlan2').addEventListener('click',function(){share(planText())});
paint();
})();
