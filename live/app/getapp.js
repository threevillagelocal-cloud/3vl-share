/* 3VL mobile app bar v2: shows after real interest (1/3 scroll, 2nd page, or 25s), timely line from line.json, store by device, view + click events */
(function(){
var ua=navigator.userAgent||'',Q=location.search;
var prev=Q.indexOf('appbar=v2')>-1;
var inFB=/FBAN|FBAV|FB_IAB|Instagram/.test(ua);
var ios=/iPhone|iPad|iPod/.test(ua),android=/Android/.test(ua);
if(!inFB&&((ios&&!/Safari/.test(ua))||(android&&ua.indexOf('; wv)')>-1)))return; // inside our own app
if(!window.matchMedia||!window.matchMedia('(max-width:768px)').matches)return;
if(!ios&&!android)return;
var p=location.pathname;if(p==='/app'||p==='/app/')return;
// real iPhone Safari gets Apple's own Smart App Banner instead
if(!prev&&ios&&!inFB&&!/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)&&document.querySelector('meta[name="apple-itunes-app"]'))return;
if(!prev){try{var d=+localStorage.getItem('tvlGetAppX')||0;if(d&&Date.now()-d<1209600000)return;}catch(e){}}
var url=ios?'https://apps.apple.com/us/app/three-village-local/id6746367200':'https://play.google.com/store/apps/details?id=com.threevillagelocal.app';
var store=ios?'ios':'android';
var pv=1;try{pv=(+sessionStorage.getItem('tvlPV')||0)+1;sessionStorage.setItem('tvlPV',pv)}catch(e){}
var LINE='Local events, businesses &amp; things to do',KEY='default',shown=false;
function pick(j){var t=new Date().toISOString().slice(0,10);(j.lines||[]).some(function(x){if((!x.from||t>=x.from)&&(!x.until||t<=x.until)){LINE=x.line;KEY=x.key||x.line;return true}})}
function ga(n,o){try{gtag('event',n,o)}catch(e){}}
function show(why){
if(shown||document.getElementById('tvl-getapp'))return;shown=true;
if(!document.getElementById('tga2css')){var st=document.createElement('style');st.id='tga2css';st.textContent='#tvl-getapp.v2 .tga-t b{white-space:normal!important;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:14px!important;line-height:1.2!important}#tvl-getapp.v2 a.tga-btn{padding:0 12px!important;height:36px!important;font-size:12.5px!important;letter-spacing:.04em!important;white-space:nowrap}@media(max-width:374px){#tvl-getapp.v2 .tg2f{display:none}#tvl-getapp.v2 .tga-t b{font-size:13px!important;-webkit-line-clamp:3}#tvl-getapp.v2 a.tga-btn{padding:0 14px!important;font-size:14px!important}}';document.head.appendChild(st)}
var b=document.createElement('div');b.id='tvl-getapp';b.className='v2';b.setAttribute('role','region');b.setAttribute('aria-label','Get the Three Village Local mobile app');
b.innerHTML='<div class="tga-ic"><img src="https://cdn.jsdelivr.net/gh/threevillagelocal-cloud/3vl-assets@ff2b1c9100c8/badges/3vl-logo-160.png" alt="" width="42" height="42"></div>'+
'<div class="tga-t"><b>'+LINE+'</b><span><i>Free</i> mobile app</span></div>'+
'<a class="tga-btn" href="'+url+'" target="_blank" rel="noopener">Get<span class="tg2f">&nbsp;it free</span></a>'+
'<button class="tga-x" type="button" aria-label="Close">&times;</button>';
document.body.appendChild(b);document.body.style.paddingBottom='96px';
b.querySelector('.tga-x').onclick=function(){b.classList.remove('tvl-in');ga('app_banner_close',{store:store,line:KEY});try{localStorage.setItem('tvlGetAppX',Date.now())}catch(e){}setTimeout(function(){b.remove();document.body.style.paddingBottom=''},600)};
b.querySelector('.tga-btn').onclick=function(){ga('app_banner_click',{store:store,line:KEY,trigger:why,v:2})};
setTimeout(function(){b.classList.add('tvl-in')},60);
ga('app_banner_view',{store:store,line:KEY,trigger:why,v:2});
}
function arm(){
if(prev){setTimeout(function(){show('preview')},1500);return}
if(pv>=2){setTimeout(function(){show('page2')},2500);return}
var t=setTimeout(function(){show('time')},25000);
function sc(){var h=document.documentElement.scrollHeight-innerHeight;if(h>0&&scrollY/h>=.33){removeEventListener('scroll',sc);clearTimeout(t);show('scroll')}}
addEventListener('scroll',sc,{passive:true});
}
function go(){fetch('https://threevillagelocal-cloud.github.io/3vl-share/live/app/line.json?d='+new Date().toISOString().slice(0,10)).then(function(r){return r.json()}).then(pick).catch(function(){}).then(arm)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
