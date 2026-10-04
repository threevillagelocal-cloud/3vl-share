/* 3VL premium page styles (Categories + Blog). Loaded sitewide from widget 13; acts only on its own pages.
   Business search results + Deals are NOT enabled here. */
(function(){
if(window.__p3)return;window.__p3=1;
var me=document.currentScript;var BASE=me?me.src.replace(/p3\.js.*$/,''):'';
/* Start the moment the page content has been read (not after the whole page loads), so BD's plain layout is never shown.
   Works from the page HEAD or from widget 13; whichever copy arrives first runs, the other does nothing (10/1/2026). */
var H=document.documentElement,cssOk=false,ran=false,mo=null;
function parsed(){var m=document.getElementById('main-content');return document.readyState!=='loading'||!!(m&&m.nextElementSibling)}
function done(){H.classList.add('p3-done')}
function tick(){if(ran||!cssOk||!parsed())return;ran=true;if(mo)mo.disconnect();var w;try{w=main()}finally{if(w&&w.then)w.then(done,done);else done()}}
(function(){var href=BASE+'p3.css',l=null;[].forEach.call(document.querySelectorAll('link[rel="stylesheet"]'),function(x){if(x.href===href)l=x});
  function ok(){cssOk=true;tick()}
  if(l&&l.sheet)return ok();
  if(!l){l=document.createElement('link');l.rel='stylesheet';l.href=href;(document.head||H).appendChild(l)}
  l.addEventListener('load',ok);l.addEventListener('error',ok);setTimeout(ok,3000)})();
if(!ran){mo=new MutationObserver(tick);mo.observe(H,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',tick)}
/* ---------- SMART SEARCH ENGINE (shared: homepage search box in smartsearch.js + keyword results page below) ----------
   Index = search/index.json, built nightly from BD members + Member Match + AI neighbor words (3vl-site-guard member-db). */
var SS=(function(){
var IDX='https://raw.githubusercontent.com/threevillagelocal-cloud/3vl-assets/master/search/index.json';
var STOP={the:1,a:1,an:1,and:1,of:1,'for':1,near:1,me:1,'in':1,best:1,local:1,good:1,my:1,to:1,at:1,on:1,with:1,service:1,services:1,company:1,ny:1,no:1,not:1,wont:1,cant:1,dont:1,need:1,needs:1,help:1,want:1,find:1,get:1,someone:1,who:1,can:1,i:1,is:1,it:1,im:1,please:1};
var TIER={vip:3,noticed:2,house:1,basic:0,claim:0};
var data=null,loading=null;
function track(n,o){try{if(window.gtag)window.gtag('event',n,o)}catch(e){}}
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function norm(s){return String(s||'').toLowerCase().replace(/&amp;/g,'&').replace(/[’']/g,'').replace(/[^a-z0-9&]+/g,' ').trim()}
function stem(w){if(w.length<=4)return w;var t=w.replace(/ies$/,'y').replace(/(ers|er|ing|es|s)$/,'');return t.length>=4?t:w}   /* never stem down to a stub (dining -> din) */
var SYN={ac:'hvac',hvac:'hvac heating',lawyer:'attorney lawyer law',attorney:'attorney lawyer law',vet:'veterinarian veterinary',doctor:'doctor physician medical',mechanic:'mechanic auto',car:'auto car',haircut:'hair salon barber haircut',barber:'barber hair',kids:'kids children',cpa:'accounting tax cpa',accountant:'accounting tax accountant',realtor:'real estate realtor',movers:'moving movers',daycare:'preschool childcare daycare',toothache:'dentist dental',tooth:'dentist dental',teeth:'dentist dental',wasp:'pest exterminator',wasps:'pest exterminator',bees:'pest exterminator',mice:'pest exterminator rodent',rats:'pest exterminator rodent',ants:'pest exterminator',termites:'pest exterminator termite',bugs:'pest exterminator',sprinkler:'irrigation sprinkler lawn',faucet:'plumber faucet',leak:'leak plumber',leaky:'leak plumber',outlet:'electrician',breaker:'electrician',wiring:'electrician',lawn:'lawn landscaping',mow:'lawn landscaping',snow:'snow plowing',ticks:'tick mosquito',mosquitoes:'mosquito',taxes:'tax accounting',groomer:'grooming groomer',grooming:'grooming groomer',sushi:'sushi japanese',optometrist:'optometrist optometry eye',glasses:'eyeglasses optometrist glasses',therapist:'therapist therapy counseling',gym:'gym fitness',dj:'dj'};
function load(){if(data||loading)return loading;loading=fetch(IDX+'?v='+Math.floor(Date.now()/36e5)).then(function(r){return r.json()}).then(function(j){
  data=(j.members||[]).map(function(m){return {m:m,name:norm(m.n),cat:norm(m.c+' '+(m.s||[]).join(' ')),terms:(m.k||[]).map(norm),desc:norm(m.d),town:norm(m.t)}});return data}).catch(function(){loading=null});return loading}
function lev1(a,b){if(Math.abs(a.length-b.length)>1)return false;var i=0,j=0,e=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue}if(++e>1)return false;if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++}}return e+(a.length-i)+(b.length-j)<=1}
/* How a query word can hit a field: 2 = strong (the whole word, or the word plus a normal ending: plumb+ing, dent+ist, sign+s),
   1 = loose (some other prefix like sign|ature, inside a word, or one typo), 0 = no hit.
   strict = a word WE added (a SYN meaning, e.g. toothache -> dental): only a strong hit counts.
   Loose hits exist so results appear while someone is still typing and for typos; they are dropped whenever a strong match exists
   (otherwise "signs" lists Signature realtors, "pilates" lists restaurants with "plates", "dental" pulls "rental") - 10/1/2026. */
var SUF=/^(|s|es|e|ed|er|ers|ing|ings|ist|ists|istry|ry|ery|al|y|ies|or|ors|ian|ians|ant|ants|ment|ic|ics|man|men|age)$/;
function pre(w,text){var t=' '+text+' ',i=-1,best=0;while((i=t.indexOf(' '+w,i+1))>-1){var j=i+1+w.length,k=t.indexOf(' ',j);if(SUF.test(t.slice(j,k)))return 2;best=1}return best}
function wordHit(w,text,strict){if(!text)return 0;if(w.length<=3)return (' '+text+' ').indexOf(' '+w+' ')>-1?2:0;
  var p=pre(w,text);if(p===2)return 2;if(strict)return 0;if(p===1)return 1;if(w.length>=5&&text.indexOf(w)>-1)return 1;
  if(w.length>=5){var ws=text.split(' '),sw=stem(w),f2=w.slice(0,2);for(var i=0;i<ws.length;i++)if(ws[i].length>=4&&ws[i].slice(0,2)===f2&&lev1(sw,stem(ws[i])))return 1}return 0}
function has(text,q){return q.length<=3?(' '+text+' ').indexOf(' '+q+' ')>-1:q.length<=4?(' '+text).indexOf(' '+q)>-1:text.indexOf(q)>-1}
/* r._all = every query word hit something; r._weak = some word only hit loosely, or only in the description/town; r._hit = which words hit */
function score(r,q,words){var s=0,sh=q.length<=3;
  if(r.name===q)s+=400;else if(!sh&&r.name.indexOf(q)===0)s+=220;else if(sh?has(r.name,q):(' '+r.name).indexOf(' '+q)>-1)s+=sh?180:150;
  if(q.length>2){for(var i=0;i<r.terms.length;i++){if(r.terms[i]===q){s+=160;break}if(has(r.terms[i],q)){s+=90;break}}
    if(has(r.cat,q))s+=110}
  var all=true,weak=false,hit=[];words.forEach(function(w){var best=0,cls=0;[w].concat(SYN[w]?SYN[w].split(' '):[]).forEach(function(v){var st=v!==w,ws=stem(v),c=0;
    var hn=wordHit(ws,r.name,st),hc=wordHit(ws,r.cat,st),b=Math.max(hn*45,hc*35);c=Math.max(hn,hc);
    for(var i=0;i<r.terms.length&&b<60;i++){var ht=wordHit(ws,r.terms[i],st);if(ht*30>b)b=ht*30;if(ht>c)c=ht}
    if(!b){b=wordHit(ws,r.desc,st)*8+wordHit(ws,r.town,st)*10;c=b?.5:0}   /* description/town only: a few points, but it does not count as matching the word */
    if(b>best)best=b;if(c>cls)cls=c});
    hit.push(cls>=1);if(cls>=1){if(cls<2)weak=true}else{all=false;if(best)weak=true}s+=best});
  r._all=all;r._weak=weak;r._hit=hit;
  if(words.length>1&&all)s+=40;if(!all&&words.length>1)s*=.55;
  return s}
/* whole phrases that mean one thing; swapped in before the words are looked at */
var PHRASE=[['air conditioning','hvac'],['air conditioner','hvac'],['central air','hvac'],['hot water','water heater'],['dry cleaners','drycleaner'],['dry cleaner','drycleaner'],['dry cleaning','drycleaner'],['eye doctor','optometrist'],['eye exam','optometrist'],['real estate agent','realtor'],['oil change','oil change auto']];
function search(qraw,max){var q=norm(qraw);if(q.length<2||!data)return [];
  PHRASE.forEach(function(p){if((' '+q+' ').indexOf(' '+p[0]+' ')>-1)q=(' '+q+' ').replace(' '+p[0]+' ',' '+p[1]+' ').trim()});
  var words=q.split(' ').filter(function(w){return w&&w!=='&'&&!STOP[w]});if(!words.length)words=[q];
  var out=[];data.forEach(function(r){var s=score(r,q,words);if(s>=28)out.push({r:r,s:s,all:r._all,weak:r._weak,hit:r._hit})});
  if(words.length>1){
    if(out.some(function(x){return x.all}))out=out.filter(function(x){return x.all});
    else{   /* nobody matches every word: keep a partial match only if the words it does match are the telling ones (rare words), so
               "appliance repair" does not list every auto repair shop and "dry cleaning" does not list every cleaner */
      var N=data.length,idf=words.map(function(w,i){var df=0;out.forEach(function(x){if(x.hit[i])df++});return Math.log((N+1)/(df+1))}),tot=idf.reduce(function(a,b){return a+b},0)||1;
      out=out.filter(function(x){var g=0;x.hit.forEach(function(h,i){if(h)g+=idf[i]});return g/tot>=.6})}}
  if(out.some(function(x){return !x.weak}))out=out.filter(function(x){return !x.weak});
  out.sort(function(a,b){return b.s-a.s||(TIER[b.r.m.p]||0)-(TIER[a.r.m.p]||0)||(b.r.m.l?1:0)-(a.r.m.l?1:0)||a.r.m.n.localeCompare(b.r.m.n)});
  if(out.length){var top=out[0].s;out=out.filter(function(x){return x.s>=top*.3})}   /* drop the long tail of faint matches */
  return out.slice(0,max||7)}
return {load:load,search:search,norm:norm,STOP:STOP,ok:function(){return !!data}}})();
window.tvlSS=SS;
/* keyword search page: start fetching the index now, and keep BD's page hidden until our results are in (head code: html.tvl-w3) */
var Q0='';try{Q0=decodeURIComponent(((location.search.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' ')).trim()}catch(e){}
var SMARTQ=(location.pathname.replace(/\/+$/,'')==='/search_results')&&Q0.length>1&&location.search.indexOf('bd=1')<0;   /* &bd=1 = show BD's own list (used if the index cannot load) */
if(SMARTQ){H.classList.add('tvl-w3');SS.load()}
function main(){
var path=location.pathname.replace(/\/+$/,'')||'/';
var SEARCH_ON=true;   /* business results: approved + live 9/26 */
var isResults=SEARCH_ON&&!!document.querySelector('.member_results.search_result');
if(path!=='/categories'&&path!=='/blog'&&!isResults&&!SMARTQ)return;
function $(s,r){return (r||document).querySelector(s)}function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function mount(html,anchor){var d=document.createElement('div');d.id='p3';d.className='p3';d.innerHTML=html;anchor.parentNode.insertBefore(d,anchor);document.documentElement.classList.add('p3-on');return d}
var SVG={
 palette:'<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1.2.9-1.9 2-1.9H17a4 4 0 0 0 4-4c0-5.2-4.1-10.5-9-10.5z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="9.5" cy="7" r="1.2"/><circle cx="14.5" cy="7" r="1.2"/>',
 scale:'<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0L5 7M19 7l-3 6a3 3 0 0 0 6 0l-3-6"/>',
 car:'<path d="M3 13l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 8l2 5v4H3zM6 17v2M18 17v2M3 13h18"/><circle cx="7.5" cy="15" r="1"/><circle cx="16.5" cy="15" r="1"/>',
 scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
 briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5 5"/>',
 hammer:'<path d="M13 7l-9 9 3 3 9-9M12 4h5l3 3v2l-2 2-5-5z"/>',
 steth:'<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
 cross:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
 grad:'<path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5M22 9v5"/>',
 ticket:'<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM14 7v10"/>',
 sprout:'<path d="M12 21v-9M12 12C12 7 8.5 5 4 5c0 4.5 3.2 7 8 7zM12 10c0-4 3-6 8-6 0 4-3 6-8 6"/>',
 dollar:'<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.8 3 2 3 .9 3 2.1-1.3 2-3 2c-1.5 0-2.6-.6-3-1.6M12 6.5v11"/>',
 dumbbell:'<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"/>',
 pulse:'<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1zM4 12h3.5l1.5-2.5 2.5 5 1.5-2.5H20"/>',
 home:'<path d="M3 10.5L12 3l9 7.5M5 9v12h14V9M10 21v-6h4v6"/>',
 bed:'<path d="M3 18V7M3 13h18v5M21 18v-2.5A3.5 3.5 0 0 0 17.5 12H10v1"/><circle cx="6.5" cy="10" r="1.8"/>',
 columns:'<path d="M3 21h18M5 21V10M9.5 21V10M14.5 21V10M19 21V10M2 10l10-6 10 6z"/>',
 anchor:'<circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 13a7 7 0 0 0 14 0M3 13h4M17 13h4"/>',
 megaphone:'<path d="M3 10v4h3l7 5V5l-7 5H3zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>',
 glass:'<path d="M8 3h8l-.5 6a3.5 3.5 0 0 1-7 0zM12 12.5V20M8.5 21h7"/>',
 heart:'<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1z"/>',
 receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>',
 paw:'<circle cx="7" cy="9.5" r="1.6"/><circle cx="10.5" cy="6" r="1.6"/><circle cx="14.5" cy="6" r="1.6"/><circle cx="17.5" cy="9.5" r="1.6"/><path d="M8 17c0-3 2-5 4-5s4 2 4 5c0 2-2 2.4-4 2s-4 0-4-2z"/>',
 clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/>',
 building:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10.5 21v-3h3v3"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
 utensils:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>',
 bag:'<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
 trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6M10 17h4"/>',
 laptop:'<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'};
var MAP=[['arts','palette'],['attorney','scale'],['automotive','car'],['beauty','scissors'],['business-services','briefcase'],['community','users'],['contractor','hammer'],['doctor','steth'],['medical','cross'],['education','grad'],['events','ticket'],['farm','sprout'],['financial','dollar'],['fitness-center','dumbbell'],['health','pulse'],['home','home'],['hotel','bed'],['local-government','columns'],['marine','anchor'],['marketing','megaphone'],['nightlife','glass'],['non-profit','heart'],['payroll','receipt'],['pet','paw'],['professional','clipboard'],['public-services','building'],['real-estate','key'],['restaurant','utensils'],['shopping','bag'],['sports','trophy'],['fitness-sports','trophy'],['technology','laptop']];
function iconFor(slug){var k='star';for(var i=0;i<MAP.length;i++){if(slug.indexOf(MAP[i][0])>=0){k=MAP[i][1];break}}
  return '<svg viewBox="0 0 24 24" aria-hidden="true">'+SVG[k]+'</svg>'}
var COLORS=['#006fbb','#d9534f','#0f866c','#f0ad4e','#8e5bd6','#205081','#3aa0e8'];

/* ---------- BUSINESS RESULTS (search + category pages) ---------- */
if(isResults||SMARTQ){
  /* SM = our smart matches for a keyword search (same engine as the search box), or null to restyle BD's own list (category pages) */
  var results=function(SM){var api=null;
  var VIP=['71','78','112','115','122','137','138','142','151','217','228','240','299','364','474','484','499','528','552','684'];
  /* top-spot limit per category: listed ids yield their featured spot when the page already has VMAX other featured members */
  var COMP=['71'],VMAX=3,paidV=-1;
  var q=Q0;
  var h1=$('h1');var catName=!q&&h1?h1.textContent.trim():'';
  function read(it){var g=function(p){var m=it.querySelector('[itemprop="'+p+'"]');return m?(m.getAttribute('content')||m.getAttribute('href')||''):''};
    var uid=(it.querySelector('.postItem')||{getAttribute:function(){return ''}}).getAttribute('data-userid')||'';
    var u=(it.querySelector('[itemtype$="LocalBusiness"] link[itemprop="url"]')||{}).href||'';
    return {n:g('name'),u:u.replace(/#.*$/,''),img:g('image'),tel:g('telephone'),d:g('description'),st:g('streetAddress'),zip:g('postalCode'),reg:g('addressRegion'),town:(g('addressLocality')||'').replace('Setauket- East Setauket','East Setauket'),uid:uid,vip:VIP.indexOf(uid)>=0||/(^| )level_(1|8)( |$)/.test(((it.closest&&it.closest('.member_results'))||it).className||'')}}
  function fmtTel(t){t=(t||'').replace(/[^\d]/g,'').slice(-10);return t.length===10?t.slice(0,3)+'-'+t.slice(3,6)+'-'+t.slice(6):''}
  function maps(b){return 'https://www.google.com/maps/search/?api=1&amp;query='+encodeURIComponent(b.n+' '+(b.st||'')+' '+b.town)}
  function addr(b){return [b.st,b.town].filter(function(x){return x&&!/^n\/?a$/i.test(x)}).join(', ')||'Three Village'}
  var vips=[];
  function vipCard(b,idx){var tel=fmtTel(b.tel),t=tel.replace(/-/g,'');
    return '<div class="p3-vwrap" data-i="'+idx+'" data-uid="'+esc(b.uid)+'" data-name="'+esc(b.n)+'"><div class="p3-vcard"><span class="p3-ftab">&#9733; FEATURED</span>'+
      '<div class="p3-vmedia"><a class="p3-vart" data-act="profile" href="'+esc(b.u)+'" data-uid="'+esc(b.uid)+'" title="View full profile"><img src="'+esc(b.img)+'" alt="'+esc(b.n)+'" loading="lazy"></a><a class="p3-vprof" data-act="profile" href="'+esc(b.u)+'">View profile &rarr;</a></div>'+
      '<div class="p3-vbody"><a class="p3-vname" data-act="profile" href="'+esc(b.u)+'">'+esc(b.n)+'</a>'+
      '<p class="p3-vloc">&#128205; '+esc(addr(b))+'</p><p class="p3-vd">'+esc(b.d)+'</p>'+
      '<div class="p3-vacts">'+(tel?'<a class="p3-call p3-callbig" data-act="call" href="tel:'+t+'">&#128222; '+tel+'</a><a class="p3-text" data-act="text" href="sms:'+t+'">&#128172; Text</a>':'')+
      '<a data-act="directions" href="'+maps(b)+'" target="_blank" rel="noopener">&#128205; Directions</a>'+
      '<button type="button" class="p3-vcf" data-act="save_contact" title="Save to your phone contacts">&#128100; Save</button></div></div>'+
      '<aside class="p3-vside" data-uid="'+esc(b.uid)+'" data-u="'+esc(b.u)+'"></aside></div></div>'}
  function card(b,i){var tel=fmtTel(b.tel);
    return '<div class="p3-rcard" style="--i:'+(i%12)+'"><a class="p3-rtop" href="'+esc(b.u)+'"><img src="'+esc(b.img)+'" alt="" loading="lazy"><div><b>'+esc(b.n)+'</b><small>&#128205; '+esc(b.town||'Three Village')+'</small></div></a>'+
      '<p class="p3-rd">'+esc(b.d.slice(0,140))+(b.d.length>140?'&hellip;':'')+'</p><div class="p3-racts">'+(tel?'<a class="p3-call" href="tel:'+tel.replace(/-/g,'')+'">&#128222; Call</a>':'')+
      '<a href="'+maps(b)+'" target="_blank" rel="noopener">&#128205; Map</a><a class="p3-view" href="'+esc(b.u)+'">View profile &rarr;</a></div></div>'}
  var title=q?'Results for <em>&ldquo;'+esc(q)+'&rdquo;</em>':'<em>'+esc(catName||'Local Businesses')+'</em>';
  var h='<header class="p3-phero" style="background-image:url(\''+BASE+'img/village-hero.jpg\')"><div class="p3-phin"><span class="p3-kick">THREE VILLAGE LOCAL</span><h1 class="p3-h1">'+title+'</h1>'+
    '<p class="p3-sub">Local businesses rated by your neighbors. Call, get directions or see the full profile.</p></div><span class="p3-credit">Photo: Iracaz, CC BY-SA 3.0</span></header>'+
    '<div class="p3-vlist" id="p3vl"></div><h2 class="p3-more" id="p3more" hidden>More local businesses</h2><div class="p3-rgrid" id="p3rg"></div>';
  var first=$('.member_results.search_result');
  var root=mount(h,first?(first.closest('[itemprop="mainEntity"]')||first):($('.content_w_sidebar.member_results [itemprop="mainEntity"]')||$('.content_w_sidebar.member_results .grid-container')||$('.member_results_header')));
  /* specialty row under the hero on category + specialty pages (data: search/subcats.json, published nightly by 3vl-site-guard member-db) */
  (function(){var segs=path.split('/').filter(Boolean);if(q||segs.length!==1)return;var cur=segs[0];
    try{fetch('https://raw.githubusercontent.com/threevillagelocal-cloud/3vl-assets/master/search/subcats.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(d){
      if(!d||!d.cats)return;var top=d.cats[cur]?cur:(d.sub||{})[cur];var c=top&&d.cats[top];if(!c||!c.s||c.s.length<2)return;
      var tw=(c.n||'').replace(/s$/,'').toLowerCase();
      function short(n){var l=n.toLowerCase(),e=[' '+tw,' '+tw+'s'];for(var k=0;k<e.length;k++){if(tw&&l.length>e[k].length+2&&l.slice(-e[k].length)===e[k])return n.slice(0,n.length-e[k].length)}return n}
      var chip=function(href,label,n,on){return '<a class="p3-spc'+(on?' on':'')+'" href="'+esc(href)+'"'+(on?' aria-current="page"':'')+'>'+esc(label)+(n?' <span>'+n+'</span>':'')+'</a>'};
      var html='<nav class="p3-specs" aria-label="'+esc(c.n)+' specialties"><div class="p3-strack">'+
        chip('/'+top,'All',0,cur===top)+c.s.map(function(x){return chip('/'+x[0],short(x[1]),x[2],cur===x[0])}).join('')+
        '<button type="button" class="p3-smore" hidden></button></div></nav>';
      var hero=$('.p3-phero',root);if(!hero)return;hero.insertAdjacentHTML('afterend',html);
      var nav=$('.p3-specs',root),tr=$('.p3-strack',nav),more=$('.p3-smore',tr),chips=[].slice.call(tr.querySelectorAll('.p3-spc')),open=false;
      /* wrap to at most 2 lines; the rest sit behind a "+ N more" button (opens them all) */
      function fit(){chips.forEach(function(x){x.hidden=false});more.hidden=true;if(open){more.hidden=false;more.textContent='Show fewer';return}
        var tops=[];chips.forEach(function(x){var t=x.offsetTop;if(tops.indexOf(t)<0)tops.push(t)});if(tops.length<=2)return;
        var lim=tops.sort(function(a,b){return a-b})[1],cut=chips.length;for(var i=0;i<chips.length;i++){if(chips[i].offsetTop>lim){cut=i;break}}
        var on=tr.querySelector('.p3-spc.on');if(on&&chips.indexOf(on)>=cut){open=true;return fit()}
        more.hidden=false;for(;cut>1;cut--){chips.forEach(function(x,j){x.hidden=j>=cut});more.textContent='+ '+(chips.length-cut)+' more';if(more.offsetTop<=lim)break}}
      more.addEventListener('click',function(){open=!open;fit()});
      var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(fit,150)});fit();
      nav.addEventListener('click',function(e){var a=e.target.closest('.p3-spc');try{if(a&&window.gtag)window.gtag('event','category_specialty_click',{category:c.n,specialty:a.textContent.trim()})}catch(x){}});
    }).catch(function(){})}catch(x){}})();
  var VL=$('#p3vl'),RG=$('#p3rg'),MORE=$('#p3more'),nRest=0;
  function hideChrome(){$$('.feature_results_header,.post-search-result-count-container,.member-search-result-count-container,.member-search-result-filters,.views,.sort-members-select').forEach(function(e){if(!root.contains(e))e.style.display='none'});
    if(h1&&!root.contains(h1))(h1.closest('.feature_results_header')||h1).style.display='none';
    var more=document.querySelector('.clickToLoadMoreContainer');
    if(SM){if(more)more.style.display='none';$$('.no-results-members,.member_results_header,.content_w_sidebar.member_results .pagination-container,.content_w_sidebar.member_results ul.pagination').forEach(function(e){if(!root.contains(e))e.style.display='none'});
      $$('.member_results.search_result:not([data-p3])').forEach(function(it){it.setAttribute('data-p3','1');it.style.display='none'});return}
    if(more){more.style.cssText='position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden'}}  /* 10/4/2026: keep BD's load-more box where BD's lazy loader looks for it (.grid-container .clickToLoadMoreContainer); moving it into #p3 made BD drop every next page */
  hideChrome();document.addEventListener('DOMContentLoaded',hideChrome);window.addEventListener('load',hideChrome);
  /* seamless auto-load: when the end of our list comes near, press BD's load-more for the visitor */
  if(!SM){var sent=document.createElement('div');sent.className='p3-sentinel';sent.innerHTML='<span>Loading more businesses&hellip;</span>';root.appendChild(sent);
  }var busy=false;
  function loadMore(){var btn=document.querySelector('.clickToLoadMoreBtn'),cont=btn&&btn.closest('.clickToLoadMoreContainer');
    var cur=+((document.querySelector('.current__amount__js')||{}).textContent||0),tot=+((document.querySelector('.total__js')||{}).textContent||0);
    if(!btn||(tot&&cur>=tot)||(cont&&getComputedStyle(cont).display==='none')||btn.offsetParent===null&&cont&&cont.style.display==='none'){sent.style.display='none';return}
    if(busy||/loadingMore/.test(btn.className))return;busy=true;sent.classList.add('is-on');btn.click();
    setTimeout(function(){busy=false},1500)}
  var inView=false;if(!SM&&'IntersectionObserver' in window)new IntersectionObserver(function(es){inView=es[0].isIntersecting;if(inView)loadMore()},{rootMargin:'0px 0px 900px 0px'}).observe(sent);
  /* 10/4/2026 heartbeat: while the end of the list is on screen keep asking BD for the next page (a press made before BD's loader was ready was lost, and pages that never scroll gave no second chance); loadMore() itself stops when everything is loaded */
  if(!SM){var hb=setInterval(function(){if(sent.style.display==='none'){clearInterval(hb);return}if(inView||sent.getBoundingClientRect().top<innerHeight+900)loadMore()},1200)}  /* reached OR scrolled past the end of the list */

  /* value panel from vip_meta.json (public listing details) */
  var META=null;
  function yrs(y){var n=new Date().getFullYear()-(+y);return n>0?n:0}
  function side(m,u){var T=[];
    if(m.verified)T.push('<span class="p3-b p3-bok">&#10003; Verified</span>');
    if(m.rating)T.push('<span class="p3-b p3-bstar">&#9733; '+m.rating.toFixed(1)+' <small>('+m.reviews+')</small></span>');
    if(m.since&&yrs(m.since)>0)T.push('<span class="p3-b p3-bcal">Since '+esc(m.since)+'</span>');
    var h='<p class="p3-vsh">Why neighbors choose them</p>'+(T.length?'<div class="p3-badges">'+T.join('')+'</div>':'');
    if(m.specs&&m.specs.length)h+='<div class="p3-vspecs">'+m.specs.slice(0,2).map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+'</div>';
    var L=[];if(m.web)L.push('<a data-act="website" href="'+esc(m.web)+'" target="_blank" rel="noopener">Website</a>');if(m.fb)L.push('<a data-act="facebook" href="'+esc(m.fb)+'" target="_blank" rel="noopener">Facebook</a>');if(m.ig)L.push('<a data-act="instagram" href="'+esc(m.ig)+'" target="_blank" rel="noopener">Instagram</a>');
    L.push('<a class="p3-vrev" data-act="review" href="'+esc(u.replace(/\/$/,''))+'/writeareview">&#9733; '+(m.reviews?'Review':'First review')+'</a>');
    return h+'<div class="p3-vlinks">'+L.join('')+'</div>'}
  function fillSides(){if(!META)return;$$('.p3-vside:not(.is-filled)',root).forEach(function(a){var m=META[a.getAttribute('data-uid')];a.classList.add('is-filled');if(m){a.innerHTML=side(m,a.getAttribute('data-u'));a.parentNode.classList.add('has-side')}});eqSoon()}
  fetch('https://raw.githubusercontent.com/threevillagelocal-cloud/3vl-assets/master/search/vip_meta.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return fetch(BASE+'vip_meta.json').then(function(r){return r.json()})}).then(function(M){META=M;fillSides()}).catch(function(){});  /* nightly from 3vl-site-guard member-db (10/4/2026) */

  /* logos: trim baked-in white margins so they fill the box */
  function trim(img){try{var w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)return;var c=document.createElement('canvas'),k=Math.min(1,600/Math.max(w,h));c.width=Math.round(w*k);c.height=Math.round(h*k);
      var x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);var d=x.getImageData(0,0,c.width,c.height).data,W=c.width,H=c.height,t=H,l=W,r=0,b=0;
      for(var y=0;y<H;y++)for(var X=0;X<W;X++){var i=(y*W+X)*4;if(d[i+3]>20&&(d[i]<235||d[i+1]<235||d[i+2]<235)){if(y<t)t=y;if(y>b)b=y;if(X<l)l=X;if(X>r)r=X}}
      if(r<=l||b<=t)return;var pad=Math.round(Math.max(r-l,b-t)*.04);l=Math.max(0,l-pad);t=Math.max(0,t-pad);r=Math.min(W-1,r+pad);b=Math.min(H-1,b+pad);
      if((r-l)*(b-t)>W*H*.92)return;
      var o=document.createElement('canvas');o.width=r-l+1;o.height=b-t+1;o.getContext('2d').drawImage(c,l,t,o.width,o.height,0,0,o.width,o.height);
      img.onload=null;img.src=o.toDataURL('image/png');img.parentNode.classList.add('is-logo');eqSoon()}catch(e){}}
  function wireImgs(scope){$$('.p3-vart img:not([data-w]), .p3-rtop img:not([data-w])',scope).forEach(function(img){img.setAttribute('data-w','1');img.loading='eager';if(img.complete&&img.naturalWidth)trim(img);else img.onload=function(){trim(img)}})}

  /* equal height for all VIP cards (desktop) */
  function equal(){var cs=$$('.p3-vcard',root);cs.forEach(function(c){c.style.minHeight=''});if(window.innerWidth<761)return;
    var m=0;cs.forEach(function(c){m=Math.max(m,c.getBoundingClientRect().height)});cs.forEach(function(c){c.style.minHeight=Math.ceil(m)+'px'})}
  var eqT;function eqSoon(){clearTimeout(eqT);eqT=setTimeout(equal,150)}
  window.addEventListener('resize',eqSoon);

  /* convert every BD result, including the ones BD loads as you scroll */
  function absorb(){var items=$$('.member_results.search_result:not([data-p3])');if(!items.length)return;
    var vh='',rh='';
    if(paidV<0){paidV=0;items.forEach(function(it){var x=read(it);if(x.vip&&COMP.indexOf(x.uid)<0)paidV++})}
    items.forEach(function(it){it.setAttribute('data-p3','1');it.style.display='none';var b=read(it);if(!b.n)return;
      if(b.vip&&COMP.indexOf(b.uid)>=0&&!SM&&paidV>=VMAX)b.vip=false;
      if(b.vip){vips.push(b);vh+=vipCard(b,vips.length-1)}else{rh+=card(b,nRest++)}});
    if(vh)VL.insertAdjacentHTML('beforeend',vh);if(rh)RG.insertAdjacentHTML('beforeend',rh);
    MORE.hidden=!(vips.length&&nRest);wireImgs(root);fillSides();hideChrome();eqSoon();
    if(typeof sent!=='undefined'){sent.classList.remove('is-on');root.appendChild(sent);busy=false;
      var r=sent.getBoundingClientRect();if(r.top<innerHeight+900)setTimeout(loadMore,400)}}
  if(SM){
    var dec=function(s){var t=document.createElement('textarea');t.innerHTML=s||'';return t.value};
    var wait=document.createElement('p');wait.className='p3-none';wait.textContent='Finding the best local matches...';
    wait.style.visibility='hidden';setTimeout(function(){wait.style.visibility=''},600);   /* only mention it if it really takes a moment */
    var fillSmart=function(list){if(wait.parentNode)wait.parentNode.removeChild(wait);
    var vh='',rh='';list.forEach(function(m){var uid=String(m.id),b={n:dec(m.n),u:m.u,img:m.l||'',tel:m.ph||'',d:dec(m.d||''),st:dec(m.a||''),zip:m.z||'',reg:'NY',town:String(m.t||'').replace('Setauket- East Setauket','East Setauket'),uid:uid,vip:VIP.indexOf(uid)>=0||m.p==='vip'};
      if(b.vip){vips.push(b);vh+=vipCard(b,vips.length-1)}else{rh+=card(b,nRest++)}});
    if(vh)VL.insertAdjacentHTML('beforeend',vh);if(rh)RG.insertAdjacentHTML('beforeend',rh);
    MORE.hidden=!(vips.length&&nRest);wireImgs(root);fillSides();hideChrome();eqSoon();
    try{if(window.gtag)window.gtag('event','smart_search_results',{search_term:q,results:list.length})}catch(e){}};
    hideChrome();new MutationObserver(function(){hideChrome()}).observe(document.body,{childList:true,subtree:true});
    if(SM.length)fillSmart(SM);else root.appendChild(wait);   /* [] = index still on its way (slow connection): show the page frame now, fill it when it lands */
    api={fill:fillSmart,none:function(down){wait.style.visibility='';wait.innerHTML=(down?'We could not load the results just now. Please try again in a moment':'No local match for &ldquo;'+esc(q)+'&rdquo; yet. Try another word')+', or <a href="/categories">browse every category</a>.';if(!wait.parentNode)root.appendChild(wait);
      try{if(window.gtag)window.gtag('event','smart_search_results',{search_term:q,results:0})}catch(e){}}};
  }else{
  absorb();
  new MutationObserver(function(){absorb()}).observe(document.body,{childList:true,subtree:true});
  }

  /* interactions + tracking (GA4 vip_card_click) */
  function track(act,w){try{if(window.gtag)window.gtag('event','vip_card_click',{action:act,business:w.getAttribute('data-name'),business_id:w.getAttribute('data-uid'),page:location.pathname+location.search})}catch(e){}}
  function vcf(b){var t=(b.tel||'').replace(/[^\d]/g,'').slice(-10),L=['BEGIN:VCARD','VERSION:3.0','FN:'+b.n,'ORG:'+b.n];
    if(t)L.push('TEL;TYPE=WORK,VOICE:+1'+t);
    if(b.st||b.town)L.push('ADR;TYPE=WORK:;;'+(b.st||'')+';'+(b.town||'')+';'+(b.reg||'NY')+';'+(b.zip||'')+';USA');
    var m=(META||{})[b.uid]||{};if(m.web)L.push('URL:'+m.web);L.push('URL;TYPE=3VL:'+b.u);L.push('NOTE:Found on Three Village Local - threevillagelocal.com');L.push('END:VCARD');
    var blob=new Blob([L.join('\r\n')],{type:'text/vcard'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=b.n.replace(/[^\w ]+/g,'').trim()+'.vcf';
    document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1500)}
  root.addEventListener('click',function(e){var a=e.target.closest('[data-act]');if(!a)return;var w=a.closest('.p3-vwrap');if(!w)return;
    var b=vips[+w.getAttribute('data-i')],act=a.getAttribute('data-act');track(act,w);
    if(act==='save_contact'){e.preventDefault();vcf(b)}});
  return api};
  if(SMARTQ){
    /* same matches as the search box. If the index is slow, show our page frame with a 'finding matches' line after 0.7s rather than a blank
       page, and NEVER BD's 'no results' (its literal keyword search is what failed on toothache / leaky faucet). */
    return new Promise(function(ok){var ui=null,fin=false,tm=0;
      function end(){if(fin)return;fin=true;clearTimeout(tm);var res=[];try{res=SS.search(Q0,48).map(function(x){return x.r.m})}catch(e){}
        if(!SS.ok()&&!ui){try{if(isResults)results(null)}catch(e){}ok();return}   /* index could not be loaded: leave BD's own page */
        try{if(res.length){if(ui)ui.fill(res);else results(res)}else if(ui){if(!SS.ok()&&isResults){location.replace(location.pathname+location.search+'&bd=1');return}ui.none(!SS.ok())}else if(isResults)results(null);else results([]).none()}catch(e){}
        ok()}
      var w=SS.load();if(SS.ok())return end();
      try{ui=results([])}catch(e){}ok();   /* index not here yet: put our page frame up right away, cards drop in when it lands */
      if(w&&w.then)w.then(end,end);else end()})}
  results(null);return
}

/* ---------- CATEGORIES ---------- */
if(path==='/categories'){
  /* 10/2/2026 (owner): no "Join Our Community" box in this page's side column, and always two VIP banners on desktop.
     vipads.js shows its second banner only when the page is taller than 2400px; on wide screens this page is a bit shorter, so catFit() below pads the grid to reach it. */
  (function(){var st=document.createElement('style');st.textContent='.member-join-offer{display:none!important}';document.head.appendChild(st)})();
  var panels=$$('.categories-panel');if(!panels.length)return;
  var cats=panels.map(function(p,i){var a=$('.topClass',p);var subs=$$('.sub-level-link > a.sub-category',p).map(function(x){return {n:x.textContent.trim(),h:x.getAttribute('href')}});
    return {n:a.textContent.trim(),h:a.getAttribute('href'),slug:(a.getAttribute('href')||'').replace('/',''),subs:subs,c:COLORS[i%COLORS.length]}});
  var quick=['Restaurants','Contractor','Home Services','Health & Wellness','Attorney','Real Estate','Beauty & Personal Care','Pet Services'].map(function(n){
    var m=cats.filter(function(c){return c.n.toLowerCase().indexOf(n.toLowerCase().split(' ')[0])===0})[0];return m?{n:n,h:m.h}:null}).filter(Boolean);
  var h='<header class="p3-phero" style="background-image:url(\''+BASE+'img/cafe-hero.jpg\')"><div class="p3-phin"><span class="p3-kick">THREE VILLAGE LOCAL</span><h1 class="p3-h1">Explore <em>Three Village</em></h1>'+
    '<p class="p3-sub">The local businesses your neighbors trust, all in one place.</p>'+
    '<form class="p3-search p3-hsearch" action="/search_results" method="get"><span>&#128269;</span><input id="p3q" name="q" autocomplete="off" placeholder="What are you looking for? Try &quot;pizza&quot;, &quot;plumber&quot;, &quot;dentist&quot;&hellip;"></form></div>'+
    '<span class="p3-credit">Photo: Shixart1985, CC BY 2.0</span></header>'+
    '<div class="p3-chips">'+quick.map(function(q){return '<a class="p3-chip" href="'+esc(q.h)+'">'+esc(q.n)+'</a>'}).join('')+'</div>'+
    '<div class="p3-cgrid">'+cats.map(function(c,i){return '<a class="p3-ctile" href="'+esc(c.h)+'" data-n="'+esc((c.n+' '+c.subs.map(function(s){return s.n}).join(' ')).toLowerCase())+'" style="--c:'+c.c+';--i:'+(i%12)+'"><span class="p3-cic">'+iconFor(c.slug)+'</span><span class="p3-ctx"><b>'+esc(c.n).replace(/\//g,'/<wbr>')+'</b><small>'+(c.subs.length?c.subs.length+' specialt'+(c.subs.length===1?'y':'ies'):'Browse all')+'</small></span><em>&rarr;</em></a>'}).join('')+'</div>'+
    '<p class="p3-none" id="p3none"></p>';
  var anchor=$('.category_filter_module')||panels[0];var root=mount(h,anchor);
  $$('.category_filter_module,.categories-panel').forEach(function(e){e.style.display='none'});
  var catFit=function(){if(innerWidth<992)return;root.style.paddingBottom='';var d=2410-document.documentElement.scrollHeight;if(d>0)root.style.paddingBottom=d+'px'};
  catFit();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',catFit);
  $$('h1,h2').forEach(function(x){if(/Businesses by Category/.test(x.textContent)&&!root.contains(x))x.style.display='none'});
  var none=$('#p3none');
  $('#p3q').addEventListener('input',function(){var q=this.value.toLowerCase().trim(),n=0;$$('.p3-ctile').forEach(function(t){var ok=!q||t.getAttribute('data-n').indexOf(q)>=0;t.style.display=ok?'':'none';if(ok)n++});
    none.innerHTML=q&&!n?'No category matches &ldquo;'+esc(this.value)+'&rdquo;. <a href="/search_results?q='+encodeURIComponent(this.value)+'">Search every business for it &rarr;</a>':''});
}

/* ---------- BLOG ---------- */
if(path==='/blog'){
  var q0=/[?&]q=/.test(location.search);   /* keep BD's own layout for keyword searches */
  if(q0)return;
  var items=$$('.search_result');if(!items.length)return;
  function dfmt(s){var m=s.match(/(\d+)\/(\d+)\/(\d+)/);if(!m)return s;var M=['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];return M[+m[1]-1]+' '+(+m[2])+', '+m[3]}
  function read(it){var a=$('.mid_section a.h3',it)||$('a.h3',it),img=$('img.search_result_image',it),d=$('.posted_meta_data span',it),p=$('.mid_section p',it);
    if(!a)return null;var ex=p?p.textContent.replace(/View More/,'').replace(/\s+/g,' ').trim():'';
    return {t:a.textContent.trim(),h:a.getAttribute('href'),img:img?img.getAttribute('src').replace('news-pictures-thumbnails','news-pictures'):'',thumb:img?img.getAttribute('src'):'',d:d?d.textContent.replace('Posted','').trim():'',ex:ex}}
  function hide(it){it.style.display='none';it.setAttribute('data-p3','1');var n=it.nextElementSibling;while(n&&(n.tagName==='HR'||/^clearfix$/.test(n.className))){n.style.display='none';n=n.nextElementSibling}}
  /* our small WebP copies (3vl-share/t/gen.py, same naming as sm() in weekender.js); a missing copy falls back to BD's full photo, then its thumbnail */
  function fnv(s){s=unescape(encodeURIComponent(s));for(var h=0x811c9dc5,i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),0x01000193)>>>0;return ('0000000'+h.toString(16)).slice(-8)}
  function sm(u,w){u=String(u||'');if(!u)return u;if(u.charAt(0)==='/'&&u.charAt(1)!=='/')u=location.origin+u;return /^https?:/i.test(u)?'https://threevillagelocal-cloud.github.io/3vl-share/t/'+fnv(u)+'-'+w+'.webp':u}
  window.__p3be=function(im){var d=im.dataset,n=+(d.e||0);im.removeAttribute('srcset');d.e=n+1;if(n===0&&d.t)im.src=d.t;else if(n<2)im.src=d.f};
  /* BD's 525px thumbnail is already downloaded with the page, so it is the base; phones (sharper screens) take the 800px copy, or BD's full photo for posts loaded later (no copy of those) */
  function pic(p,extra,cp){return '<img src="'+esc(p.thumb||p.img)+'"'+(p.thumb?' srcset="'+esc(p.thumb)+' 525w, '+esc(cp?sm(p.img,800):p.img)+(cp?' 800w':' 1200w')+'" sizes="(max-width:700px) 92vw, (max-width:1100px) 46vw, 380px"':'')+' alt="'+esc(p.t)+'" '+extra+' onerror="__p3be(this)" data-f="'+esc(p.img)+'" data-t="'+esc(p.thumb)+'">'}
  function card(p,i,cp){return '<a class="p3-bcard" href="'+esc(p.h)+'" style="--i:'+(i%9)+'"><div class="p3-bimg">'+pic(p,'loading="lazy"',cp)+'</div><div class="p3-bb"><p class="p3-date">'+esc(dfmt(p.d))+'</p><h3>'+esc(p.t)+'</h3><p>'+esc(p.ex.slice(0,120))+(p.ex.length>120?'&hellip;':'')+'</p></div></a>'}
  function ts(p){var m=(p.d||'').match(/(\d+)\/(\d+)\/(\d+)/);return m?new Date(+m[3],+m[1]-1,+m[2]).getTime():0}
  var posts=items.map(read).filter(Boolean).sort(function(a,b){return ts(b)-ts(a)});   /* BD pins featured posts first; lead with the newest */
  var lead=posts[0],rest=posts.slice(1);
  var mos=posts.slice(0,6).map(function(p){return '<span style="background-image:url(\''+esc(p.thumb||p.img)+'\')"></span>'}).join('');
  var h='<header class="p3-hero"><div class="p3-mosaic">'+mos+'</div><div class="p3-hin"><span class="p3-kick">THREE VILLAGE LOCAL</span><h1 class="p3-h1">Local <em>Stories</em></h1><p class="p3-sub">Neighbors, businesses, events and the news that matters in Stony Brook, Setauket and Port Jefferson.</p></div></header>'+
    '<a class="p3-lead" href="'+esc(lead.h)+'"><div class="p3-limg"><img src="'+esc(lead.thumb||lead.img)+'" data-hi="'+esc(sm(lead.img,800))+'" alt="'+esc(lead.t)+'" fetchpriority="high" onerror="__p3be(this)" data-f="'+esc(lead.img)+'" data-t="'+esc(lead.thumb)+'"></div><div class="p3-lb"><p class="p3-date"><span class="p3-new">&#9679; LATEST</span> '+esc(dfmt(lead.d))+'</p><h2>'+esc(lead.t)+'</h2><p>'+esc(lead.ex)+'</p><span class="p3-go">Read the story &rarr;</span></div></a>'+
    '<div class="p3-bgrid" id="p3grid">'+rest.map(function(p,i){return card(p,i,1)}).join('')+'</div>';
  var root=mount(h,items[0].closest('[itemprop="mainEntity"]')||items[0]);
  items.forEach(hide);
  /* lead photo: BD's thumbnail is already on its way, so it shows first; the sharper 800px copy replaces it once loaded */
  (function(li){if(!li||!li.dataset.hi)return;var hi=new Image();hi.onload=function(){li.src=hi.src};hi.src=li.dataset.hi})($('.p3-limg img',root));
  function hideTop(){$$('.feature_results_header,.post-search-result-count-container,.views').forEach(function(e){if(!root.contains(e))e.style.display='none'})}
  hideTop();document.addEventListener('DOMContentLoaded',hideTop);window.addEventListener('load',hideTop);
  /* BD loads more posts as you scroll: turn each new one into a card */
  var grid=$('#p3grid'),seen={},n=rest.length;posts.forEach(function(p){seen[p.h]=1});
  new MutationObserver(function(){$$('.search_result:not([data-p3])').forEach(function(it){var p=read(it);hide(it);if(p&&!seen[p.h]){seen[p.h]=1;grid.insertAdjacentHTML('beforeend',card(p,n++))}})}).observe(document.body,{childList:true,subtree:true});
}
}
})();
/* Member dashboard cards (9/27): promo card for everyone, Member Match card for Basic (plan 6).
   /member-match remembers a submit on this device and skips straight to the dashboard next login. */
(function(){
if(window.__p3b)return;window.__p3b=1;
function run(){
var path=location.pathname.replace(/\/+$/,'');var K='3vl_mm_done';
function get(){try{return localStorage.getItem(K)}catch(e){return null}}
function set(){try{localStorage.setItem(K,'1')}catch(e){}}
if(path==='/member-match'){
  var edit=/[?&]edit=1/.test(location.search);
  if(get()&&!edit){location.replace('/account/home');return}
  /* other devices: an hourly job writes finished member IDs into window.MM_DONE on this page */
  if(!edit&&window.MM_DONE&&MM_DONE.length&&window.fetch){
    fetch('/account/home',{credentials:'same-origin'}).then(function(r){return r.text()}).then(function(t){
      var m=t.match(/Member ID #(\d+)/);if(m&&MM_DONE.indexOf(+m[1])>-1){set();location.replace('/account/home')}
    }).catch(function(){});
  }
  document.addEventListener('submit',function(e){
    if(!e.target||!/^member_match/.test(e.target.name||''))return;set();
    /* after BD shows its thank-you, point its "Back To Previous Page" button at the dashboard */
    var n=0,t=setInterval(function(){n++;var a=[].filter.call(document.querySelectorAll('#main-content a,#main-content button'),function(x){return /Back To Previous Page/i.test(x.textContent)})[0];
      if(a){clearInterval(t);var d=document.createElement('a');d.href='/account/home';d.className=a.className;d.textContent='Go to my dashboard';a.parentNode.replaceChild(d,a)}else if(n>40)clearInterval(t)},250);
  },true);
  return;
}
if(path!=='/account/home')return;
var h=document.querySelector('.dashboard_home_title');if(!h||document.getElementById('dc3'))return;
var basic=/\bsession-plan-level-6\b/.test(document.body.className),done=get();
var css='#dc3{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:4px 0 22px;font-family:"Radio Canada",sans-serif}'
+'#dc3 .dc3-c{position:relative;overflow:hidden;border-radius:20px;padding:20px 20px 18px;background:#fff;border:1px solid #e3e9f0;box-shadow:0 10px 28px rgba(27,47,69,.08);color:#1b2f45}'
+'#dc3 .dc3-c.mm{background:linear-gradient(135deg,#fff8e6,#fff);border-color:#f4d27a}'
+'#dc3 .dc3-ic{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;font-size:22px;margin-bottom:12px;background:rgba(255,255,255,.7);border:1px solid rgba(27,47,69,.08);box-shadow:inset 0 1px 0 #fff,0 6px 14px rgba(27,47,69,.1)}'
+'#dc3 .dc3-k{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#006fbb;margin:0 0 4px}'
+'#dc3 .mm .dc3-k{color:#b07800}'
+'#dc3 b{display:block;font-size:20px;line-height:1.2;margin:0 0 6px;word-break:normal}'
+'#dc3 p{font-size:16px;line-height:1.45;color:#55636f;margin:0 0 14px;word-break:normal}'
+'#dc3 a.dc3-b{display:inline-block;font-size:16px;font-weight:700;padding:11px 18px;border-radius:12px;text-decoration:none!important;background:#006fbb;color:#fff!important}'
+'#dc3 .mm a.dc3-b{background:#ffc53d;color:#1b2f45!important}'
+'#dc3 a.dc3-l{display:inline-block;margin-left:12px;font-size:15px;font-weight:700;color:#006fbb}'
+'@media(max-width:600px){#dc3 a.dc3-b{display:block;text-align:center}#dc3 a.dc3-l{display:block;margin:10px 0 0;text-align:center}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var mm='';
if(basic){mm=done
 ?'<div class="dc3-c mm"><div class="dc3-ic">&#9989;</div><p class="dc3-k">Member Match</p><b>Thanks, you are all set</b><p>Your private Member Match details help our AI-driven search send neighbors your way. Update them anytime.</p><a class="dc3-b" href="/member-match?edit=1">Update my answers</a></div>'
 :'<div class="dc3-c mm"><div class="dc3-ic">&#10024;</div><p class="dc3-k">New &middot; 2 minutes</p><b>Get matched with neighbors</b><p>Answer 7 quick questions so our new AI-driven search can send leads your way on the free plan. Private, never shown on your profile.</p><a class="dc3-b" href="/member-match?edit=1">Fill out Member Match</a></div>';}
/* 3VL Smart Publisher (live 10/3/2026): paid plans (VIP 1/8, Getting Noticed 2) open it; others get the free tip form plus the upgrade line */
var spm=document.body.className.match(/session-plan-level-(\d+)/),spp=spm?spm[1]:'',spPaid=spp==='1'||spp==='8'||spp==='2';
var promo=spPaid
 ?'<div class="dc3-c"><div class="dc3-ic">&#10024;</div><p class="dc3-k">New &middot; 3VL Smart Publisher</p><b>Promote something in minutes</b><p>Tell us the basics about your event, special or news. We write it, design it and publish it on Three Village Local when you choose. '+(spp==='2'?'1 page a month on your plan.':'One every two weeks on your plan.')+'</p><a class="dc3-b" href="/smart-publisher">Open Smart Publisher</a></div>'
 :'<div class="dc3-c"><div class="dc3-ic">&#128227;</div><p class="dc3-k">Free for members</p><b>Got something you want to promote?</b><p>Send us a special, an event or big news and we will help put it in front of Three Village. Want us to write and publish a full page for you? That is 3VL Smart Publisher, included with Getting Noticed and VIP.</p><a class="dc3-b" href="/checkout/2">Upgrade now</a> <a href="/join" style="margin-left:12px;font-weight:700">See the plans</a><p style="margin:10px 0 0;font-size:14px">Or <a href="/promotion#pr3-form">send us a free tip</a> and our team decides what to feature.</p></div>';
var box=document.createElement('div');box.id='dc3';box.innerHTML=mm+promo;
h.insertAdjacentElement('afterend',box);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();

/* NEWSLETTER (owner 10/3/2026): BD's sidebar "Join Our Newsletter" box opened a pop-up; it now links to the /newsletter page */
(function(){function nl(){[].forEach.call(document.querySelectorAll('.module.newsletter-sign-up-form'),function(m){if(m.getAttribute('data-nl'))return;m.setAttribute('data-nl','1');
  var h=m.querySelector('h2');if(h)h.textContent='Three Village Weekly';
  var a=m.querySelector('a[data-target="#newsletter_subscribe_modal"]');if(!a)return;a.removeAttribute('data-toggle');a.removeAttribute('data-target');a.setAttribute('href','/newsletter');a.innerHTML='Sign up free &rarr;';
  if(!m.querySelector('.p3-nlsub')){var p=document.createElement('p');p.className='p3-nlsub';p.textContent='The best of Three Village in your inbox every'+String.fromCharCode(160)+'week.';a.parentNode.insertBefore(p,a)}
  a.addEventListener('click',function(){try{gtag('event','newsletter_link_click',{from:'sidebar'})}catch(e){}})})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',nl);else nl();window.addEventListener('load',nl)})();
