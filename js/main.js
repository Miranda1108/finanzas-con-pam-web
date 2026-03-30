// ============ SCROLL ANIMATIONS ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .service-card').forEach(el => {
  revealObserver.observe(el);
});

// ============ PARALLAX SCROLL EFFECTS ============
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      // Navbar scroll
      const navbar = document.getElementById('navbar');
      if (navbar) {
        if (scrollY > 60) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      // Parallax on hero giant text
      const heroText = document.querySelector('.hero-giant-text');
      if (heroText) {
        const speed = scrollY * 0.15;
        heroText.style.transform = 'translateY(' + speed + 'px) scale(' + (1 - scrollY * 0.0003) + ')';
        heroText.style.opacity = Math.max(0, 1 - scrollY * 0.002);
      }

      // Footer giant text parallax
      const footerGiant = document.querySelector('.footer-giant-text');
      if (footerGiant) {
        const rect = footerGiant.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          const offset = (window.innerHeight - rect.top) * 0.1;
          footerGiant.style.transform = 'translateX(' + (-offset) + 'px)';
        }
      }

      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ============ MOBILE MENU ============
const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ============ STATS COUNTER ============
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(counter => {
        const target = parseInt(counter.dataset.target, 10);
        const prefix = counter.dataset.prefix || '';
        const suffix = counter.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();
        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = prefix + Math.floor(target * eased).toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const statsGrid = document.querySelector('.stats-grid');
if (statsGrid) statsObserver.observe(statsGrid);

// ============ FAQ ACCORDION ============
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// ============ QUIZ LOGIC ============
let quizScore = 0;
let currentStep = 1;
let stepScores = {}; // Track score per step for back functionality

function updateProgressBar() {
  const bar = document.getElementById('quizProgressBar');
  if (bar) {
    bar.style.width = ((currentStep / 12) * 100) + '%';
  }
}

function updateBackButton() {
  const backBtn = document.getElementById('quizBackBtn');
  if (backBtn) {
    backBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';
  }
}

function selectOption(btn) {
  const points = parseInt(btn.dataset.points, 10);
  const step = parseInt(btn.closest('.quiz-step').dataset.step, 10);

  // Store score for this step
  stepScores[step] = points;
  quizScore += points;

  btn.classList.add('selected');
  // Disable all options
  btn.parentElement.querySelectorAll('.quiz-option').forEach(o => {
    o.disabled = true;
    o.style.pointerEvents = 'none';
  });

  // Auto-advance
  setTimeout(() => {
    if (step < 12) {
      goToStep(step + 1);
    } else {
      showResult();
    }
  }, 500);
}

function goToStep(step) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  const target = document.querySelector('[data-step="' + step + '"]');
  if (target) {
    target.classList.add('active');
    currentStep = step;
    updateProgressBar();
    updateBackButton();
  }
}

function goBack() {
  if (currentStep <= 1) return;

  const prevStep = currentStep - 1;

  // Remove score for previous step
  if (stepScores[prevStep] !== undefined) {
    quizScore -= stepScores[prevStep];
    delete stepScores[prevStep];
  }

  // Re-enable options in the previous step
  const prevStepEl = document.querySelector('[data-step="' + prevStep + '"]');
  if (prevStepEl) {
    prevStepEl.querySelectorAll('.quiz-option').forEach(o => {
      o.disabled = false;
      o.style.pointerEvents = '';
      o.classList.remove('selected');
    });
  }

  goToStep(prevStep);
}

function showResult() {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  const resultEl = document.getElementById('quizResult');
  resultEl.classList.add('active');

  // Hide back button and show full progress
  const backBtn = document.getElementById('quizBackBtn');
  if (backBtn) backBtn.style.display = 'none';
  const bar = document.getElementById('quizProgressBar');
  if (bar) bar.style.width = '100%';

  let profile, tagline, desc, items, footer, ctaText;

  if (quizScore <= 18) {
    profile = 'Perfil Conservador';
    tagline = 'Tu prioridad es la tranquilidad.';
    desc = 'No te interesa "ganar mucho", te interesa dormir tranquila. Prefieres saber cu\u00e1nto puedes ganar y evitar sustos innecesarios. Y eso no est\u00e1 mal. Tu siguiente paso no es correr riesgos. Es construir base.';
    items = ['Fondo de emergencia s\u00f3lido', 'Inversiones de bajo riesgo', 'Estrategias claras y reguladas', 'Instrumentos de renta fija'];
    footer = 'No se trata de ir r\u00e1pido. Se trata de ir firme.';
    ctaText = 'Quiero mi Mini Gu\u00eda + Asesor\u00eda';
  } else if (quizScore <= 26) {
    profile = 'Perfil Moderado';
    tagline = 'Buscas equilibrio entre seguridad y crecimiento.';
    desc = 'Entiendes que el dinero puede subir y bajar, pero tampoco quieres vivir con el coraz\u00f3n acelerado. Te interesa crecer\u2026 con estrategia. Tu perfil permite combinar estabilidad con oportunidades.';
    items = ['Fondos diversificados', 'Estrategia de mediano plazo', 'Planeaci\u00f3n para metas claras', 'Posible estrategia para retiro (PPR)'];
    footer = 'Tu reto no es el riesgo. Es tener un plan estructurado.';
    ctaText = 'Quiero mi asesor\u00eda personalizada';
  } else {
    profile = 'Perfil Crecimiento';
    tagline = 'Tu prioridad es expansi\u00f3n.';
    desc = 'No te asusta la volatilidad. Sabes que para crecer hay que aceptar movimiento. Te interesa construir patrimonio fuerte a largo plazo. Pero ser agresivo no significa improvisar. Significa tener estrategia, diversificaci\u00f3n y claridad.';
    items = ['Renta variable', 'Acciones o fondos de crecimiento', 'Estrategias internacionales', 'Planeaci\u00f3n patrimonial'];
    footer = 'Tu siguiente nivel es sofisticar tu estrategia.';
    ctaText = 'Quiero una sesi\u00f3n estrat\u00e9gica';
  }

  resultEl.innerHTML = '<div class="quiz-result-icon">' + (quizScore <= 18 ? '\u{1F49A}' : quizScore <= 26 ? '\u{1F49B}' : '\u2764\uFE0F') + '</div>' +
    '<h3 class="quiz-result-profile">' + profile + '</h3>' +
    '<p class="quiz-result-tagline">' + tagline + '</p>' +
    '<p class="quiz-result-desc">' + desc + '</p>' +
    '<ul class="quiz-result-list">' + items.map(i => '<li>' + i + '</li>').join('') + '</ul>' +
    '<p class="quiz-result-footer">' + footer + '</p>' +
    '<a href="https://wa.me/5215610484232?text=Hola%20Pam%2C%20hice%20el%20quiz%20y%20mi%20perfil%20es%20' + encodeURIComponent(profile) + '.%20Me%20interesa%20una%20asesor%C3%ADa." class="btn btn-primary btn-lg quiz-result-cta" target="_blank" rel="noopener">' + ctaText + '</a>';
}

// Initialize progress bar on load
updateProgressBar();

// ============ CHATBOT ============
(function() {
  var toggle = document.getElementById('chatbotToggle');
  var win = document.getElementById('chatbotWindow');
  var closeBtn = document.getElementById('chatbotClose');
  var input = document.getElementById('chatbotInput');
  var sendBtn = document.getElementById('chatbotSend');
  var messages = document.getElementById('chatbotMessages');
  var suggestions = document.getElementById('chatbotSuggestions');

  if (!toggle || !win) return;

  toggle.addEventListener('click', function() {
    win.classList.toggle('active');
  });
  closeBtn.addEventListener('click', function() {
    win.classList.remove('active');
  });

  function addMessage(text, isUser) {
    var msg = document.createElement('div');
    msg.className = 'chatbot-msg chatbot-msg--' + (isUser ? 'user' : 'bot');
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    var typing = document.createElement('div');
    typing.className = 'chatbot-typing';
    typing.id = 'chatbotTyping';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    var typing = document.getElementById('chatbotTyping');
    if (typing) typing.remove();
  }

  var responses = {
    'ahorro': 'Para empezar a ahorrar te recomiendo la regla 50/30/20: 50% para necesidades, 30% para gustos y 20% para ahorro. Empieza poco a poco, aunque sean $100 a la semana. Lo importante es crear el habito.',
    'ahorrar': 'Para empezar a ahorrar te recomiendo la regla 50/30/20: 50% para necesidades, 30% para gustos y 20% para ahorro. Empieza poco a poco, aunque sean $100 a la semana. Lo importante es crear el habito.',
    'cetes': 'Los CETES (Certificados de la Tesoreria) son instrumentos de inversion del gobierno mexicano. Son de bajo riesgo y puedes empezar desde $100 MXN en cetesdirecto.com. Ideal para principiantes que buscan seguridad.',
    'invertir': 'Para empezar a invertir, primero necesitas un fondo de emergencia (3-6 meses de gastos). Despues puedes empezar con CETES o fondos de inversion diversificados. En una asesoria 1:1 podemos crear tu plan personalizado.',
    'inversion': 'Para empezar a invertir, primero necesitas un fondo de emergencia (3-6 meses de gastos). Despues puedes empezar con CETES o fondos de inversion diversificados. En una asesoria 1:1 podemos crear tu plan personalizado.',
    'emergencia': 'Un fondo de emergencia debe cubrir entre 3 y 6 meses de tus gastos fijos. Guardalo en una cuenta separada con liquidez inmediata (como una cuenta de ahorro o CETES a 28 dias). Es tu red de seguridad financiera.',
    'fondo': 'Un fondo de emergencia debe cubrir entre 3 y 6 meses de tus gastos fijos. Guardalo en una cuenta separada con liquidez inmediata (como una cuenta de ahorro o CETES a 28 dias). Es tu red de seguridad financiera.',
    'presupuesto': 'Para hacer un presupuesto efectivo: 1) Anota todos tus ingresos, 2) Lista tus gastos fijos, 3) Registra tus gastos variables por 1 mes, 4) Aplica la regla 50/30/20. Con Gestori puedes hacer esto de forma automatica por solo $99/mes.',
    'deuda': 'Para salir de deudas, usa el metodo bola de nieve: paga primero la deuda mas pequena mientras haces pagos minimos en las demas. Cada deuda que liquides te da impulso. Evita adquirir nuevas deudas mientras te liberas.',
    'deudas': 'Para salir de deudas, usa el metodo bola de nieve: paga primero la deuda mas pequena mientras haces pagos minimos en las demas. Cada deuda que liquides te da impulso. Evita adquirir nuevas deudas mientras te liberas.',
    'servicio': 'Ofrezco 3 servicios principales: 1) Asesoria 1:1 ($1,200 MXN - sesion de 60 min), 2) Money Club (workshop presencial en CDMX), 3) Gestori (app de control de gastos por $99/mes). Puedes ver mas en cada seccion del sitio.',
    'servicios': 'Ofrezco 3 servicios principales: 1) Asesoria 1:1 ($1,200 MXN - sesion de 60 min), 2) Money Club (workshop presencial en CDMX), 3) Gestori (app de control de gastos por $99/mes). Puedes ver mas en cada seccion del sitio.',
    'asesoria': 'La asesoria 1:1 es una sesion personalizada de 60 minutos por $1,200 MXN. Incluye diagnostico financiero, plan de inversion y 7 dias de seguimiento por WhatsApp. Puedes agendarla enviando mensaje por WhatsApp.',
    'gestori': 'Gestori es tu app de control de gastos por $99 MXN/mes. Registra gastos, categoriza automaticamente, y te da reportes mensuales con graficas claras. Puedes suscribirte por WhatsApp.',
    'money': 'Money Club es un workshop presencial de finanzas para mujeres. El proximo es el 12 de Abril en CDMX. Incluye workbook, comunidad exclusiva y certificado. Los lugares son limitados.',
    'club': 'Money Club es un workshop presencial de finanzas para mujeres. El proximo es el 12 de Abril en CDMX. Incluye workbook, comunidad exclusiva y certificado. Los lugares son limitados.',
    'tarjeta': 'Las tarjetas de credito no son malas si las usas bien. Reglas clave: paga siempre el total (no el minimo), no gastes mas del 30% de tu limite, y aprovecha meses sin intereses solo para compras planeadas.',
    'credito': 'Las tarjetas de credito no son malas si las usas bien. Reglas clave: paga siempre el total (no el minimo), no gastes mas del 30% de tu limite, y aprovecha meses sin intereses solo para compras planeadas.',
    'retiro': 'Para planear tu retiro, considera un PPR (Plan Personal de Retiro) que ademas te da beneficios fiscales. Tambien puedes complementar con inversiones a largo plazo. Entre mas joven empieces, mejor. El interes compuesto es tu mejor aliado.',
    'ppr': 'Un PPR (Plan Personal de Retiro) te permite ahorrar para tu retiro con beneficios fiscales. Puedes deducir hasta 10% de tus ingresos anuales. Hay opciones conservadoras y de crecimiento segun tu perfil.',
    'inflacion': 'La inflacion es el aumento general de precios. Si tu dinero esta guardado sin generar rendimientos, pierde valor cada dia. Por eso es importante invertir: al menos en instrumentos que superen la inflacion como CETES o fondos de renta fija.',
    'hola': 'Hola! Que gusto saludarte. Puedes preguntarme sobre ahorro, inversiones, presupuestos, deudas, o cualquiera de nuestros servicios. Estoy aqui para ayudarte.',
    'gracias': 'De nada! Si necesitas una asesoria mas personalizada, puedes agendar una sesion 1:1 con Pam por WhatsApp. Estamos para ayudarte en tu camino financiero.'
  };

  function getResponse(text) {
    var lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (var key in responses) {
      if (lower.indexOf(key) !== -1) {
        return responses[key];
      }
    }
    return 'Esa es una gran pregunta. Para darte la mejor respuesta personalizada, te recomiendo agendar una asesoria 1:1 con Pam. Tambien puedes preguntarme sobre: ahorro, inversiones, CETES, presupuestos, deudas, fondo de emergencia o nuestros servicios.';
  }

  function handleSend() {
    var text = input.value.trim();
    if (!text) return;
    addMessage(text, true);
    input.value = '';
    if (suggestions) suggestions.style.display = 'none';
    showTyping();
    setTimeout(function() {
      removeTyping();
      addMessage(getResponse(text), false);
    }, 800 + Math.random() * 600);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') handleSend();
  });

  // Make sendSuggestion available globally
  window.sendSuggestion = function(btn) {
    input.value = btn.textContent;
    handleSend();
  };
})();

// ============ PAGE BANNER SLIDER ============
(function() {
  var slides = document.querySelector('.page-banner-slides');
  var dots = document.querySelectorAll('.page-banner-dot');
  if (!slides || dots.length === 0) return;

  var current = 0;
  var total = dots.length;

  function goToSlide(index) {
    current = index;
    slides.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() { goToSlide(i); });
  });

  setInterval(function() {
    goToSlide((current + 1) % total);
  }, 4000);
})();
