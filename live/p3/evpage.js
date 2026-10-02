/* Three Village Local: event detail pages (/events/<slug>) in the premium look, plus the "next step" block
   on event pages and blog posts. Live since 10/2/2026: loaded from the HEAD code ("3VL instant design" block) on /events/<slug> and /blog/<slug>;
   BD's own event layout stays hidden (html.tvl-we) until this has drawn. Publish with site/publish_live.py.
   Rebuilds BD's event template in place: one photo, one set of facts, one row of actions. Starts as soon as
   #post-content has been read (same pattern as p3.js). */
(function(){
if(window.__tvlEv)return;
var path=location.pathname.replace(/\/+$/,'');
var isEvent=/^\/events\/[^\/]+$/.test(path),isPost=/^\/blog\/[^\/]+$/.test(path);
if(!isEvent&&!isPost)return;
var H=document.documentElement,BASE='https://threevillagelocal-cloud.github.io/3vl-share/live/p3/';
/* the styles ride along with this file; the new layout is shown only once they are in (or after 2.5s) */
var cssOK=false,cssWait=[];
(function(){var l=document.createElement('link');l.rel='stylesheet';l.href=BASE+'evpage.css';
  function done(){if(cssOK)return;cssOK=true;cssWait.forEach(function(f){f()});cssWait=[]}
  l.onload=done;l.onerror=done;setTimeout(done,2500);(document.head||H).appendChild(l)})();
function whenCss(f){if(cssOK)f();else cssWait.push(f)}
var FEED='https://raw.githubusercontent.com/threevillagelocal-cloud/3vl-assets/master/weekender/live/events.json';
function $(s,r){return (r||document).querySelector(s)}function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fnv(s){s=unescape(encodeURIComponent(s));for(var h=0x811c9dc5,i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),0x01000193)>>>0;return ('0000000'+h.toString(16)).slice(-8)}
function sm(u,w){u=String(u||'');if(!u||/\.svg(\?|$)|^data:|threevillagelocal-cloud\.github\.io|cdn\.jsdelivr\.net\/gh\/threevillagelocal-cloud\/.*\.webp$/i.test(u))return u;if(u.charAt(0)==='/'&&u.charAt(1)!=='/')u=location.origin+u;
  return /^https?:/i.test(u)?'https://threevillagelocal-cloud.github.io/3vl-share/t/'+fnv(u)+'-'+(w>400?800:360)+'.webp':u}
window.__tvlEvImg=function(im){if(im.dataset.o&&im.src!==im.dataset.o){im.src=im.dataset.o}else{im.style.display='none'}};
var SHARE="<svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14\"/></svg>";
var DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MON=['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];
function pd(iso){var m=String(iso||'').match(/(\d{4})-(\d\d)-(\d\d)(?:T(\d\d):(\d\d))?/);return m?new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)):null}
function tm(d){var h=d.getHours(),mi=d.getMinutes();return ((h%12)||12)+(mi?':'+(mi<10?'0':'')+mi:'')+(h<12?' AM':' PM')}
function day(d){return DOW[d.getDay()]+', '+MON[d.getMonth()]+' '+d.getDate()}
function when(s,e,allday){if(!s)return '';var same=!e||(s.toDateString()===e.toDateString());
  var noTime=allday||(s.getHours()===0&&s.getMinutes()===0&&(!e||e.getHours()===23||(e.getHours()===0&&e.getMinutes()===0)));
  if(!same)return day(s)+' to '+day(e);
  return day(s)+(noTime?'':' · '+tm(s)+(e&&e>s?' to '+tm(e):''))}

