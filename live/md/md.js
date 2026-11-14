(function(){
  var md=document.getElementById('md');if(!md)return;
  var $$=function(s,r){return [].slice.call((r||md).querySelectorAll(s))};
  var on0=md.querySelector('.md-mtabs button.on'),month=on0?on0.getAttribute('data-m'):'',chan='all';
  var nf=function(n){return Math.round(n).toLocaleString('en-US')};
  function apply(){
    var shown=0;
    $$('.md-list li').forEach(function(li){var ok=li.getAttribute('data-m')===month&&(chan==='all'||li.getAttribute('data-f')===chan);li.classList.toggle('md-hide',!ok);if(ok)shown++});
    md.querySelector('.md-empty').hidden=shown>0;
    $$('.md-kpis').forEach(function(k){k.hidden=k.getAttribute('data-m')!==month});
  }
  function countUp(el){var to=+el.getAttribute('data-n')||0,t0=null;if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=nf(to);return}
    function f(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/900);el.textContent=nf(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
  md.addEventListener('click',function(ev){
    var b=ev.target.closest('button');if(!b)return;
    var grp=b.parentNode;
    if(grp.classList.contains('md-mtabs'))month=b.getAttribute('data-m');
    else if(grp.classList.contains('md-chips'))chan=b.getAttribute('data-f');
    else return;
    [].forEach.call(grp.children,function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false')});
    apply();
    if(grp.classList.contains('md-mtabs'))$$('.md-kpis:not([hidden]) [data-n]').forEach(countUp);
  });
  /* banner reach: refresh from the nightly JSON once it is published; the built-in number stays if that fails */
  var ban=md.querySelector('.md-ban[data-live]');
  if(ban&&window.fetch&&location.protocol.indexOf('http')===0){
    fetch(ban.getAttribute('data-live'),{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(j){
      var n=j&&+j.views;if(!n)return;var b=ban.querySelector('[data-ban-n]');b.setAttribute('data-n',n);b.textContent=nf(n);ban.querySelector('[data-ban-n2]').textContent=nf(n);
      var pe=ban.querySelector('[data-ban-pct]'),pc=j.change_pct;if(pe){if(typeof pc==='number'&&pc>0){pe.textContent='Up '+pc+'% vs the 30 days before';pe.hidden=false}else pe.hidden=true}}).catch(function(){});
  }
  apply();
  requestAnimationFrame(function(){md.classList.add('md-run');$$('.md-kpis:not([hidden]) [data-n],.md-ban [data-n]').forEach(countUp)});
})();
