
export function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

export function initWordReveal(selector, startDelay = 300) {
  const el = document.querySelector(selector);
  if (!el) return;

  const lines = el.querySelectorAll('.line');
  let wordIdx = 0;

  lines.forEach(line => {
    const text = line.textContent;
    line.textContent = '';
    line.classList.add('word-reveal');
    text.split(' ').forEach((word, i) => {
      if (i > 0) line.appendChild(document.createTextNode(' '));
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.style.animationDelay = `${startDelay + wordIdx * 80}ms`;
      line.appendChild(span);
      wordIdx++;
    });
  });
}

export function fadeInSequential(selectors, baseDelay = 600, step = 100) {
  selectors.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.animationDelay = `${baseDelay + i * step}ms`;
    el.classList.add('fade-in');
  });
}

export function animateBar(barEl, targetPct, delay = 0) {
  if (!barEl) return;
  setTimeout(() => {
    barEl.style.width = targetPct + '%';
  }, delay);
}

export function animateCounter(el, target, duration = 1600, delay = 0) {
  if (!el) return;
  setTimeout(() => {
    const start = Date.now();
    const update = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, delay);
}

export function initParallax(selector) {
  if (window.innerWidth <= 768) return;
  const el = document.querySelector(selector);
  if (!el) return;
  window.addEventListener('scroll', () => {
    el.style.transform = `translateY(${window.scrollY * 0.08}px)`;
  }, { passive: true });
}

export function initAccordion(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      container.querySelectorAll('.accordion-item.open').forEach(i => {
        i.classList.remove('open');
      });

      if (!isOpen) item.classList.add('open');
    });
  });
}

export function initStickyCTA(selector, scrollThreshold = 400) {
  const el = document.querySelector(selector);
  if (!el) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  }, { passive: true });
}