/* ---------- next step block (events + blog posts) ---------- */
function nextBlock(host,opts){
  if(!host||$('#ev-next'))return;
  var sec=document.createElement('section');sec.id='ev-next';sec.className='ev-next';
  sec.innerHTML='<p class="ev-kick">'+esc(opts.kick)+'</p><h2>'+esc(opts.title)+'</h2><div class="ev-cards" id="ev-cards"></div>'+
    '<div class="ev-links"><a href="/events-calendar" data-ev="calendar">Full calendar <span>&rarr;</span></a><a href="/categories" data-ev="business">Find a local business <span>&rarr;</span></a><a href="/app" data-ev="app">Get the free app <span>&rarr;</span></a></div>';
  host.appendChild(sec);
  sec.addEventListener('click',function(ev){var a=ev.target.closest('a');if(a)try{if(window.gtag)window.gtag('event','next_step_click',{target:a.getAttribute('data-ev')||'event',from:isEvent?'event':'post'})}catch(e){}});
  fetch(FEED+'?v='+Math.floor(Date.now()/9e5)).then(function(r){return r.json()}).then(function(d){
    var now=Date.now(),here=location.origin+path,seen={};
    var list=(d.events||[]).filter(function(e){var en=pd(e.end||e.start);return e.img&&e.status!=='cancelled'&&en&&en.getTime()>now&&(e.page||e.url)&&String(e.page||'').replace(/\/+$/,'')!==here&&e.title!==opts.skip});
    list.sort(function(a,b){var A=pd(a.start).getTime(),B=pd(b.start).getTime(),ra=A<now,rb=B<now;return ra!==rb?(ra?1:-1):(ra?pd(a.end)-pd(b.end):A-B)});   /* coming up first, then what is already running */
    list=list.filter(function(e){var k=e.title.toLowerCase().slice(0,28);if(seen[k])return false;seen[k]=1;return true}).slice(0,3);
    if(!list.length){$('#ev-cards').style.display='none';return}
    $('#ev-cards').innerHTML=list.map(function(e){var s=pd(e.start),en=pd(e.end),run=s.getTime()<now,u=e.page||e.url,own=u.indexOf(location.origin)===0;
      return '<a class="ev-card" href="'+esc(u)+'"'+(own?'':' target="_blank" rel="noopener"')+'><span class="ev-cimg"><img src="'+esc(sm(e.img,360))+'" data-o="'+esc(e.img)+'" onerror="__tvlEvImg(this)" alt="" loading="lazy"></span>'+
        '<span class="ev-cb"><span class="ev-cdate">'+esc(run?'Now through '+MON[en.getMonth()]+' '+en.getDate():when(s,en,e.allday))+'</span><b>'+esc(e.title)+'</b><small>'+esc(e.venue||'')+'</small></span></a>'}).join('')
  }).catch(function(){var c=$('#ev-cards');if(c)c.style.display='none'});
}

