/* Three Village Events: premium calendar + list for /events-calendar and /events (BD).
   Data: BD's /event-calendar-json (titles, times, links) + #tvl-cal-data (photo, venue, tags, free; written daily by 3vl-site-guard). */
(function(){
if(window.__tvc)return;window.__tvc=1;
/* Start the moment the page content has been read (not after the whole page loads), and ask for the event list right away,
   so BD's plain layout is never shown. Works from the page HEAD or from the block on the page (10/1/2026). */
var H=document.documentElement,ran=false,mo=null;
var FEED=window.__tvlFeed||fetch('/event-calendar-json',{credentials:'same-origin'}).then(function(r){return r.json()});FEED.catch(function(){});   /* the HEAD code may have asked for it already */
function parsed(){var m=document.getElementById('main-content');return document.readyState!=='loading'||!!(m&&m.nextElementSibling)}
function tick(){if(ran||!parsed())return;ran=true;if(mo)mo.disconnect();boot()}
function boot(){
var R=document.getElementById('tvl-cal');if(!R||R.getAttribute('data-ready')){H.classList.add('tvc-done');return}R.setAttribute('data-ready','1');
var META={};try{META=JSON.parse((document.getElementById('tvl-cal-data')||{}).textContent||'{}')}catch(e){}
var TAGS=['Kids & Family','Music','History','Food & Drink','Arts & Stage','Outdoors','Learning'];
var TC={'Kids & Family':'#3aa0e8','Music':'#d9534f','History':'#205081','Food & Drink':'#f0ad4e','Arts & Stage':'#8e5bd6','Outdoors':'#0f866c','Learning':'#006fbb'};
var TI={'Kids & Family':'&#129490;','Music':'&#127925;','History':'&#128373;&#65039;','Food & Drink':'&#127822;','Arts & Stage':'&#127917;','Outdoors':'&#127795;','Learning':'&#128218;'};
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],MONL=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],DOWL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function fnv(s){s=unescape(encodeURIComponent(s));for(var h=0x811c9dc5,i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),0x01000193)>>>0;return ('0000000'+h.toString(16)).slice(-8)}
function sm(u,w){u=String(u||'');if(!u||/\.svg(\?|$)|^data:|wsrv\.nl|google\.com\/s2\/favicons|threevillagelocal-cloud\.github\.io|cdn\.jsdelivr\.net\/gh\/threevillagelocal-cloud\/.*\.webp$/i.test(u))return u;if(u.charAt(0)==='/'&&u.charAt(1)!=='/')u=location.origin+u;
  return /^https?:/i.test(u)?'https://threevillagelocal-cloud.github.io/3vl-share/t/'+fnv(u)+'-'+(w>400?800:360)+'.webp':u}  /* our small WebP copy (3vl-share/t/gen.py makes them every 30 min); some originals are 6 MB */
function bgfix(root){[].forEach.call((root||document).querySelectorAll('[data-bgo]'),function(el){var m=(el.getAttribute('style')||'').match(/url\('([^']+)'\)/);if(!m||m[1]===el.getAttribute('data-bgo'))return;
  var i=new Image();i.onerror=function(){el.style.backgroundImage="url('"+el.getAttribute('data-bgo')+"')"};i.src=m[1]})}  /* background photo whose copy isn't made yet: use the original */
