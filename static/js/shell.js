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
  /* ícone de caminhão padrão do app (truck-speed) — usado em todo lugar via GAO.truck ou <span class="ic-truck"> */
  var TRUCK_SVG = '<svg width="22" height="22" viewBox="0 -1 26 26" fill="none" stroke-linecap="round" stroke-linejoin="round"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.31 16.826C12.2864 17.9963 11.3464 18.9278 10.2052 18.9118C9.06401 18.8957 8.14927 17.9382 8.15697 16.7676C8.16467 15.5971 9.09191 14.6522 10.2332 14.652C10.7897 14.6578 11.3212 14.8901 11.7106 15.2978C12.1001 15.7055 12.3157 16.2552 12.31 16.826V16.826Z" stroke="currentColor" stroke-width="1.5"/><path fill-rule="evenodd" clip-rule="evenodd" d="M22.2014 16.826C22.1778 17.9963 21.2378 18.9278 20.0966 18.9118C18.9554 18.8957 18.0407 17.9382 18.0484 16.7676C18.0561 15.5971 18.9833 14.6522 20.1246 14.652C20.6811 14.6578 21.2126 14.8901 21.602 15.2978C21.9915 15.7055 22.2071 16.2552 22.2014 16.826V16.826Z" stroke="currentColor" stroke-width="1.5"/><path d="M17.8032 17.576C18.2174 17.576 18.5532 17.2402 18.5532 16.826C18.5532 16.4118 18.2174 16.076 17.8032 16.076V17.576ZM12.31 16.076C11.8958 16.076 11.56 16.4118 11.56 16.826C11.56 17.2402 11.8958 17.576 12.31 17.576V16.076ZM17.0571 16.826C17.0571 17.2402 17.3928 17.576 17.8071 17.576C18.2213 17.576 18.5571 17.2402 18.5571 16.826H17.0571ZM18.5571 11.559C18.5571 11.1448 18.2213 10.809 17.8071 10.809C17.3928 10.809 17.0571 11.1448 17.0571 11.559H18.5571ZM17.8071 16.076C17.3928 16.076 17.0571 16.4118 17.0571 16.826C17.0571 17.2402 17.3928 17.576 17.8071 17.576V16.076ZM18.0518 17.576C18.466 17.576 18.8018 17.2402 18.8018 16.826C18.8018 16.4118 18.466 16.076 18.0518 16.076V17.576ZM22.189 16.0762C21.7749 16.0852 21.4465 16.4281 21.4555 16.8423C21.4644 17.2564 21.8074 17.5848 22.2215 17.5758L22.189 16.0762ZM24.4 14.485L25.1499 14.4718C25.1492 14.4331 25.1455 14.3946 25.1389 14.3565L24.4 14.485ZM24.63 11.4305C24.559 11.0224 24.1706 10.7491 23.7625 10.8201C23.3544 10.8911 23.0812 11.2794 23.1521 11.6875L24.63 11.4305ZM17.8031 6.127C17.3889 6.127 17.0531 6.46279 17.0531 6.877C17.0531 7.29121 17.3889 7.627 17.8031 7.627V6.127ZM21.2849 6.877L21.2849 7.62702L21.2897 7.62698L21.2849 6.877ZM22.8737 7.56387L22.327 8.07731L22.327 8.07731L22.8737 7.56387ZM23.4835 9.218L22.7342 9.18603C22.7319 9.23979 22.7354 9.29363 22.7446 9.34663L23.4835 9.218ZM23.1522 11.6876C23.2232 12.0957 23.6116 12.3689 24.0197 12.2979C24.4278 12.2268 24.701 11.8384 24.6299 11.4304L23.1522 11.6876ZM18.5531 6.877C18.5531 6.46279 18.2174 6.127 17.8031 6.127C17.3889 6.127 17.0531 6.46279 17.0531 6.877H18.5531ZM17.0531 11.559C17.0531 11.9732 17.3889 12.309 17.8031 12.309C18.2174 12.309 18.5531 11.9732 18.5531 11.559H17.0531ZM17.0531 6.877C17.0531 7.29121 17.3889 7.627 17.8031 7.627C18.2174 7.627 18.5531 7.29121 18.5531 6.877H17.0531ZM17.8031 6.077L17.0531 6.0722V6.077H17.8031ZM16.7657 5L16.77 4.25H16.7657V5ZM7.42037 5L7.42037 4.24999L7.41679 4.25001L7.42037 5ZM6.68411 5.31693L6.14467 4.79587L6.14467 4.79587L6.68411 5.31693ZM6.382 6.075L7.13201 6.075L7.13199 6.07158L6.382 6.075ZM6.382 15.75L7.132 15.7534V15.75H6.382ZM6.68411 16.5081L6.14467 17.0291L6.14467 17.0291L6.68411 16.5081ZM7.42037 16.825L7.41679 17.575H7.42037V16.825ZM8.1526 17.575C8.56681 17.575 8.9026 17.2392 8.9026 16.825C8.9026 16.4108 8.56681 16.075 8.1526 16.075V17.575ZM17.8051 10.808C17.3909 10.808 17.0551 11.1438 17.0551 11.558C17.0551 11.9722 17.3909 12.308 17.8051 12.308V10.808ZM23.893 12.308C24.3072 12.308 24.643 11.9722 24.643 11.558C24.643 11.1438 24.3072 10.808 23.893 10.808V12.308ZM1 6.25C0.585786 6.25 0.25 6.58579 0.25 7C0.25 7.41421 0.585786 7.75 1 7.75V6.25ZM4.05175 7.75C4.46596 7.75 4.80175 7.41421 4.80175 7C4.80175 6.58579 4.46596 6.25 4.05175 6.25V7.75ZM1.975 9.25C1.56079 9.25 1.225 9.58579 1.225 10C1.225 10.4142 1.56079 10.75 1.975 10.75V9.25ZM3.925 10.75C4.33921 10.75 4.675 10.4142 4.675 10C4.675 9.58579 4.33921 9.25 3.925 9.25V10.75ZM2.56975 12.25C2.15554 12.25 1.81975 12.5858 1.81975 13C1.81975 13.4142 2.15554 13.75 2.56975 13.75V12.25ZM3.925 13.75C4.33921 13.75 4.675 13.4142 4.675 13C4.675 12.5858 4.33921 12.25 3.925 12.25V13.75ZM17.8032 16.076H12.31V17.576H17.8032V16.076ZM18.5571 16.826V11.559H17.0571V16.826H18.5571ZM17.8071 17.576H18.0518V16.076H17.8071V17.576ZM22.2215 17.5758C23.8876 17.5397 25.1791 16.1341 25.1499 14.4718L23.6501 14.4982C23.6655 15.3704 22.9939 16.0587 22.189 16.0762L22.2215 17.5758ZM25.1389 14.3565L24.63 11.4305L23.1521 11.6875L23.6611 14.6135L25.1389 14.3565ZM17.8031 7.627H21.2849V6.127H17.8031V7.627ZM21.2897 7.62698C21.6768 7.62448 22.0522 7.7847 22.327 8.07731L23.4204 7.05042C22.8641 6.4581 22.0909 6.12177 21.28 6.12702L21.2897 7.62698ZM22.327 8.07731C22.6025 8.37065 22.7519 8.7712 22.7342 9.18603L24.2328 9.24997C24.2675 8.43728 23.976 7.642 23.4204 7.05042L22.327 8.07731ZM22.7446 9.34663L23.1522 11.6876L24.6299 11.4304L24.2224 9.08937L22.7446 9.34663ZM17.0531 6.877V11.559H18.5531V6.877H17.0531ZM18.5531 6.877V6.077H17.0531V6.877H18.5531ZM18.5531 6.0818C18.5562 5.60485 18.3745 5.14259 18.0422 4.79768L16.9619 5.83829C17.0188 5.8974 17.0537 5.98123 17.0532 6.0722L18.5531 6.0818ZM18.0422 4.79768C17.7094 4.45212 17.2522 4.25277 16.77 4.25001L16.7615 5.74999C16.8331 5.7504 16.9056 5.77984 16.9619 5.83829L18.0422 4.79768ZM16.7657 4.25H7.42037V5.75H16.7657V4.25ZM7.41679 4.25001C6.93498 4.25231 6.4778 4.45098 6.14467 4.79587L7.22355 5.83799C7.27989 5.77967 7.3524 5.75033 7.42396 5.74999L7.41679 4.25001ZM6.14467 4.79587C5.81216 5.1401 5.62983 5.60177 5.63201 6.07843L7.13199 6.07158C7.13158 5.98066 7.16659 5.89696 7.22355 5.83799L6.14467 4.79587ZM5.632 6.075V15.75H7.132V6.075H5.632ZM5.63201 15.7466C5.62983 16.2232 5.81216 16.6849 6.14467 17.0291L7.22355 15.987C7.16659 15.928 7.13158 15.8443 7.13199 15.7534L5.63201 15.7466ZM6.14467 17.0291C6.4778 17.374 6.93498 17.5727 7.41679 17.575L7.42396 16.075C7.3524 16.0747 7.27988 16.0453 7.22355 15.987L6.14467 17.0291ZM7.42037 17.575H8.1526V16.075H7.42037V17.575ZM17.8051 12.308H23.893V10.808H17.8051V12.308ZM1 7.75H4.05175V6.25H1V7.75ZM1.975 10.75H3.925V9.25H1.975V10.75ZM2.56975 13.75H3.925V12.25H2.56975V13.75Z" fill="currentColor"/></svg>';
  var IC_X      = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var IC_GRID   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>';
  var TG_COL    = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  var TG_EXP    = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

  // ----- persistência no navegador (sem back-end) -----
  function save(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function load(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }
  function remove(k){ try{ localStorage.removeItem(k); }catch(e){} }

  // ----- stepper / mapa de orientação do fluxo (read-only) -----
  var FLOW_KEYS   = ['checkin','rota','carregamento','entregas','coleta','checkout','resumo'];
  var FLOW_LABELS = ['Check-in','Rota','Carregamento','Entregas','Coleta','Check-out','Resumo'];
  var FLOW_HREF = {checkin:'index.html',rota:'rota.html',carregamento:'carregar.html',entregas:'entrega.html',coleta:'coleta-rota.html',checkout:'checkout.html',resumo:'resumo.html'};
  function flowHTML(activeKey){
    var cur = FLOW_KEYS.indexOf(activeKey); if(cur<0) cur=0;
    var steps='';
    for(var i=0;i<FLOW_KEYS.length;i++){
      var cls = i<cur ? 'done' : (i===cur ? 'cur' : 'pending');
      var inner = '<span class="gf-dotwrap"><span class="gf-d"></span></span><span class="gf-name">'+FLOW_LABELS[i]+'</span>';
      if(i<cur){ steps += '<a class="gf-step '+cls+'" href="'+(FLOW_HREF[FLOW_KEYS[i]]||'#')+'">'+inner+'</a>'; }
      else { steps += '<div class="gf-step '+cls+'">'+inner+'</div>'; }
    }
    return '<div class="gf-track">'+steps+'</div>';
  }
  function enableDrag(track){
    if(!track || track._drag) return; track._drag=true;
    var down=false, sx=0, sl=0, moved=false;
    track.addEventListener('pointerdown', function(e){ if(e.pointerType==='touch') return; down=true; moved=false; sx=e.clientX; sl=track.scrollLeft; track.classList.add('drag'); });
    window.addEventListener('pointermove', function(e){ if(!down) return; if(Math.abs(e.clientX-sx)>4) moved=true; track.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function(){ if(down){ down=false; track.classList.remove('drag'); } });
    track.addEventListener('click', function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); moved=false; } }, true);
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
    if(NAV_BOTTOM.length){
      h += '<div class="gao-foot-nav">'+ NAV_BOTTOM.map(function(it){ return navItem(it, page); }).join('') +'</div>';
    }
    h += '<div class="gao-foot">';
    h += '<div class="gao-pop" id="gaoPop">'
      + '<a class="gao-pop-item me" href="perfil.html"><span class="pii"><i data-lucide="circle-user-round"></i></span> Meu perfil</a>'
      + '<button class="gao-pop-item" id="gaoThemeItem" type="button"><span class="pii"><i data-lucide="moon"></i></span> Modo escuro</button>'
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

    // tema claro/escuro — agora dentro do menu do perfil (configurações)
    var themeItem=document.getElementById('gaoThemeItem');
    function applyTheme(t){
      var dark=(t==='dark');
      if(dark) document.documentElement.setAttribute('data-theme','dark');
      else document.documentElement.removeAttribute('data-theme');
      if(themeItem) themeItem.innerHTML='<span class="pii"><i data-lucide="'+(dark?'sun':'moon')+'"></i></span> '+(dark?'Modo claro':'Modo escuro');
    }
    applyTheme(load('gao_theme')==='dark'?'dark':'light');
    if(themeItem) themeItem.addEventListener('click', function(){
      var next=(document.documentElement.getAttribute('data-theme')==='dark')?'light':'dark';
      save('gao_theme', next); applyTheme(next); icons();
    });

    // suporte: abrir o modal pelo item "Suporte" do menu
    buildSupport();
    var supLink=side.querySelector('.gao-foot-nav a.gao-nav');
    if(supLink) supLink.addEventListener('click', function(e){ e.preventDefault(); closeMenu(); openSupport(); });

    // ao trocar de breakpoint, fecha o drawer
    try{ var mq=matchMedia('(max-width:899px)'); mq.onchange=function(){ closeMenu(); }; }catch(e){}

    // ícone de caminhão padrão: preenche os placeholders <span class="ic-truck">
    try{ document.querySelectorAll('.ic-truck').forEach(function(el){ el.innerHTML=TRUCK_SVG; }); }catch(e){}

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

  // câmera + leitura de código de barras / QR (ZXing) — compartilhado por carregamento e entrega
  function startCamera(video, opts){
    opts=opts||{};
    if(!window.ZXingBrowser || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ if(opts.onError)opts.onError(new Error('no-cam')); return function(){}; }
    var reader=new ZXingBrowser.BrowserMultiFormatReader();
    var controls=null, stopped=false, paused=false;
    reader.decodeFromConstraints({video:{facingMode:{ideal:'environment'}}}, video, function(result){
      if(stopped || paused || !result || !opts.onCode) return;
      paused=true; opts.onCode(result.getText ? result.getText() : (result.text||''));
      setTimeout(function(){ paused=false; }, opts.cooldown||1400);
    }).then(function(c){ controls=c; if(stopped && controls){ try{controls.stop();}catch(e){} } }).catch(function(e){ if(opts.onError)opts.onError(e); });
    return function stop(){ stopped=true; if(controls){ try{controls.stop();}catch(e){} } try{ video.srcObject=null; }catch(e){} };
  }

  window.GAO = { open:openMenu, close:closeMenu, icons:icons, renderFlow:renderFlow, flowHTML:flowHTML, getTrip:getTrip, setTrip:setTrip, clearTrip:clearTrip, save:save, load:load, remove:remove, shrink:shrink, startCamera:startCamera, truck:TRUCK_SVG };

  if(document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
})();
