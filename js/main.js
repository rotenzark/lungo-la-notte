/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'lungo-la-notte', // usato per localStorage lang
    whatsapp: {
      number: '', // nessun WhatsApp dichiarato: si prenota al telefono
      message: '',
      ids: [],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [['12:00', '15:00']],
      1: [['12:00', '15:00'], ['17:30', '23:30']],
      2: [['12:00', '15:00'], ['17:30', '23:30']],
      3: [['12:00', '15:00'], ['17:30', '23:30']],
      4: [['12:00', '15:00'], ['17:30', '23:30']],
      5: [['12:00', '15:00'], ['17:30', '23:30']],
      6: [['12:00', '15:00'], ['17:30', '23:30']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1400,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "m.top": "Lungo la Notte, back to the top",
      "m.nav": "The lands of the map",
      "m.lingua": "Language",
      "m.menu": "Open the navigation",
      "m.lightbox": "Enlarged photo",
      "m.chiudi": "Close",
      "i.cosa": "the map of the four lands",
      "i.skip": "Skip",
      "n.piemonte": "Piedmont",
      "n.liguria": "Liguria",
      "n.milano": "Milan",
      "n.carta": "The menu",
      "n.voci": "Reviews",
      "n.orari": "Hours",
      "n.tel": "Book",
      "h.k": "Meat restaurant · Via Lodovico il Moro 131 · on the Naviglio Grande",
      "h.t": "A little Liguria<br>and a good deal of Milan.",
      "h.s": "Our meat comes from Piedmont, from the meadows of Fossano. Then we add something from the Oltrepò, a little Liguria and a good deal of Milan, starting with the address: on the bank of the Naviglio Grande.",
      "h.tel": "Book on 02 813 9177",
      "h.carta": "The menu",
      "h.cena": "dinner until 11:30 pm, Sundays lunch only",
      "h.voto": "4.6 from 411 Google reviews",
      "c.inter": "The map by day or by night",
      "c.giorno": "Day",
      "c.notte": "Night",
      "c.lp": "Piedmont · the meat and the wines",
      "c.lo": "Oltrepò · something",
      "c.ll": "Liguria · a little",
      "c.lm": "Milan · a good deal",
      "c.ln": "Naviglio Grande · all the way to no. 131",
      "c.t": "The map of Lungo la Notte",
      "c.d": "Piedmont, the Oltrepò, Liguria and Milan, with the Naviglio Grande running to number 131 of Via Lodovico il Moro. At night the lights come on: a small one over the Oltrepò, slightly bigger ones along the Ligurian coast, the biggest over Milan.",
      "c.mare": "Ligurian Sea",
      "c.piemonte": "PIEDMONT",
      "c.oltrepo": "OLTREPÒ",
      "c.liguria": "LIGURIA",
      "c.milano": "MILAN",
      "c.porta": "until 11:30 pm",
      "p.nastro": "Piedmont",
      "p.t": "Vines and pastures.",
      "p.s": "Piedmont, green and rich, is the ideal place for the good things that start from the land: the vines that give sublime wines, the pastures for the cattle that give the finest meat.",
      "p.s2": "The cows of the Subalpina D.O.C. are selected by Latitudine 38 and raised with traditional methods on the meadows of Fossano, in the province of Cuneo. A short supply chain, quality, traceability and a unique flavour.",
      "p.griglia": "From the grill",
      "p.griglia.l": "<li>Fiorentina</li><li>Costata</li><li>Tagliata with porcini mushrooms, truffle cream, Chianti, balsamic vinegar and strawberries, gorgonzola, green pepper, with potatoes, with rocket and grana</li><li>Lamb cutlets scottadito</li><li>Mixed grill with scamorza, for two</li>",
      "p.cialda": "Every tagliata with a sauce arrives in a crisp of grana cheese. The meat comes to the table on the hot plate, which keeps it warm.",
      "p.cruda": "Raw",
      "p.cruda.l": "<li>Chef's tartare</li><li>Battuta di manzo with oil and lemon</li><li>Carpaccio with rocket</li><li>Luganega sausage with scamorza</li>",
      "p.alt1": "A raw fiorentina steak, standing tall on a white oval plate",
      "p.cap1": "The fiorentina, before the grill",
      "p.alt2": "The sliced fiorentina on the black hot plate, with the bread basket beside it",
      "p.cap2": "At the table, on the hot plate",
      "p.alt3": "A tagliata in red wine sauce inside the grana crisp",
      "p.cap3": "A tagliata in the grana crisp",
      "p.alt4": "The chef's tartare on a black plate, with toasted bread and lemon",
      "p.cap4": "The chef's tartare",
      "o.t": "Something from the Oltrepò.",
      "o.s": "What, we'll tell you at the table.",
      "l.nastro": "Liguria",
      "l.t": "A little.",
      "l.s": "A little Liguria means pesto, first of all: trenette al pesto avvantaggiato, that is with green beans and potatoes, as they do in Genoa.",
      "l.lista": "<li>Trenette al pesto avvantaggiato, with green beans and potatoes</li><li>Genoese vegetable minestrone</li><li>And to finish, canestrelli alla genovese with zibibbo</li>",
      "l.alt": "Trenette with pesto, green beans and potato, on a black and white diamond-patterned plate",
      "l.cap": "Trenette al pesto avvantaggiato: you can see the green beans",
      "mi.nastro": "Milan",
      "mi.t": "A good deal.",
      "mi.s": "A good deal of Milan, starting with the address: Via Lodovico il Moro 131, on the bank of the Naviglio Grande, where the canal heads towards Corsico. Inside, a few tables under the vaults and the bare bricks; on the wall, an old sign: FORNO.",
      "mi.padella": "From the pan, the dishes of the old days: crispy brains, rognoncini trifolati, straccetti profumati.",
      "mi.alt1": "The dining room under the arch: the brick wall with the FORNO sign, the beams, the white chairs",
      "mi.cap1": "The dining room, with the FORNO sign on the brick wall",
      "mi.alt2": "Rognoncini trifolati in their sauce, on a flowered plate",
      "mi.cap2": "Rognoncini trifolati",
      "mi.hassan": "All of this is prepared by Hassan, a <em>«Milanès Ariùs»</em>, as he calls himself. He wasn't born anywhere near Milan, but his heart has been beating here for a long time, and with his family he has learned to love this city and its people.",
      "mi.cit": "«Lungo la Notte is, for me, feeling at home in Milan.»",
      "mi.citchi": "Salvatore Alberto Zammataro, Google review (translated from Italian)",
      "mi.alt3": "The front at night: the Lungo la Notte sign lit above the lit door, two olive trees in pots",
      "mi.cap3": "Number 131, at night",
      "g.t": "The menu, all of it.",
      "g.s": "The six sections of our menu. You'll find the prices at the table.",
      "g.cruda": "Raw",
      "g.cruda.l": "<li>Chef's tartare</li><li>Battuta di manzo with oil and lemon</li><li>Carpaccio with rocket</li><li>Luganega sausage with scamorza</li>",
      "g.primi": "First courses",
      "g.primi.l": "<li>Trenette al pesto avvantaggiato, with green beans and potatoes</li><li>Risotto with truffle cream</li><li>Pappardelle with porcini mushrooms</li><li>Pennette all'aurora</li><li>Penne with beef ragù</li><li>Genoese vegetable minestrone</li>",
      "g.griglia": "Grill",
      "g.griglia.l": "<li>Fiorentina</li><li>Costata</li><li>Tagliata with porcini mushrooms</li><li>Tagliata with truffle cream</li><li>Tagliata with Chianti</li><li>Tagliata with balsamic vinegar and strawberries</li><li>Tagliata with gorgonzola</li><li>Tagliata with potatoes</li><li>Tagliata with green pepper</li><li>Tagliata with rocket and grana</li><li>Lamb cutlets scottadito</li><li>Mixed grill with scamorza, for two</li>",
      "g.griglia.n": "All our tagliate with a sauce are served with a crisp of grana cheese.",
      "g.contorni": "Sides",
      "g.contorni.l": "<li>Lungo la Notte fries, cut in rounds</li><li>Cannellini beans al fiasco</li><li>Grilled radicchio</li><li>Mixed salad</li><li>Tomato salad with garlic and oregano</li>",
      "g.padella": "Pan",
      "g.padella.l": "<li>Straccetti profumati (fragrant beef strips)</li><li>Rognoncini trifolati (kidneys)</li><li>Crispy brains</li>",
      "g.dolci": "The chef's desserts and fruit",
      "g.dolci.l": "<li>Latte fritto (fried milk)</li><li>Chocolate cake</li><li>Canestrelli alla genovese and zibibbo</li><li>Tarte tatin</li><li>Sfogliatina Cleopatra</li><li>Plain pineapple</li>",
      "g.piede": "Some dishes may change: ask at the table.",
      "r.t": "Travel notes.",
      "r.s": "4.6 from 411 reviews on Google. Five of them, translated from Italian.",
      "rc.1": "A special blend of Lombard and Ligurian cooking. Both the minestrone and the pesto are excellent, the fried brains are among the best around; the tartare alone is worth the trip. A good choice of wines.",
      "rc.f1": "Anna Iannelli · Google · 5 months ago · 5 stars",
      "rc.2": "A small but very welcoming place, quiet enough and with a warm atmosphere. The food is excellent (meat specialities, excellent tagliate on a cheese crisp) and it is worth going just to meet the owner, Hassan, who wins you over with his stories and his genuineness.",
      "rc.f2": "Marco D · Google · 6 years ago · 5 stars",
      "rc.3": "We ate dishes from another time, like fried brains and trifolato kidney, finding flavours we had never forgotten. We were welcomed with kindness and familiarity, we will be back as soon as possible.",
      "rc.f3": "Marinella Filosa · Google · 6 years ago · 5 stars",
      "rc.4": "A menu with few dishes, but the right ones, much appreciated, with Ligurian dishes like a delicious pasta with pesto. Good service, super welcome from a super host. A very welcoming room. Average prices",
      "rc.f4": "Flo_Pla · Google · a year ago · 5 stars",
      "rc.5": "Excellent, top meat and an attentive, cordial restaurateur, I'll be back even though it's 190 km from home",
      "rc.f5": "Domenico Longo · Google · 2 years ago · 5 stars",
      "rc.piede": "Public reviews on Google, translated from Italian.",
      "ga.t": "From the dining room and the kitchen.",
      "ga.alt1": "The blue awning reading Lungo la Notte Ristorante above the glass door",
      "ga.cap1": "The blue awning, by day",
      "ga.alt2": "The dining room with white chairs and the brick wall lit from below",
      "ga.cap2": "The white chairs under the arch",
      "ga.alt4": "Fries cut in rounds in a white bowl",
      "ga.cap4": "The Lungo la Notte fries, cut in rounds",
      "ga.alt5": "Four cubes of fried milk with sugar",
      "ga.cap5": "Latte fritto",
      "ga.alt6": "A slice of tarte tatin with ice cream",
      "ga.cap6": "The tarte tatin",
      "d.t": "Hours and location.",
      "d.zona": "(on the Naviglio Grande)",
      "d.cap": "Opening hours",
      "gg.lun": "Monday",
      "gg.mar": "Tuesday",
      "gg.mer": "Wednesday",
      "gg.gio": "Thursday",
      "gg.ven": "Friday",
      "gg.sab": "Saturday",
      "gg.dom": "Sunday",
      "d.serachiuso": "closed in the evening",
      "d.tel": "To book",
      "d.nota": "Booking is recommended in the evening. Wheelchair-accessible entrance, tables and toilet. Cards accepted. High chairs for children. Free street parking.",
      "d.mappa": "Map: Lungo la Notte, Via Lodovico il Moro 131, Milan",
      "d.btn": "Directions",
      "q.t": "Questions.",
      "q.1": "Do I need to book?",
      "q.1r": "In the evening it's a good idea: call us on +39 02 813 9177.",
      "q.2": "Are you open on Sundays?",
      "q.2r": "Yes, for lunch, from 12 to 3 pm. On Sunday evenings we are closed.",
      "q.3": "Do you deliver?",
      "q.3r": "No: at our place you eat at the table.",
      "q.4": "Is there anything besides meat?",
      "q.4r": "Yes: the first courses, like trenette with pesto and Genoese minestrone, the sides and the desserts. Feel free to ask us how they are made.",
      "q.5": "Can we come with children?",
      "q.5r": "Yes, we have high chairs.",
      "q.6": "Can I pay by card?",
      "q.6r": "Yes, credit and debit cards, contactless too.",
      "q.7": "Where can I park?",
      "q.7r": "On the street: parking is free.",
      "z.chiusa": "But enough sentimentality! Bon appétit.",
      "z.cred": "Demo website made by <a href=\"https://bespokestud.io\" rel=\"noopener\">Bespoke Studio</a> · texts from their website and the Google listing (September 2026); public reviews on Google; photographs from their website and the Google listing; the map is drawn on ISTAT and Natural Earth boundaries, in the manner of Umberto Zimelli's «Italie Gastronomique» (1931).",
      "x.nav": "Quick actions",
      "x.chiama": "Call",
      "x.carta": "Menu",
      "x.mappa": "Map",
      "x.orari": "Hours"
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  // ── FIRMA «scende la notte sulla carta» (#212 Lungo la Notte) ──
  // Stato finale in HTML e CSS (vale senza JS e con reduced-motion): la carta di notte, le luci accese, il Naviglio acceso,
  // la porta del 131 illuminata. Con GSAP e senza reduced-motion il JS, sotto l'intro, rimette il giorno (classe is-giorno:
  // i colori di Zimelli, il sole, luci spente); a fine intro (o quando la carta entra in vista) il sole scende, il giorno
  // svanisce e si accendono le luci nelle misure delle loro parole: Fossano, l'Oltrepò piccola («qualcosa»), la Liguria
  // («un po'»), Milano grande («un bel po'»); poi la luce corre lungo il Naviglio Grande e al 131 si accende la porta.
  // Il visitatore ha l'interruttore Giorno/Notte. Senza animazione l'interruttore cambia la classe e basta.
  var carta = document.getElementById('carta');
  var anima = hasGsap && !reducedMotion;
  var introFinita = false;
  var parti = function () {};
  var inVista = function () { return false; };
  if (carta) {
    var giornoL = document.getElementById('cartaGiorno');
    var luci = ['fossano', 'oltrepo', 'liguria', 'milano'].map(function (k) { return carta.querySelector('[data-luce="' + k + '"]'); });
    var navG = document.getElementById('naviglioLuce');
    var navLuce = [].slice.call(carta.querySelectorAll('.naviglio-luce path'));
    var lung = function (p) { return Math.ceil(p.getTotalLength()) + 2; };
    var porta = document.getElementById('cartaPorta');
    var sole = document.getElementById('cartaSole'), luna = document.getElementById('cartaLuna'), stelle = carta.querySelector('.stelle');
    var btnG = document.getElementById('bottoneGiorno'), btnN = document.getElementById('bottoneNotte');
    var statoEl = document.getElementById('cartaStato');
    var tl = null, scendendo = false;
    var tutti = [giornoL, porta, sole, luna, stelle, navG].concat(luci, navLuce);
    var inglese = function () { return (document.documentElement.lang || 'it').indexOf('en') === 0; };
    var scrivi = function () {
      var g = carta.classList.contains('is-giorno'), en = inglese();
      var t = scendendo ? (en ? 'Night is falling…' : 'Scende la notte…')
        : g ? (en ? "Day: the map in Zimelli's colours, the lights off." : 'Di giorno: la carta nei colori di Zimelli, le luci spente.')
          : (en ? 'Night: the lights are on, all the way to number 131.' : 'Di notte: le luci accese, fino al 131.');
      if (statoEl) statoEl.textContent = t;
      if (btnG) btnG.setAttribute('aria-pressed', g && !scendendo ? 'true' : 'false');
      if (btnN) btnN.setAttribute('aria-pressed', g && !scendendo ? 'false' : 'true');
    };
    var pulisci = function () { if (hasGsap) gsap.set(tutti, { clearProps: 'all' }); };
    var mettiGiorno = function () { if (tl) tl.kill(); tl = null; scendendo = false; pulisci(); carta.classList.add('is-giorno'); scrivi(); };
    var mettiNotte = function () { if (tl) tl.kill(); tl = null; scendendo = false; pulisci(); carta.classList.remove('is-giorno'); scrivi(); };
    var notte = function () {
      if (!anima) { mettiNotte(); return; }
      if (tl) tl.kill();
      // si parte dal giorno scritto a mano (stili in linea), poi si toglie la classe: la notte del CSS è la meta
      gsap.set(giornoL, { opacity: 1 });
      gsap.set(luci, { opacity: 0, scale: 0.2, transformOrigin: '50% 50%' });
      gsap.set(navG, { opacity: 1 });
      navLuce.forEach(function (p) { var L = lung(p); gsap.set(p, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }); });
      gsap.set([porta, luna, stelle], { opacity: 0 });
      gsap.set(sole, { opacity: 1, x: 0, y: 0 });
      carta.classList.remove('is-giorno');
      scendendo = true; scrivi();
      tl = gsap.timeline({ onComplete: function () { tl = null; scendendo = false; pulisci(); scrivi(); } })
        .to(sole, { x: -70, y: 230, duration: 1.3, ease: 'power1.in' }, 0)
        .to(sole, { opacity: 0, duration: 0.5 }, 0.8)
        .to(giornoL, { opacity: 0, duration: 1.5, ease: 'power1.inOut' }, 0.4)
        .to(luna, { opacity: 1, duration: 0.8 }, 1.2)
        .to(stelle, { opacity: 1, duration: 0.8 }, 1.3)
        .to(luci[0], { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, 1.5)
        .to(luci[1], { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, 1.9)
        .to(luci[2], { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.4)' }, 2.2)
        .to(luci[3], { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.3)' }, 2.6)
        .to(navLuce, { strokeDashoffset: 0, duration: 1.4, ease: 'power1.inOut' }, 2.9)
        .to(porta, { opacity: 1, duration: 0.6 }, 4.1);
    };
    var giorno = function () {
      if (!anima) { mettiGiorno(); return; }
      if (tl) tl.kill();
      pulisci();
      carta.classList.remove('is-giorno');
      scendendo = false;
      navLuce.forEach(function (p) { var L = lung(p); gsap.set(p, { strokeDasharray: L + ' ' + L, strokeDashoffset: 0 }); });
      tl = gsap.timeline({ onComplete: function () { tl = null; carta.classList.add('is-giorno'); pulisci(); scrivi(); } })
        .to(porta, { opacity: 0, duration: 0.3 }, 0)
        .to(navLuce, { strokeDashoffset: function (i, p) { return lung(p); }, duration: 0.6, ease: 'power1.in' }, 0)
        .to(luci, { opacity: 0, scale: 0.2, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.08 }, 0.1)
        .to([luna, stelle], { opacity: 0, duration: 0.5 }, 0.2)
        .fromTo(giornoL, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power1.inOut' }, 0.3)
        .fromTo(sole, { opacity: 0, x: -70, y: 230 }, { opacity: 1, x: 0, y: 0, duration: 1.2, ease: 'power2.out' }, 0.5);
    };
    if (btnG) btnG.addEventListener('click', function () { if (btnG.getAttribute('aria-pressed') !== 'true') giorno(); });
    if (btnN) btnN.addEventListener('click', function () { if (btnN.getAttribute('aria-pressed') !== 'true') notte(); });
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(scrivi, 0); }); });
    if (anima) {
      mettiGiorno(); // sotto l'intro: la carta di giorno
      var partita = false;
      parti = function () { if (partita) return; partita = true; gsap.delayedCall(0.3, notte); };
      inVista = function () { var rr = carta.getBoundingClientRect(); return rr.top < window.innerHeight * 0.85 && rr.bottom > 0; };
      if (hasST) ScrollTrigger.create({ trigger: carta, start: 'top 85%', once: true, onEnter: function () { if (introFinita) parti(); } });
    } else {
      scrivi();
    }
  }
  window.bespokeHeroEntrance = function () {
    introFinita = true;
    if (carta && anima && inVista()) parti();
  };

  // lo stato degli orari anche in «Orari e dove»
  var st1 = document.getElementById('orarioStato'), st2 = document.getElementById('orarioStato2');
  if (st1 && st2) {
    var copiaStato = function () { st2.textContent = st1.textContent; };
    copiaStato();
    new MutationObserver(copiaStato).observe(st1, { childList: true, characterData: true, subtree: true });
  }
})();
