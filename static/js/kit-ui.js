/* GAO Gestor — kit-ui.js: utilidades dos componentes do kit (popover, painel, modal). */
window.GK={
  /* separador padrão entre informações na mesma linha: barrinha cinza clara (nunca bolinha). GK.sep é o HTML; GK.sp troca ' · ' por ele */
  sep:'<span class="gk-sep" aria-hidden="true"></span>',
  sp:function(t){ return String(t).split(' · ').join(GK.sep); },
  icons:function(){ if(window.lucide&&lucide.createIcons) lucide.createIcons(); if(window.gkIcons) gkIcons(); },
  popovers:function(){
    document.querySelectorAll('[data-pop]').forEach(function(btn){
      btn.addEventListener('click',function(e){ e.stopPropagation(); var p=document.getElementById(btn.getAttribute('data-pop'));
        document.querySelectorAll('.gk-pop.is-open').forEach(function(o){ if(o!==p) o.classList.remove('is-open'); });
        p.classList.toggle('is-open'); });
    });
    document.addEventListener('click',function(e){ document.querySelectorAll('.gk-pop.is-open').forEach(function(o){ if(!o.contains(e.target)) o.classList.remove('is-open'); }); });
    document.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click',function(){ GK.close(b.getAttribute('data-close')); }); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') document.querySelectorAll('.gk-overlay.is-open,.gk-pop.is-open').forEach(function(o){ o.classList.remove('is-open'); }); });
  },
  checkFilter:function(o){
    var btn=document.getElementById(o.btn), pop=document.getElementById(o.pop), lbl=btn.querySelector('span'), value=[];
    function boxes(){ return pop.querySelectorAll('input[type=checkbox]'); }
    function apply(){
      value=[].filter.call(boxes(),function(b){return b.checked;}).map(function(b){return b.value;});
      var names=[].filter.call(boxes(),function(b){return b.checked;}).map(function(b){return b.parentNode.textContent.trim();});
      if(names.length>1) lbl.innerHTML = o.label+GK.sep+names.length; else lbl.textContent = names.length ? names[0] : o.label;
      btn.classList.toggle('is-filtered',names.length>0);
      pop.classList.remove('is-open'); if(o.onChange) o.onChange(value);
    }
    pop.querySelector('[data-apply]').addEventListener('click',apply);
    pop.querySelector('[data-clear]').addEventListener('click',function(){ boxes().forEach(function(b){b.checked=false;}); apply(); });
    return { get:function(){return value;}, reset:function(){ boxes().forEach(function(b){b.checked=false;}); apply(); } };
  },
  periodFilter:function(o){
    var btn=document.getElementById(o.btn), pop=document.getElementById(o.pop), lbl=btn.querySelector('span'), key='all';
    var REF=new Date(2026,10,17), DAY=86400000;
    var OPTS=[['all','Todo o período'],['7','Últimos 7 dias'],['30','Últimos 30 dias'],['mes','Este mês']];
    pop.innerHTML=OPTS.map(function(x){ return '<button type="button" class="gk-menu-item'+(x[0]==='all'?' is-selected':'')+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('');
    function set(k){
      key=k; var o2=OPTS.filter(function(x){return x[0]===k;})[0];
      lbl.textContent=k==='all'?'Período':o2[1]; btn.classList.toggle('is-filtered',k!=='all');
      pop.querySelectorAll('.gk-menu-item').forEach(function(b){ b.classList.toggle('is-selected',b.getAttribute('data-v')===k); });
      pop.classList.remove('is-open'); if(o.onChange) o.onChange(k);
    }
    pop.addEventListener('click',function(e){ var b=e.target.closest('[data-v]'); if(b) set(b.getAttribute('data-v')); });
    function test(str){
      if(key==='all') return true; var m=/(\d+)\/(\d+)\/(\d+)/.exec(str); if(!m) return true;
      var d=new Date(+m[3],+m[2]-1,+m[1]);
      if(key==='7') return d>=new Date(REF-6*DAY)&&d<=REF; if(key==='30') return d>=new Date(REF-29*DAY)&&d<=REF;
      return d.getMonth()===REF.getMonth()&&d.getFullYear()===REF.getFullYear();
    }
    return { test:test, active:function(){return key!=='all';}, reset:function(){ set('all'); } };
  },
  msHTML:function(id,ph,sp,items,up){
    return '<div class="gk-ms'+(up?' is-up':'')+'" id="'+id+'"><div class="gk-ms-field"><span class="gk-ms-ph">'+ph+'</span></div><i data-lucide="chevron-down" class="gk-ic gk-ms-chev"></i>'
      +'<div class="gk-pop gk-menu"><div class="gk-ms-search"><div class="gk-input-wrap"><i data-lucide="search" class="gk-ic"></i><input class="gk-input gk-input-sm" placeholder="'+sp+'" autocomplete="off"></div></div>'
      +'<div class="gk-ms-list">'+items.map(function(i){ return '<label class="gk-check gk-menu-item" data-t="'+i[1].toLowerCase()+'"><input type="checkbox" value="'+i[0]+'" data-nm="'+i[1]+'">'+i[1]+'</label>'; }).join('')+'<div class="gk-ms-empty" hidden>Nenhum resultado</div></div></div></div>';
  },
  ssHTML:function(id,ph,sp,items){
    return '<div class="gk-ss" id="'+id+'"><button type="button" class="gk-select gk-ss-btn"><span class="gk-ss-val is-ph">'+ph+'</span></button>'
      +'<div class="gk-pop gk-menu gk-ss-menu"><div class="gk-ms-search"><div class="gk-input-wrap"><i data-lucide="search" class="gk-ic"></i><input class="gk-input gk-input-sm" placeholder="'+sp+'" autocomplete="off"></div></div>'
      +'<div class="gk-ms-list gk-ss-list">'+items.map(function(i){ return '<button type="button" class="gk-menu-item" data-v="'+i+'" data-t="'+i.toLowerCase()+'">'+i+'</button>'; }).join('')+'<div class="gk-ms-empty" hidden>Nenhum resultado</div></div></div></div>';
  },
  searchSelect:function(root,onChange){
    var btn=root.querySelector('.gk-ss-btn'), val=root.querySelector('.gk-ss-val'), menu=root.querySelector('.gk-ss-menu'), q=root.querySelector('.gk-ms-search input'), empty=root.querySelector('.gk-ms-empty'), ph=val.textContent, cur='';
    function filtrar(){ var v=q.value.toLowerCase().trim(), n=0; root.querySelectorAll('[data-t]').forEach(function(b){ var ok=!v||b.getAttribute('data-t').indexOf(v)>=0; b.hidden=!ok; if(ok) n++; }); empty.hidden=n>0; }
    function pos(){ var r=btn.getBoundingClientRect(), h=menu.offsetHeight||240, up=r.top>h+16||r.top>window.innerHeight-r.bottom;
      var m=root.closest('.gk-modal'), o=m?m.getBoundingClientRect():{left:0,top:0,bottom:window.innerHeight};
      menu.style.left=(r.left-o.left)+'px'; menu.style.width=r.width+'px';
      if(up){ menu.style.top='auto'; menu.style.bottom=(o.bottom-r.top+4)+'px'; } else { menu.style.bottom='auto'; menu.style.top=(r.bottom-o.top+4)+'px'; } }
    function set(v){ cur=v||''; val.textContent=cur||ph; val.classList.toggle('is-ph',!cur); root.querySelectorAll('.gk-menu-item').forEach(function(b){ b.classList.toggle('is-selected',b.getAttribute('data-v')===cur); }); }
    btn.addEventListener('click',function(e){ e.stopPropagation(); if(btn.disabled) return; document.querySelectorAll('.gk-pop.is-open').forEach(function(o){ if(o!==menu) o.classList.remove('is-open'); });
      menu.classList.toggle('is-open'); if(menu.classList.contains('is-open')){ q.value=''; filtrar(); pos(); setTimeout(function(){ q.focus(); },0); } });
    menu.addEventListener('click',function(e){ e.stopPropagation(); var b=e.target.closest('.gk-menu-item'); if(!b) return; set(b.getAttribute('data-v')); menu.classList.remove('is-open'); if(onChange) onChange(cur); });
    q.addEventListener('input',filtrar);
    return { get:function(){ return cur; }, set:set, disable:function(d){ btn.disabled=!!d; } };
  },
  multiselect:function(root,onChange){
    var field=root.querySelector('.gk-ms-field'), menu=root.querySelector('.gk-pop'), ph=root.querySelector('.gk-ms-ph'), q=root.querySelector('.gk-ms-search input'), empty=root.querySelector('.gk-ms-empty');
    function boxes(){ return root.querySelectorAll('input[type=checkbox]'); }
    function render(){
      field.querySelectorAll('.gk-ms-chip').forEach(function(c){ c.remove(); });
      var ch=[].filter.call(boxes(),function(b){ return b.checked; }); ph.hidden=!!ch.length;
      ch.forEach(function(inp){ var chip=document.createElement('span'); chip.className='gk-ms-chip';
        chip.innerHTML='<span>'+inp.getAttribute('data-nm')+'</span><button type="button" aria-label="Remover"><i data-lucide="x" class="gk-ic"></i></button>';
        chip.querySelector('button').addEventListener('click',function(e){ e.stopPropagation(); inp.checked=false; render(); if(onChange) onChange(); }); field.appendChild(chip); });
      GK.icons();
    }
    function filtrar(){ var v=q.value.toLowerCase().trim(), n=0; root.querySelectorAll('label[data-t]').forEach(function(l){ var ok=!v||l.getAttribute('data-t').indexOf(v)>=0; l.hidden=!ok; if(ok) n++; }); empty.hidden=n>0; }
    field.addEventListener('click',function(e){ if(e.target.closest('.gk-ms-chip')) return; e.stopPropagation(); document.querySelectorAll('.gk-pop.is-open').forEach(function(o){ if(o!==menu) o.classList.remove('is-open'); });
      menu.classList.toggle('is-open'); q.value=''; filtrar(); setTimeout(function(){ if(menu.classList.contains('is-open')) q.focus(); },0); });
    menu.addEventListener('click',function(e){ e.stopPropagation(); });
    menu.addEventListener('change',function(){ render(); if(onChange) onChange(); });
    q.addEventListener('input',filtrar);
    return { get:function(){ return [].filter.call(boxes(),function(b){ return b.checked; }).map(function(b){ return b.value; }); },
             set:function(v){ boxes().forEach(function(b){ b.checked=(v||[]).indexOf(b.value)>=0; }); render(); },
             close:function(){ menu.classList.remove('is-open'); } };
  },
  open:function(id){ document.getElementById(id).classList.add('is-open'); GK.icons(); },
  close:function(id){ document.getElementById(id).classList.remove('is-open'); },
  /* feedback "foi útil?": GK.feedbackHTML(pergunta) devolve o bloco; o clique é tratado aqui para qualquer bloco .gk-feedback */
  feedbackHTML:function(q){
    return '<div class="gk-feedback"><div class="gk-fb-row"><span class="gk-fb-q">'+(q||'Isso foi útil?')+'</span>'
      +'<button type="button" class="gk-fb-btn" data-fb="up"><i data-lucide="thumbs-up" class="gk-ic"></i>Sim</button>'
      +'<button type="button" class="gk-fb-btn" data-fb="down"><i data-lucide="thumbs-down" class="gk-ic"></i>Não</button></div>'
      +'<div class="gk-fb-more" hidden><input class="gk-input" placeholder="O que faltou?"><button type="button" class="gk-btn gk-btn-secondary" data-fb="send">Enviar</button></div>'
      +'<div class="gk-fb-done" hidden>Obrigado pelo retorno.</div></div>';
  }
};
document.addEventListener('click',function(e){
  var b=e.target.closest('.gk-feedback [data-fb]'); if(!b) return;
  var f=b.closest('.gk-feedback'), k=b.getAttribute('data-fb'),
      row=f.querySelector('.gk-fb-row'), more=f.querySelector('.gk-fb-more'), done=f.querySelector('.gk-fb-done');
  if(k==='down'){ row.hidden=true; more.hidden=false; var i=more.querySelector('input'); if(i) i.focus(); }
  else { row.hidden=true; more.hidden=true; done.hidden=false;
    f.dispatchEvent(new CustomEvent('gk-feedback',{bubbles:true,detail:{value:k==='up'?'sim':'nao',text:(more.querySelector('input')||{}).value||''}})); }
});

/* tooltip: qualquer .gk-act, .gk-btn-icon ou [data-tip]. O texto vem de data-tip, aria-label ou title. */
(function(){
  var tip=null, timer=null, cur=null;
  var SEL='[data-tip],.gk-act,.gk-btn-icon';
  function box(){ if(!tip){ tip=document.createElement('div'); tip.className='gk-tip'; tip.setAttribute('role','tooltip'); document.body.appendChild(tip); } return tip; }
  function text(n){
    var v=n.getAttribute('data-tip');
    if(!v){ v=n.getAttribute('aria-label')||n.getAttribute('title'); if(v) n.setAttribute('data-tip',v); }
    if(n.hasAttribute('title')) n.removeAttribute('title');
    return v;
  }
  function show(n){
    var v=text(n); if(!v) return; cur=n;
    var t=box(); t.textContent=v; t.style.left='0px'; t.style.top='0px'; t.classList.add('is-on');
    var r=n.getBoundingClientRect(), w=t.offsetWidth, h=t.offsetHeight;
    var x=Math.max(8,Math.min(window.innerWidth-w-8, r.left+r.width/2-w/2));
    var y=r.top-h-8; if(y<8) y=r.bottom+8;
    t.style.left=x+'px'; t.style.top=y+'px';
  }
  function hide(){ clearTimeout(timer); cur=null; if(tip) tip.classList.remove('is-on'); }
  document.addEventListener('mouseover',function(e){ var n=e.target.closest&&e.target.closest(SEL); if(!n||n===cur) return; clearTimeout(timer); text(n); timer=setTimeout(function(){ show(n); },250); });
  document.addEventListener('mouseout',function(e){ var n=e.target.closest&&e.target.closest(SEL); if(n) hide(); });
  document.addEventListener('focusin',function(e){ var n=e.target.closest&&e.target.closest(SEL); if(n&&n.matches(':focus-visible')) show(n); });
  document.addEventListener('focusout',hide);
  document.addEventListener('click',hide,true);
  window.addEventListener('scroll',hide,true);
})();

/* carregando: as tabelas mostram o esqueleto por um instante e depois as linhas entram (veja .is-loading no CSS) */
(function(){
  var reduce=false; try{ reduce=matchMedia('(prefers-reduced-motion:reduce)').matches; }catch(e){}
  function start(){
    var ws=document.querySelectorAll('.gk-table-wrap'); if(!ws.length||reduce) return;
    ws.forEach(function(w){ w.classList.add('is-loading'); });
    setTimeout(function(){ ws.forEach(function(w){ w.classList.remove('is-loading'); }); }, 420);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();

/* gráficos: dica flutuante, colunas e rosca (GK.tip, GK.barChart, GK.donut) */
(function(){
  var tip=null;
  function box(){ if(!tip){ tip=document.createElement('div'); tip.className='gk-ctip'; document.body.appendChild(tip); } return tip; }
  function put(node,b,s,e){
    var t=box(); t.textContent='';
    var x=document.createElement('b'); x.textContent=b; t.appendChild(x);
    if(s){ var y=document.createElement('span'); y.textContent=s; t.appendChild(y); }
    if(e){ var z=document.createElement('em'); z.textContent=e; t.appendChild(z); }
    t.style.left='0px'; t.style.top='0px'; t.classList.add('is-on');
    var r=node.getBoundingClientRect(), w=t.offsetWidth, h=t.offsetHeight;
    var l=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2)), tp=r.top-h-8; if(tp<8) tp=r.bottom+8;
    t.style.left=l+'px'; t.style.top=tp+'px';
  }
  function off(){ if(tip) tip.classList.remove('is-on'); }
  function bind(node,b,s,e){
    node.addEventListener('mouseenter',function(){ put(node,b,s,e); });
    node.addEventListener('focus',function(){ put(node,b,s,e); });
    node.addEventListener('mouseleave',off); node.addEventListener('blur',off);
  }
  GK.tip={bind:bind,off:off,show:put};
  /* colunas: items=[{l:'08h',v:2,t:'08:00 às 09:00'}], unit:'entregas' */
  GK.barChart=function(el,o){
    var max=Math.max.apply(null,o.items.map(function(i){ return Math.max(i.v==null?0:i.v,i.p||0); })), top=Math.max(2,Math.ceil(max/2)*2), n=o.items.length;
    el.className='gk-bc'; el.textContent='';
    var plot=document.createElement('div'); plot.className='gk-bc-plot'; el.appendChild(plot);
    [top,top/2,0].forEach(function(v,k){ var g=document.createElement('div'); g.className='gk-bc-g'; g.style.top=(k*50)+'%'; var s=document.createElement('span'); s.textContent=v; g.appendChild(s); plot.appendChild(g); });
    var cols=document.createElement('div'); cols.className='gk-bc-cols'; plot.appendChild(cols);
    var xs=document.createElement('div'); xs.className='gk-bc-x'; el.appendChild(xs);
    o.items.forEach(function(it){
      var c=document.createElement('div'); c.className='gk-bc-c'+(it.p!=null?' has-plan':''); c.tabIndex=0; c.setAttribute('role','img');
      var tit=it.v==null?'Previsto: '+it.p+' '+(it.p===1?o.one:o.unit):it.v+' '+(it.v===1?o.one:o.unit);
      c.setAttribute('aria-label',it.t+': '+tit+(it.e?' · '+it.e:''));
      if(it.p!=null){ var g=document.createElement('i'); g.className='is-p'; g.style.height=(it.p/top*100)+'%'; if(!it.p) g.style.display='none'; c.appendChild(g); }
      var b=document.createElement('i'); b.style.height=((it.v||0)/top*100)+'%'; if(!it.v) b.style.display='none'; c.appendChild(b); cols.appendChild(c);
      bind(c,tit,it.t,it.e);
      var x=document.createElement('span'); x.textContent=it.l; xs.appendChild(x);
    });
  };
  /* rosca: parts=[{n:'Entregues',v:8,c:'var(--ok)'}], centro:{v:24,l:'entregas hoje'} */
  GK.donut=function(el,o){
    var tot=o.parts.reduce(function(a,p){ return a+p.v; },0), R=54, C=2*Math.PI*R, gap=14, off0=0, NS='http://www.w3.org/2000/svg';
    el.className='gk-donut'; el.textContent='';
    var wrap=document.createElement('div'); wrap.className='gk-donut-c'; el.appendChild(wrap);
    var svg=document.createElementNS(NS,'svg'); svg.setAttribute('viewBox','0 0 132 132'); svg.setAttribute('role','img'); svg.setAttribute('aria-label',o.parts.map(function(p){ return p.n+' '+p.v; }).join(', ')); wrap.appendChild(svg);
    var lg=document.createElement('div'); lg.className='gk-lg'; el.appendChild(lg);
    var cs=[], rows=[];
    o.parts.forEach(function(p,k){
      var len=p.v/tot*C, c=document.createElementNS(NS,'circle'); c.setAttribute('cx',66); c.setAttribute('cy',66); c.setAttribute('r',R);
      c.style.stroke=p.c; c.setAttribute('stroke-linecap','round'); var dl=Math.max(.1,len-gap); c.setAttribute('stroke-dasharray',dl+' '+(C-dl)); c.setAttribute('stroke-dashoffset',-(off0+gap/2)); off0+=len;
      if(!p.v) c.style.display='none'; svg.appendChild(c); cs.push(c);
      var r=document.createElement('div'); r.className='gk-lg-i'; var d=document.createElement('i'); d.style.background=p.c; var t=document.createElement('span'); t.textContent=p.n; var b=document.createElement('b'); b.textContent=p.v; var pe=document.createElement('em'); pe.textContent=Math.round(p.v/tot*100)+'%';
      r.appendChild(d); r.appendChild(t); r.appendChild(b); r.appendChild(pe); lg.appendChild(r); rows.push(r);
      var pc=Math.round(p.v/tot*100)+'% do total';
      function on(){ cs.forEach(function(x,j){ x.classList.toggle('is-dim',j!==k); }); }
      function out(){ cs.forEach(function(x){ x.classList.remove('is-dim'); }); }
      [c,r].forEach(function(n){ n.addEventListener('mouseenter',on); n.addEventListener('mouseleave',out); });
      bind(c,p.v+' '+(p.v===1?o.one:o.unit),p.n,pc); r.addEventListener('mouseenter',function(){ put(r,p.v+' '+(p.v===1?o.one:o.unit),p.n,pc); }); r.addEventListener('mouseleave',off);
    });
    var n=document.createElement('div'); n.className='gk-donut-n'; var b=document.createElement('b'); b.textContent=o.centro.v; var s=document.createElement('span'); s.textContent=o.centro.l; n.appendChild(b); n.appendChild(s); wrap.appendChild(n);
  };
})();

/* gráfico de área suave com linha de guia e dica (GK.areaChart) */
(function(){
  var NS='http://www.w3.org/2000/svg';
  GK.areaChart=function(el,o){
    function draw(){
      var W=el.clientWidth||520, H=168, L=26, B=24, T=10, R=8, pw=W-L-R, ph=H-B-T, n=o.items.length;
      var max=Math.max.apply(null,o.items.map(function(i){ return Math.max(i.v==null?0:i.v,i.p||0); })), top=Math.max(2,Math.ceil(max/2)*2), lo=0, fm=function(v){ return ''+v; };
      if(o.min!=null){ lo=o.min; top=o.max; fm=function(v){ return v.toFixed(o.dec||0).replace('.',','); }; }
      var X=function(i){ return L+(n>1?pw*i/(n-1):pw/2); }, Y=function(v){ return T+ph*(1-(v-lo)/(top-lo)); };
      el.className='gk-ac'; el.textContent='';
      var svg=document.createElementNS(NS,'svg'); svg.setAttribute('width',W); svg.setAttribute('height',H); svg.setAttribute('viewBox','0 0 '+W+' '+H); svg.setAttribute('role','img'); svg.setAttribute('aria-label',o.items.map(function(i){ return i.l+': '+(i.v==null?'—':i.v); }).join(', ')); el.appendChild(svg);
      var g='<defs><linearGradient id="gkAcG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--primary)" stop-opacity=".2"/><stop offset="1" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs>';
      [top,(top+lo)/2,lo].forEach(function(v){ var y=Y(v); g+='<line class="gk-ac-g" x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'"/><text class="gk-ac-y" x="'+(L-8)+'" y="'+(y+4)+'" text-anchor="end">'+fm(v)+'</text>'; });
      o.items.forEach(function(it,i){ g+='<text class="gk-ac-x" x="'+X(i)+'" y="'+(H-6)+'" text-anchor="middle">'+it.l+'</text>'; });
      function curve(idx,val){ var d='M'+X(idx[0])+' '+Y(val(idx[0])); for(var q=1;q<idx.length;q++){ var a=idx[q-1],b=idx[q],cx=(X(a)+X(b))/2; d+=' C'+cx+' '+Y(val(a))+' '+cx+' '+Y(val(b))+' '+X(b)+' '+Y(val(b)); } return d; }
      var real=[]; o.items.forEach(function(it,i){ if(it.v!=null) real.push(i); }), last=real[real.length-1];
      var d=curve(real,function(i){ return o.items[i].v; }), plan=o.items[0].p!=null;
      if(plan) g+='<path class="gk-ac-p" d="'+o.items.map(function(x,i){ return (i?'L':'M')+X(i)+' '+Y(x.p); }).join(' ')+'"/>';
      g+='<path d="'+d+' L'+X(last)+' '+Y(lo)+' L'+X(real[0])+' '+Y(lo)+' Z" fill="url(#gkAcG)"/><path class="gk-ac-l" d="'+d+'"/><line class="gk-ac-c" y1="'+T+'" y2="'+Y(lo)+'"/>';
      svg.innerHTML=g;
      var cl=svg.querySelector('.gk-ac-c'), dot=document.createElement('i'); dot.className='gk-ac-d'; el.appendChild(dot);
      function at(i){ var it=o.items[i]; cl.setAttribute('x1',X(i)); cl.setAttribute('x2',X(i)); cl.style.opacity=1; dot.style.left=X(i)+'px'; dot.style.top=Y(it.v==null?it.p:it.v)+'px'; dot.style.opacity=1; dot.classList.toggle('is-plan',it.v==null); GK.tip.show(dot,it.v==null?'Previsto: '+Math.round(it.p)+' '+o.unit:fm(it.v)+(o.unit==='%'?'%':' '+(it.v===1?o.one:o.unit)),it.t,it.e); }
      function out(){ cl.style.opacity=0; dot.style.opacity=0; GK.tip.off(); }
      el.addEventListener('pointermove',function(e){ var r=el.getBoundingClientRect(), x=e.clientX-r.left, k=Math.round((x-L)/(pw/Math.max(n-1,1))); at(Math.max(0,Math.min(n-1,k))); });
      el.addEventListener('pointerleave',out);
    }
    draw(); var w=el.clientWidth; el.style.overflow='hidden'; function re(){ if(el.clientWidth!==w){ w=el.clientWidth; draw(); } } if(window.ResizeObserver) new ResizeObserver(function(){ requestAnimationFrame(re); }).observe(el); else window.addEventListener('resize',re);
  };
})();

/* confirmação rápida (GK.toast): aviso pequeno embaixo que some sozinho.
   Se a página trocar logo em seguida (ex.: excluir e voltar para a lista), a mensagem reaparece na página nova. */
(function(){
  var KEY='gk_toast', box=null, cur=null, tm=null;
  function wrap(){ if(!box){ box=document.createElement('div'); box.className='gk-toasts'; document.body.appendChild(box); } return box; }
  function show(msg,ms){
    var w=wrap(); if(cur){ cur.remove(); cur=null; } clearTimeout(tm);
    var t=document.createElement('div'); t.className='gk-toast'; t.setAttribute('role','status');
    t.innerHTML='<span class="gk-toast-ic"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>';
    var s=document.createElement('span'); s.textContent=msg; t.appendChild(s); w.appendChild(t); cur=t;
    tm=setTimeout(function(){ t.classList.add('is-out'); setTimeout(function(){ t.remove(); if(cur===t) cur=null; try{ sessionStorage.removeItem(KEY); }catch(e){} },200); },ms||3200);
  }
  GK.toast=function(msg,ms){ try{ sessionStorage.setItem(KEY,JSON.stringify({m:msg,t:Date.now()})); }catch(e){} show(msg,ms); };
  document.addEventListener('DOMContentLoaded',function(){ try{ var o=JSON.parse(sessionStorage.getItem(KEY)||'null'); if(o&&Date.now()-o.t<4000) show(o.m,Math.max(1200,3200-(Date.now()-o.t))); else sessionStorage.removeItem(KEY); }catch(e){} });
})();

/* estado vazio (GK.emptyHTML): ícone em quadrado azul-claro, título, uma linha de apoio e a ação principal */
(function(){
  GK.emptyHTML=function(o){
    return '<div class="gk-empty gk-empty-first"><span class="gk-empty-ic"><i data-lucide="'+o.icon+'" class="gk-ic"></i></span><b>'+o.title+'</b>'+(o.text?'<span>'+o.text+'</span>':'')
      +(o.btn?'<button type="button" class="gk-btn gk-btn-primary"'+(o.btn.id?' id="'+o.btn.id+'"':'')+'><i data-lucide="'+(o.btn.icon||'plus')+'" class="gk-ic"></i>'+o.btn.label+'</button>':'')+'</div>';
  };
})();

/* lista sem nenhum registro (primeiro uso): esconde rodapé, desativa a barra e mostra o estado vazio com a ação */
(function(){
  GK.firstUse=function(zero,o){
    var w=document.querySelector('.gk-table-wrap'), v=document.getElementById('vazio'); if(!w||!v) return;
    w.classList.toggle('is-vazio',zero); var f=w.querySelector('.gk-tfoot'); if(f) f.hidden=zero; v.hidden=!zero;
    if(zero&&!v.innerHTML){ v.innerHTML=GK.emptyHTML(o); GK.icons(); var b=v.querySelector('button'); if(b) b.addEventListener('click',function(){ var n=document.getElementById('btnNovo')||document.getElementById('btnNova'); if(n) n.click(); }); }
  };
})();
