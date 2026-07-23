import { captureUTMs, loadData, getSessionId } from './utils.js';
import { logEvent, flushEventsBeacon } from './supabase-client.js';

const VALOR_BASE = 29.90;


const FB_PIXEL_ID = '4357308414488269';
const CAPI_URL    = 'https://amqfcznqyyrgzlhzqohu.supabase.co/functions/v1/capi-proxy';


export function trackEvent(event, payload) {
  try {
    logEvent(event, payload || null, getSessionId(), null);
  } catch (_) {}
}

const _buffer = [];
const _BUFFER_MAX = 50;

export function trackEventBuffered(event, payload) {
  try {
    _buffer.push({ event, payload: payload || null, session_id: getSessionId(), lead_id: null });
    if (_buffer.length >= _BUFFER_MAX) flushEvents();
  } catch (_) {}
}

export function flushEvents() {
  try {
    if (_buffer.length === 0) return;
    const copy = _buffer.slice();
    _buffer.length = 0;
    flushEventsBeacon(copy);
  } catch (_) {}
}

try {
  window.addEventListener('pagehide', flushEvents);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushEvents();
  });
} catch (_) {}


function pushDL(event, data) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...(data || {}) });
  } catch (_) {}
}


function track(event, params, eventId) {
  if (typeof fbq !== 'undefined') {
    try {
      fbq('track', event, params || {}, eventId ? { eventID: eventId } : undefined);
    } catch (_) {}
  }
}

function trackCustom(event, params, eventId) {
  if (typeof fbq !== 'undefined') {
    try {
      fbq('trackCustom', event, params || {}, eventId ? { eventID: eventId } : undefined);
    } catch (_) {}
  }
}

function getCookie(name) {
  try {
    const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : null;
  } catch (_) { return null; }
}


function sendCapiEvent(eventName, eventId, customData) {
  try {
    const lead = JSON.parse(sessionStorage.getItem('jcs_lead') || '{}');
    const utm  = JSON.parse(sessionStorage.getItem('jcs_utm')  || '{}');

    let fbc = getCookie('_fbc');
    if (!fbc && utm.fbclid) fbc = 'fb.1.' + Date.now() + '.' + utm.fbclid;

    fetch(CAPI_URL, {
      method:    'POST',
      keepalive: true,
      headers:   { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name:       eventName,
        event_id:         eventId,
        event_source_url: location.href,
        user_data: {
          email:       lead.email   || null,
          phone:       lead.celular || null,
          external_id: getSessionId(),
          fbc:         fbc || null,
          fbp:         getCookie('_fbp') || null,
        },
        custom_data: customData || null,
      })
    }).catch(() => {});
  } catch (_) {}
}


function makeEid(eventName) {
  return eventName + '_' + getSessionId() + '_' + Date.now();
}


let pixelLoaded = false;

function loadPixel() {
  if (pixelLoaded) return;
  pixelLoaded = true;
  if (!FB_PIXEL_ID) return;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('set', 'autoConfig', false, FB_PIXEL_ID);
  fbq('init', FB_PIXEL_ID);
}


setTimeout(loadPixel, 0);


['scroll', 'click', 'touchstart', 'keydown'].forEach(ev => {
  window.addEventListener(ev, loadPixel, { once: true, passive: true });
});




export function trackPageView(pageName) {
  const page = pageName || 'landing';
  const utms = captureUTMs();
  trackEvent('page_view', { page, source: utms.source || 'direto' });
  pushDL('page_view', { page, source: utms.source || 'direto' });


  if (page !== 'landing') return;

  setTimeout(() => {
    loadPixel();

    const eidPV = makeEid('PageView');
    track('PageView', {}, eidPV);
    sendCapiEvent('PageView', eidPV, {});

    const eidVC = makeEid('ViewContent');
    const cdVC  = { content_name: 'landing', value: VALOR_BASE, currency: 'BRL' };
    track('ViewContent', cdVC, eidVC);
    sendCapiEvent('ViewContent', eidVC, cdVC);
  }, 1000);
}


