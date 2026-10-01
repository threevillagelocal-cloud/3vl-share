/* 3VL smart search: instant, relevance-ranked business results under the homepage search box.
   Index = search/index.json (built nightly from BD members + Member Match + AI neighbor words by 3vl-site-guard member-db).
   Ranking: best match first; paid plans only break ties (and get a badge). Enter / "See all" goes to /search_results?q=..., where p3.js
   shows the SAME matches from the same engine (BD's own keyword search is not used for keyword searches any more, 10/1/2026).
   Served from 3vl-share/live (run site/publish_live.py after editing). */
(function(){
'use strict';
var FORCE=/[?&]tvlsearch=1/.test(location.search);
var p=location.pathname.replace(/\/+$/,'')||'/';
var NOW=p==='/now'||/[?&]tvlsearch=now/.test(location.search);
var HOME=p==='/'||p==='/home';  /* 9/28: runs sitewide; attaches to the Now/homepage hero bar, the p3 hero search (#p3q on /categories, search results, category pages) or the old homepage box */
/* The matching engine lives in p3.js (window.tvlSS) so this box and the keyword results page always agree (10/1/2026). */
var SS=null;
function track(n,o){try{if(window.gtag)window.gtag('event',n,o)}catch(e){}}
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function hl(text,q){var t=esc(text),ws=SS.norm(q).split(' ').filter(function(w){return w.length>1&&!SS.STOP[w]});
  ws.forEach(function(w){t=t.replace(new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<b>$1</b>')});return t}
var CSS='#tvlss{position:absolute;left:0;right:0;top:calc(100% + 8px);z-index:9999;background:#fff;border:1px solid #e3e9f0;border-radius:18px;box-shadow:0 24px 60px rgba(15,26,40,.25);overflow:hidden;text-align:left;font-family:inherit}'+
'#tvlss[hidden]{display:none}'+
'#tvlss .ss-h{margin:0;padding:10px 16px 6px;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0a6fb5}'+
'#tvlss a.ss-r{display:flex;align-items:center;gap:12px;padding:10px 16px;text-decoration:none!important;color:#1b2f45;border-top:1px solid #f0f3f7}'+
'#tvlss a.ss-r:hover,#tvlss a.ss-r.on{background:#f3f8fd}'+
'#tvlss .ss-l{flex:0 0 44px;width:44px;height:44px;border-radius:12px;background:#eef3f8 center/cover no-repeat;border:1px solid #e3e9f0}'+
'#tvlss .ss-l.ss-ini{display:flex;align-items:center;justify-content:center;font-weight:800;color:#205081;font-size:17px;background:linear-gradient(145deg,#fff,#e8f1fa)}'+
'#tvlss .ss-t{flex:1;min-width:0}'+
'#tvlss .ss-n{display:block;font-size:16px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'#tvlss .ss-n b{color:#0a6fb5}'+
'#tvlss .ss-m{display:block;font-size:13px;color:#5b6b7d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}'+
'#tvlss .ss-b{flex:0 0 auto;font-size:10.5px;font-weight:800;letter-spacing:.08em;padding:4px 8px;border-radius:999px;text-transform:uppercase}'+
'#tvlss .ss-vip{background:linear-gradient(180deg,#ffd76a,#ffc53d);color:#1b2f45}'+
'#tvlss .ss-gn{background:#e3f4ef;color:#0f866c}'+
'#tvlss .ss-all{display:block;padding:12px 16px;border-top:1px solid #e3e9f0;background:#f7f9fc;font-size:14px;font-weight:800;color:#0a6fb5;text-decoration:none!important}'+
'#tvlss .ss-none{margin:0;padding:14px 16px;font-size:14px;color:#5b6b7d}'+
'.tvl-ns{display:flex;align-items:center;gap:8px;max-width:600px;margin:0 0 18px;padding:5px 5px 5px 16px;border-radius:999px;background:rgba(255,255,255,.13);border:1.5px solid rgba(255,255,255,.32);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 10px 30px rgba(0,0,0,.25)}'+
'.tvl-ns svg{flex:0 0 20px;width:20px;height:20px;opacity:.85}'+
'.tvl-ns input{flex:1;min-width:0;background:transparent!important;border:0!important;outline:0;box-shadow:none!important;color:#fff!important;font:600 16px/1.2 inherit;padding:9px 4px!important;height:auto!important;margin:0!important}'+
'.tvl-ns input::placeholder{color:rgba(255,255,255,.72);font-weight:500}'+
'.tvl-ns button{flex:0 0 auto;border:0;border-radius:999px;padding:10px 18px;font:800 15px/1 inherit;color:#13233a;background:linear-gradient(180deg,#ffd76a,#ffc53d);cursor:pointer;white-space:nowrap;word-break:normal}'+
'#tvlss.ss-fix{position:fixed;right:auto;top:auto}'+
'@media (max-width:600px){.tvl-ns{margin:0 0 14px}.tvl-ns button{padding:10px 14px}#tvlss a.ss-r{padding:9px 12px}#tvlss .ss-n{font-size:15px}#tvlss .ss-b{display:none}}';
function nowBar(){var dek=document.querySelector('.wk-hero2 .wk-dek')||document.querySelector('.wk-hero .wk-dek');if(!dek)return null;
  var ex=document.querySelector('.tvl-ns input');if(ex)return ex;
  var f=document.createElement('form');f.className='tvl-ns';f.action='/search_results';f.method='get';f.setAttribute('role','search');
  f.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'+
    '<input type="search" name="q" autocomplete="off" aria-label="Search local businesses" placeholder="Search local businesses">'+'<button type="submit">Search</button>';
  dek.parentNode.insertBefore(f,dek.nextSibling);return f.querySelector('input')}
function init(){
  SS=SS||window.tvlSS;if(!SS)return false;
  var fixed=false,inp;
  if(NOW||document.querySelector('.wk-hero .wk-dek')){inp=nowBar();fixed=true}
  else if(document.getElementById('p3q')){inp=document.getElementById('p3q');fixed=true}
  else if(HOME||FORCE)inp=document.querySelector('.search_box input[name=q]')||document.querySelector('form[action*="search_results"] input[name=q]');
  if(!inp||inp.getAttribute('data-ss'))return false;
  /* retire BD's alphabetical 3-per-group suggest dropdown on this box */
  if(!fixed){var fresh=inp.cloneNode(true);fresh.classList.remove('large-autosuggest-input');fresh.setAttribute('autocomplete','off');inp.parentNode.replaceChild(fresh,inp);inp=fresh}
  inp.setAttribute('data-ss','1');
  var form=inp.form,host=inp.parentNode;if(getComputedStyle(host).position==='static')host.style.position='relative';
  var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  var box=document.createElement('div');box.id='tvlss';box.hidden=true;box.setAttribute('role','listbox');
  function place(){if(!fixed)return;var b=(inp.form||inp).getBoundingClientRect(),w=Math.min(Math.max(b.width,300),window.innerWidth-20);
    box.style.left=Math.max(10,Math.min(b.left,window.innerWidth-w-10))+'px';box.style.top=(b.bottom+8)+'px';box.style.width=w+'px';box.style.maxHeight=(window.innerHeight-b.bottom-20)+'px';box.style.overflowY='auto'}
  if(fixed){box.className='ss-fix';document.body.appendChild(box);window.addEventListener('scroll',place,{passive:true});window.addEventListener('resize',place)}else host.appendChild(box);
  var sel=-1,items=[],tmr;
  function render(){var q=inp.value.trim();if(q.length<2){box.hidden=true;return}
    SS.load().then(function(){var res=SS.search(q);items=res;sel=-1;
      var h='<p class="ss-h">Best matches in Three Village</p>';
      if(!res.length)h+='<p class="ss-none">No quick match. Press Enter to search everything.</p>';
      res.forEach(function(x,i){var m=x.r.m,ini=(m.n||'?').replace(/^the\s+/i,'').charAt(0).toUpperCase(),meta=[m.c,String(m.t||'').replace(/^(East\s+)?Setauket.*$/i,'Setauket')].filter(Boolean).join(' \u00b7 ');
        h+='<a class="ss-r" role="option" href="'+esc(m.u)+'" data-i="'+i+'">'+(m.l?'<span class="ss-l" style="background-image:url(\''+esc(m.l)+'\')"></span>':'<span class="ss-l ss-ini">'+esc(ini)+'</span>')+
          '<span class="ss-t"><span class="ss-n">'+hl(m.n,q)+'</span><span class="ss-m">'+esc(meta)+'</span></span>'+(m.p==='vip'?'<span class="ss-b ss-vip">&#11088; VIP</span>':m.p==='noticed'?'<span class="ss-b ss-gn">Featured</span>':'')+'</a>'});
      h+='<a class="ss-all" href="/search_results?q='+encodeURIComponent(q)+'">See all results for &ldquo;'+esc(q)+'&rdquo; &rarr;</a>';
      box.innerHTML=h;box.hidden=false;place()})}
  inp.addEventListener('focus',SS.load);
  inp.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(render,90)});
  inp.addEventListener('keydown',function(e){var rows=box.querySelectorAll('a.ss-r');if(box.hidden||!rows.length)return;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length;[].forEach.call(rows,function(r,i){r.classList.toggle('on',i===sel)})}
    else if(e.key==='Enter'&&sel>-1){e.preventDefault();rows[sel].click();location.href=rows[sel].href}
    else if(e.key==='Escape'){box.hidden=true}});
  box.addEventListener('click',function(e){var a=e.target.closest('a.ss-r');if(a){var x=items[+a.getAttribute('data-i')];if(x)track('smart_search_click',{search_term:inp.value.trim(),biz:x.r.m.n,rank:+a.getAttribute('data-i')+1,where:p})}
    else if(e.target.closest('.ss-all'))track('smart_search_all',{search_term:inp.value.trim()})});
  document.addEventListener('click',function(e){if(!host.contains(e.target)&&!box.contains(e.target))box.hidden=true});
  if(form)form.addEventListener('submit',function(){track('smart_search_submit',{search_term:inp.value.trim()})});
  return true}
var n=0,t=setInterval(function(){n++;if(init()||n>40)clearInterval(t)},250);
})();
