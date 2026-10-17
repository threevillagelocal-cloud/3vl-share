/* 3VL premium business profile v2 (prototype). Loaded by prof.js only with ?v=2 for now.
   Data: live/p3/vip/<user_id>.json (photos pre-graded and compressed as webp, lazy-loaded below the hero). */
(function(){
if(window.__pv2)return;window.__pv2=1;
var col=document.querySelector('.member_profile>.col-md-9');if(!col)return;
var ud=document.querySelector('.member-profile-header .userData'),uid=ud?ud.getAttribute('data-userid'):'';if(!uid)return;
var me=document.currentScript||document.querySelector('script[src*="prof2.js"]');
var BASE=me?me.src.replace(/prof2\.js.*$/,''):'https://threevillagelocal-cloud.github.io/3vl-share/live/p3/';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function track(a){try{if(window.gtag)gtag('event','vip_profile_click',{action:a,business_id:uid,version:'v2'})}catch(e){}}
var SVG={call:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
 msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
 map:'<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
 web:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>',
 ig:'<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1"/>'};
function ic(n){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+SVG[n]+'</svg>'}
var DAYS=['sun','mon','tue','wed','thu','fri','sat'],DN={sun:'Sunday',mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday',sat:'Saturday'};
function t12(s){var h=+s.slice(0,2),m=s.slice(3);return (h%12||12)+(m==='00'?'':':'+m)+(h<12?' AM':' PM')}
function nowET(){var p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});
  return {d:DAYS.indexOf(p.weekday.toLowerCase().slice(0,3)),m:(+p.hour%24)*60+(+p.minute)}}
function openState(h){if(!h)return null;var n=nowET(),k=DAYS[n.d],t=h[k];function mm(s){return +s.slice(0,2)*60+(+s.slice(3))}
  if(t&&n.m>=mm(t[0])&&n.m<mm(t[1]))return {on:true,txt:'Open now · til '+t12(t[1])};
  for(var i=0;i<8;i++){var dd=(n.d+i)%7,x=h[DAYS[dd]];if(!x)continue;if(i===0&&n.m<mm(x[0]))return {on:false,txt:'Opens today '+t12(x[0])};if(i>0)return {on:false,txt:'Opens '+(i===1?'tomorrow':DN[DAYS[dd]].slice(0,3))+' '+t12(x[0])}}
  return {on:false,txt:'Closed'}}

fetch(BASE+'vip/'+uid+'.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(d){if(d)render(d)}).catch(function(){});

function render(d){
  var T=d.theme||{},slug=location.pathname.replace(/^\/|\/$/g,''),tel=(d.phone||'').replace(/\D/g,'').slice(-10),
      telF=tel.slice(0,3)+'-'+tel.slice(3,6)+'-'+tel.slice(6),quote='/'+slug+'/connect',review='/'+slug+'/writeareview',
      dir='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(d.maps||d.name),st=openState(d.hours);
  function img(base,ws,sizes,alt,lazy){var w=ws||[800,1600];return '<img src="'+BASE+'vip/'+base+'-'+w[0]+'.webp" srcset="'+w.map(function(x){return BASE+'vip/'+base+'-'+x+'.webp '+x+'w'}).join(', ')+'" sizes="'+sizes+'" alt="'+esc(alt)+'"'+(lazy?' loading="lazy" decoding="async"':' fetchpriority="high"')+'>'}
  var h='';
  h+='<section class="pv-hero">'+img(d.hero.img,[900,1600],'(max-width:760px) 100vw, 850px',d.hero.alt,false).replace('<img ','<img style="object-position:'+(d.hero.pos||'50% 50%')+'" ')+
     '<div class="pv-top"><span class="pv-tier">'+(d.tier==='vip'?'&#9733; VIP MEMBER':'FEATURED')+'</span>'+(st?'<span class="pv-open'+(st.on?' on':'')+'"><i></i>'+esc(st.txt)+'</span>':'')+'</div>'+
     '<div class="pv-hin"><div class="pv-id">'+(d.logo?'<div class="pv-logo"><img src="'+esc(d.logo)+'" alt="'+esc(d.name)+' logo"></div>':'')+
     '<div><h1>'+esc(d.short||d.name)+'</h1><div class="pv-meta">'+esc(d.category)+' &middot; '+esc(d.town)+'</div></div></div>'+
     (d.tagline?'<p class="pv-tag">'+esc(d.tagline)+'</p>':'')+'</div></section>';
  h+='<div class="pv-acts pv-up">'+
     '<a class="pv-act pri" data-a="call" href="tel:'+tel+'">'+ic('call')+'Call</a>'+
     '<a class="pv-act" data-a="quote" href="'+quote+'">'+ic('msg')+'Get a quote</a>'+
     '<a class="pv-act" data-a="directions" target="_blank" rel="noopener" href="'+dir+'">'+ic('map')+'Directions</a>'+
     (d.website?'<a class="pv-act" data-a="website" target="_blank" rel="noopener" href="'+esc(d.website)+'">'+ic('web')+'Website</a>':'')+'</div>';
  if(d.facts&&d.facts.length)h+='<div class="pv-facts pv-up">'+d.facts.map(function(f){return '<span>'+esc(f)+'</span>'}).join('')+'</div>';
  if(d.intro)h+='<p class="pv-intro pv-up">'+esc(d.intro)+'</p>';
  var SOC='';if(d.instagram&&d.feed&&d.feed.length)SOC='<section class="pv-sec pv-up"><h2 class="pv-h">Follow along on social</h2><div class="pv-ig"><div class="pv-igh"><span class="ic">'+ic('ig')+'</span><div><b>@'+esc(d.instagram)+'</b><span>Their latest posts</span></div>'+
     '<a data-a="instagram" target="_blank" rel="noopener" href="https://www.instagram.com/'+esc(d.instagram)+'/">Follow</a></div><div class="pv-igg">'+
     d.feed.slice(0,9).map(function(f){return '<a data-a="ig_post" target="_blank" rel="noopener" href="'+esc(f.link)+'"><img src="'+BASE+'vip/'+f.img+'-400.webp" loading="lazy" decoding="async" alt="Instagram post from @'+esc(d.instagram)+'"></a>'}).join('')+'</div>'+
     '<div class="pv-socb"><a class="ig" data-a="instagram" target="_blank" rel="noopener" href="https://www.instagram.com/'+esc(d.instagram)+'/">'+ic('ig')+'Instagram</a>'+(d.facebook?'<a class="fb" data-a="facebook" target="_blank" rel="noopener" href="'+esc(d.facebook)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>Facebook</a>':'')+'</div></div></section>';
  h+=SOC;
  if(d.services)h+='<section class="pv-sec pv-up"><h2 class="pv-h">What they do</h2><div class="pv-svcs">'+d.services.map(function(s){return '<div class="pv-svc"><b>'+esc(s.t)+'</b><p>'+esc(s.d)+'</p></div>'}).join('')+'</div></section>';
  if(d.gallery&&d.gallery.length)h+='<section class="pv-sec pv-up"><h2 class="pv-h">Recent work <span class="pv-count">Swipe &rarr;</span></h2><div class="pv-rail">'+
     d.gallery.map(function(g,i){return '<button type="button" data-i="'+i+'" aria-label="Open photo: '+esc(g.alt)+'">'+img(g.img,[g.w[0]],'(max-width:760px) 78vw, 420px',g.alt,true)+'</button>'}).join('')+'</div></section>';
  if(d.why)h+='<section class="pv-sec pv-up"><h2 class="pv-h">Why neighbors choose them</h2><div class="pv-why">'+d.why.map(function(w,i){return '<div class="pv-w"><em>0'+(i+1)+'</em><b>'+esc(w.t)+'</b><p>'+esc(w.d)+'</p></div>'}).join('')+'</div></section>';
  if(d.hours){var today=DAYS[nowET().d];h+='<section class="pv-sec pv-two pv-up"><div class="pv-card pv-hrs"><h2 class="pv-h">Hours</h2>'+
     ['mon','tue','wed','thu','fri','sat','sun'].map(function(k){var x=d.hours[k];return '<div'+(k===today?' class="today"':'')+'><span>'+DN[k]+'</span><span>'+(x?t12(x[0])+' - '+t12(x[1]):'Closed')+'</span></div>'}).join('')+'</div>'+
     '<div class="pv-card pv-rev"><h2 class="pv-h">Reviews</h2><p>Worked with '+esc(d.short||d.name)+'? Your review helps neighbors choose with confidence.</p>'+
     '<a class="pv-btn pri" data-a="review" href="'+review+'">Write a review</a>'+
     '<a class="pv-btn" data-a="google_reviews" target="_blank" rel="noopener" href="https://www.google.com/search?q='+encodeURIComponent(d.name+' reviews')+'">See Google reviews</a></div></section>'}
  if(d.cta)h+='<section class="pv-cta pv-up"><h2>'+esc(d.cta.title)+'</h2><p>'+esc(d.cta.text)+'</p><div class="row"><a class="a1" data-a="quote" href="'+quote+'">Get a quote</a><a class="a2" data-a="call" href="tel:'+tel+'">Call '+telF+'</a></div></section>';
  var box=document.createElement('div');box.id='pv2';box.innerHTML=h;
  box.style.cssText='--ac:'+(T.accent||'#f2c94c')+';--ink:'+(T.ink||'#13233a')+';--deep:'+(T.deep||'#141c26')+';--ac2:'+(T.accent2||'#2f8a4c');
  col.insertBefore(box,col.firstChild);document.documentElement.classList.add('pv2-on');
  var sb=document.createElement('div');sb.className='pv-sticky';sb.style.setProperty('--pv-ac',T.accent||'#f2c94c');
  sb.innerHTML='<a class="pri" data-a="call" href="tel:'+tel+'">Call</a><a data-a="quote" href="'+quote+'">Quote</a><a data-a="directions" target="_blank" rel="noopener" href="'+dir+'">Directions</a>';document.body.appendChild(sb);
  /* clicks */
  document.addEventListener('click',function(e){var a=e.target.closest('#pv2 [data-a], .pv-sticky [data-a]');if(a)track(a.getAttribute('data-a'))});
  /* gallery lightbox */
  var G=d.gallery||[],lb=null,cur=0;
  function show(i){cur=(i+G.length)%G.length;var g=G[cur];lb.querySelector('img').src=BASE+'vip/'+g.img+'-'+g.w[g.w.length-1]+'.webp';lb.querySelector('img').alt=g.alt}
  function open(i){if(!lb){lb=document.createElement('div');lb.className='pv-lb';lb.innerHTML='<img alt=""><button class="x" aria-label="Close">&times;</button><button class="p" aria-label="Previous">&lsaquo;</button><button class="n" aria-label="Next">&rsaquo;</button>';document.body.appendChild(lb);
    lb.addEventListener('click',function(e){if(e.target.classList.contains('n'))show(cur+1);else if(e.target.classList.contains('p'))show(cur-1);else if(e.target===lb||e.target.classList.contains('x'))close()});
    document.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')close();if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)})}
    show(i);lb.style.display='flex';requestAnimationFrame(function(){lb.classList.add('on')});track('gallery_open')}
  function close(){lb.classList.remove('on');setTimeout(function(){lb.style.display='none'},250)}
  box.addEventListener('click',function(e){var b=e.target.closest('.pv-rail button');if(b)open(+b.getAttribute('data-i'))});
  /* reveal on scroll + sticky bar */
  box.classList.add('pv-ready');var ups=[].slice.call(box.querySelectorAll('.pv-up')),hero=box.querySelector('.pv-hero'),busy=false;
  function chk(){busy=false;var lim=innerHeight*.92;ups=ups.filter(function(u){if(u.getBoundingClientRect().top<lim){u.classList.add('in');return false}return true});
    var hb=hero.getBoundingClientRect().bottom,cb=box.querySelector('.pv-cta');var cv=cb&&cb.getBoundingClientRect().top<innerHeight;sb.classList.toggle('on',hb<0&&!cv)}
  addEventListener('scroll',function(){if(!busy){busy=true;requestAnimationFrame(chk)}},{passive:true});setInterval(chk,800);chk();
}
})();