export function trackQuizStart() {
  const eid = makeEid('QuizStart');
  trackEvent('quiz_start');
  pushDL('quiz_start');
  trackCustom('QuizStart', {}, eid);
  sendCapiEvent('QuizStart', eid, {});
}


export function trackQuestionView(idx) {
  trackEventBuffered('question_view', { idx });
}

export function trackQuestionAnswer(idx, opcao, dwellMs) {
  trackEventBuffered('question_answer', { idx, opcao, dwell_ms: dwellMs });
}

export function trackAnswerChange(idx, de, para) {
  trackEventBuffered('answer_change', { idx, de, para });
}

export function trackQuizProgress(_q) {  }

export function trackQuizAbandon(idx, dwellMs) {
  trackEvent('quiz_abandon', { idx, dwell_ms: dwellMs });
}


export function trackQuizComplete(perfil) {
  const eid = makeEid('QuizComplete');
  trackEvent('quiz_complete', {
    fingerprint_key:   perfil.fingerprint_key,
    fingerprint_group: perfil.fingerprint_group,
    fallback:          perfil.fingerprint_fallback,
    total:             perfil.total,
    pctM: perfil.pctM, pctF: perfil.pctF, pctC: perfil.pctC, pctI: perfil.pctI
  });
  pushDL('quiz_complete', { perfil: perfil.id, score_total: perfil.total });
  trackCustom('QuizComplete', { score_total: perfil.total }, eid);
  sendCapiEvent('QuizComplete', eid, { score_total: perfil.total });
}


export function trackLead() {
  const eid = makeEid('Lead');
  const cd  = { content_name: 'Diagnostico', value: VALOR_BASE, currency: 'BRL' };
  trackEvent('gate_submit');
  pushDL('lead');
  track('Lead', cd, eid);
  sendCapiEvent('Lead', eid, cd);
}


export function trackGateView() {
  trackEvent('gate_view');
}

export function trackGateField(campo, acao) {
  trackEvent('gate_field', { campo, acao });
}

export function trackPlanoCardView(dim) {
  trackEvent('plano_card_view', { dim });
}

export function trackTimeOnPage(page, ms) {
  trackEventBuffered('time_on_page', { page, ms });
  flushEvents();
}

export function trackDiagScroll(depth) {
  trackEvent('diag_scroll_' + depth);
}


export function trackCtaClick(origem) {
  trackEvent('cta_click', { origem: origem || null });
  pushDL('cta_click', { origem: origem || null });
}


export function trackLandPageView(dispararMeta) {
  trackEvent('land_page_view');
  pushDL('land_page_view');
  if (dispararMeta) {
    loadPixel();
    const eid = makeEid('page_view_land');
    trackCustom('page_view_land', {}, eid);
    sendCapiEvent('page_view_land', eid, {});
  }
}


export function trackViewContentLand() {
  const eid = makeEid('ViewContentLand');
  const cd  = { content_name: 'vendas', value: VALOR_BASE, currency: 'BRL' };
  trackEvent('view_content_land');
  pushDL('ViewContentLand', cd);
  loadPixel();
  trackCustom('ViewContentLand', cd, eid);
  sendCapiEvent('ViewContentLand', eid, cd);
}


export function trackViewContent() {
  trackEvent('diag_view_content');
  pushDL('diag_view_content');
  setTimeout(() => {
    const eid = makeEid('ViewContentDiag');
    const cd  = { content_name: 'diagnostico', value: VALOR_BASE, currency: 'BRL' };
    trackCustom('ViewContentDiag', cd, eid);
    sendCapiEvent('ViewContentDiag', eid, cd);
  }, 800);
}


export function trackInitiateCheckout(plano, valor) {
  const eid = makeEid('InitiateCheckout');
  const cd  = { content_name: plano || 'plano', value: valor ?? VALOR_BASE, currency: 'BRL' };
  trackEvent('checkout_click', { plano: plano || null, valor: valor ?? VALOR_BASE });
  pushDL('initiate_checkout', { plano: plano || null, valor: valor ?? VALOR_BASE, currency: 'BRL' });
  track('InitiateCheckout', cd, eid);
  sendCapiEvent('InitiateCheckout', eid, cd);
}
