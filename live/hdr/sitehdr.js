/* 3VL sitewide header + footer (10/24/2026): the homepage's header (white top bar, navy menu, category quick links) and footer on every BD page.
   Loaded by p3.js (3vl-share live/hdr/sitehdr.js). PREVIEW ONLY until switched on: runs when the page URL has ?hdr=1 (sets a test cookie;
   ?hdr=0 clears it) or SITEWIDE=true in p3.js. Menu links are read from BD's own menu on the page, so they always match the admin menu.
   BD's header/footer stay hidden only once ours is drawn (sitehdr.css: 6 s fallback). Not used on the homepage (it draws its own). */
(function(){
'use strict';
if(window.__tvlsh)return;window.__tvlsh=1;
var H=document.documentElement,SITE='https://www.threevillagelocal.com',LIVE='https://threevillagelocal-cloud.github.io/3vl-share/live/';
if(document.getElementById('wk-top')&&document.querySelector('#wk-top.wk-y'))return;
H.classList.add('tvl-sh');
try{var u=navigator.userAgent||'';if(!/FBAN|FBAV|FB_IAB|Instagram/.test(u)&&((/iPhone|iPad|iPod/.test(u)&&!/Safari/.test(u))||(/Android/.test(u)&&u.indexOf('; wv)')>-1)))document.documentElement.classList.add('tvl-inapp');}catch(e){}
function esc(x){return String(x||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function track(n,p){try{if(window.gtag)window.gtag('event',n,p||{})}catch(e){}}
var IC={search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
 star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
 menu:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
 mail:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/></svg>'};
var CATS=[['Restaurants','/restaurant','<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 0-3 2-3 6s1 4 3 4v8"/>'],
 ['Home Services','/home-services','<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>'],
 ['Contractors','/contractor','<path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/>'],
 ['Health & Wellness','/health-wellness','<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'],
 ['Real Estate','/real-estate-services','<path d="M4 20V9l8-5 8 5v11z"/><path d="M9 13h6M9 16h6"/>'],
 ['Attorneys','/attorney','<path d="M12 4v16M5 20h14M6 8h12M6 8l-3 6a3 3 0 0 0 6 0zM18 8l-3 6a3 3 0 0 0 6 0z"/>'],
 ['Beauty','/beauty-personal-care','<path d="M6 4l8 8M14 4l-8 8"/><circle cx="6" cy="17" r="3"/><circle cx="16" cy="17" r="3"/>'],
 ['Financial','/financial-services','<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>'],
 ['All categories','/categories','<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>']];
var STD=['/this-weekend','/events','/events-calendar'];
var DEF=[['Home','/',[]],['Find a Local Business','/categories',[]],['Things to Do','/events',[['This Weekend','/this-weekend'],['All Events','/events'],['Events Calendar','/events-calendar']]],['Three Village Local Blog','/blog',[]],['Get the Mobile App','/app',[]]];
/* stylesheet first (preloaded alongside this file) */
(function(){var l=document.createElement('link');l.rel='stylesheet';l.href=LIVE+'hdr/sitehdr.css';(document.head||H).appendChild(l)})();

function clean(t){t=String(t||'').replace(/[^\u0000-↏]/g,'').replace(/\s+/g,' ').trim();if(/^local stories$/i.test(t))return 'Three Village Local Blog';if(/^get the app$/i.test(t))return 'Get the Mobile App';return t}
function path(u){try{var x=new URL(u,location.href);return x.origin===location.origin?x.pathname.replace(/\/+$/,'')||'/':u}catch(e){return u}}
function menu(){var ul=document.querySelector('.mobile-main-menu .sidebar-nav');if(!ul)return DEF;var out=[];
  [].forEach.call(ul.children,function(li){var a=li.querySelector(':scope>a');if(!a)return;var kids=[].map.call(li.querySelectorAll(':scope>ul>li>a'),function(k){return [clean(k.textContent),k.getAttribute('href')]});
    out.push([clean(a.textContent),a.getAttribute('href'),kids])});return out.length>2?out:DEF}
function acct(){/* BD's own header links tell us if a member is logged in */
  var hd=document.querySelector('body>.header'),r={login:true,links:[]};if(!hd)return r;
  [].forEach.call(hd.querySelectorAll('a[href]'),function(a){var h=a.getAttribute('href')||'',t=clean(a.textContent);
    if(/\/logout/.test(h)){r.login=false;r.links.push(['Logout',h])}else if(/\/account(\/|$)/.test(h)&&t){r.login=false;r.links.unshift([t.length>18?'My Account':t,h])}});return r}
function plans(){var n=0;try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^wkSaved_/.test(k)){var v=JSON.parse(localStorage.getItem(k)||'[]');if(v.length>n)n=v.length}}}catch(e){}return n}
function abs(u){return /^https?:/.test(u)?u:SITE+(u.charAt(0)==='/'?u:'/'+u)}

function header(){
  var cur=path(location.href),mn=menu(),hl='',links=mn.map(function(m,i){var t=m[0],u=m[1],kids=m[2]||[];
    if(kids.length){var sp=kids.filter(function(k){return STD.indexOf(path(abs(k[1])))<0})[0];if(sp)hl='<a class="yh-hl" href="'+esc(abs(sp[1]))+'">'+esc(sp[0])+'</a>';
      return '<span class="yh-dd"><a href="'+esc(abs(u))+'"'+(cur===path(abs(u))?' class="on"':'')+'>'+esc(t)+'</a><span class="yh-ddm">'+kids.map(function(k){return '<a href="'+esc(abs(k[1]))+'">'+esc(k[0])+'</a>'}).join('')+'</span></span>'}
    var on=cur===path(abs(u)),app=/\/app$/.test(path(abs(u)));return '<a href="'+esc(abs(u))+'"'+((on||app)?' class="'+(on?'on':'')+(app?' yh-applink':'')+'"':'')+'>'+esc(t)+'</a>'}).join('');
  var ac=acct(),n=plans();
  var right=(ac.login?'<a class="yh-tl" href="'+SITE+'/about/contact">Contact</a><a class="yh-tl" href="'+SITE+'/login">Login</a>':
      ac.links.map(function(l){return '<a class="yh-tl yh-acct" href="'+esc(abs(l[1]))+'">'+esc(l[0])+'</a>'}).join(''));
  var mob=ac.login?'<a class="yh-mob" href="'+SITE+'/about/contact">Contact</a><a class="yh-mob" href="'+SITE+'/login">Login</a>':ac.links.map(function(l){return '<a class="yh-mob" href="'+esc(abs(l[1]))+'">'+esc(l[0])+'</a>'}).join('');
  var cats=CATS.map(function(c){return '<a class="yh-q" href="'+SITE+c[1]+'"><span class="yh-qi"><svg viewBox="0 0 24 24" aria-hidden="true">'+c[2]+'</svg></span><span>'+esc(c[0])+'</span></a>'}).join('');
  var d=document.createElement('div');d.id='tvl-sh';
  d.innerHTML='<header class="yh"><div class="yh-in"><a class="yh-logo" href="'+SITE+'/" aria-label="Three Village Local home"><img src="'+LIVE+'hdr/logo-540.webp" width="167" height="52" alt="Three Village Local"></a>'+
    '<form class="yh-srch" action="/search_results" method="get" role="search"><span class="yh-si">'+IC.search+'</span><input type="search" name="q" placeholder="Search local businesses" aria-label="Search local businesses" autocomplete="off"><button type="submit">Search</button></form>'+
    '<div class="yh-r"><a class="yh-gr" href="https://maps.google.com/?cid=15405294417866042762" target="_blank" rel="noopener" aria-label="Rated 5.0 on Google"><b>5.0</b><span class="yh-grs">&#9733;&#9733;&#9733;&#9733;&#9733;</span><em>Google</em></a>'+right+
    '<a class="yh-plans" href="'+SITE+'/?plans=1" aria-label="My Plans">'+IC.star+'<span>My Plans</span><b>'+n+'</b></a>'+
    '<a class="yh-join" href="'+SITE+'/join">Businesses - Join Today</a><button type="button" class="yh-mnu" aria-label="Menu" aria-expanded="false">'+IC.menu+'</button></div></div>'+
    '<nav class="yh-mn" aria-label="Main menu"><div class="yh-mnin">'+links+'<span class="yh-sp"></span>'+hl+mob+'<a class="yh-mob yh-mobj" href="'+SITE+'/join">Businesses - Join Today</a></div></nav>'+
    '<div class="yh-ql"><div class="yh-qlin">'+cats+'</div></div></header>';
  return d}

function wire(d){
  var b=d.querySelector('.yh-mnu'),nav=d.querySelector('.yh-mn');b.addEventListener('click',function(){var o=nav.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false')});
  d.addEventListener('click',function(e){var a=e.target.closest('a');if(a)track('sitehdr_click',{link:(a.textContent||a.getAttribute('aria-label')||'').trim().slice(0,40),page:location.pathname})});
  /* smart search dropdown: the same engine as everywhere else (window.tvlSS from p3.js) */
  var f=d.querySelector('.yh-srch'),inp=f.querySelector('input'),box=document.createElement('div'),items=[],sel=-1,tm=0;box.className='yh-ssbox';box.hidden=true;f.appendChild(box);
  function SS(){return window.tvlSS}
  function hl(n,q){var e=esc(n),w=esc(q);var i=e.toLowerCase().indexOf(w.toLowerCase());return !w||i<0?e:e.slice(0,i)+'<b>'+e.slice(i,i+w.length)+'</b>'+e.slice(i+w.length)}
  function render(){var q=inp.value.trim();if(q.length<2||!SS()){box.hidden=true;return}
    SS().load().then(function(){var res=SS().search(q)||[];items=res;sel=-1;var h='<p class="yh-ssh">Best matches in Three Village</p>';if(!res.length)h+='<p class="yh-ssn">No quick match. Press Enter to search everything.</p>';
      res.slice(0,8).forEach(function(x,i){var m=x.r.m,meta=[m.c,String(m.t||'').replace(/^(East\s+)?Setauket.*$/i,'Setauket')].filter(Boolean).join(' · ');
        h+='<a class="yh-ssr" href="'+esc(m.u)+'" data-i="'+i+'">'+(m.l?'<span class="yh-ssl" style="background-image:url(\''+esc(m.l)+'\')"></span>':'<span class="yh-ssl"></span>')+'<span class="yh-sst"><span>'+hl(m.n,q)+'</span><small>'+esc(meta)+'</small></span>'+(m.p==='vip'?'<em>VIP</em>':'')+'</a>'});
      h+='<a class="yh-ssall" href="/search_results?q='+encodeURIComponent(q)+'">See all results for &ldquo;'+esc(q)+'&rdquo; &rarr;</a>';box.innerHTML=h;box.hidden=false})}
  inp.addEventListener('focus',function(){if(SS())SS().load()});
  inp.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(render,90)});
  inp.addEventListener('keydown',function(e){var rows=box.querySelectorAll('a.yh-ssr');if(box.hidden||!rows.length)return;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length;[].forEach.call(rows,function(r,i){r.classList.toggle('on',i===sel)})}
    else if(e.key==='Enter'&&sel>-1){e.preventDefault();location.href=rows[sel].href}else if(e.key==='Escape')box.hidden=true});
  box.addEventListener('click',function(e){var a=e.target.closest('a.yh-ssr');if(a)track('smart_search_click',{search_term:inp.value.trim(),where:'sitehdr'})});
  document.addEventListener('click',function(e){if(!f.contains(e.target))box.hidden=true});
  f.addEventListener('submit',function(e){var q=inp.value.trim();if(!q){e.preventDefault();inp.focus();return}track('smart_search_submit',{search_term:q,where:'sitehdr'})});
  var q=new URLSearchParams(location.search).get('q');if(q&&/search_results/.test(location.pathname))inp.value=q;
}

function footer(){var fb='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8z"/></svg>',ig='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/></svg>';
  var d=document.createElement('div');d.id='tvl-sf';var S=SITE;
  d.innerHTML='<footer class="yf"><div class="yf-in"><div class="yf-a"><img src="'+LIVE+'hdr/logo-white.webp" width="149" height="50" alt="Three Village Local" loading="lazy"><p>Three Village Local is the free local guide to Setauket, Stony Brook, Port Jefferson and the Three Village area. Find trusted local businesses, this week&rsquo;s events, restaurant specials and community news, all in one place, and support the neighbors who make our community special.</p></div>'+
    '<div class="yf-c"><b>Website</b><a href="'+S+'/about">How It Works</a><a href="'+S+'/about/contact">Contact Us</a><a href="'+S+'/newsletter">Three Village Weekly</a></div>'+
    '<div class="yf-c"><b>Search</b><a href="'+S+'/search_results">Browse Directory</a><a href="'+S+'/categories">Search by Category</a></div>'+
    '<div class="yf-c"><b>Support</b><a href="'+S+'/login">Member Login</a><a href="'+S+'/login/retrieval">Reset Password</a></div></div>'+
    '<div class="yf-in yf-2"><span class="yf-soc"><a href="'+S+'/about/contact" aria-label="Email">'+IC.mail+'</a><a href="https://www.facebook.com/ThreeVillageLocal" aria-label="Facebook" target="_blank" rel="noopener">'+fb+'</a><a href="https://www.instagram.com/threevillagelocal/" aria-label="Instagram" target="_blank" rel="noopener">'+ig+'</a></span><a class="yf-join" href="'+S+'/join">Businesses - Join Today</a></div>'+
    '<p class="yf-copy">&copy; 2026 Three Village Local. All Rights Reserved. <a href="'+S+'/about/terms">Terms of Use</a> <a href="'+S+'/about/privacy">Privacy Policy</a></p></footer>';return d}

/* draw as soon as BD's header has been read (its menu + login links are in it), before the page content paints */
var drawn=false,fdone=false;
function ready(){var m=document.getElementById('main-content');return document.readyState!=='loading'||!!m}
function tryDraw(){if(drawn||!document.body||!ready())return;drawn=true;
  try{var d=header();document.body.insertBefore(d,document.body.firstChild);wire(d);H.classList.add('tvl-sh-on')}catch(e){H.classList.remove('tvl-sh')}}
function tryFoot(){if(fdone)return;var bf=document.querySelector('body>.footer');if(!bf&&document.readyState==='loading')return;fdone=true;
  try{var f=footer();if(bf)bf.parentNode.insertBefore(f,bf);else document.body.appendChild(f);H.classList.add('tvl-sf-on')}catch(e){}}
tryDraw();
if(!drawn&&window.MutationObserver){var mo=new MutationObserver(function(){tryDraw();if(drawn)mo.disconnect()});mo.observe(H,{childList:true,subtree:true})}
document.addEventListener('DOMContentLoaded',function(){tryDraw();tryFoot()});
if(document.readyState!=='loading')tryFoot();
})();
