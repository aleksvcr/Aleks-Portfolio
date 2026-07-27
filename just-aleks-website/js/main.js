(function(){
  const root    = document.documentElement;
  const langs   = Array.from(document.querySelectorAll('[data-setlang]'));
  const gms     = Array.from(document.querySelectorAll('.gm'));
  const navs    = Array.from(document.querySelectorAll('.nv'));
  const secs    = Array.from(document.querySelectorAll('.sec'));
  const blurb   = document.getElementById('blurb');
  const burger  = document.getElementById('burger');
  const navmenu = document.getElementById('navmenu');

  const TZ = 'America/Cancun';   // the clock is locked to here, not the visitor

  /* ==========================================================
     RANSOM-NOTE TYPESETTER
     ========================================================== */
  const FACES = ['rf-a','rf-b','rf-c','rf-d','rf-e'];

  function seeded(str){
    let h = 2166136261;
    for (let i = 0; i < str.length; i++){
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function(){
      h += 0x6D2B79F5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function ransom(el){
    if (el.dataset.rn === 'done') return;
    el.dataset.rn = 'done';
    const allowChips = el.dataset.chips === '1';
    const rand = seeded(el.textContent.trim() + el.className);

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      if (!node.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      let atWordStart = true;

      for (const ch of node.nodeValue){
        if (!/\S/.test(ch)){
          frag.appendChild(document.createTextNode(ch));
          atWordStart = true;
          continue;
        }
        const s = document.createElement('span');
        s.className = 'rl ' + FACES[Math.floor(rand() * FACES.length)];
        const roll = rand();
        s.textContent = (atWordStart || roll > 0.38) ? ch.toUpperCase() : ch.toLowerCase();
        s.style.setProperty('--r', (rand() * 9 - 4.5).toFixed(2) + 'deg');
        s.style.setProperty('--y', (rand() * 5 - 2.5).toFixed(2) + 'px');
        s.style.setProperty('--s', (0.93 + rand() * 0.17).toFixed(3));
        if (allowChips && rand() < 0.14) s.classList.add('chip');
        frag.appendChild(s);
        atWordStart = false;
      }
      node.parentNode.replaceChild(frag, node);
    });
  }

  document.querySelectorAll('.rn').forEach(ransom);

  /* ==========================================================
     CANCÚN CLOCK — always Aleks's local time, wherever you are
     ========================================================== */
  const clkTime = document.getElementById('clkTime');
  const clkDate = document.getElementById('clkDate');
  const clkLoc  = document.getElementById('clkLoc');
  const dot     = document.getElementById('dot');

  // pull the wall-clock parts for a timezone, no libraries
  function partsIn(tz, date){
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year:'numeric', month:'2-digit', day:'2-digit',
      hour:'2-digit', minute:'2-digit', weekday:'short'
    });
    const out = {};
    for (const p of fmt.formatToParts(date)) out[p.type] = p.value;
    return {
      year:  Number(out.year),
      month: Number(out.month),
      day:   Number(out.day),
      hour:  Number(out.hour) % 24,
      minute:Number(out.minute),
      wd:    out.weekday
    };
  }

  const DAYS = {en:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], es:['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']};
  const MON  = {en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                es:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']};
  const WDMAP = {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};

  function paintClock(){
    const es = root.dataset.lang === 'es';
    const p  = partsIn(TZ, new Date());

    clkTime.textContent = String(p.hour).padStart(2,'0') + ':' + String(p.minute).padStart(2,'0');
    clkDate.textContent = DAYS[es?'es':'en'][WDMAP[p.wd]] + ' ' + p.day + ' ' + MON[es?'es':'en'][p.month - 1];
    clkLoc.textContent  = es ? 'HORA DE CANCÚN' : 'CANCÚN TIME';

    // working hours: Mon-Fri 9-18, Sat 10-14
    const wd = WDMAP[p.wd];
    const open =
      (wd >= 1 && wd <= 5 && p.hour >= 9 && p.hour < 18) ||
      (wd === 6 && p.hour >= 10 && p.hour < 14);
    dot.classList.toggle('off', !open);
    dot.title = open ? (es ? 'Disponible ahora' : 'Around right now')
                     : (es ? 'Fuera de horario' : 'Offline right now');
  }

  /* ==========================================================
     LEVEL SYSTEM — level = age, ticks up on the birthday
     ========================================================== */
  const card    = document.getElementById('card');
  const lvTab   = document.getElementById('lvTab');
  const nextVal = document.getElementById('nextVal');
  const xpBar   = document.getElementById('xpBar');
  const DAY = 86400000;

  function paintLevel(){
    const [by, bm, bd] = card.dataset.birth.split('-').map(Number);
    const es = root.dataset.lang === 'es';
    const p  = partsIn(TZ, new Date());              // today, Cancún time
    const now = new Date(p.year, p.month - 1, p.day);

    let level = p.year - by;
    const hadBirthday = (p.month > bm) || (p.month === bm && p.day >= bd);
    if (!hadBirthday) level--;

    const lastBd = new Date(p.year - (hadBirthday ? 0 : 1), bm - 1, bd);
    const nextBd = new Date(p.year + (hadBirthday ? 1 : 0), bm - 1, bd);

    const isBirthday = (p.month === bm && p.day === bd);
    const daysLeft   = Math.round((nextBd - now) / DAY);
    const span       = Math.round((nextBd - lastBd) / DAY);
    const progress   = Math.min(100, Math.max(0, ((span - daysLeft) / span) * 100));

    if (isBirthday){
      lvTab.innerHTML = '<span>LEVEL UP! ' + level + '</span>';
      lvTab.classList.add('levelup');
      nextVal.textContent = es ? '¡HOY!' : 'TODAY!';
    } else {
      lvTab.innerHTML = '<span>LV. ' + level + '</span>';
      lvTab.classList.remove('levelup');
      nextVal.textContent = daysLeft + (es ? (daysLeft === 1 ? ' DÍA' : ' DÍAS')
                                           : (daysLeft === 1 ? ' DAY'  : ' DAYS'));
    }
    requestAnimationFrame(() => { xpBar.style.width = progress.toFixed(1) + '%'; });
  }

  /* ---------- language ---------- */
  let sel = 0;

  function setLang(code, remember){
    root.dataset.lang = code;
    root.setAttribute('lang', code);
    langs.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setlang === code)));
    paintBlurb();
    paintClock();
    paintLevel();
    if (remember){ try{ localStorage.setItem('ja-lang', code); }catch(e){} }
  }
  langs.forEach(b => b.addEventListener('click', () => setLang(b.dataset.setlang, true)));

  /* ---------- hero cursor ---------- */
  function paintBlurb(){
    const it = gms[sel];
    blurb.textContent = root.dataset.lang === 'es' ? it.dataset.es : it.dataset.en;
  }
  function move(i){
    sel = (i + gms.length) % gms.length;
    gms.forEach((g,n) => g.classList.toggle('on', n === sel));
    paintBlurb();
  }
  gms.forEach((g,i) => {
    g.addEventListener('mouseenter', () => move(i));
    g.addEventListener('focus',      () => move(i));
  });

  /* ---------- mobile nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      navmenu.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
    });
  });
  burger.addEventListener('click', () => {
    const open = navmenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {rootMargin:'0px 0px -12% 0px', threshold:0.06});
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* ---------- active section ---------- */
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        const id = e.target.id;
        navs.forEach(n => n.setAttribute('aria-current', String(n.getAttribute('href') === '#' + id)));
        const gi = gms.findIndex(g => g.getAttribute('href') === '#' + id);
        if (gi > -1) move(gi);
      }
    });
  }, {rootMargin:'-45% 0px -50% 0px', threshold:0});
  secs.forEach(s => spy.observe(s));

  /* ---------- keys 1-5 ---------- */
  document.addEventListener('keydown', e => {
    const tag = (document.activeElement.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key >= '1' && e.key <= '5' && gms[Number(e.key) - 1]){
      e.preventDefault();
      gms[Number(e.key) - 1].click();
    }
  });

  /* ---------- boot ---------- */
  let saved = null;
  try{ saved = localStorage.getItem('ja-lang'); }catch(e){}
  if (saved === 'en' || saved === 'es') setLang(saved, false);
  else if ((navigator.language || '').toLowerCase().startsWith('es')) setLang('es', false);
  else setLang('en', false);

  setInterval(paintClock, 20000);
  setInterval(paintLevel, 60 * 60 * 1000);

  move(0);
})();
