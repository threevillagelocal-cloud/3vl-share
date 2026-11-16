(function(){
  var r=document.getElementById('mdx');if(!r)return;
  var preview=r.getAttribute('data-preview')==='1',END=r.getAttribute('data-endpoint')||'',TEST=r.getAttribute('data-test')==='1',TOKEN=r.getAttribute('data-token')||'',
    tier=r.getAttribute('data-tier')||'',uid=r.getAttribute('data-uid')||r.getAttribute('data-md-uid')||'';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,fine=window.matchMedia&&matchMedia('(pointer:fine)').matches;
  [].forEach.call(r.querySelectorAll('[data-greet]'),function(g){var h=new Date().getHours();g.textContent=h<12?'Good morning':(h<17?'Good afternoon':'Good evening')});
  function ga(n,p){try{if(window.gtag)gtag('event',n,p)}catch(x){}}
  function toast(t){var b=document.getElementById('toasts');if(!b)return;var d=document.createElement('div');d.className='toast';d.textContent=t;b.appendChild(d);setTimeout(function(){d.remove()},2800)}
  /* images in views that are not open yet load when the view opens (data-src) */
  function hydrate(scope){[].forEach.call(scope.querySelectorAll('img[data-src]'),function(i){i.src=i.getAttribute('data-src');i.removeAttribute('data-src');var ss=i.getAttribute('data-srcset');if(ss){i.srcset=ss;i.removeAttribute('data-srcset')}})}
  /* count-ups (eased, rAF, after first paint) */
  function countUp(scope){[].forEach.call(scope.querySelectorAll('[data-count]'),function(el){
    var n=+el.getAttribute('data-count')||0,pre=el.getAttribute('data-pre')||'',suf=el.getAttribute('data-suf')||'';
    if(reduce||n<4){el.textContent=pre+n.toLocaleString('en-US')+suf;return}
    var t0=null,dur=1300;function step(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/dur),v=Math.round(n*(1-Math.pow(1-p,4)));el.textContent=pre+v.toLocaleString('en-US')+suf;if(p<1)requestAnimationFrame(step)}
    requestAnimationFrame(step)})}
  /* views */
  var views=[].slice.call(r.querySelectorAll('[data-view]'));
  function show(v,push){var t=views.filter(function(x){return x.getAttribute('data-view')===v})[0];if(!t)return;
    views.forEach(function(x){x.classList.toggle('on',x===t)});hydrate(t);
    [].forEach.call(r.querySelectorAll('[data-go]'),function(a){if(a.closest('.nav,.tabbar')){var on=a.getAttribute('data-go')===v;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}});
    requestAnimationFrame(function(){countUp(t)});if(push!==false){try{history.replaceState(null,'','#'+v)}catch(x){}}
    if(push!==false)window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});ga('dash_view',{view:v,member_tier:tier})}
  var h=(location.hash||'').replace('#','');
  requestAnimationFrame(function(){show(views.some(function(x){return x.getAttribute('data-view')===h})?h:'overview',false)});
  /* drawer */
  var dr=document.getElementById('drawer');
  function openDr(k){if(!dr)return;[].forEach.call(dr.querySelectorAll('[data-pane]'),function(p){p.hidden=p.getAttribute('data-pane')!==k});hydrate(dr);dr.hidden=false;dr.setAttribute('aria-hidden','false');
    var f=dr.querySelector('[data-pane="'+k+'"] input:not([type=hidden]),[data-pane="'+k+'"] textarea');if(f&&fine)setTimeout(function(){f.focus()},250);ga('dash_action_open',{action:k,member_tier:tier})}
  function closeDr(){if(dr){dr.hidden=true;dr.setAttribute('aria-hidden','true')}}
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closeDr()});
  r.addEventListener('click',function(ev){
    var t=ev.target.closest&&ev.target.closest('[data-go],[data-open],[data-close],[data-copy],.seg button');if(!t)return;
    if(t.hasAttribute('data-close')){closeDr();return}
    if(t.hasAttribute('data-open')){ev.preventDefault();openDr(t.getAttribute('data-open'));return}
    if(t.hasAttribute('data-copy')){var v=t.getAttribute('data-copy');(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(function(){toast('Link copied')},function(){window.prompt('Copy this link',v)});ga('dash_tool_click',{tool:'copy',member_tier:tier});return}
    if(t.parentNode&&t.parentNode.classList&&t.parentNode.classList.contains('seg')){var f=t.getAttribute('data-f');[].forEach.call(t.parentNode.children,function(x){x.classList.toggle('on',x===t)});
      var list=t.closest('.card').querySelectorAll('.act');[].forEach.call(list,function(li){li.classList.toggle('hide',f!=='all'&&li.getAttribute('data-f')!==f)});return}
    if(t.hasAttribute('data-go')){var inner=ev.target.closest('a[target],button:not([data-go]),[data-open]');if(inner&&inner!==t)return;ev.preventDefault();show(t.getAttribute('data-go'))}
  });
  /* search */
  var s=r.querySelector('[data-search]');
  if(s)s.addEventListener('keydown',function(ev){if(ev.key!=='Enter')return;var q=s.value.trim().toLowerCase();if(!q)return;
    var map=[['banner','seen'],['spotlight','seen'],['homepage','seen'],['promo','promotions'],['post','promotions'],['event','actions'],['special','actions'],['video','actions'],['request','actions'],['profile','profile'],['qr','profile'],['review','profile'],['share','profile'],['chatbot','grow'],['website','grow'],['dashboard','grow'],['sample','grow'],['grow','grow']];
    for(var i=0;i<map.length;i++){if(q.indexOf(map[i][0])>-1){show(map[i][1]);s.value='';return}}
    var hit=views.filter(function(v){return v.textContent.toLowerCase().indexOf(q)>-1})[0];if(hit){show(hit.getAttribute('data-view'));s.value=''}else toast('Nothing found for "'+s.value+'"')});
  /* celebration burst on success */
  function burst(el){if(reduce||!el)return;var b=el.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2,cols=['#2b7bff','#f2c94c','#22c55e','#7cc4ff','#e2725b'];
    for(var i=0;i<22;i++){var d=document.createElement('i');d.className='burst';var a=Math.random()*Math.PI*2,dist=60+Math.random()*90;
      d.style.left=cx+'px';d.style.top=cy+'px';d.style.background=cols[i%cols.length];d.style.setProperty('--bx',Math.cos(a)*dist+'px');d.style.setProperty('--by',Math.sin(a)*dist-30+'px');r.appendChild(d);setTimeout(function(x){return function(){x.remove()}}(d),950)}}
  /* photo: resize in the browser (max 1600px JPEG) so uploads stay small */
  function readPhoto(file){return new Promise(function(res){if(!file||!file.size)return res(null);var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){
    var k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    res({type:'image/jpeg',data:c.toDataURL('image/jpeg',.86).split(',')[1]})};im.onerror=function(){res(null)};im.src=fr.result};fr.onerror=function(){res(null)};fr.readAsDataURL(file)})}
  function post(body){body.token=TOKEN;body.uid_hint=uid;body.page=location.pathname.replace(/[A-Za-z0-9_-]{20,}/,'[token]');if(TEST)body.test=true;
    return fetch(END,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(x){return x.json().catch(function(){return{ok:false}}).then(function(j){j._s=x.status;return j})})}
  /* forms */
  r.addEventListener('submit',function(ev){
    var f=ev.target;if(!f.hasAttribute('data-x-form'))return;ev.preventDefault();
    var ok=f.querySelector('.x-form-ok'),req=[].filter.call(f.querySelectorAll('[required]'),function(x){return !x.value.trim()});
    ok.classList.remove('good');ga('dash_form_submit',{form:f.getAttribute('data-x-form'),member_tier:tier});
    if(req.length){req[0].focus();ok.hidden=false;ok.textContent='Please fill in the highlighted field.';return}
    if(!END){ok.hidden=false;ok.textContent='Preview: this form is switched off.';return}
    var fields={},photo=null;[].forEach.call(f.elements,function(x){if(!x.name||x.type==='submit')return;if(x.type==='file'){photo=x.files&&x.files[0];return}fields[x.name]=x.value});
    var b=f.querySelector('button[type=submit]');b.disabled=true;ok.hidden=false;ok.textContent='Sending...';
    readPhoto(photo).then(function(p){var body={kind:f.getAttribute('data-x-form'),fields:fields};if(p)body.photo=p;return post(body)})
      .then(function(j){if(j.ok){ok.classList.add('good');ok.textContent=(TEST?'Test sent. ':'')+'Got it, thank you! Our team will be in touch soon.';f.reset();burst(b);ga('dash_form_done',{form:f.getAttribute('data-x-form'),member_tier:tier})}
        else if(j.upgrade){ok.textContent='This one is part of a higher plan. Tap Upgrade to unlock it.'}
        else ok.textContent=j.error||'Something went wrong. Please email hello@threevillagelocal.com and we will take care of it.'})
      .catch(function(){ok.textContent='Something went wrong. Please email hello@threevillagelocal.com and we will take care of it.'}).then(function(){b.disabled=false});
  });
  /* 3VL Digital slots: one card per visit; the free sample feature card + thank-you state */
  var SK='x-sample-'+uid,asked=false;try{asked=localStorage.getItem(SK)==='1'}catch(x){}
  if(asked)[].forEach.call(r.querySelectorAll('#sfeat'),function(x){x.remove()});
  function rotate(attr){var ups=[].slice.call(r.querySelectorAll('.upsell ['+attr+']'));
    if(asked)ups=ups.filter(function(u){if(u.getAttribute(attr)==='dashboards'){u.remove();return false}return true});
    if(!ups.length)return;var n=0;try{n=(+(localStorage.getItem('x-ups-n')||0))%ups.length}catch(x){}
    ups.forEach(function(u,i){u.hidden=i!==n})}
  rotate('data-ups');rotate('data-ups2');rotate('data-ups3');try{localStorage.setItem('x-ups-n',(+(localStorage.getItem('x-ups-n')||0)+1))}catch(x){}
  r.addEventListener('click',function(ev){var sb=ev.target.closest&&ev.target.closest('[data-sample]');if(!sb)return;
    var fn=(sb.getAttribute('data-first')||'').replace(/[<>&"]/g,''),wait=!!sb.getAttribute('data-kind');
    function say(head,body){[].forEach.call(r.querySelectorAll('[data-ups="dashboards"] .ups-t,[data-ups2="dashboards"] .ups-t,[data-ups3="dashboards"] .ups-t'),function(t){
      t.innerHTML='<span class="sf-k ups-k">3VL Digital</span><b>'+head+'</b><i>'+body+'</i>'+(TEST?'<i style="color:#f6d36b">Test mode: only our team inbox got it.</i>':'')})}
    function done(){try{localStorage.setItem(SK,'1')}catch(x){}say('Thank you'+(fn?', '+fn:'')+'!',wait?'You are on the list. We will reach out as soon as a spot opens.':'We will build your working sample and get back to you soon.');burst(sb)}
    sb.disabled=true;ga('dash_sample_request',{product:wait?'waitlist':'dashboards',member_tier:tier});
    if(!END){done();return}
    post({kind:sb.getAttribute('data-kind')||'dashboard_sample'}).then(function(j){
      if(j.ok)done();
      else if(j.full){sb.disabled=false;sb.setAttribute('data-kind','dashboard_sample_waitlist');sb.textContent='Join the list';say('Our free sample spots are full this week.','Join the list and we will reach out first.');var nb=sb.cloneNode(true);var t=r.querySelector('#sfeat .ups-t');if(t)t.appendChild(nb)}
      else{sb.disabled=false;sb.textContent='Please try again'}}).catch(function(){sb.disabled=false;sb.textContent='Please try again'})});
  /* hover tilt + light-follow on cards (desktop only) */
  if(fine&&!reduce){r.addEventListener('pointermove',function(ev){var c=ev.target.closest&&ev.target.closest('.view.on .card');if(!c||c.closest('.drawer'))return;var b=c.getBoundingClientRect(),x=(ev.clientX-b.left)/b.width,y=(ev.clientY-b.top)/b.height;
      c.classList.add('tilt');c.style.setProperty('--ry',((x-.5)*4).toFixed(2)+'deg');c.style.setProperty('--rx',((.5-y)*4).toFixed(2)+'deg');c.style.setProperty('--mx',(x*100).toFixed(1)+'%');c.style.setProperty('--my',(y*100).toFixed(1)+'%')},{passive:true});
    r.addEventListener('pointerout',function(ev){var c=ev.target.closest&&ev.target.closest('.card');if(c&&!c.contains(ev.relatedTarget))c.classList.remove('tilt')},{passive:true})}
  /* homepage Spotlight mini preview rotates like the real one */
  if(!reduce)[].forEach.call(r.querySelectorAll('.spotmock'),function(sm){var a=sm.querySelectorAll('.sp-a');if(a.length<2)return;var i=0;setInterval(function(){if(document.hidden)return;[].forEach.call(a,function(x,j){x.classList.toggle('hl',j===i)});i=(i+1)%a.length},2600)});
  /* PWA: service worker (live pages) + install banner + install button in the app panel */
  var sw=r.getAttribute('data-sw');if(sw&&'serviceWorker' in navigator&&location.protocol==='https:'){try{navigator.serviceWorker.register(sw,{scope:'./'})}catch(x){}}
  var bip=null;window.addEventListener('beforeinstallprompt',function(ev){ev.preventDefault();bip=ev;[].forEach.call(r.querySelectorAll('[data-install]'),function(b){b.hidden=false})});
  r.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('[data-install]');if(b&&bip){bip.prompt();bip.userChoice.then(function(){b.hidden=true})}});
  var ib=document.getElementById('x-inst');
  if(ib){var KEY='x-inst-off',off=false;try{off=localStorage.getItem(KEY)==='1'}catch(x){}
    var force=location.hash.replace('#',''),ua=navigator.userAgent||'',stand=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
    var phone=window.matchMedia&&matchMedia('(max-width: 860px)').matches,ios=force==='ios'||(/iphone|ipad|ipod/i.test(ua)&&force!=='android');
    var showI=function(k){ib.classList.add('x-inst-'+k);ib.hidden=false};
    if(!stand&&(phone||force==='ios'||force==='android')&&(!off||force)){if(ios)showI('i');else if(force==='android')showI('a');
      window.addEventListener('beforeinstallprompt',function(){if(!ios)showI('a')})}
    ib.addEventListener('click',function(ev){if(ev.target.closest('.x-inst-x')){ib.hidden=true;try{localStorage.setItem(KEY,'1')}catch(x){}}
      else if(ev.target.closest('.x-inst-go')&&bip){bip.prompt();bip.userChoice.then(function(){ib.hidden=true})}})}
  /* GA4 (after load, never blocks first paint) */
  window.addEventListener('load',function(){setTimeout(function(){r.classList.add('ready')},900)});
  /* One-time announcement popups (data: #mdann, built nightly from announcements.json). Once per browser per id, max one per visit, max one new popup every 3 days. ?reset=1 re-shows. */
  (function(){
    var el=document.getElementById('mdann');if(!el)return;var list=[];try{list=JSON.parse(el.textContent)||[]}catch(x){return}
    function g(k){try{return localStorage.getItem(k)}catch(x){return null}}function s(k,v){try{localStorage.setItem(k,v)}catch(x){}}
    if(/[?&]reset=1/.test(location.search)){list.forEach(function(a){try{localStorage.removeItem('md_ann_'+a.id)}catch(x){}});try{localStorage.removeItem('md_ann_last')}catch(x){}}
    var last=+g('md_ann_last')||0;if(Date.now()-last<3*864e5)return;
    var a=null;for(var i=0;i<list.length;i++){if(!g('md_ann_'+list[i].id)){a=list[i];break}}if(!a)return;
    function esc(t){return String(t||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    function open(){
      var ins=document.querySelector('.x-inst');if(document.querySelector('#drawer:not([hidden]),.mdann')||(ins&&!ins.hidden&&ins.offsetParent))return;
      var w=document.createElement('div');w.className='mdann';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-labelledby','mdann-t');
      var img=a.image?('<div class="mdann-v'+(a.frame==='laptop'?' lap':'')+'"><div class="mdann-scr"><img src="'+esc(a.image_640||a.image)+'"'+(a.image_640?' srcset="'+esc(a.image_640)+' 640w, '+esc(a.image)+' 960w" sizes="420px"':'')+' alt="" width="640" height="400" decoding="async"></div>'+(a.frame==='laptop'?'<div class="mdann-base"></div>':'')+'</div>'):'';
      var btn=a.button&&a.button.url?'<a class="mdann-b" href="'+esc(a.button.url)+'" target="_blank" rel="noopener" data-ga="dash_announcement_click">'+esc(a.button.label||'Take a look')+' <span aria-hidden="true">&rarr;</span></a>':'';
      w.innerHTML='<div class="mdann-card"><button type="button" class="mdann-x" aria-label="Close">&times;</button>'+img+'<div class="mdann-t"><h3 id="mdann-t">'+esc(a.title)+(a.emoji?' <span aria-hidden="true">'+esc(a.emoji)+'</span>':'')+'</h3>'+(a.body?'<p>'+esc(a.body)+'</p>':'')+'<div class="mdann-act">'+btn+'<button type="button" class="mdann-ok">Close</button></div></div></div>';
      document.body.appendChild(w);s('md_ann_'+a.id,String(Date.now()));s('md_ann_last',String(Date.now()));
      requestAnimationFrame(function(){w.classList.add('in')});
      var prev=document.activeElement;function close(){w.classList.remove('in');document.removeEventListener('keydown',kd);setTimeout(function(){w.remove()},260);try{prev&&prev.focus&&prev.focus()}catch(x){}}
      function kd(e){if(e.key==='Escape')close()}document.addEventListener('keydown',kd);
      w.addEventListener('click',function(e){if(e.target===w||e.target.closest('.mdann-x,.mdann-ok'))close();else if(e.target.closest('.mdann-b'))setTimeout(close,200)});
      w.querySelector('.mdann-x').focus();
      try{if(window.gtag)gtag('event','dash_announcement_view',{id:a.id})}catch(x){}
    }
    window.addEventListener('load',function(){setTimeout(open,1300)});
  })();
  window.addEventListener('load',function(){setTimeout(function(){if(!window.gtag&&document.body.classList.contains('x-page')){window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','G-ERG4CN7V3E',{send_page_view:true,page_title:'Member Dashboard'});
    var gs=document.createElement('script');gs.async=true;gs.src='https://www.googletagmanager.com/gtag/js?id=G-ERG4CN7V3E';document.head.appendChild(gs)}},1500)});
  r.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('[data-ga]');if(a&&!a.hasAttribute('data-sample')&&!a.hasAttribute('data-open'))ga(a.getAttribute('data-ga'),{product:a.getAttribute('data-product')||'',member_tier:tier})},true);
})();
