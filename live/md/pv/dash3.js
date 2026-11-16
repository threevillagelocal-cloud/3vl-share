(function(){
  var r=document.getElementById('mdx');if(!r)return;
  var preview=r.getAttribute('data-preview')==='1',END=r.getAttribute('data-endpoint')||'',tier=r.getAttribute('data-tier')||'',uid=r.getAttribute('data-uid')||r.getAttribute('data-md-uid')||'';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].forEach.call(r.querySelectorAll('[data-greet]'),function(g){var h=new Date().getHours();g.textContent=h<12?'Good morning':(h<17?'Good afternoon':'Good evening')});
  function ga(n,p){try{if(window.gtag)gtag('event',n,p)}catch(x){}}
  function toast(t){var b=document.getElementById('toasts');if(!b)return;var d=document.createElement('div');d.className='toast';d.textContent=t;b.appendChild(d);setTimeout(function(){d.remove()},2800)}
  /* count-ups */
  function countUp(scope){[].forEach.call(scope.querySelectorAll('[data-count]'),function(el){
    var n=+el.getAttribute('data-count')||0,pre=el.getAttribute('data-pre')||'',suf=el.getAttribute('data-suf')||'';
    if(reduce||n<4){el.textContent=pre+n.toLocaleString('en-US')+suf;return}
    var t0=null,dur=1100;function step(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/dur),v=Math.round(n*(1-Math.pow(1-p,3)));el.textContent=pre+v.toLocaleString('en-US')+suf;if(p<1)requestAnimationFrame(step)}
    requestAnimationFrame(step)})}
  /* views */
  var views=[].slice.call(r.querySelectorAll('[data-view]'));
  function show(v,push){var t=views.filter(function(x){return x.getAttribute('data-view')===v})[0];if(!t)return;
    views.forEach(function(x){x.classList.toggle('on',x===t)});
    [].forEach.call(r.querySelectorAll('[data-go]'),function(a){if(a.closest('.nav,.tabbar')){var on=a.getAttribute('data-go')===v;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}});
    void t.offsetWidth;countUp(t);if(push!==false){try{history.replaceState(null,'','#'+v)}catch(x){}}
    var c=r.querySelector('.content');if(c&&push!==false)window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});ga('dash_view',{view:v,member_tier:tier})}
  var h=(location.hash||'').replace('#','');show(views.some(function(x){return x.getAttribute('data-view')===h})?h:'overview',false);
  /* drawer */
  var dr=document.getElementById('drawer');
  function openDr(k){if(!dr)return;[].forEach.call(dr.querySelectorAll('[data-pane]'),function(p){p.hidden=p.getAttribute('data-pane')!==k});dr.hidden=false;dr.setAttribute('aria-hidden','false');
    var f=dr.querySelector('[data-pane="'+k+'"] input,[data-pane="'+k+'"] textarea');if(f)setTimeout(function(){f.focus()},250);ga('dash_action_open',{action:k,member_tier:tier})}
  function closeDr(){if(dr){dr.hidden=true;dr.setAttribute('aria-hidden','true')}}
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closeDr()});
  r.addEventListener('click',function(ev){
    var t=ev.target.closest&&ev.target.closest('[data-go],[data-open],[data-close],[data-copy],.seg button,.seen[data-go]');if(!t)return;
    if(t.hasAttribute('data-close')){closeDr();return}
    if(t.hasAttribute('data-open')){ev.preventDefault();openDr(t.getAttribute('data-open'));return}
    if(t.hasAttribute('data-copy')){var v=t.getAttribute('data-copy');(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(function(){toast('Link copied')},function(){window.prompt('Copy this link',v)});ga('dash_tool_click',{tool:'copy',member_tier:tier});return}
    if(t.parentNode&&t.parentNode.classList&&t.parentNode.classList.contains('seg')){var f=t.getAttribute('data-f');[].forEach.call(t.parentNode.children,function(x){x.classList.toggle('on',x===t)});
      var list=t.closest('.card').querySelectorAll('.act');[].forEach.call(list,function(li){li.classList.toggle('hide',f!=='all'&&li.getAttribute('data-f')!==f)});return}
    if(t.hasAttribute('data-go')){if(ev.target.closest('a[target],button:not([data-go]),[data-open]')&&ev.target.closest('a[target],button:not([data-go]),[data-open]')!==t)return;ev.preventDefault();show(t.getAttribute('data-go'))}
  });
  /* search: jump to the matching view */
  var s=r.querySelector('[data-search]');
  if(s)s.addEventListener('keydown',function(ev){if(ev.key!=='Enter')return;var q=s.value.trim().toLowerCase();if(!q)return;
    var map=[['banner','seen'],['spotlight','seen'],['homepage','seen'],['promo','promotions'],['post','promotions'],['event','actions'],['special','actions'],['video','actions'],['request','actions'],['profile','profile'],['qr','profile'],['review','profile'],['share','profile'],['chatbot','grow'],['website','grow'],['dashboard','grow'],['sample','grow'],['grow','grow']];
    for(var i=0;i<map.length;i++){if(q.indexOf(map[i][0])>-1){show(map[i][1]);s.value='';return}}
    var hit=views.filter(function(v){return v.textContent.toLowerCase().indexOf(q)>-1})[0];if(hit){show(hit.getAttribute('data-view'));s.value=''}else toast('Nothing found for "'+s.value+'"')});
  /* forms */
  r.addEventListener('submit',function(ev){
    var f=ev.target;if(!f.hasAttribute('data-x-form'))return;ev.preventDefault();
    var ok=f.querySelector('.x-form-ok'),req=[].filter.call(f.querySelectorAll('[required]'),function(x){return !x.value.trim()});
    ga('dash_form_submit',{form:f.getAttribute('data-x-form'),member_tier:tier});
    if(req.length){req[0].focus();ok.hidden=false;ok.textContent='Please fill in the highlighted field.';return}
    if(preview||!END){ok.hidden=false;ok.textContent='Preview: this form is switched off. On your live dashboard it goes straight to our team and you get a confirmation here.';return}
    var fd=new FormData(f);fd.append('kind',f.getAttribute('data-x-form'));fd.append('uid',uid);fd.append('t',location.pathname);
    var b=f.querySelector('button[type=submit]');b.disabled=true;
    fetch(END,{method:'POST',body:fd}).then(function(x){return x.ok?x.json():Promise.reject()}).then(function(){ok.hidden=false;ok.textContent='Got it, thank you. Our team will be in touch soon.';f.reset()})
      .catch(function(){ok.hidden=false;ok.textContent='Something went wrong. Please email hello@threevillagelocal.com and we will take care of it.'}).then(function(){b.disabled=false});
  });
  /* 3VL Digital slot: one card per visit (both slots show the same card) */
  var SK='x-sample-'+uid,asked=false;try{asked=localStorage.getItem(SK)==='1'}catch(x){}
  function rotate(attr){var ups=[].slice.call(r.querySelectorAll('['+attr+']'));
    if(asked)ups=ups.filter(function(u){if(u.getAttribute(attr)==='dashboards'){u.remove();return false}return true});
    if(!ups.length)return;var n=0;try{n=(+(localStorage.getItem('x-ups-n')||0))%ups.length}catch(x){}
    if(/ups-dash/.test(location.hash))n=0;ups.forEach(function(u,i){u.hidden=i!==n})}
  rotate('data-ups');rotate('data-ups2');rotate('data-ups3');try{localStorage.setItem('x-ups-n',(+(localStorage.getItem('x-ups-n')||0)+1))}catch(x){}
  r.addEventListener('click',function(ev){var sb=ev.target.closest&&ev.target.closest('[data-sample]');if(!sb)return;
    var fn=(sb.getAttribute('data-first')||'').replace(/[<>&"]/g,''),wait=!!sb.getAttribute('data-kind');
    function done(){try{localStorage.setItem(SK,'1')}catch(x){}
      [].forEach.call(r.querySelectorAll('[data-ups="dashboards"] .ups-t,[data-ups2="dashboards"] .ups-t,[data-ups3="dashboards"] .ups-t'),function(t){
        t.innerHTML='<span class="ups-k">3VL Digital</span><b>Thank you'+(fn?', '+fn:'')+'!</b><i>'+(wait?'You are on the list. We will reach out as soon as a spot opens.':'We will build your working sample and get back to you soon.')+'</i>'+(preview?'<i style="color:#f6d36b">Preview: no alert was sent.</i>':'')})}
    sb.disabled=true;ga('dash_sample_request',{product:wait?'waitlist':'dashboards',member_tier:tier});
    if(preview||!END){done();return}
    var fd=new FormData();fd.append('kind',sb.getAttribute('data-kind')||'dashboard_sample');fd.append('uid',uid);fd.append('t',location.pathname);
    fetch(END,{method:'POST',body:fd}).then(function(x){if(!x.ok)throw 0;done()}).catch(function(){sb.disabled=false;sb.textContent='Please try again'})});
  /* PWA: service worker (live pages) + install banner on phones */
  var sw=r.getAttribute('data-sw');if(sw&&'serviceWorker' in navigator&&location.protocol==='https:'){try{navigator.serviceWorker.register(sw,{scope:'./'})}catch(x){}}
  var ib=document.getElementById('x-inst');
  if(ib){var KEY='x-inst-off',off=false;try{off=localStorage.getItem(KEY)==='1'}catch(x){}
    var force=location.hash.replace('#',''),ua=navigator.userAgent||'',stand=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
    var phone=window.matchMedia&&matchMedia('(max-width: 860px)').matches,ios=force==='ios'||(/iphone|ipad|ipod/i.test(ua)&&force!=='android');
    var showI=function(k){ib.classList.add('x-inst-'+k);ib.hidden=false};
    if(!stand&&(phone||force==='ios'||force==='android')&&(!off||force)){if(ios)showI('i');else if(force==='android')showI('a');
      window.addEventListener('beforeinstallprompt',function(ev){ev.preventDefault();ib._p=ev;if(!ios)showI('a')})}
    ib.addEventListener('click',function(ev){if(ev.target.closest('.x-inst-x')){ib.hidden=true;try{localStorage.setItem(KEY,'1')}catch(x){}}
      else if(ev.target.closest('.x-inst-go')&&ib._p){ib._p.prompt();ib._p.userChoice.then(function(){ib.hidden=true})}})}
  /* GA4 */
  if(!window.gtag&&document.body.classList.contains('x-page')){window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','G-ERG4CN7V3E',{send_page_view:true,page_title:'Member Dashboard'});
    var gs=document.createElement('script');gs.async=true;gs.src='https://www.googletagmanager.com/gtag/js?id=G-ERG4CN7V3E';document.head.appendChild(gs)}
  r.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('[data-ga]');if(a&&!a.hasAttribute('data-sample')&&!a.hasAttribute('data-open'))ga(a.getAttribute('data-ga'),{product:a.getAttribute('data-product')||'',member_tier:tier})},true);
})();
