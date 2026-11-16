(function(){
  var r=document.getElementById('mdx');if(!r)return;
  var g=r.querySelector('[data-x-greet]');if(g){var h=new Date().getHours();g.textContent=h<12?'Good morning':(h<17?'Good afternoon':'Good evening')}
  var preview=r.getAttribute('data-preview')==='1',END=r.getAttribute('data-endpoint')||'';
  r.addEventListener('click',function(ev){
    var t=ev.target.closest&&ev.target.closest('button,a');if(!t)return;
    if(t.parentNode.classList&&t.parentNode.classList.contains('x-chips')){
      var f=t.getAttribute('data-f');[].forEach.call(t.parentNode.children,function(x){x.classList.toggle('on',x===t)});
      [].forEach.call(r.querySelectorAll('.x-tl li'),function(li){li.classList.toggle('x-hide',f!=='all'&&li.getAttribute('data-f')!==f)});return}
    if(t.hasAttribute('data-x-tab')){var k=t.getAttribute('data-x-tab');
      [].forEach.call(r.querySelectorAll('[data-x-tab]'),function(x){var on=x===t;x.classList.toggle('on',on);x.setAttribute('aria-selected',on?'true':'false')});
      [].forEach.call(r.querySelectorAll('[data-x-pane]'),function(p){p.hidden=p.getAttribute('data-x-pane')!==k});return}
    if(t.hasAttribute('data-x-copy')){var v=t.getAttribute('data-x-copy'),old=t.innerHTML;
      (navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(function(){t.textContent='Copied'},function(){window.prompt('Copy this link',v)}).then(function(){setTimeout(function(){t.innerHTML=old},1600)});return}
    if(t.closest('.x-nav')){[].forEach.call(r.querySelectorAll('.x-nav a'),function(x){x.classList.toggle('on',x===t)})}
  });
  r.addEventListener('submit',function(ev){
    var f=ev.target;if(!f.hasAttribute('data-x-form'))return;ev.preventDefault();
    var ok=f.querySelector('.x-form-ok'),req=[].filter.call(f.querySelectorAll('[required]'),function(x){return !x.value.trim()});
    if(req.length){req[0].focus();ok.hidden=false;ok.textContent='Please fill in the highlighted field.';return}
    if(preview||!END){ok.hidden=false;ok.textContent='Preview: this form is switched off. On your live dashboard it goes straight to our team and you get a confirmation here.';return}
    var fd=new FormData(f);fd.append('kind',f.getAttribute('data-x-form'));fd.append('uid',r.getAttribute('data-uid')||'');fd.append('t',location.pathname);
    var b=f.querySelector('button[type=submit]');b.disabled=true;
    fetch(END,{method:'POST',body:fd}).then(function(x){return x.ok?x.json():Promise.reject()}).then(function(){
      ok.hidden=false;ok.textContent='Got it, thank you. Our team will be in touch soon.';f.reset()}).catch(function(){
      ok.hidden=false;ok.textContent='Something went wrong. Please email hello@threevillagelocal.com and we will take care of it.'}).then(function(){b.disabled=false});
  });
  /* PWA: service worker (live pages only) + "Add to home screen" banner on phones */
  var sw=r.getAttribute('data-sw');
  if(sw&&'serviceWorker' in navigator&&location.protocol==='https:'){try{navigator.serviceWorker.register(sw,{scope:'./'})}catch(x){}}
  var ib=document.getElementById('x-inst');
  if(ib){
    var KEY='x-inst-off',off=false;try{off=localStorage.getItem(KEY)==='1'}catch(x){}
    var force=location.hash.replace('#',''),ua=navigator.userAgent||'';
    var stand=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
    var phone=window.matchMedia&&matchMedia('(max-width: 820px)').matches;
    var ios=force==='ios'||(/iphone|ipad|ipod/i.test(ua)&&force!=='android');
    var show=function(kind){ib.classList.add('x-inst-'+kind);ib.hidden=false};
    if(!stand&&(phone||force)&&(!off||force)){
      if(ios)show('i');
      else if(force==='android')show('a');
      window.addEventListener('beforeinstallprompt',function(ev){ev.preventDefault();ib._p=ev;if(!ios)show('a')});
    }
    ib.addEventListener('click',function(ev){
      if(ev.target.closest('.x-inst-x')){ib.hidden=true;try{localStorage.setItem(KEY,'1')}catch(x){}}
      else if(ev.target.closest('.x-inst-go')&&ib._p){ib._p.prompt();ib._p.userChoice.then(function(){ib.hidden=true})}
    });
  }
  /* 3VL Digital card: one per visit */
  var ups=[].slice.call(r.querySelectorAll('[data-ups]'));
  var uid=r.getAttribute('data-uid')||r.getAttribute('data-md-uid')||'',SK='x-sample-'+uid,asked=false;try{asked=localStorage.getItem(SK)==='1'}catch(x){}
  if(asked){ups=ups.filter(function(u){if(u.getAttribute('data-ups')==='dashboards'){u.remove();return false}return true})}
  if(ups.length){var n=0;try{n=(+(localStorage.getItem('x-ups-n')||0)+1)%ups.length;localStorage.setItem('x-ups-n',n)}catch(x){n=Math.floor(Math.random()*ups.length)}
    if(/ups-dash/.test(location.hash))n=0;
    ups.forEach(function(u,i){u.hidden=i!==n})}
  r.addEventListener('click',function(ev){var sb=ev.target.closest&&ev.target.closest('[data-sample]');if(!sb)return;
    var card=sb.closest('.x-ups'),fn=sb.getAttribute('data-first')||'';sb.disabled=true;
    function done(){try{localStorage.setItem(SK,'1')}catch(x){}
      card.innerHTML='<div class="x-ups-t x-ups-thx"><span class="x-ups-k">3VL Digital</span><b>Thank you'+(fn?', '+fn.replace(/[<>&"]/g,''):'')+'!</b><i>'+(sb.getAttribute('data-kind')?'You are on the list. We will reach out as soon as a spot opens.':'We will build your working sample and get back to you soon.')+'</i></div>'}
    if(preview||!END){done();var pn=document.createElement('p');pn.className='x-prev-note';pn.textContent='Preview: no alert was sent.';card.querySelector('.x-ups-t').appendChild(pn);return}
    var fd=new FormData();fd.append('kind',sb.getAttribute('data-kind')||'dashboard_sample');fd.append('uid',uid);fd.append('t',location.pathname);
    fetch(END,{method:'POST',body:fd}).then(function(x){if(!x.ok)throw 0;done()}).catch(function(){sb.disabled=false;sb.textContent='Please try again'})});
  /* GA4: every upgrade, offer, action and form (owner wants to learn which offers pull) */
  var tier=r.getAttribute('data-tier')||'';
  if(!window.gtag&&document.body.classList.contains('x-page')){window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','G-ERG4CN7V3E',{send_page_view:true,page_title:'Member Dashboard'});
    var gs=document.createElement('script');gs.async=true;gs.src='https://www.googletagmanager.com/gtag/js?id=G-ERG4CN7V3E';document.head.appendChild(gs)}
  function ga(n,p){try{if(window.gtag)gtag('event',n,p)}catch(x){}}
  r.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('[data-ga],[data-x-tab],.x-fix,.x-chipb');if(!a)return;
    if(a.hasAttribute('data-ga'))ga(a.getAttribute('data-ga'),{product:a.getAttribute('data-product')||'',member_tier:tier});
    else if(a.hasAttribute('data-x-tab'))ga('dash_action_open',{action:a.getAttribute('data-x-tab'),member_tier:tier});
    else ga('dash_tool_click',{tool:(a.textContent||'').trim().slice(0,30),member_tier:tier})},true);
  r.addEventListener('submit',function(ev){var f=ev.target;if(f.hasAttribute&&f.hasAttribute('data-x-form'))ga('dash_form_submit',{form:f.getAttribute('data-x-form'),member_tier:tier})},true);
})();
