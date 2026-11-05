/* ============================================================
   GAO — shell.js
   Injeta em TODA página: sidebar recolhível (desktop) / drawer (mobile),
   com seções colapsáveis e o perfil do motorista no rodapé (toque abre
   "Meu perfil / Sair"). A topbar do desktop é um breadcrumb fininho que
   só diz em que página do menu o usuário está — os títulos de página
   vivem dentro do conteúdo.
   Item ativo do menu: <body data-page="home">.
   Abrir o menu no mobile: qualquer elemento [data-gao-menu].
   ============================================================ */
(function(){
  // aplica o tema salvo o quanto antes (evita a maior parte do flash)
  try{ if(JSON.parse(localStorage.getItem('gao_theme')||'null')==='dark') document.documentElement.setAttribute('data-theme','dark'); }catch(e){}
  var NAV_TOP = [
    {label:'Início', icon:'layout-grid', href:'index.html', key:'home'}
  ];
  var SECTIONS = [
    {name:'Operação', items:[
      {label:'Histórico de viagens', icon:'route', href:'historico.html', key:'historico'}
    ]}
  ];
  var NAV_BOTTOM = [
    {label:'Suporte', icon:'headphones', href:'#', key:'suporte'}
  ];
  var USER = {name:'Ronaldo Araújo', short:'Olá, Ronaldo', role:'Motorista', initials:'RA'};

  /* ---- ícones estruturais inline (independem do lucide) ---- */
  var CHV_SEC   = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  var CHV_DOWN  = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  var CHV_UP    = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
  var IC_X      = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var IC_GRID   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>';
  var TG_COL    = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M16 15l-3-3 3-3"/></svg>';
  var TG_EXP    = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M14 9l3 3-3 3"/></svg>';

  // ----- persistência no navegador (sem back-end) -----
  function save(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function load(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }
  function remove(k){ try{ localStorage.removeItem(k); }catch(e){} }

  // ----- stepper / mapa de orientação do fluxo (read-only) -----
  var FLOW_KEYS   = ['checkin','rota','carregamento','entregas','coleta','checkout','resumo'];
  var FLOW_LABELS = ['Check-in','Rota','Carregamento','Entregas','Coleta','Check-out','Resumo'];
  function flowHTML(activeKey){
    var cur = FLOW_KEYS.indexOf(activeKey); if(cur<0) cur=0;
    var steps='';
    for(var i=0;i<FLOW_KEYS.length;i++){
      var cls = i<cur ? 'done' : (i===cur ? 'cur' : 'pending');
      steps += '<div class="gf-step '+cls+'"><span class="gf-dotwrap"><span class="gf-d"></span></span><span class="gf-name">'+FLOW_LABELS[i]+'</span></div>';
    }
    return '<div class="gf-track">'+steps+'</div>';
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

  function esc(s){ return String(s).replace(/"/g,'&quot;'); }
  function navItem(it, page){
    return '<a class="gao-nav'+(it.key===page?' active':'')+'" href="'+it.href+'" data-lbl="'+esc(it.label)+'" title="'+esc(it.label)+'">'
      + '<span class="gni"><i data-lucide="'+it.icon+'"></i></span><span class="lb">'+it.label+'</span></a>';
  }

  // breadcrumb a partir da key da página: caminho + ícone do próprio item (null = fora do menu)
  function crumbInfo(page){
    var r=null;
    NAV_TOP.forEach(function(it){ if(it.key===page) r={path:[it.label], icon:it.icon}; });
    if(r) return r;
    SECTIONS.forEach(function(s){ s.items.forEach(function(it){ if(it.key===page) r={path:[s.name, it.label], icon:it.icon}; }); });
    if(r) return r;
    NAV_BOTTOM.forEach(function(it){ if(it.key===page) r={path:[it.label], icon:it.icon}; });
    return r;
  }

  function buildSidebar(page){
    var closedSet = load('gao_side_closed') || [];
    var h = '<button class="gao-tg" id="gaoTg" type="button" aria-label="Recolher menu"></button>';
    h += '<div class="gao-top">'
      + '<a class="gao-brand" href="index.html"><img class="gao-logo-full" src="static/img/logo.svg" alt="GAO"><img class="gao-logo-mark" src="static/img/flor.svg" alt="GAO"></a>'
      + '<button class="gao-x" id="gaoX" type="button" aria-label="Fechar menu">'+IC_X+'</button>'
      + '</div>';
    h += '<nav class="gao-navwrap" id="gaoNav">';
    NAV_TOP.forEach(function(it){ h += navItem(it, page); });
    SECTIONS.forEach(function(s){
      var hasActive = s.items.some(function(it){ return it.key===page; });
      var cl = (closedSet.indexOf(s.name) >= 0) && !hasActive;
      h += '<div class="gao-sec'+(cl?' cl':'')+'" data-sec="'+esc(s.name)+'">'
        + '<button class="gao-sh" type="button"><span>'+s.name+'</span><span class="chv">'+CHV_SEC+'</span></button>'
        + '<div class="gao-sec-bd">'+ s.items.map(function(it){ return navItem(it, page); }).join('') +'</div></div>';
    });
    h += '</nav>';
    h += '<div class="gao-foot">';
    if(NAV_BOTTOM.length){
      h += '<div class="gao-foot-nav">'+ NAV_BOTTOM.map(function(it){ return navItem(it, page); }).join('') +'</div>';
    }
    h += '<div class="gao-pop" id="gaoPop">'
      + '<a class="gao-pop-item me" href="perfil.html"><span class="pii"><i data-lucide="circle-user-round"></i></span> Meu perfil</a>'
      + '<div class="gao-pop-dv"></div>'
      + '<a class="gao-pop-item" href="login.html"><span class="pii"><i data-lucide="log-out"></i></span> Sair</a>'
      + '</div>'
      + '<button class="gao-pc" id="gaoPc" data-gao-user aria-haspopup="true"><span class="gao-avatar">'+USER.initials+'</span>'
      + '<span class="gao-pt"><b>'+USER.name+'</b><small>'+USER.role+'</small></span>'
      + '<span class="gao-pc-cx" id="gaoPcCx">'+CHV_UP+'</span></button>'
      + '</div>';
    var side = document.createElement('aside'); side.className='gao-side'; side.id='gaoSide'; side.innerHTML=h;
    return side;
  }

  function buildTopbar(){
    var page = document.body.getAttribute('data-page') || '';
    // fluxo / voltar / cabeçalho .nav têm prioridade sobre o breadcrumb
    var hasFlow = !!document.body.getAttribute('data-flow-step');
    var hasBack = !!document.body.getAttribute('data-top-back');
    var _navEl = document.querySelector('.nav');
    var hasNav  = !!(_navEl && _navEl.querySelector('h1') && !_navEl.closest('.view:not(.active)'));
    var skipCrumb = hasFlow || hasBack || hasNav;
    var info = skipCrumb ? null : crumbInfo(page);
    // páginas fora do menu podem declarar o próprio breadcrumb (data-crumb / data-crumb-icon)
    if(!info && !skipCrumb){
      var dc=document.body.getAttribute('data-crumb');
      if(dc) info={path:dc.split('›').map(function(s){return s.trim();}), icon:document.body.getAttribute('data-crumb-icon')||'layout-grid'};
    }
    // páginas do menu: breadcrumb fininho (só localização; o título vive no conteúdo)
    if(info){
      document.body.classList.add('gao-crumb');
      var path=info.path, segs='';
      for(var i=0;i<path.length;i++){ segs += (i>0?'<span class="gbc-sep">›</span>':'') + '<span class="gbc-seg">'+path[i]+'</span>'; }
      var bc=document.createElement('header'); bc.className='gao-topbar gao-topbar-bc';
      bc.innerHTML='<div class="gao-top-inner"><div class="gao-bc"><span class="gbc-ic"><i data-lucide="'+info.icon+'"></i></span>'+segs+'</div></div>';
      return bc;
    }
    // demais páginas (fluxo / resumo): título + voltar
    var tt = document.body.getAttribute('data-top-title');
    var ts = document.body.getAttribute('data-top-sub');
    var tb = document.body.getAttribute('data-top-back');
    var navProxy = false;
    if(!tt){
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
    var title = tt ? '<div class="gao-top-title"><b>'+tt+'</b>'+(ts?'<small>'+ts+'</small>':'')+'</div>' : '';
    var hasLeft = !!(tt||tb);
    var left = hasLeft ? '<div class="gao-top-left">'+back+title+'</div>' : '';
    var bar = document.createElement('header'); bar.className='gao-topbar'+(hasLeft?' has-left':'')+((tb||navProxy)?' has-back':''); bar.innerHTML='<div class="gao-top-inner">'+left+'</div>';
    return bar;
  }

  // ----- Suporte: modal global (abrir chamado -> GLPI da GAO) -----
  var SUP_TOPICS=[
    {t:'Localização (GPS) não funciona', p:'urgente'},
    {t:'Não consigo adicionar foto', p:'urgente'},
    {t:'App travando ou muito lento', p:'normal'},
    {t:'Erro ao registrar entrega ou coleta', p:'alta'},
    {t:'Problema no leitor de gaiola', p:'alta'},
    {t:'Outro', p:'normal'}
  ];
  var PRIO_LABEL={urgente:'Urgente', alta:'Alta', normal:'Normal'};
  var SUP_SEL=-1, SUP_PHOTO=null;
  var SUP_ADD='<input type="file" accept="image/*" id="gaoSupFile" hidden><button type="button" class="pslot-empty" id="gaoSupAdd"><div class="cam-ic"><i data-lucide="camera"></i></div><div class="pt">Tirar ou adicionar foto</div><div class="ps">Adicione uma foto do problema</div></button>';
  function supWirePhoto(){
    var add=document.getElementById('gaoSupAdd'), file=document.getElementById('gaoSupFile');
    if(!add||!file) return;
    add.addEventListener('click', function(){ file.click(); });
    file.addEventListener('change', function(e){
      var f=e.target.files[0]; if(!f) return;
      var r=new FileReader();
      r.onload=function(){
        SUP_PHOTO=r.result;
        var ph=document.getElementById('gaoSupPhoto');
        ph.innerHTML='<div class="sup-thumb"><img src="'+r.result+'" alt="Print"><button type="button" class="st-rm" id="gaoSupRm" aria-label="Remover">'+IC_X+'</button></div>';
        var rm=document.getElementById('gaoSupRm');
        if(rm) rm.addEventListener('click', function(){ SUP_PHOTO=null; document.getElementById('gaoSupPhoto').innerHTML=SUP_ADD; supWirePhoto(); icons(); });
      };
      r.readAsDataURL(f); file.value='';
    });
  }
  function supReset(){
    SUP_SEL=-1; SUP_PHOTO=null;
    var b=document.getElementById('gaoSupBody'), d=document.getElementById('gaoSupDone');
    if(b) b.hidden=false; if(d){ d.hidden=true; d.innerHTML=''; }
    var sel=document.getElementById('gaoSupSel'); if(sel) sel.value='';
    var desc=document.getElementById('gaoSupDesc'); if(desc) desc.value='';
    var ph=document.getElementById('gaoSupPhoto'); if(ph) ph.innerHTML=SUP_ADD;
    supWirePhoto();
    var s=document.getElementById('gaoSupSend'); if(s) s.disabled=true;
  }
  function openSupport(){ var w=document.getElementById('gaoSupWrap'); if(!w) return; supReset(); w.classList.add('open'); icons(); }
  function closeSupport(){ var w=document.getElementById('gaoSupWrap'); if(w) w.classList.remove('open'); }
  function buildSupport(){
    if(document.getElementById('gaoSupWrap')) return;
    var opts=SUP_TOPICS.map(function(o,i){ return '<option value="'+i+'">'+o.t+'</option>'; }).join('');
    var h='<div class="sheet sup-sheet">'
      +'<div class="sup-top"><div class="sup-ico"><i data-lucide="headset"></i></div><button class="sup-x" id="gaoSupX" type="button" aria-label="Fechar">'+IC_X+'</button></div>'
      +'<div class="sup-body" id="gaoSupBody">'
      +'<h2>Solicitar suporte</h2>'
      +'<p class="sup-sub">Diga o que está acontecendo. A equipe de TI da GAO recebe na hora.</p>'
      +'<p class="sup-label">O que aconteceu? <span class="sup-req">*</span></p>'
      +'<select class="sup-select" id="gaoSupSel"><option value="" selected disabled>Selecione o motivo</option>'+opts+'</select>'
      +'<p class="sup-label">Foto do problema <span class="sup-opt-tag">(opcional)</span></p>'
      +'<div class="sup-photo" id="gaoSupPhoto">'+SUP_ADD+'</div>'
      +'<p class="sup-label">Descrição <span class="sup-opt-tag">(opcional)</span></p>'
      +'<textarea class="sup-area" id="gaoSupDesc" placeholder="Se quiser, explique em poucas palavras o que aconteceu"></textarea>'
      +'<button class="sup-send" id="gaoSupSend" type="button" disabled>Enviar ao time</button>'
      +'</div>'
      +'<div class="sup-done" id="gaoSupDone" hidden></div>'
      +'</div>';
    var wrap=document.createElement('div'); wrap.className='sheet-wrap sup-wrap'; wrap.id='gaoSupWrap'; wrap.innerHTML=h;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function(e){ if(e.target===wrap) closeSupport(); });
    var x=document.getElementById('gaoSupX'); if(x) x.addEventListener('click', closeSupport);
    var selEl=document.getElementById('gaoSupSel');
    if(selEl) selEl.addEventListener('change', function(){
      SUP_SEL = selEl.value===''? -1 : +selEl.value;
      var s=document.getElementById('gaoSupSend'); if(s) s.disabled = SUP_SEL<0;
    });
    supWirePhoto();
    var send=document.getElementById('gaoSupSend');
    if(send) send.addEventListener('click', function(){
      if(SUP_SEL<0) return;
      var topic=SUP_TOPICS[SUP_SEL], proto='GAO-'+Math.floor(10000+Math.random()*89999);
      var d=document.getElementById('gaoSupDone');
      d.innerHTML='<div class="success sup-success"><div class="ring"><i data-lucide="check"></i></div>'
        +'<h3>Solicitação enviada</h3>'
        +'<p>A equipe de TI da GAO recebeu. Pode seguir usando o app normalmente.</p>'
        +'<div class="sd-meta"><div class="sd-row"><span class="k">Protocolo</span><span class="v">'+proto+'</span></div>'
        +'<div class="sd-row"><span class="k">Problema</span><span class="v">'+topic.t+'</span></div>'
        +'</div>'
        +'<button class="sd-close" id="gaoSupClose" type="button">Fechar</button></div>';
      document.getElementById('gaoSupBody').hidden=true; d.hidden=false; icons();
      var c=document.getElementById('gaoSupClose'); if(c) c.addEventListener('click', closeSupport);
    });
  }

  function build(){
    try{ if('scrollRestoration' in history) history.scrollRestoration='manual'; window.scrollTo(0,0); }catch(e){}  // toda fase começa no topo
    var page = document.body.getAttribute('data-page') || '';
    var side  = buildSidebar(page);
    var scrim = document.createElement('div'); scrim.className='gao-scrim'; scrim.id='gaoScrim';
    var top   = buildTopbar();

    // estado recolhido salvo (só faz efeito no desktop, via CSS)
    if(load('gao_side_collapsed')) document.body.classList.add('gao-col');

    document.body.insertBefore(top, document.body.firstChild);
    document.body.insertBefore(scrim, document.body.firstChild);
    document.body.insertBefore(side, document.body.firstChild);

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

    var pop = document.getElementById('gaoPop');

    // abrir/fechar drawer no mobile
    scrim.addEventListener('click', closeMenu);
    document.querySelectorAll('[data-gao-menu]').forEach(function(b){ b.addEventListener('click', openMenu); });
    var xb = document.getElementById('gaoX'); if(xb) xb.addEventListener('click', closeMenu);

    // recolher/expandir (desktop)
    var tg=document.getElementById('gaoTg');
    function setTgIcon(){ if(!tg) return; var c=document.body.classList.contains('gao-col'); tg.innerHTML=c?TG_EXP:TG_COL; tg.setAttribute('aria-label', c?'Expandir menu':'Recolher menu'); }
    setTgIcon();
    if(tg) tg.addEventListener('click', function(){ var c=document.body.classList.toggle('gao-col'); save('gao_side_collapsed', c); setTgIcon(); if(pop) pop.classList.remove('show'); });

    // seções colapsáveis (persistidas)
    side.querySelectorAll('.gao-sh').forEach(function(btn){
      btn.addEventListener('click', function(){
        var sec=btn.closest('.gao-sec'); if(!sec) return;
        sec.classList.toggle('cl');
        var name=sec.getAttribute('data-sec'), closed=load('gao_side_closed')||[], i=closed.indexOf(name);
        if(sec.classList.contains('cl')){ if(i<0) closed.push(name); } else if(i>=0){ closed.splice(i,1); }
        save('gao_side_closed', closed);
      });
    });

    // dropdown do perfil — gatilho [data-gao-user] (card do rodapé)
    function togglePop(e){ e.stopPropagation(); if(!pop) return; var open=pop.classList.toggle('show'); var cx=document.getElementById('gaoPcCx'); if(cx) cx.innerHTML=open?CHV_DOWN:CHV_UP; }
    document.querySelectorAll('[data-gao-user]').forEach(function(b){ b.addEventListener('click', togglePop); });
    document.addEventListener('click', function(e){
      if(pop && !pop.contains(e.target) && !e.target.closest('[data-gao-user]')){ pop.classList.remove('show'); var cx=document.getElementById('gaoPcCx'); if(cx) cx.innerHTML=CHV_UP; }
    });

    // ação "Voltar" na topbar (só nas páginas de fluxo/resumo)
    var backBtn=document.getElementById('gaoTopBack');
    if(backBtn){
      var backDest=document.body.getAttribute('data-top-back');
      if(backDest){
        document.body.classList.add('gao-has-back');  // mostra a barra também no mobile (ex.: resumo)
        backBtn.addEventListener('click', function(){ window.location.href=backDest; });
      } else {
        backBtn.addEventListener('click', function(){ var nb=document.querySelector('.nav .back'); if(nb) nb.click(); });
      }
    }

    // tema claro/escuro — lua no topo (fixa no desktop, rola junto no mobile)
    var themeBtn=document.createElement('button');
    themeBtn.id='gaoTheme'; themeBtn.type='button'; themeBtn.setAttribute('aria-label','Alternar tema');
    document.body.appendChild(themeBtn);
    function applyTheme(t){
      var dark=(t==='dark');
      if(dark) document.documentElement.setAttribute('data-theme','dark');
      else document.documentElement.removeAttribute('data-theme');
      themeBtn.innerHTML='<i data-lucide="'+(dark?'sun':'moon')+'"></i>';
    }
    applyTheme(load('gao_theme')==='dark'?'dark':'light');
    themeBtn.addEventListener('click', function(){
      var next=(document.documentElement.getAttribute('data-theme')==='dark')?'light':'dark';
      save('gao_theme', next); applyTheme(next); icons();
    });

    // suporte: abrir o modal pelo item "Suporte" do menu
    buildSupport();
    var supLink=side.querySelector('.gao-foot-nav a.gao-nav');
    if(supLink) supLink.addEventListener('click', function(e){ e.preventDefault(); closeMenu(); openSupport(); });

    // ao trocar de breakpoint, fecha o drawer
    try{ var mq=matchMedia('(max-width:899px)'); mq.onchange=function(){ closeMenu(); }; }catch(e){}

    icons();
  }

  function openMenu(){ var s=document.getElementById('gaoSide'),c=document.getElementById('gaoScrim'); if(s)s.classList.add('open'); if(c)c.classList.add('show'); }
  function closeMenu(){ var s=document.getElementById('gaoSide'),c=document.getElementById('gaoScrim'),p=document.getElementById('gaoPop'); if(s)s.classList.remove('open'); if(c)c.classList.remove('show'); if(p)p.classList.remove('show'); }

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

  // câmera + leitura de QR (jsQR) — compartilhado por carregamento e entrega
  function startCamera(video, opts){
    opts=opts||{}; var stream=null, raf=null, paused=false;
    var canvas=document.createElement('canvas'), ctx=canvas.getContext('2d',{willReadFrequently:true});
    function loop(){
      raf=requestAnimationFrame(loop);
      if(paused || !video.videoWidth) return;
      canvas.width=video.videoWidth; canvas.height=video.videoHeight;
      ctx.drawImage(video,0,0,canvas.width,canvas.height);
      var img; try{ img=ctx.getImageData(0,0,canvas.width,canvas.height); }catch(e){ return; }
      if(!window.jsQR) return;
      var code=jsQR(img.data,img.width,img.height,{inversionAttempts:'dontInvert'});
      if(code && code.data && opts.onCode){ paused=true; opts.onCode(code.data); setTimeout(function(){ paused=false; }, opts.cooldown||1200); }
    }
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ if(opts.onError)opts.onError(new Error('no-cam')); return function(){}; }
    navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}}).then(function(s){
      stream=s; video.srcObject=s; video.setAttribute('playsinline',''); video.muted=true;
      var p=video.play(); if(p&&p.then) p.then(loop).catch(loop); else loop();
    }).catch(function(e){ if(opts.onError)opts.onError(e); });
    return function stop(){ if(raf)cancelAnimationFrame(raf); if(stream)stream.getTracks().forEach(function(t){t.stop();}); try{ video.srcObject=null; }catch(e){} };
  }

  window.GAO = { open:openMenu, close:closeMenu, icons:icons, renderFlow:renderFlow, flowHTML:flowHTML, getTrip:getTrip, setTrip:setTrip, clearTrip:clearTrip, save:save, load:load, remove:remove, shrink:shrink, startCamera:startCamera };

  if(document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
})();
