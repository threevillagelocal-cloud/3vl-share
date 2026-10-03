/* Three Village Local: member dashboard (/account/home) in the premium look (10/2/2026).
   Restyles BD's own dashboard in place: welcome header, quick actions, cleaner publishing tiles (only the post types the
   site uses), card panels, and a compact "add our badge to your website" box instead of the 950px badge.
   Loaded by p3.js on /account/home. Safe to fail: if anything is missing, BD's own layout stays. */
(function(){
if(window.__tvlDash)return;
if(location.pathname.replace(/\/+$/,'')!=='/account/home')return;
function $(s,r){return (r||document).querySelector(s)}function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var DEAD=/^(SoundCloud Posts?|Classifieds?|Website - Digital Products?|Products?|Videos?|Discussions?|Property|Properties)$/i;   /* sections the site does not use (set to noindex 10/1/2026) */
var CSS=''
+'body.tvl-dash .member_admin_sidemenu{border-radius:20px;border:1px solid #e3e9f0;background:#fff;box-shadow:0 10px 28px rgba(27,47,69,.06);padding:18px 16px}'
+'body.tvl-dash .member_admin_sidemenu h4{font-size:17px;color:#1b2f45}'
+'body.tvl-dash .member_admin_sidemenu .btn-primary{border-radius:10px;background:#1b2f45;border-color:#1b2f45}'
+'body.tvl-dash .member-account-information{border-radius:14px;background:#f6f9fc;border:1px solid #e3e9f0}'
+'body.tvl-dash .dashboard_home_title,body.tvl-dash .hr-account-member-dashboard{display:none!important}'
+'#td-hero{position:relative;overflow:hidden;border-radius:22px;padding:26px 26px 24px;margin:0 0 16px;color:#fff;background:radial-gradient(circle at 92% 0,rgba(242,169,59,.32),transparent 46%),linear-gradient(140deg,#1b2f45,#0f1f31);font-family:"tvl-rc","Radio Canada",system-ui,sans-serif}'
+'#td-hero .td-bg{position:absolute;inset:-30px;background-size:cover;background-position:center;filter:blur(10px) brightness(.62) saturate(1.2);transform:scale(1.05)}'
+'#td-hero .td-shade{position:absolute;inset:0;background:linear-gradient(110deg,rgba(15,31,49,.9) 0%,rgba(15,31,49,.62) 48%,rgba(15,31,49,.12) 100%)}'
+'#td-hero .td-in{position:relative;z-index:1}'
+'#td-hero .td-k{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#f2a93b;margin:0 0 6px}'
+'#td-hero h1{font-size:30px;line-height:1.15;margin:0 0 8px;color:#fff;font-weight:800}'
+'#td-hero .td-plan{display:inline-block;font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);margin:0 8px 14px 0}'
+'#td-hero .td-plan.vip{background:#f2a93b;color:#1b2f45;border-color:#f2a93b}'
+'#td-hero .td-btns{display:flex;flex-wrap:wrap;gap:10px}'
+'#td-hero .td-btns a{display:inline-block;font-weight:700;font-size:15px;padding:11px 18px;border-radius:12px;text-decoration:none!important;background:#fff;color:#1b2f45!important}'
+'#td-hero .td-btns a.g{background:#f2a93b}'
+'#td-quick{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0 0 18px;font-family:"tvl-rc","Radio Canada",system-ui,sans-serif}'
+'#td-quick a{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e3e9f0;border-radius:16px;padding:14px 16px;text-decoration:none!important;color:#1b2f45!important;box-shadow:0 6px 18px rgba(27,47,69,.05);transition:transform .15s,box-shadow .15s}'
+'#td-quick a:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(27,47,69,.1)}'
+'#td-quick span.i{flex:0 0 40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:19px;background:#f3f6fa}'
+'#td-quick b{display:block;font-size:16px;line-height:1.2}#td-quick small{display:block;font-size:13px;color:#5b6b7c;margin-top:2px}'
+'body.tvl-dash .dashboard-module .panel,body.tvl-dash .dashboard-publish-content .panel{border-radius:20px;border:1px solid #e3e9f0;box-shadow:0 8px 24px rgba(27,47,69,.06);overflow:hidden}'
+'body.tvl-dash .dashboard-module .panel-heading,body.tvl-dash .dashboard-publish-content .panel-heading{background:#fff;border-bottom:1px solid #eef2f6;padding:16px 18px}'
+'body.tvl-dash .panel-heading h4{font-size:17px;color:#1b2f45}'
+'body.tvl-dash .dashboard-publish-content a.alert{display:flex;align-items:center;gap:10px;border-radius:14px;border:1px solid #e3e9f0;background:#f8fafc;color:#1b2f45;font-weight:700;font-size:15px;padding:14px 14px;margin:0 0 12px;transition:background .15s}'
+'body.tvl-dash .dashboard-publish-content a.alert:hover{background:#fff8ea;border-color:#f4d27a}'
+'body.tvl-dash .dashboard-publish-content a.alert i{color:#c98a12}'
+'body.tvl-dash .td-mod-manage{display:none!important}'
+'body.tvl-dash .dashboard-module .btn{border-radius:10px}'
+'#td-badge{display:flex;gap:22px;align-items:center;background:#fff;border:1px solid #e3e9f0;border-radius:20px;padding:20px 22px;box-shadow:0 8px 24px rgba(27,47,69,.06);font-family:"tvl-rc","Radio Canada",system-ui,sans-serif;margin:4px 0 24px}'
+'#td-badge img{flex:0 0 120px;width:120px!important;height:auto!important;max-width:120px!important}'
+'#td-badge .td-k{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#b36b00;margin:0 0 4px}'
+'#td-badge b{display:block;font-size:20px;color:#1b2f45;margin:0 0 6px}#td-badge p{font-size:15px;line-height:1.45;color:#55636f;margin:0 0 12px}'
+'#td-badge textarea{width:100%;height:58px;font:12px/1.4 monospace;border:1px solid #dde5ee;border-radius:10px;padding:8px;color:#5b6b7c;background:#f8fafc;resize:none}'
+'#td-badge button{margin-top:8px;font-weight:700;font-size:14px;padding:9px 16px;border-radius:10px;border:0;background:#1b2f45;color:#fff;cursor:pointer}'
+'body.tvl-dash .dashboard-promote-banner{display:none!important}'
+'.td-sp{position:relative;overflow:hidden;border-radius:20px;padding:22px;background:linear-gradient(140deg,#1b2f45,#0f1f31);color:#fff;font-family:"tvl-rc","Radio Canada",system-ui,sans-serif}'
+'.td-sp:after{content:"";position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(242,169,59,.32),transparent 70%)}'
+'.td-sp>*{position:relative;z-index:1}'
+'.td-sp .td-spic{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;font-size:22px;margin-bottom:12px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18)}'
+'.td-sp .td-k{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#f2a93b;margin:0 0 4px}'
+'#dc3 .td-sp b{display:block;font-size:21px;line-height:1.2;margin:0 0 6px;color:#fff}#dc3 .td-sp p{font-size:16px;line-height:1.45;color:#cfdbe7;margin:0 0 14px}#dc3 .td-sp .td-k{color:#f2a93b}'
+'.td-sp a.td-spb{display:inline-block;font-weight:700;font-size:16px;padding:12px 20px;border-radius:12px;text-decoration:none!important;background:#f2a93b;color:#1b2f45!important}'
+'.td-sp.locked{background:#f6f8fa;color:#1b2f45;border:1px solid #e3e9f0}.td-sp.locked:after{display:none}'
+'.td-sp.locked .td-spic{background:#fff;border-color:#e3e9f0}#dc3 .td-sp.locked .td-k{color:#8a96a3}#dc3 .td-sp.locked b{color:#1b2f45}#dc3 .td-sp.locked p{color:#55636f}'
+'.td-sp.locked a.td-spb{background:#006fbb;color:#fff!important}'
+'.td-sp .td-pill{display:inline-block;font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;background:#fff3dc;color:#9a5d00;margin:0 0 10px}'
+'#dc3 .td-sp p.td-free{font-size:14px;margin:12px 0 0}.td-sp .td-free a{color:#006fbb;font-weight:700}'
+'@media(max-width:767px){#td-quick{grid-template-columns:1fr 1fr}#td-hero h1{font-size:24px}#td-badge{flex-direction:column;align-items:flex-start}}';
function run(){
  var title=$('.dashboard_home_title'),side=$('.member_admin_sidemenu');if(!title||!side||$('#td-hero'))return false;
  window.__tvlDash=1;
  var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  document.body.classList.add('tvl-dash');
  var name=($('h4',side)||{}).textContent||'';name=name.trim();
  var info=($('.member-account-information',side)||{}).textContent||'';
  var plan=(info.match(/Plan:\s*([^\n]+?)(?:\s{2,}|Change|$)/)||[])[1]||'';plan=plan.trim();
  var vip=/vip/i.test(plan),pub=$$('a',side).filter(function(a){return /View Public Listing/i.test(a.textContent)})[0];
  var hero=document.createElement('div');hero.id='td-hero';
  /* background: the member's own photo or logo (already on the page in the sidebar, so no extra download), blurred and darkened */
  var pic=$('img',side),src=pic&&(pic.currentSrc||pic.getAttribute('src'))||'';
  hero.innerHTML=(src&&!/profile-holder|default/i.test(src)?'<div class="td-bg" style="background-image:url(\''+esc(src)+'\')"></div><div class="td-shade"></div>':'')+'<div class="td-in"><p class="td-k">Your Three Village Local dashboard</p><h1>Welcome back, '+esc(name)+'</h1>'+
    (plan?'<span class="td-plan'+(vip?' vip':'')+'">'+(vip?'&#11088; ':'')+esc(plan)+'</span>':'')+
    '<div class="td-btns">'+(pub?'<a class="g" href="'+esc(pub.getAttribute('href'))+'" target="_blank">View my listing &rarr;</a>':'')+'<a href="/account/contact">Edit my business info</a>'+(vip?'':'<a href="/join">See plans</a>')+'</div></div>';
  title.parentNode.insertBefore(hero,title);
  var q=document.createElement('div');q.id='td-quick';
  q.innerHTML=[['&#9998;','Business info','Name, phone, hours, website','/account/contact'],['&#128247;','Photos and logo','What neighbors see first','/account/profile'],['&#128221;','About my business','Your story and services','/account/about'],
    ['&#128205;','Service areas','Where you work','/account/locations'],['&#128232;','Leads','Messages from neighbors','/account/leads'],['&#11088;','Reviews','What customers say','/account/recommendations']]
    .map(function(x){return '<a href="'+x[3]+'"><span class="i">'+x[0]+'</span><span><b>'+x[1]+'</b><small>'+x[2]+'</small></span></a>'}).join('');
  var row=$('.dashboard-publish-content');var dc3=$('#dc3');
  /* Smart Publisher card (replaces the old "Got something to promote?" card): open for Getting Noticed + VIP, locked for everyone else */
  var paid=/\bsession-plan-level-(1|2|8)\b/.test(document.body.className);
  var old=dc3&&$$('.dc3-c',dc3).filter(function(c){return !c.classList.contains('mm')})[0];
  if(old){var sp=document.createElement('div');sp.className='td-sp'+(paid?'':' locked');
    sp.innerHTML=paid
      ?'<div class="td-spic">&#10024;</div><p class="td-k">New &middot; 3VL Smart Publisher</p><b>Promote something in minutes</b><p>Tell us the basics about your event, special or news. We write it, design it and publish it on Three Village Local when you choose.</p><a class="td-spb" href="/promotion#pr3-form">Open Smart Publisher</a>'
      :'<div class="td-spic">&#128274;</div><p class="td-k">3VL Smart Publisher</p><span class="td-pill">Getting Noticed and VIP members</span><b>Your own page about your event or special, written for you</b><p>Give us the basics, our smart publishing tool writes and designs the page, and it goes live on Three Village Local when you choose, with an option to promote it on our social media.</p><a class="td-spb" href="/join">See the plans</a><p class="td-free">Free members can still send us a tip anytime: <a href="/promotion#pr3-form">submit a promotion</a> and our team decides what to feature.</p>';
    old.parentNode.replaceChild(sp,old)}
  (dc3||title).insertAdjacentElement('afterend',q);
  /* publishing tiles: only the post types the site uses */
  $$('.dashboard-publish-content a').forEach(function(a){if(DEAD.test(a.textContent.trim())){var c=a.closest('[class*="col-"]');(c||a).style.display='none'}});
  /* the Manage Listing panel duplicates the quick actions */
  $$('.dashboard-module').forEach(function(m){var h=$('.panel-heading',m);if(h&&/Manage Listing/i.test(h.textContent))m.classList.add('td-mod-manage')});
  $$('.dashboard-module').filter(function(m){return !m.classList.contains('td-mod-manage')}).forEach(function(m){m.className=m.className.replace(/\bcol-md-4\b/,'col-md-6')});
  /* sidebar: hide counters for the unused post types */
  $$('a',side).forEach(function(a){var t=a.textContent.replace(/\d+/g,'').trim();if(DEAD.test(t)){var li=a.closest('.panel,li')||a;li.style.display='none'}});
  /* badge: compact card with a copy button */
  var ban=$('.dashboard-promote-banner');
  if(ban){var img=$('img',ban),ta=$('textarea',ban);
    if(img&&ta){var b=document.createElement('div');b.id='td-badge';
      b.innerHTML='<img src="'+esc(img.getAttribute('src'))+'" alt="Three Village Local badge"><div style="flex:1;min-width:0"><p class="td-k">Free trust badge</p><b>Show your '+(vip?'VIP ':'')+'badge on your website</b><p>Customers trust businesses their neighbors recommend. Copy this code into your website and the badge links back to your listing.</p></div>';
      var box=b.lastChild,t2=document.createElement('textarea');t2.readOnly=true;t2.value=ta.value;box.appendChild(t2);
      var btn=document.createElement('button');btn.type='button';btn.textContent='Copy code';btn.onclick=function(){t2.select();try{navigator.clipboard.writeText(t2.value)}catch(e){document.execCommand('copy')}btn.textContent='Copied';setTimeout(function(){btn.textContent='Copy code'},2000)};box.appendChild(btn);
      ban.parentNode.insertBefore(b,ban)}}
  return true;
}
if(!run()){var n=0,t=setInterval(function(){if(run()||++n>40)clearInterval(t)},150)}
})();
