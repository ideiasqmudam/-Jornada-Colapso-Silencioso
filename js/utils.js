
export function sanitize(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
}

export function saveData(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch(e) {}
}

export function loadData(key) {
  try {
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch(e) {
    return null;
  }
}

export function formatPhone(val) {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2)  return digits;
  if (digits.length <= 7)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  return val;
}

// Preview do funil vintage: quando a página atual é uma *old.html, os links
// internos do funil apontam para as variantes *old. Nas páginas canônicas
// (vivas ou promovidas) o guard é falso e nada muda.
const IS_OLD_PREVIEW = /old\.html$/i.test(window.location.pathname);

function toPreviewPage(page) {
  if (!IS_OLD_PREVIEW) return page;
  return String(page).replace(/^(index|quiz|loading|diagnostico|metodo)\.html/i, '$1old.html');
}

if (IS_OLD_PREVIEW) {
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    const href = a.getAttribute('href');
    const mapped = toPreviewPage(href);
    if (mapped !== href) a.setAttribute('href', mapped);
  }, true);
}

export function navigateTo(page) {
  page = toPreviewPage(page);
  const overlay = document.getElementById('page-overlay');
  if (!overlay) {
    window.location.href = page;
    return;
  }

  overlay.style.cssText = 'display:block;opacity:0;transition:opacity 0.22s ease-in;';
  void overlay.offsetWidth;
  overlay.style.opacity = '1';

  setTimeout(() => { window.location.href = page; }, 230);
}

export function initPageTransition() {
  const overlay = document.getElementById('page-overlay');
  if (!overlay) return;

  overlay.style.cssText = 'display:block;opacity:1;transition:opacity 0.45s cubic-bezier(0.22,1,0.36,1);';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 500);
  }));
}

export function getFormattedDate() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function getSessionId() {
  let sid = loadData('jcs_sid');
  if (!sid) {
    sid = (crypto?.randomUUID?.() ||
      'sid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
    saveData('jcs_sid', sid);
  }
  return sid;
}

export function captureUTMs() {
  const saved = loadData('jcs_utm');
  if (saved) return saved;
  const url = new URLSearchParams(window.location.search);
  const utms = {
    source:   url.get('utm_source')   || '',
    medium:   url.get('utm_medium')   || '',
    campaign: url.get('utm_campaign') || '',
    content:  url.get('utm_content')  || '',
    term:     url.get('utm_term')     || '',
    fbclid:   url.get('fbclid')       || ''
  };
  saveData('jcs_utm', utms);

  if (!loadData('jcs_landing')) {
    saveData('jcs_landing', {
      landing_path: location.pathname,
      referrer:     document.referrer || '',
      ts:           Date.now()
    });
  }
  return utms;
}

export function getContexto() {
  const landing = loadData('jcs_landing') || {};
  const ua = navigator.userAgent || '';
  return {
    device:       /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile' : 'desktop',
    viewport:     `${window.innerWidth}x${window.innerHeight}`,
    screen:       `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    lang:         navigator.language || '',
    referrer:     landing.referrer || document.referrer || '',
    landing_path: landing.landing_path || ''
  };
}
