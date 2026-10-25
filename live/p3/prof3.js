/* 3VL VIP profile v3 ("epic" layout). Called by prof2.js when live/p3/vip/<uid>.json has "layout":"v3".
   Every section is optional and only renders when the JSON has data for it. Brand colors and fonts come from d.theme. */
(function(){
if(window.__pv3)return;window.__pv3=1;
var col=document.querySelector('.member_profile>.col-md-9');if(!col)return;
var ud=document.querySelector('.member-profile-header .userData'),uid=ud?ud.getAttribute('data-userid'):'';if(!uid)return;
var me=document.currentScript||document.querySelector('script[src*="prof3.js"]');
var BASE=me?me.src.replace(/prof3\.js.*$/,''):'https://threevillagelocal-cloud.github.io/3vl-share/live/p3/';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function track(a){try{if(window.gtag)gtag('event','vip_profile_click',{action:a,business_id:uid,version:'v3'})}catch(e){}}
var P={call:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
 msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
 apply:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>',
 card:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c.8-1.8 2-2.6 3.5-2.6s2.7.8 3.5 2.6M15 10h3M15 13h3"/>',
 map:'<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
 mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
 web:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>',
 cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 ig:'<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1"/>',
 li:'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>',
 fb:'<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'};
function ic(n){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(P[n]||P.web)+'</svg>'}
function ext(u){return /^https?:/.test(u||'')&&u.indexOf(location.host)<0?' target="_blank" rel="noopener"':''}
function src(x){return /^(https?:)?\/\//.test(x)?x:BASE+'vip/'+x}
var DAYS=['sun','mon','tue','wed','thu','fri','sat'],DN={sun:'Sunday',mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday',sat:'Saturday'};
function t12(s){var h=+s.slice(0,2),m=s.slice(3);return (h%12||12)+(m==='00'?'':':'+m)+(h<12?' AM':' PM')}
function nowET(){var p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});return {d:DAYS.indexOf(p.weekday.toLowerCase().slice(0,3)),m:(+p.hour%24)*60+(+p.minute)}}
function openState(h){if(!h)return null;var n=nowET(),t=h[DAYS[n.d]];function mm(s){return +s.slice(0,2)*60+(+s.slice(3))}
  if(t==='24h')return {on:true,txt:'Open 24 hours'};if(t&&n.m>=mm(t[0])&&n.m<mm(t[1]))return {on:true,txt:'Open now · til '+t12(t[1])};
  for(var i=0;i<8;i++){var dd=(n.d+i)%7,x=h[DAYS[dd]];if(!x)continue;if(x==='24h')x=['00:00','24:00'];if(i===0&&n.m<mm(x[0]))return {on:false,txt:'Opens today '+t12(x[0])};if(i>0)return {on:false,txt:'Opens '+(i===1?'tomorrow':DN[DAYS[dd]].slice(0,3))+' '+t12(x[0])}}return {on:false,txt:'Closed'}}

/* prof.js already started this download (window.__pvData, 10/24/2026); fetch only if it did not */
(window.__pvData||fetch(BASE+'vip/'+uid+'.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null})).then(function(d){if(d)render(d)}).catch(function(){});

function render(d){
  var T=d.theme||{},slug=location.pathname.replace(/^\/|\/$/g,''),tel=(d.phone||'').replace(/\D/g,'').slice(-10),telF='('+tel.slice(0,3)+') '+tel.slice(3,6)+'-'+tel.slice(6)+(d.phone_ext?' ext. '+d.phone_ext:''),
      telH='tel:+1'+tel+(d.phone_ext?','+d.phone_ext:''),contact=d.contact_url||('/'+slug+'/connect'),review='/'+slug+'/writeareview',
      dir='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(d.maps||d.address||d.name),st=openState(d.hours),h='';
  if(T.fonts){var fl=document.createElement('link');fl.rel='stylesheet';fl.href=T.fonts;document.head.appendChild(fl)}
  /* hero (the name is a div styled as before: BD's own server-rendered h1 stays the page's only H1, 10/24/2026) */
  h+='<section class="h'+(d.hero.banner?' bn':'')+'"><img class="bg" src="'+src(d.hero.img)+'" alt="'+esc(d.hero.alt)+'" style="object-position:'+(d.hero.pos||'50% 50%')+'" fetchpriority="high">'+
     '<div class="top"><span class="tier'+(d.tier==='vip'?'':' feat')+'">'+(d.tier==='vip'?'&#9733; VIP MEMBER':'FEATURED')+'</span>'+
     (d.verified!==false?'<span class="pill"><svg viewBox="0 0 24 24"><path d="M12 1l3 2.4 3.8-.3.9 3.7 3.3 2-1.5 3.5 1.5 3.5-3.3 2-.9 3.7-3.8-.3L12 23l-3-2.4-3.8.3-.9-3.7-3.3-2L2.5 12 1 8.5l3.3-2 .9-3.7 3.8.3z"/><path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>Verified</span>':'')+
     (st?'<span class="pill open'+(st.on?' on':'')+'"><i></i>'+esc(st.txt)+'</span>':'')+
     (d.pills||[]).map(function(p){return '<span class="pill">'+esc(p)+'</span>'}).join('')+'</div>'+
     (d.hero.banner?'</section>':'')+
     '<div class="hin'+(d.hero.banner?' hb':'')+'">'+(d.headshot?'<div class="head"><img src="'+src(d.headshot)+'" alt="'+esc(d.headshot_alt||d.name)+'"></div>':d.logo&&!d.logo_hero?'<div class="head logo"><img src="'+src(d.logo)+'" alt="'+esc(d.name)+' logo"></div>':'')+
     '<div>'+(d.kicker?'<div class="k">'+esc(d.kicker)+'</div>':'')+'<div class="h1" role="heading" aria-level="1">'+esc(d.short||d.name)+'</div>'+(d.sub?'<div class="sub">'+esc(d.sub)+'</div>':'')+
     /* social icons in the top section (owner 10/24/2026) */
     ((d.facebook||d.instagram||d.linkedin||d.youtube||d.tiktok||d.website)?'<div class="soc">'+
       (d.facebook?'<a class="s-fb" data-a="facebook" href="'+esc(d.facebook)+'" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M15.1 12.6h-2.2V20h-3v-7.4H8.4V10h1.5V8.4c0-2 .9-3.2 3.3-3.2h2v2.6h-1.3c-.9 0-1 .3-1 1V10h2.3z"/></svg></a>':'')+
       (d.instagram?'<a class="s-ig" data-a="instagram" href="https://www.instagram.com/'+esc(d.instagram)+'/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="#fff" stroke-width="2"/><circle cx="16.7" cy="7.3" r="1.2"/></svg></a>':'')+
       (d.linkedin?'<a class="s-li" data-a="linkedin" href="'+esc(d.linkedin)+'" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M6.5 9.5h2.8V18H6.5zM7.9 5.3a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM11 9.5h2.7v1.2c.4-.7 1.3-1.4 2.7-1.4 2.9 0 3.4 1.9 3.4 4.3V18h-2.8v-3.9c0-.9 0-2.1-1.3-2.1s-1.5 1-1.5 2V18H11z"/></svg></a>':'')+
       (d.youtube?'<a class="s-yt" data-a="youtube" href="'+esc(d.youtube)+'" target="_blank" rel="noopener" aria-label="YouTube"><svg viewBox="0 0 24 24"><path d="M10 8.8v6.4l5.6-3.2z"/></svg></a>':'')+
       (d.tiktok?'<a class="s-tt" data-a="tiktok" href="'+esc(d.tiktok)+'" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="M14 4h2.4c.2 1.7 1.3 3 3 3.2v2.4c-1.1 0-2.1-.3-3-.9v5.6a4.6 4.6 0 1 1-4.6-4.6h.5v2.5h-.5a2.1 2.1 0 1 0 2.2 2.1z"/></svg></a>':'')+
       (d.website?'<a class="s-web" data-a="website" href="'+esc(d.website)+'" target="_blank" rel="noopener" aria-label="Website">'+ic('web')+'</a>':'')+'</div>':'')+
     (((d.logo_hero&&!d.hero.banner)||d.rating)?'<div class="co">'+(d.logo_hero&&!d.hero.banner?'<img src="'+src(d.logo_hero)+'" alt="'+esc(d.brand||d.name)+'">':'')+
       (d.rating?'<a class="gstar" data-a="google_reviews" href="'+esc(d.rating.url)+'" target="_blank" rel="noopener"><i>&#9733;&#9733;&#9733;&#9733;&#9733;</i>'+esc(d.rating.text)+'</a>':'')+'</div>':'')+
     '</div></div>'+(d.hero.banner?'':'</section>');
  /* action tiles */
  var A=d.actions||[{t:'Call',i:'call',u:telH,a:'call',pri:1},{t:'Contact',i:'msg',u:contact,a:'contact'},{t:'Directions',i:'map',u:dir,a:'directions'},{t:'Website',i:'web',u:d.website,a:'website'}];
  A=A.filter(function(x){return x.u||x.i==='card'});
  h+='<div class="acts up'+(A.length===3?' n3':'')+'">'+A.map(function(x){return '<a class="act'+(x.pri?' pri':'')+'" data-a="'+esc(x.a||x.i)+'" href="'+esc(x.i==='card'?'#':x.u)+'"'+(x.i==='card'?' data-vcard="1" download="'+esc(slug)+'.vcf"':ext(x.u))+'>'+ic(x.i)+esc(x.t)+'</a>'}).join('')+'</div>';
  /* contact strip */
  var C='';if(tel)C+='<a data-a="call" href="'+telH+'">'+ic('call')+'<span><small>'+esc(d.phone_label||'Phone')+'</small>'+telF+'</span></a>';
  if(d.email)C+='<a data-a="email" href="mailto:'+esc(d.email)+'">'+ic('mail')+'<span><small>Email</small>'+esc(d.email)+'</span></a>';
  if(d.address)C+='<a data-a="directions" href="'+dir+'" target="_blank" rel="noopener">'+ic('map')+'<span><small>'+esc(d.address_label||'Address')+'</small>'+esc(d.address)+'</span></a>';
  if(d.contact_cta)C+='<a class="inq" data-a="contact" href="'+esc(contact)+'"'+ext(contact)+'><span><small>'+esc(d.contact_cta.k)+'</small>'+esc(d.contact_cta.t)+' &rarr;</span></a>';
  if(C)h+='<div class="cs up">'+C+'</div>';
  if(d.ticker)h+='<div class="tk up"><div class="tr">'+(function(x){return x+x})(d.ticker.map(function(t){return '<span>'+esc(t)+'</span>'}).join(''))+'</div></div>';
  function H2(t){return '<h2 class="h2">'+esc(t).replace(/\*(.+?)\*/g,'<em>$1</em>')+'</h2>'}
  function K(t){return t?'<div class="kick">'+esc(t)+'</div>':''}
  /* intro */
  if(d.intro)h+='<section class="s up"><div class="intro'+(d.intro.quote?'':' one')+'"><div>'+K(d.intro.k)+H2(d.intro.t)+'<p class="lead">'+esc(d.intro.text)+'</p></div>'+
     (d.intro.quote?'<div class="q"><p>'+esc(d.intro.quote)+'</p><b>'+esc(d.intro.by||'')+'</b></div>':'')+'</div></section>';
  /* gallery */
  var G=d.gallery||[];
  if(G.length)h+='<section class="s up">'+K(d.gallery_k||'Take a look')+H2(d.gallery_t||'Inside *'+(d.short||d.name)+'*')+'<div class="rail">'+G.map(function(g,i){return '<div class="gi" role="button" tabindex="0" data-i="'+i+'"><img src="'+src(g.img)+'" loading="lazy" decoding="async" alt="'+esc(g.alt)+'"></div>'}).join('')+'</div></section>';
  /* goal tabs */
  if(d.goals)h+='<section class="s up">'+K(d.goals.k)+H2(d.goals.t)+'<div class="tabs" role="tablist">'+d.goals.items.map(function(g,i){return '<div class="tab" role="tab" tabindex="0" data-g="'+i+'" aria-selected="'+(i===0)+'">'+esc(g.t)+'</div>'}).join('')+'</div><div class="gp"></div></section>';
  /* services */
  if(d.services)h+='<section class="s up">'+K(d.services_k||'What they do')+H2(d.services_t||'Services')+'<div class="svcs">'+d.services.map(function(s){return '<div class="svc"><b>'+esc(s.t)+'</b><p>'+esc(s.d)+'</p></div>'}).join('')+'</div></section>';
  /* advantage + stats */
  if(d.advantage)h+='<section class="s up"><div class="adv"><div>'+K(d.advantage.k)+H2(d.advantage.t)+'<p class="lead">'+esc(d.advantage.text)+'</p>'+
     (d.advantage.logos?'<div class="logos">'+d.advantage.logos.map(function(l){return '<img src="'+src(l.img)+'" alt="'+esc(l.alt)+'" loading="lazy">'}).join('')+'</div>':'')+'</div>'+
     (d.stats?'<div class="st">'+d.stats.map(function(s){return '<div><b'+(s.count?' data-n="'+s.count+'"':'')+'>'+esc(s.n)+'</b><span>'+esc(s.l)+'</span></div>'}).join('')+'</div>':'')+'</div></section>';
  /* hours */
  if(d.hours){var today=DAYS[nowET().d];h+='<section class="s up">'+K(d.hours_k||'Hours')+H2(d.hours_t||'When to *visit*')+'<div class="hrs">'+['mon','tue','wed','thu','fri','sat','sun'].map(function(k){var x=d.hours[k];return '<div'+(k===today?' class="today"':'')+'><span>'+DN[k]+'</span><span>'+(x==='24h'?'Open 24 hours':x?t12(x[0])+' - '+t12(x[1]):'Closed')+'</span></div>'}).join('')+'</div></section>'}
  /* instagram */
  if(d.instagram&&d.feed&&d.feed.length)h+='<section class="s up">'+K('Live on Instagram')+H2('@'+d.instagram)+'<div class="ig">'+d.feed.slice(0,9).map(function(f){return '<a data-a="ig_post" target="_blank" rel="noopener" href="'+esc(f.link)+'"><img src="'+src(f.img+'-400.webp')+'" loading="lazy" alt="Instagram post from @'+esc(d.instagram)+'"></a>'}).join('')+'</div><div class="row"><a class="b b1" data-a="instagram" target="_blank" rel="noopener" href="https://www.instagram.com/'+esc(d.instagram)+'/">Follow on Instagram</a></div></section>';
  /* reviews */
  if(d.reviews)h+='<section class="s rv up" id="pv3rv"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>'+H2(d.reviews.t)+'<p class="lead">'+esc(d.reviews.text)+'</p><div class="rvl" id="pv3rvl"></div><div class="row">'+
     (d.reviews.url?'<a class="b bg2" data-a="google_reviews" href="'+esc(d.reviews.url)+'" target="_blank" rel="noopener">'+esc(d.reviews.btn||'Read Google reviews')+'</a>':'')+
     '<a class="b b2" data-a="review" href="'+review+'">Review '+esc(d.first||d.short||'them')+' on 3VL</a></div></section>';
  /* faq */
  if(d.faq)h+='<section class="s up">'+K(d.faq_k||'Questions neighbors ask')+H2(d.faq_t||'*FAQ*')+d.faq.map(function(f){return '<details><summary>'+esc(f[0])+'</summary><p>'+esc(f[1])+'</p></details>'}).join('')+'</section>';
  /* final cta */
  if(d.final)h+='<section class="s fin up">'+K(d.final.k)+H2(d.final.t)+'<p class="lead">'+esc(d.final.text)+'</p><div class="row">'+
     (tel?'<a class="b bg2" data-a="call" href="'+telH+'">Call '+telF+'</a>':'')+'<a class="b b2" data-a="contact" href="'+esc(contact)+'"'+ext(contact)+'>'+esc(d.final.btn||'Contact')+'</a></div></section>';
  if(d.compliance)h+='<p class="comp">'+esc(d.compliance)+(d.compliance_logo?'<img src="'+src(d.compliance_logo)+'" alt="Equal Housing Opportunity" loading="lazy">':'')+'</p>';

  var box=document.createElement('div');box.id='pv3';box.innerHTML=h;

  /* real 3VL reviews (owner 10/24/2026: "show reviews in these new profile designs"); reviews.json is rebuilt from BD */
  fetch(BASE+'vip/reviews.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(R){var v=R&&R[uid],el=box.querySelector('#pv3rvl'),top=box.querySelector('.h .top');
    /* star rating badge next to the VIP/Verified pills: links to the reviews, or to "write a review" when there are none yet */
    if(top){var a=document.createElement('a');a.className='pill rate';a.setAttribute('data-a','reviews_badge');
      if(v&&v.items&&v.items.length){a.href=box.querySelector('#pv3rv')?'#pv3rv':review;a.innerHTML='<span class="rst">&#9733;&#9733;&#9733;&#9733;&#9733;</span><b>'+v.avg.toFixed(1)+'</b>&nbsp;('+v.count+' review'+(v.count>1?'s':'')+')'}
      else{a.href=review;a.innerHTML='<span class="rst">&#9734;&#9734;&#9734;&#9734;&#9734;</span>Be the first to review'}
      top.appendChild(a)}
    if(!v||!v.items||!v.items.length||!el)return;
    var st=function(n){var o='';for(var i=0;i<5;i++)o+=i<Math.round(n)?'&#9733;':'&#9734;';return o};
    var mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],dt=function(x){var a=(x||'').split('-');return a.length===3?mo[+a[1]-1]+' '+a[0]:''};
    el.innerHTML='<div class="rvs"><b>'+v.avg.toFixed(1)+'</b><span class="stars">'+st(v.avg)+'</span><i>'+v.count+' review'+(v.count>1?'s':'')+' on Three Village Local</i></div><div class="rvc">'+
      v.items.slice(0,3).map(function(x){var t=x.x.length>280?x.x.slice(0,277).replace(/ [^ ]*$/,'')+'...':x.x;return '<div class="rvi"><div class="rs">'+st(x.r)+'</div>'+(x.t&&x.x.indexOf(x.t.replace(/\.\.\.$/,''))!==0?'<b>'+esc(x.t)+'</b>':'')+'<p>'+esc(t)+'</p><span>'+esc(x.n)+(dt(x.d)?' &middot; '+dt(x.d):'')+'</span>'+(x.reply?'<em>Reply: '+esc(x.reply)+'</em>':'')+'</div>'}).join('')+'</div>';
    var h2=box.querySelector('.rv .h2');if(h2)h2.textContent='What neighbors say'}).catch(function(){});
  var V={navy:'--navy',navy2:'--navy2',blue:'--blue',sky:'--sky',gold:'--gold',ink:'--ink',soft:'--soft',line:'--line',onblue:'--onblue',hf:'--hf',hw:'--hw',hcase:'--hcase',hls:'--hls',bf:'--bf',h1s:'--h1s',h2s:'--h2s',h1m:'--h1m',h2m:'--h2m'},css='';
  for(var k in V)if(T[k])css+=V[k]+':'+T[k]+';';box.style.cssText=css;
  col.insertBefore(box,col.firstChild);document.documentElement.classList.add('pv3-on','pv2-on');/* pv2-on here, not earlier: the old layout keeps its space until now, so the right column never jumps (10/24/2026) */
  /* sidebar */
  var side=document.querySelector('.member_profile .sidebar-section');
  if(side){var sd=document.createElement('div');sd.id='pv3s';sd.style.cssText=css;
    sd.innerHTML='<div class="c"><div class="who"><img'+(d.headshot?'':' class="lg"')+' src="'+src(d.headshot||d.logo)+'" alt=""><div><b>'+esc(d.side_name||d.short||d.name)+'</b><span>'+esc(d.side_sub||d.category||'')+'</span></div></div>'+
      (tel?'<a class="b b1" data-a="call" href="'+telH+'">Call '+telF+'</a>':'')+
      '<a class="b b2" data-a="contact" href="'+esc(contact)+'"'+ext(contact)+'>'+esc(d.side_contact||'Contact')+'</a>'+
      (d.side_extra?'<a class="b b2" data-a="'+esc(d.side_extra.a||'extra')+'" href="'+esc(d.side_extra.u)+'"'+ext(d.side_extra.u)+'>'+esc(d.side_extra.t)+'</a>':'')+'</div>'+
      '<div class="c"><h4>'+esc(d.address_label||'Find them')+'</h4>'+
      (d.address?'<div class="li">'+ic('map')+'<a data-a="directions" href="'+dir+'" target="_blank" rel="noopener">'+esc(d.address)+'</a></div>':'')+
      (d.email?'<div class="li">'+ic('mail')+'<a data-a="email" href="mailto:'+esc(d.email)+'">'+esc(d.email)+'</a></div>':'')+
      (d.website?'<div class="li">'+ic('web')+'<a data-a="website" href="'+esc(d.website)+'" target="_blank" rel="noopener">'+esc(d.website.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,''))+'</a></div>':'')+
      (d.instagram?'<div class="li">'+ic('ig')+'<a data-a="instagram" href="https://www.instagram.com/'+esc(d.instagram)+'/" target="_blank" rel="noopener">@'+esc(d.instagram)+'</a></div>':'')+
      (d.facebook?'<div class="li">'+ic('fb')+'<a data-a="facebook" href="'+esc(d.facebook)+'" target="_blank" rel="noopener">Facebook</a></div>':'')+
      (d.linkedin?'<div class="li">'+ic('li')+'<a data-a="linkedin" href="'+esc(d.linkedin)+'" target="_blank" rel="noopener">LinkedIn</a></div>':'')+'</div>';
    /* Facebook feed in the right column, like BD had it (owner 10/24/2026); BD's own box is desktop-only and loads late, so it is hidden */
    if(d.facebook&&/facebook\.com\//.test(d.facebook)&&d.fb_feed!==false){
      var fbc=document.createElement('div');fbc.className='c fbc';fbc.innerHTML='<div class="fbh"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M15.1 12.6h-2.2V20h-3v-7.4H8.4V10h1.5V8.4c0-2 .9-3.2 3.3-3.2h2v2.6h-1.3c-.9 0-1 .3-1 1V10h2.3z"/></svg><b>Facebook</b><a data-a="facebook" href="'+esc(d.facebook)+'" target="_blank" rel="noopener">Follow</a></div><div class="fb-lazy" data-href="'+esc(d.facebook)+'" data-tabs="timeline" data-show-posts="true" data-width="320" data-height="480" data-small-header="true" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="false"></div>';
      sd.appendChild(fbc);
      /* BD's own box is renamed so the Facebook script skips it, and ours only becomes a .fb-page when it is near the screen
         (on phones the right column is far down: ~600 KB of Facebook files no longer load up front, 10/24/2026) */
      Array.prototype.forEach.call(side.querySelectorAll('.fb-page'),function(x){if(!fbc.contains(x)){var m=x.closest('.module')||x.parentNode;m.style.display='none';x.className='fb-page-off'}});
      var fbgo=function(){var z=fbc.querySelector('.fb-lazy');if(z)z.className='fb-page';
      var fbn=0,fbt=setInterval(function(){fbn++;
        if(window.FB&&FB.XFBML&&!fbc.getAttribute('data-p')){fbc.setAttribute('data-p','1');FB.XFBML.parse(fbc)}
        else if(fbn===4&&!window.FB&&!document.querySelector('script[src*="connect.facebook.net/en_US/sdk.js"]')){if(!document.getElementById('fb-root')){var fr=document.createElement('div');fr.id='fb-root';document.body.appendChild(fr)}var sc=document.createElement('script');sc.async=true;sc.src='https://connect.facebook.net/en_US/sdk.js#version=v24.0&xfbml=1';document.head.appendChild(sc)}
        if(fbn>60){clearInterval(fbt);var fi=fbc.querySelector('iframe');if(!fi||fi.offsetHeight<60)fbc.style.display='none'}},250)}}
    side.insertBefore(sd,side.firstChild);
    if(fbc){if('IntersectionObserver' in window){var fio=new IntersectionObserver(function(es){if(es.some(function(x){return x.isIntersecting})){fio.disconnect();fbgo()}},{rootMargin:'700px 0px'});fio.observe(fbc)}else fbgo()}}
  /* sticky phone bar */
  var sb=document.createElement('div');sb.className='pv3-sticky';sb.style.cssText=css;
  sb.innerHTML=(tel?'<a class="p" data-a="call" href="'+telH+'">Call</a>':'')+'<a data-a="contact" href="'+esc(contact)+'"'+ext(contact)+'>'+esc(d.sticky_contact||'Contact')+'</a>'+(d.sticky_extra?'<a data-a="'+esc(d.sticky_extra.a||'extra')+'" href="'+esc(d.sticky_extra.u)+'"'+ext(d.sticky_extra.u)+'>'+esc(d.sticky_extra.t)+'</a>':'<a data-a="directions" href="'+dir+'" target="_blank" rel="noopener">Directions</a>');
  document.body.appendChild(sb);
  /* vCard */
  [].forEach.call(box.querySelectorAll('[data-vcard]'),function(a){var v='BEGIN:VCARD\r\nVERSION:3.0\r\nN:'+(d.vcard&&d.vcard.n||d.name)+'\r\nFN:'+(d.vcard&&d.vcard.fn||d.name)+'\r\n'+(d.vcard&&d.vcard.org?'ORG:'+d.vcard.org+'\r\n':'')+(d.vcard&&d.vcard.title?'TITLE:'+d.vcard.title+'\r\n':'')+
    (tel?'TEL;TYPE=WORK:+1-'+tel.slice(0,3)+'-'+tel.slice(3,6)+'-'+tel.slice(6)+(d.phone_ext?' ext. '+d.phone_ext:'')+'\r\n':'')+(d.email?'EMAIL;TYPE=WORK:'+d.email+'\r\n':'')+'URL:'+location.origin+'/'+slug+'\r\nNOTE:Found on Three Village Local\r\nEND:VCARD\r\n';a.href='data:text/vcard;charset=utf-8,'+encodeURIComponent(v)});
  /* goal tabs */
  var gp=box.querySelector('.gp');
  function showG(i){var g=d.goals.items[i],u=g.u||contact;gp.innerHTML='<div class="pn"><div><h3>'+esc(g.h)+'</h3><p>'+esc(g.d)+'</p><ul>'+g.b.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div><div class="sc"><div><small>'+esc(d.goals.chips_k||'Ask about')+'</small><div class="chips">'+(g.c||[]).map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+'</div></div><a class="b b1" data-a="goal_'+i+'" href="'+esc(u)+'"'+ext(u)+'>'+esc(g.cta||'Ask about '+g.t.toLowerCase())+'</a></div></div>';
    [].forEach.call(box.querySelectorAll('.tab'),function(t){t.setAttribute('aria-selected',String(+t.getAttribute('data-g')===i))})}
  if(gp){showG(0);box.addEventListener('click',function(e){var t=e.target.closest('.tab');if(t){showG(+t.getAttribute('data-g'));track('tab')}});
    box.addEventListener('keydown',function(e){var t=e.target.closest('.tab');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showG(+t.getAttribute('data-g'))}})}
  /* gallery lightbox */
  var lb=null,cur=0;function sh(i){cur=(i+G.length)%G.length;lb.querySelector('img').src=src(G[cur].big||G[cur].img);lb.querySelector('img').alt=G[cur].alt}
  function op(i){if(!lb){lb=document.createElement('div');lb.className='pv3-lb';lb.innerHTML='<img alt=""><div role="button" class="x" aria-label="Close">&times;</div><div role="button" class="p" aria-label="Previous">&lsaquo;</div><div role="button" class="n" aria-label="Next">&rsaquo;</div>';document.body.appendChild(lb);
    lb.addEventListener('click',function(e){var c=e.target.classList;if(c.contains('n'))sh(cur+1);else if(c.contains('p'))sh(cur-1);else if(e.target===lb||c.contains('x'))cl()});
    document.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')cl();if(e.key==='ArrowRight')sh(cur+1);if(e.key==='ArrowLeft')sh(cur-1)})}
    sh(i);lb.style.display='flex';requestAnimationFrame(function(){lb.classList.add('on')});track('gallery_open')}
  function cl(){lb.classList.remove('on');setTimeout(function(){lb.style.display='none'},250)}
  box.addEventListener('click',function(e){var g=e.target.closest('.gi');if(g)op(+g.getAttribute('data-i'))});
  /* clicks */
  document.addEventListener('click',function(e){var a=e.target.closest('#pv3 [data-a], #pv3s [data-a], .pv3-sticky [data-a]');if(a)track(a.getAttribute('data-a'))});
  /* reveal, counters, sticky */
  box.classList.add('ready');var ups=[].slice.call(box.querySelectorAll('.up')),hero=box.querySelector('.h'),fin=box.querySelector('.fin'),busy=false;
  if(/[?&]shot/.test(location.search)){ups.forEach(function(u){u.classList.add('in')});ups=[];[].forEach.call(document.querySelectorAll('#pv3 img[loading=lazy]'),function(i){i.loading='eager'});sb.style.display='none'}
  function cnt(el){var n=+el.getAttribute('data-n'),s0=performance.now();(function f(t){var q=Math.min(1,(t-s0)/1200);el.textContent=Math.round(n*(1-Math.pow(1-q,3)))+(q===1?'+':'');if(q<1)requestAnimationFrame(f)})(s0)}
  function chk(){busy=false;var lim=innerHeight*.9;ups=ups.filter(function(u){if(u.getBoundingClientRect().top<lim){u.classList.add('in');[].forEach.call(u.querySelectorAll('[data-n]'),cnt);return false}return true});
    sb.classList.toggle('on',hero.getBoundingClientRect().bottom<0&&(!fin||fin.getBoundingClientRect().top>innerHeight))}
  addEventListener('scroll',function(){if(!busy){busy=true;requestAnimationFrame(chk)}},{passive:true});setInterval(chk,800);chk();
}
})();