/* ---------- event page ---------- */
function buildEvent(){
  var pc=$('#post-content'),body=$('.feature-events .post-detail-body');if(!pc||!body)return false;
  var desc=$('.the-post-description',pc);if(!desc)return false;
  if(document.readyState==='loading'&&!$('.post-detail-sidebar'))return false;   /* wait until the whole event body has been read */
  window.__tvlEv=1;
  var h1=$('h1',pc),head=h1&&h1.parentNode,venueB=head&&$('b',head),addrS=head&&$('span.font-sm',head);
  var cal=$('.add-to-calendar-widget',body),ev={};try{ev=JSON.parse(cal.getAttribute('data-event'))}catch(e){}
  var s=pd(ev.startDateISO),e=pd(ev.endDateISO),past=(e||s)&&(e||s).getTime()<Date.now();
  var more=$('a.btn-primary.btn-lg',pc),bdImg=$('.alert-secondary img',pc),first=desc.firstElementChild,ownImg=first&&first.tagName==='P'&&$('img',first);
  var photo=(ownImg&&ownImg.getAttribute('src'))||(bdImg&&bdImg.getAttribute('src'))||'';
  var venue=venueB?venueB.textContent.trim():'',addr=addrS?addrS.textContent.trim():(ev.location||'');
  var title=h1?h1.textContent.trim():(ev.title||'');
  var hero=document.createElement('header');hero.className='ev-hero'+(photo?'':' ev-noimg');
  hero.innerHTML=(photo?'<img class="ev-himg" src="'+esc(sm(photo,800))+'" data-o="'+esc(photo)+'" onerror="__tvlEvImg(this)" alt="'+esc(title)+'" fetchpriority="high">':'')+'<div class="ev-shade"></div>'+
    '<div class="ev-hin"><span class="ev-chip'+(past?' ev-past':'')+'">'+esc(past?'This event has passed':when(s,e))+'</span><div class="ev-h1"></div>'+
    (venue||addr?'<p class="ev-venue"><i class="fa fa-map-marker"></i> '+(venue?'<b>'+esc(venue)+'</b>':'')+(addr&&!(venue&&addr.indexOf(venue)===0)?' <span>'+esc(addr)+'</span>':'')+'</p>':'')+'</div>';
  /* flyers and posters (square or tall artwork, usually full of text) are shown whole with the title underneath, not cropped behind it */
  var him=$('.ev-himg',hero);if(him){var fit=function(){if(him.naturalWidth&&him.naturalHeight/him.naturalWidth>0.9)hero.classList.add('ev-split')};him.addEventListener('load',fit);if(him.complete)fit()}
  if(h1){h1.className='';$('.ev-h1',hero).appendChild(h1)}else $('.ev-h1',hero).innerHTML='<h1>'+esc(title)+'</h1>';
  var act=document.createElement('div');act.className='ev-actions';
  var dir=addr||ev.location?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent((venue?venue+', ':'')+(addr||ev.location)):'';
  act.innerHTML=(more&&!past?'<a class="ev-btn ev-primary" href="'+esc(more.getAttribute('href'))+'" target="_blank" rel="noopener" data-ev="details">Details &amp; registration <span>&rarr;</span></a>':'')+
    '<span class="ev-cal"></span>'+(dir?'<a class="ev-btn" href="'+esc(dir)+'" target="_blank" rel="noopener" data-ev="directions"><i class="fa fa-map-marker"></i> Directions</a>':'')+
    '<button type="button" class="ev-btn" id="ev-share">'+SHARE+' Share</button>';
  if(cal&&!past)$('.ev-cal',act).appendChild(cal);
  /* our own generated content: the photo moves to the top, the pill button to the action row */
  if(ownImg)first.parentNode.removeChild(first);
  var facts=$('div[style*="border-left:5px"]',desc);if(facts){facts.removeAttribute('style');facts.className='ev-facts';$$('p',facts).forEach(function(p){p.removeAttribute('style')})}
  $$('a[style*="border-radius:999px"]',desc).forEach(function(a){var p=a.parentNode;if(p&&p.tagName==='P'&&p.children.length===1)p.parentNode.removeChild(p)});
  var card=document.createElement('div');card.className='ev-body';card.appendChild(desc);
  var root=document.createElement('div');root.id='ev';root.appendChild(hero);root.appendChild(act);root.appendChild(card);
  body.insertBefore(root,body.firstChild);
  $$('.posted-by-snippet',body).forEach(function(x){x.style.display='none'});pc.style.display='none';
  act.addEventListener('click',function(x){var a=x.target.closest('[data-ev]');if(a)try{if(window.gtag)window.gtag('event','event_page_click',{action:a.getAttribute('data-ev')})}catch(e){}});
  $('#ev-share',act).addEventListener('click',function(){var b=this,u=location.origin+path;
    if(navigator.share){navigator.share({title:title,url:u}).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){b.textContent='Link copied';setTimeout(function(){b.innerHTML=SHARE+' Share'},2200)})}});
  nextBlock(root,{kick:'Keep exploring',title:'More happening in Three Village',skip:title});
  whenCss(function(){H.classList.add('ev-on')});
  return true;
}
function buildPost(){
  var pc=$('#post-content');if(!pc)return false;
  if(document.readyState==='loading')return false;   /* the post body must be complete before the block goes under it */
  window.__tvlEv=1;
  nextBlock(pc,{kick:'While you are here',title:"What's happening in Three Village",skip:''});
  return true;
}
var ran=false,mo=null;
function tick(){if(ran)return;if(isEvent?buildEvent():buildPost()){ran=true;if(mo)mo.disconnect()}}
tick();
if(!ran){mo=new MutationObserver(tick);mo.observe(H,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',function(){tick();if(!ran&&isEvent)H.classList.add('ev-on')})}
})();
