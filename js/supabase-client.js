

const SUPABASE_URL  = 'https://amqfcznqyyrgzlhzqohu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcWZjem5xeXlyZ3psaHpxb2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTQwMTEsImV4cCI6MjA5NjMzMDAxMX0.Opyho0TsTH1lgoRIFv5UpNMvD9Yvuun8OOuSzO-6inQ';

let _clientPromise = null;

async function getSupabase() {
  if (!_clientPromise) {
    _clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
  }
  return _clientPromise;
}

export async function salvarLead(dados) {

  if (SUPABASE_URL.startsWith('COLE_AQUI')) {
    console.warn('[Supabase] Credenciais não configuradas — lead não salvo.');
    return { error: null };
  }

  const supabase = await getSupabase();

  const payload = {

    nome:              dados.nome       || null,
    email:             dados.email,
    celular:           dados.celular    || null,
    maior_dificuldade: dados.maior_dificuldade || null,
    sexo:              dados.sexo         || null,
    faixa_etaria:      dados.faixa_etaria || null,

    fingerprint_key:   dados.fingerprint_key,
    fingerprint_group: dados.fingerprint_group,

    score_memoria:     dados.pctM,
    score_foco:        dados.pctF,
    score_criatividade: dados.pctC,
    score_identidade:  dados.pctI,
    score_total:       dados.total,

    score_memoria_raw:      dados.rawM ?? null,
    score_foco_raw:         dados.rawF ?? null,
    score_criatividade_raw: dados.rawC ?? null,
    score_identidade_raw:   dados.rawI ?? null,

    fingerprint_fallback:   dados.fingerprint_fallback ?? null,

    nivel_consciencia:  dados.nivel_consciencia || null,
    prontidao_score:    dados.prontidao_score  ?? null,

    contexto:           dados.contexto         || null,

    session_id:         dados.session_id        || null,
    tempo_total_ms:     dados.tempo_total_ms    ?? null,
    tempo_por_pergunta: dados.tempo_por_pergunta || null,

    analise_comportamental: dados.analise_comportamental || null,
    insights_automaticos:   dados.insights_automaticos   || null,

    fbclid:             dados.fbclid             || null,
    versao_quiz:        1,

    nivel_memoria:     dados.nivelM,
    nivel_foco:        dados.nivelF,
    nivel_criatividade: dados.nivelC,
    nivel_identidade:  dados.nivelI,

    respostas: dados.respostas || null,

    utm_source:   dados.utm_source   || null,
    utm_medium:   dados.utm_medium   || null,
    utm_campaign: dados.utm_campaign || null,
    utm_content:  dados.utm_content  || null,
    utm_term:     dados.utm_term     || null,

    user_agent: navigator.userAgent || null,
  };

  try {

    let { error } = await supabase.from('leads').insert(payload);

    if (error && error.code === '23505') {
      const conflict = (error.details || error.message || '');
      const porCelular = payload.celular && conflict.includes('(celular)');
      ({ error } = porCelular
        ? await supabase.from('leads').update(payload).eq('celular', payload.celular)
        : await supabase.from('leads').update(payload).eq('email',   payload.email));
    }

    if (error) console.error('[Supabase] Erro ao salvar lead:', error.message);
    return { error };
  } catch (err) {
    console.error('[Supabase] Exceção ao salvar lead:', err);
    return { error: err };
  }
}

export function flushEventsBeacon(eventos) {
  if (SUPABASE_URL.startsWith('COLE_AQUI')) return;
  if (!Array.isArray(eventos) || eventos.length === 0) return;
  try {
    fetch(SUPABASE_URL + '/rest/v1/events', {
      method:    'POST',
      keepalive: true,
      headers: {
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(eventos)
    }).catch(() => {});
  } catch (_) {

  }
}

export async function logEvent(event, payload, sessionId, leadId) {
  if (SUPABASE_URL.startsWith('COLE_AQUI')) return;
  try {
    const supabase = await getSupabase();
    await supabase.from('events').insert({
      event,
      payload:    payload   || null,
      session_id: sessionId || null,
      lead_id:    leadId    || null,
    });
  } catch (_) {

  }
}

export async function atualizarConversao(email, planId) {
  if (SUPABASE_URL.startsWith('COLE_AQUI')) return;

  const supabase = await getSupabase();
  try {
    await supabase
      .from('leads')
      .update({
        converted: true,
        converted_at: new Date().toISOString(),
        plan_purchased: planId || null
      })
      .eq('email', email);
  } catch (err) {
    console.error('[Supabase] Erro ao atualizar conversão:', err);
  }
}

export async function keepAlive() {
  if (SUPABASE_URL.startsWith('COLE_AQUI')) return;

  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  const lastPing = localStorage.getItem('sb_ping');

  if (lastPing && Date.now() - parseInt(lastPing, 10) < THREE_DAYS_MS) return;

  try {
    const supabase = await getSupabase();
    await supabase.from('leads').select('id').limit(1);
    localStorage.setItem('sb_ping', Date.now().toString());
  } catch (_) {

  }
}