function smi(u,w){var s=sm(u,w),q=function(x){return String(x).replace(/&/g,'&amp;').replace(/"/g,'&quot;')};return s===u?'src="'+q(u)+'"':'src="'+q(s)+'" data-o="'+q(u)+'" onerror="if(this.dataset.o){this.src=this.dataset.o;this.dataset.o=\'\'}"'}  /* <img> attrs; falls back to the original if the copy is missing */
function day(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function key(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function tm(d){var h=d.getHours(),m=d.getMinutes(),a=h>=12?'PM':'AM';h=h%12||12;return h+(m?':'+(m<10?'0':'')+m:'')+' '+a}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function dec(s){var t=document.createElement('textarea');t.innerHTML=s||'';return t.value}
var NOW=new Date(),T0=day(NOW),TM=new Date(T0.getTime()+864e5);
function rel(d){var k=Math.round((day(d)-T0)/864e5);return k===0?'Today':k===1?'Tomorrow':k>1&&k<7?DOWL[d.getDay()]:DOW[d.getDay()]+', '+MON[d.getMonth()]+' '+d.getDate()}
var MODE=R.getAttribute('data-mode')||'month';
var S={tag:'',free:false,view:MODE,month:new Date(T0.getFullYear(),T0.getMonth(),1),sel:T0,shown:36};
var EV=[],BY={};

/* hide BD's plain versions of these pages */
function hideNative(){
  var hideTxt=/^(Upcoming Community Events|Check Out Our Events Calendar|Upcoming Events)$/;
  document.querySelectorAll('h1,h2,h3').forEach(function(h){if(!R.contains(h)&&hideTxt.test((h.textContent||'').trim())){(h.closest('.feature_results_header')||h).style.display='none'}});
  var cal=document.getElementById('calendar');if(cal){var m=cal.closest('.module');(m||cal).style.display='none'}
  ['.post-search-result-count-container','.views','.grid-container','.feature-events .pagination','.content_w_sidebar .pagination-container'].forEach(function(s){document.querySelectorAll(s).forEach(function(el){if(!R.contains(el))el.style.display='none'})});
  var v=document.querySelector('.views');if(v&&v.nextElementSibling&&v.nextElementSibling.tagName==='HR')v.nextElementSibling.style.display='none';
  var f=document.querySelector('form.eventsForm');if(f){var mod=f.closest('.module');if(mod)mod.style.display='none'}
  document.querySelectorAll('.content_w_sidebar ul.pagination').forEach(function(u){u.style.display='none'});
  document.documentElement.classList.add('tvc-on')}

function load(){
  /* the event list is written into the page (#tvl-cal-feed, daily by 3vl-site-guard) so the calendar draws at once;
     BD's live list is still checked and the calendar redraws only if something changed since then */
  var INLINE=null;try{INLINE=JSON.parse((document.getElementById('tvl-cal-feed')||{}).textContent||'null')}catch(e){}
  function sig(l){return l.map(function(x){return x.id+'|'+x.start+'|'+(x.end||'')}).join(',')}
  function build(list){EV=[];BY={};
    list.forEach(function(x){var m=META[x.id]||{},s=new Date(+x.start),e=new Date(+x.end||+x.start);
      var url=String(x.url||'');if(url.indexOf('//')===0)url=location.protocol+url;
      var allday=s.getHours()===0&&s.getMinutes()===0;
      if(e<=s)e=allday?new Date(s.getFullYear(),s.getMonth(),s.getDate(),23,59):new Date(s.getTime()+2*36e5);  /* no end time: assume 2 hours */
      EV.push({id:x.id,title:dec(x.title),url:url,s:s,e:e,allday:allday,img:m.i||'',venue:dec(m.v||''),tags:m.t||[],free:!!m.f})});
    EV.sort(function(a,b){return a.s-b.s});
    EV.forEach(function(ev){var d0=day(ev.s),d1=day(ev.e),span=Math.round((d1-d0)/864e5);if(span<0)span=0;if(span>62)span=62;
      for(var i=0;i<=span;i++){var k=key(new Date(d0.getTime()+i*864e5+3600e3));(BY[k]=BY[k]||[]).push(ev)}});
    hideNative();render()}
  var drawn=false;if(INLINE&&INLINE.length){build(INLINE);drawn=true}
  FEED.then(function(d){var list=d.result||d||[];if(drawn&&sig(list)===sig(INLINE))return;build(list);drawn=true}).catch(function(){if(!drawn){R.innerHTML='';H.classList.add('tvc-done')}})}

function pass(ev){return (!S.tag||ev.tags.indexOf(S.tag)>=0)&&(!S.free||ev.free)}
function evsOn(d){var l=(BY[key(d)]||[]).filter(pass);return key(d)===key(T0)?l.filter(function(ev){return ev.e>=NOW}):l}  /* today: hide events that already ended */
function upcoming(){return EV.filter(function(ev){return ev.e>=NOW}).filter(pass)}   /* gone as soon as it ends */
function multi(ev){return day(ev.e)>day(ev.s)}
function rng(ev){var a=ev.s,b=ev.e;return MON[a.getMonth()]+' '+a.getDate()+' - '+(a.getMonth()===b.getMonth()?'':MON[b.getMonth()]+' ')+b.getDate()}

function hero(){
  var up=EV.filter(function(ev){return day(ev.s)>=T0}),wk=0,fr=0,sat=new Date(T0);sat.setDate(T0.getDate()+((6-T0.getDay()+7)%7));
  var fri=new Date(sat.getTime()-864e5),sun=new Date(sat.getTime()+864e5);
  up.forEach(function(ev){var d=day(ev.s);if(d>=fri&&d<=sun)wk++;if(ev.free)fr++});
  var pics=up.filter(function(ev){return ev.img&&ev.img.indexOf('/events-cal/img/')<0}).slice(0,60),seen={},pp=[];pics.forEach(function(ev){if(!seen[ev.img]&&pp.length<6){seen[ev.img]=1;pp.push(ev.img)}});
  return '<header class="tvc-hero"><div class="tvc-mosaic">'+pp.map(function(u){return '<span style="background-image:url(\''+esc(sm(u,560))+'\')" data-bgo="'+esc(u)+'"></span>'}).join('')+'</div>'+
    '<div class="tvc-hin"><span class="tvc-live"><i></i>LIVE &middot; Updated daily</span>'+
    '<h1 class="tvc-h1">Three Village <em>Events</em></h1>'+
    '<p class="tvc-sub">Everything happening in Stony Brook, Setauket, Port Jefferson and nearby, gathered every morning from local organizers.</p>'+
    '<div class="tvc-stats"><div><b>'+up.length+'</b><span>coming up</span></div><div><b>'+wk+'</b><span>this weekend</span></div><div><b>'+fr+'</b><span>free</span></div></div>'+(MODE==='list'?'<a class="tvc-hbtn" href="/events-calendar">&#128197; View on Calendar &rarr;</a>':'')+'</div></header>'}

function bar(){
  var chip=function(v,l,ic){return '<button type="button" class="tvc-chip'+(S.tag===v?' is-on':'')+'" data-tag="'+esc(v)+'"'+(v?' style="--tc:'+TC[v]+'"':'')+'>'+(ic?'<i>'+ic+'</i>':'')+esc(l)+'</button>'};
  return '<div class="tvc-bar"><div class="tvc-views"><button type="button" data-view="month" class="'+(S.view==='month'?'is-on':'')+'">&#128197; Calendar</button><button type="button" data-view="list" class="'+(S.view==='list'?'is-on':'')+'">&#9776; List</button></div>'+
    '<div class="tvc-chips">'+chip('','All events')+TAGS.map(function(t){return chip(t,t,TI[t])}).join('')+
    '<button type="button" class="tvc-chip tvc-free'+(S.free?' is-on':'')+'" data-free="1"><i>&#127903;&#65039;</i>Free</button></div></div>'}

function thumb(ev,cls){var t=ev.tags[0]||'';
  return ev.img?'<img class="'+cls+'" src="'+esc(sm(ev.img,640))+'" data-o="'+esc(ev.img)+'" alt="" loading="lazy" onerror="if(this.dataset.o&&this.src!==this.dataset.o){this.src=this.dataset.o}else{this.style.display=\'none\'}">':
    '<span class="'+cls+' tvc-noimg" style="--tc:'+(TC[t]||'#205081')+'">'+(TI[t]||'&#11088;')+'</span>'}
function card(ev,i){var d=ev.s,on=day(ev.s)<T0&&ev.e>=NOW;  /* multi-day event that started earlier and is still running */
  return '<a class="tvc-card" href="'+esc(ev.url)+'" style="--i:'+(i%12)+'"><div class="tvc-pic">'+thumb(ev,'tvc-img')+
    (on?'<span class="tvc-date tvc-now"><b>NOW</b>thru '+MON[ev.e.getMonth()]+' '+ev.e.getDate()+'</span>':'<span class="tvc-date"><b>'+d.getDate()+'</b>'+MON[d.getMonth()]+(multi(ev)?'<i class="tvc-thru">thru '+MON[ev.e.getMonth()]+' '+ev.e.getDate()+'</i>':'')+'</span>')+(ev.free?'<span class="tvc-freep">Free</span>':'')+'</div>'+
    '<div class="tvc-cb"><p class="tvc-when">'+(on?'Now through '+esc(DOW[ev.e.getDay()]+', '+MON[ev.e.getMonth()]+' '+ev.e.getDate()):multi(ev)?esc(rng(ev))+(ev.allday?'':' &middot; '+tm(ev.s)):esc(rel(d))+' &middot; '+(ev.allday?'All day':tm(ev.s)+(ev.e>ev.s?' to '+tm(ev.e):'')))+'</p>'+
    '<h3 class="tvc-title">'+esc(ev.title)+'</h3>'+(ev.venue?'<p class="tvc-where">&#128205; '+esc(ev.venue)+'</p>':'')+
    '<div class="tvc-tags">'+ev.tags.map(function(t){return '<span style="--tc:'+TC[t]+'">'+esc(t)+'</span>'}).join('')+'</div><span class="tvc-go">Details &rarr;</span></div></a>'}

function month(){
  var m=S.month,first=new Date(m.getFullYear(),m.getMonth(),1),start=new Date(first);start.setDate(1-first.getDay());
  var h='<div class="tvc-mhead"><button type="button" class="tvc-nav" data-nav="-1" aria-label="Previous month">&#8249;</button><h2 class="tvc-mt">'+MONL[m.getMonth()]+' <span>'+m.getFullYear()+'</span></h2><button type="button" class="tvc-nav" data-nav="1" aria-label="Next month">&#8250;</button><button type="button" class="tvc-today" data-nav="0">Today</button></div>';
  h+='<div class="tvc-grid"><div class="tvc-dow">'+DOW.map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><div class="tvc-cells">';
  var cur=m.getFullYear()===T0.getFullYear()&&m.getMonth()===T0.getMonth(),skip=0;
  if(cur){while(skip<35&&new Date(start.getFullYear(),start.getMonth(),start.getDate()+skip+6)<T0)skip+=7}   /* this month: drop weeks that are already over */
  for(var i=skip;i<42;i++){var d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);if(i%7===0&&i>=28&&d.getMonth()!==m.getMonth())break;
    var l=evsOn(d),out=d.getMonth()!==m.getMonth(),past=d<T0,cls='tvc-cell'+(out?' is-out':'')+(past?' is-past':'')+(key(d)===key(T0)?' is-today':'')+(key(d)===key(S.sel)?' is-sel':'')+(d.getDay()%6===0?' is-wknd':'')+(l.length?' has-ev':'');
    h+='<button type="button" class="'+cls+'" data-day="'+d.getTime()+'"><span class="tvc-dn">'+d.getDate()+'</span>';
    if(l.length){h+='<span class="tvc-evs">'+l.slice(0,3).map(function(ev){return '<span class="tvc-ev" style="--tc:'+(TC[ev.tags[0]]||'#205081')+'"><i>'+(ev.allday?'':tm(ev.s).replace(':00','').replace(' ','').toLowerCase())+'</i>'+esc(ev.title)+'</span>'}).join('')+
      (l.length>3?'<span class="tvc-more">+'+(l.length-3)+' more</span>':'')+'</span><span class="tvc-cnt">'+l.length+'</span>'}
    h+='</button>'}
  h+='</div></div>';
  var dl=evsOn(S.sel);
  h+='<div class="tvc-daypanel" id="tvc-day"><div class="tvc-dayh"><h2>'+esc(rel(S.sel)==='Today'||rel(S.sel)==='Tomorrow'?rel(S.sel)+', '+MONL[S.sel.getMonth()]+' '+S.sel.getDate():DOWL[S.sel.getDay()]+', '+MONL[S.sel.getMonth()]+' '+S.sel.getDate())+'</h2><span>'+dl.length+' event'+(dl.length===1?'':'s')+'</span></div>'+
    (dl.length?'<div class="tvc-cards">'+dl.map(card).join('')+'</div>':'<p class="tvc-empty">Nothing listed'+(S.tag||S.free?' for this filter':'')+' on this day yet. Try another day or <button type="button" class="tvc-link" data-view="list">see the full list</button>.</p>')+'</div>';
  return h}

function list(){
  var l=upcoming(),out='',cur='',n=0;
  if(!l.length)return '<p class="tvc-empty">No upcoming events match this filter yet.</p>';
  l.slice(0,S.shown).forEach(function(ev,i){var dd=day(ev.s)<T0?T0:ev.s,k=key(dd);if(k!==cur){if(cur)out+='</div>';cur=k;   /* ongoing events roll forward into Today */
      out+='<div class="tvc-lday"><h2 class="tvc-lh"><b>'+esc(rel(dd).split(',')[0])+'</b><span>'+DOWL[dd.getDay()]+', '+MONL[dd.getMonth()]+' '+dd.getDate()+'</span></h2></div><div class="tvc-cards tvc-lcards">'}
    out+=card(ev,n++)});
  out+='</div>';
  if(l.length>S.shown)out+='<div class="tvc-moreb"><button type="button" class="tvc-loadmore">Show more events <span>('+(l.length-S.shown)+' more)</span></button></div>';
  return out}

function render(){
  R.innerHTML='<section class="tvc">'+hero()+bar()+'<div class="tvc-body">'+(S.view==='month'?month():list())+'</div>'+
    '<p class="tvc-foot">Listings come from local organizers, including the Emma S. Clark Library, the Long Island Museum, Stony Brook Village, WMHO, both Chambers of Commerce, the Village of Port Jefferson and the Town of Brookhaven. Plans change, so check with the organizer before you go. <a href="/about/contact">Tell us about an event &rarr;</a></p></section>';
  reveal();bgfix(R)}
function reveal(){if(!('IntersectionObserver' in window)){R.querySelectorAll('.tvc-card').forEach(function(c){c.classList.add('is-in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -5% 0px'});
  R.querySelectorAll('.tvc-card').forEach(function(c){io.observe(c)})}

R.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!R.contains(b))return;
  if(b.hasAttribute('data-tag')){S.tag=b.getAttribute('data-tag');S.shown=36;render();return}
  if(b.hasAttribute('data-free')){S.free=!S.free;S.shown=36;render();return}
  if(b.hasAttribute('data-view')){S.view=b.getAttribute('data-view');render();R.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(b.hasAttribute('data-nav')){var n=+b.getAttribute('data-nav');S.month=n?new Date(S.month.getFullYear(),S.month.getMonth()+n,1):new Date(T0.getFullYear(),T0.getMonth(),1);if(!n)S.sel=T0;render();return}
  if(b.hasAttribute('data-day')){S.sel=new Date(+b.getAttribute('data-day'));if(S.sel.getMonth()!==S.month.getMonth())S.month=new Date(S.sel.getFullYear(),S.sel.getMonth(),1);render();
    var p=document.getElementById('tvc-day');if(p&&window.innerWidth<900)p.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(b.classList.contains('tvc-loadmore')){S.shown+=36;render();return}});

load();
/* BD's own scripts un-hide a few of its controls when the page finishes; hide them again */
function again(){if(H.classList.contains('tvc-on'))hideNative()}
document.addEventListener('DOMContentLoaded',again);window.addEventListener('load',again);
}
tick();if(!ran){mo=new MutationObserver(tick);mo.observe(H,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',tick)}
})();
