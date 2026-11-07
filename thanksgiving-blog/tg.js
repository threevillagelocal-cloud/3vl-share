/* Thanksgiving in Three Village (2026 blog): progress bar, lazy images, scroll reveals, share. No regex (BD strips backslashes). */
(function(){
  var root=document.querySelector('.tgb');if(!root)return;root.classList.add('js');
  var bar=document.createElement('div');bar.className='tgb-prog';document.body.appendChild(bar);
  function prog(){var r=root.getBoundingClientRect(),h=r.height-window.innerHeight;var p=h>0?Math.min(1,Math.max(0,-r.top/h)):0;bar.style.width=(p*100)+'%'}
  window.addEventListener('scroll',prog,{passive:true});prog();
  function load(img){var s=img.getAttribute('data-src');if(!s)return;img.src=s;img.removeAttribute('data-src')}
  var lazy=[].slice.call(root.querySelectorAll('img[data-src]')),rv=[].slice.call(root.querySelectorAll('.tgb-rv'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){io.observe(el)});
    var il=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){load(e.target);il.unobserve(e.target)}})},{rootMargin:'900px 0px'});
    lazy.forEach(function(i){il.observe(i)});
  }else{rv.forEach(function(el){el.classList.add('in')});lazy.forEach(load)}
  [].forEach.call(root.querySelectorAll('[data-share]'),function(b){b.addEventListener('click',function(){
    var u=location.href.split('#')[0],t=document.title;
    if(navigator.share){navigator.share({title:t,url:u}).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){b.textContent='Link copied!'})}
  })});
})();
