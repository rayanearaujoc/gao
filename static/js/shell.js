/* ============================================================
   GAO — shell.js
   Injeta em TODA página: barra lateral (desktop) / drawer (mobile),
   a topbar com o chip do usuário (desktop) e o dropdown do usuário
   (Meu perfil / Sair) — que funciona também no mobile ao tocar na
   bolinha RA (qualquer elemento [data-gao-user]).
   Item ativo do menu: <body data-page="home">.
   Abrir o menu no mobile: qualquer elemento [data-gao-menu].
   ============================================================ */
(function(){
  var NAV = [
    {label:'Início',               icon:'layout-grid', href:'index.html', key:'home'},
    {label:'Histórico de viagens', icon:'route',       href:'historico.html', key:'historico'}
  ];
  var FOOT = [
    {label:'Meu perfil', icon:'circle-user-round', href:'#'},
    {label:'Suporte',    icon:'headphones',        href:'#'}
  ];
  var USER = {name:'Ronaldo Araújo', short:'Olá, Ronaldo', role:'Motorista', initials:'RA'};

  // ----- stepper / mapa de orientação do fluxo (read-only) -----
  var FLOW_KEYS   = ['checkin','carregamento','rota','entregas','coleta','checkout','resumo'];
  var FLOW_LABELS = ['Check-in','Carregamento','Rota','Entregas','Coleta','Check-out','Resumo'];
  function flowHTML(activeKey){
    var cur = FLOW_KEYS.indexOf(activeKey); if(cur<0) cur=0;
    var steps='';
    for(var i=0;i<FLOW_KEYS.length;i++){
      var cls = i<cur ? 'done' : (i===cur ? 'cur' : 'pending');
      steps += '<div class="gf-step '+cls+'"><span class="gf-dotwrap"><span class="gf-d"></span></span><span class="gf-name">'+FLOW_LABELS[i]+'</span></div>';
    }
    return '<div class="gf-track">'+steps+'</div><span class="gf-cnt">'+(cur+1)+'/'+FLOW_KEYS.length+'</span>';
  }
  function enableDrag(track){
    if(!track || track._drag) return; track._drag=true;
    var down=false, sx=0, sl=0;
    track.addEventListener('pointerdown', function(e){ if(e.pointerType==='touch') return; down=true; sx=e.clientX; sl=track.scrollLeft; track.classList.add('drag'); });
    window.addEventListener('pointermove', function(e){ if(!down) return; track.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function(){ if(down){ down=false; track.classList.remove('drag'); } });
  }
  function centerFlow(root){
    if(!root) return;
    var track=root.querySelector('.gf-track'), curEl=root.querySelector('.gf-step.cur');
    if(track && curEl){ try{ track.scrollLeft = Math.max(0, curEl.offsetLeft - (track.clientWidth/2) + (curEl.offsetWidth/2)); }catch(e){} }
  }
  function afterFlow(root){ centerFlow(root); if(root) enableDrag(root.querySelector('.gf-track')); }
  function renderFlow(el, activeKey){ if(!el) return; el.innerHTML = flowHTML(activeKey); (window.requestAnimationFrame||setTimeout)(function(){ afterFlow(el); }, 0); }

  function icons(){ if(window.lucide && lucide.createIcons) lucide.createIcons(); }

  function buildSidebar(page){
    var h = '<a class="gao-brand" href="index.html"><img class="gao-logo" src="static/img/logo.svg" alt="GAO"></a>';
    h += '<div class="gao-navlabel">Operação</div>';
    NAV.forEach(function(it){ h += '<a class="gao-nav'+(it.key===page?' active':'')+'" href="'+it.href+'"><i data-lucide="'+it.icon+'"></i> '+it.label+'</a>'; });
    h += '<div class="gao-sp"></div><div class="gao-sidefoot">';
    FOOT.forEach(function(it){ h += '<a class="gao-nav" href="'+it.href+'"><i data-lucide="'+it.icon+'"></i> '+it.label+'</a>'; });
    h += '</div>';
    var side = document.createElement('aside'); side.className='gao-side'; side.id='gaoSide'; side.innerHTML=h;
    return side;
  }
  function buildTopbar(){
    var tt = document.body.getAttribute('data-top-title');
    var ts = document.body.getAttribute('data-top-sub');
    var tb = document.body.getAttribute('data-top-back');
    var tg = document.body.getAttribute('data-top-greet');
    var navProxy = false;
    // telas de fluxo: puxa o cabeçalho (.nav) pra topbar no desktop
    if(!tt && !tg){
      var navEl = document.querySelector('.nav'), navH1 = navEl && navEl.querySelector('h1');
      if(navH1){
        tt = navH1.textContent;
        var navP = navEl.querySelector('p'); if(navP) ts = navP.textContent;
        if(navEl.querySelector('.back')) navProxy = true;
        document.body.classList.add('gao-nav-topbar');
      }
    }
    var back = navProxy
      ? '<button class="back" id="gaoTopBack" type="button" aria-label="Voltar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>'
      : (tb ? '<button class="gao-top-back" id="gaoTopBack" type="button"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg> Voltar</button>' : '');
    var greet = tg ? '<div class="gao-top-greet"><span class="gtg-hi"><img class="gtg-wave" src="static/img/wave.svg" width="18" height="18" alt=""> Olá,</span><b class="gtg-name">'+tg+'</b></div>' : '';
    var title = tt ? '<div class="gao-top-title"><b>'+tt+'</b>'+(ts?'<small>'+ts+'</small>':'')+'</div>' : '';
    var hasLeft = !!(tt||tb||tg);
    var left = hasLeft ? '<div class="gao-top-left">'+back+greet+title+'</div>' : '';
    var h = left
      + '<button class="gao-userchip" id="gaoUser" data-gao-user aria-haspopup="true">'
      + '<span class="gao-avatar">'+USER.initials+'</span>'
      + '<span class="gao-nm"><b>'+USER.short+'</b><small>'+USER.role+'</small></span>'
      + '<i data-lucide="chevron-down"></i></button>';
    var bar = document.createElement('header'); bar.className='gao-topbar'+(hasLeft?' has-left':'')+((tb||navProxy)?' has-back':''); bar.innerHTML='<div class="gao-top-inner">'+h+'</div>';
    return bar;
  }
  function buildPop(){
    var h = '<div class="gao-pop-id"><span class="gao-avatar">'+USER.initials+'</span><div><b>'+USER.name+'</b><small>'+USER.role+'</small></div></div>'
      + '<a class="gao-pop-item" href="#"><i data-lucide="circle-user-round"></i> Meu perfil</a>'
      + '<a class="gao-pop-item" href="#"><i data-lucide="log-out"></i> Sair</a>';
    var pop = document.createElement('div'); pop.className='gao-pop'; pop.id='gaoPop'; pop.innerHTML=h;
    return pop;
  }

  function build(){
    try{ if('scrollRestoration' in history) history.scrollRestoration='manual'; window.scrollTo(0,0); }catch(e){}  // toda fase começa no topo
    var page = document.body.getAttribute('data-page') || '';
    var side  = buildSidebar(page);
    var scrim = document.createElement('div'); scrim.className='gao-scrim'; scrim.id='gaoScrim';
    var top   = buildTopbar();
    var pop   = buildPop();

    document.body.insertBefore(top, document.body.firstChild);
    document.body.insertBefore(scrim, document.body.firstChild);
    document.body.insertBefore(side, document.body.firstChild);
    document.body.appendChild(pop);

    // stepper automático: páginas do fluxo declaram data-flow-step no <body>
    var fstep = document.body.getAttribute('data-flow-step');
    if(fstep){
      var nav = document.querySelector('.nav');
      if(nav){
        var fb=document.createElement('div'); fb.className='gao-flow'; fb.innerHTML=flowHTML(fstep);
        nav.parentNode.insertBefore(fb, nav.nextSibling);
        (window.requestAnimationFrame||setTimeout)(function(){ afterFlow(fb); }, 0);
      }
    }

    scrim.addEventListener('click', closeMenu);
    document.querySelectorAll('[data-gao-menu]').forEach(function(b){ b.addEventListener('click', openMenu); });

    // dropdown do usuário — qualquer gatilho [data-gao-user] (chip do desktop ou bolinha do mobile)
    function togglePop(e){ e.stopPropagation(); pop.classList.toggle('open'); }
    document.querySelectorAll('[data-gao-user]').forEach(function(b){ b.addEventListener('click', togglePop); });
    document.addEventListener('click', function(e){
      if(!pop.contains(e.target) && !e.target.closest('[data-gao-user]')) pop.classList.remove('open');
    });

    // ação "Voltar" na topbar
    var backBtn=document.getElementById('gaoTopBack');
    if(backBtn){
      var backDest=document.body.getAttribute('data-top-back');
      if(backDest){
        document.body.classList.add('gao-has-back');  // mostra a barra também no mobile (ex.: resumo)
        backBtn.addEventListener('click', function(){ window.location.href=backDest; });
      } else {
        // telas de fluxo: aciona o voltar original do cabeçalho (.nav .back)
        backBtn.addEventListener('click', function(){ var nb=document.querySelector('.nav .back'); if(nb) nb.click(); });
      }
    }
    icons();
  }

  function openMenu(){ var s=document.getElementById('gaoSide'),c=document.getElementById('gaoScrim'); if(s)s.classList.add('open'); if(c)c.classList.add('show'); }
  function closeMenu(){ var s=document.getElementById('gaoSide'),c=document.getElementById('gaoScrim'); if(s)s.classList.remove('open'); if(c)c.classList.remove('show'); }

  // ----- persistência no navegador (sem back-end) -----
  function save(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function load(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }
  function remove(k){ try{ localStorage.removeItem(k); }catch(e){} }

  // reduz uma foto (dataURL) p/ caber no localStorage antes de salvar; cai pro original se falhar
  function shrink(src, maxW, cb){
    try{
      var img=new Image();
      img.onload=function(){
        try{
          var w=img.width||maxW, h=img.height||maxW;
          if(w>maxW){ h=Math.round(h*maxW/w); w=maxW; }
          var c=document.createElement('canvas'); c.width=w; c.height=h;
          c.getContext('2d').drawImage(img,0,0,w,h);
          cb(c.toDataURL('image/jpeg',0.6));
        }catch(e){ cb(src); }
      };
      img.onerror=function(){ cb(src); };
      img.src=src;
    }catch(e){ cb(src); }
  }

  var TRIP_KEY='gao_trip';
  function getTrip(){ return load(TRIP_KEY); }
  function setTrip(t){ save(TRIP_KEY,t); }
  function clearTrip(){ remove(TRIP_KEY); }

  window.GAO = { open:openMenu, close:closeMenu, icons:icons, renderFlow:renderFlow, flowHTML:flowHTML, getTrip:getTrip, setTrip:setTrip, clearTrip:clearTrip, save:save, load:load, remove:remove, shrink:shrink };

  if(document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
})();
