/* A Three Village Throwback: Remembering Snow Shed (2026): reading progress, jump-nav scrollspy, scroll reveals,
   lazy images, "your first pair" picker, share. No regex (BD strips backslashes). */
(function(){
  var root=document.querySelector('.ss');if(!root)return;root.classList.add('js');
  var bar=document.createElement('div');bar.className='ss-prog';document.body.appendChild(bar);
  function prog(){var r=root.getBoundingClientRect(),h=r.height-window.innerHeight;var p=h>0?Math.min(1,Math.max(0,-r.top/h)):0;bar.style.width=(p*100)+'%'}
  window.addEventListener('scroll',prog,{passive:true});prog();
  var lazy=[].slice.call(root.querySelectorAll('img[data-src]'));
  function load(img){if(!img.getAttribute('data-src'))return;if(img.getAttribute('data-srcset'))img.srcset=img.getAttribute('data-srcset');img.src=img.getAttribute('data-src');img.removeAttribute('data-src')}
  var rv=[].slice.call(root.querySelectorAll('.ss-rv'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){io.observe(el)});
    var il=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){load(e.target);il.unobserve(e.target)}})},{rootMargin:'900px 0px'});
    lazy.forEach(function(i){il.observe(i)});
  }else{rv.forEach(function(el){el.classList.add('in')});lazy.forEach(load)}
  /* safety: anything still hidden after 4 s shows */
  setTimeout(function(){rv.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight)el.classList.add('in')})},4000);
  /* scrollspy */
  var links=[].slice.call(root.querySelectorAll('.ss-nav a'));
  function spy(){var cur=null;links.forEach(function(a){var s=document.getElementById(a.getAttribute('href').slice(1));if(s&&s.getBoundingClientRect().top<160)cur=a});
    links.forEach(function(a){a.classList.toggle('on',a===cur)})}
  window.addEventListener('scroll',spy,{passive:true});spy();
  /* your first pair picker */
  var pick=root.querySelector('.ss-pick');
  if(pick){
    var opts=[].slice.call(pick.querySelectorAll('.ss-opt')),img=pick.querySelector('.ss-out img'),cap=pick.querySelector('.ss-out figcaption'),
        h=pick.querySelector('.ss-out h3'),p=pick.querySelector('.ss-out p'),a=pick.querySelector('.ss-out a');
    opts.forEach(function(o){o.addEventListener('click',function(){
      opts.forEach(function(x){x.classList.toggle('on',x===o);x.setAttribute('aria-pressed',x===o?'true':'false')});
      img.removeAttribute('srcset');img.src=o.getAttribute('data-img');img.alt=o.getAttribute('data-alt');cap.textContent=o.getAttribute('data-cred');
      h.textContent=o.getAttribute('data-h');p.textContent=o.getAttribute('data-p');
      a.href='mailto:hello@threevillagelocal.com?subject='+encodeURIComponent('My Snow Shed memory: '+o.getAttribute('data-h'))+'&body='+encodeURIComponent(o.getAttribute('data-q')+'\n\n');
      if(window.gtag)gtag('event','throwback_pick',{page:'snow-shed',pick:o.getAttribute('data-k')})})});
  }
  /* share */
  var toast=document.createElement('div');toast.className='ss-toast';document.body.appendChild(toast);
  function say(t){toast.textContent=t;toast.classList.add('on');setTimeout(function(){toast.classList.remove('on')},2200)}
  [].forEach.call(root.querySelectorAll('[data-share]'),function(b){b.addEventListener('click',function(){
    var d={title:document.title,text:'Remember Snow Shed on Route 112? 44 winters of Long Island skiing.',url:location.href.split('#')[0]};
    if(navigator.share){navigator.share(d).catch(function(){})}else if(navigator.clipboard){navigator.clipboard.writeText(d.url).then(function(){say('Link copied')})}else{say(d.url)}
    if(window.gtag)gtag('event','share',{page:'snow-shed'})})});
})();
