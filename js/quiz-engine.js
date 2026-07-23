import { saveData, navigateTo, getSessionId } from './utils.js';
import {
  trackQuizComplete,
  trackQuestionView, trackQuestionAnswer, trackQuizAbandon,
  trackAnswerChange, flushEvents
} from './tracking.js';
import { calcularFingerprintKey, calcularFingerprintGroup } from './fingerprint-engine.js';

export const QUIZ = [

  {
    id: 6, bloco: 'dor',
    texto: "Com que frequência um nome ou uma palavra some bem na hora que você vai falar?",
    sub: "Pense no seu dia normal, não num dia ruim.",
    opcoes: [
      { key: "A", txt: "Quase nunca, a palavra vem fácil", scores: {M:5} },
      { key: "B", txt: "De vez em quando, mas logo volta", scores: {M:3} },
      { key: "C", txt: "Bastante, e me incomoda ficar sem ela", scores: {M:1} },
      { key: "D", txt: "Direto, e às vezes a palavra nem volta", scores: {M:0} }
    ]
  },
  {
    id: 2, bloco: 'dor',
    texto: "Quantas vezes por semana você entra num cômodo e esquece o que foi fazer ali?",
    sub: "",
    opcoes: [
      { key: "A", txt: "Quase nunca", scores: {M:5} },
      { key: "B", txt: "Uma vez ou outra", scores: {M:3} },
      { key: "C", txt: "Várias vezes na semana", scores: {M:1} },
      { key: "D", txt: "Quase todo dia", scores: {M:0} }
    ]
  },
  {
    id: 9, bloco: 'dor',
    texto: "Você lê um texto ou uma notícia e, quando termina, quase não lembra o que leu?",
    sub: "",
    opcoes: [
      { key: "A", txt: "Não, guardo bem o que leio", scores: {M:5} },
      { key: "B", txt: "Às vezes preciso reler um trecho", scores: {M:3} },
      { key: "C", txt: "Acontece bastante, releio muito", scores: {M:1} },
      { key: "D", txt: "Quase sempre, não fica quase nada", scores: {M:0} }
    ]
  },
  {
    id: 4, bloco: 'dor',
    texto: "Numa conversa que importa, com que frequência a sua cabeça já foi para outra coisa?",
    sub: "",
    opcoes: [
      { key: "A", txt: "Quase nunca, fico ali na conversa", scores: {F:5} },
      { key: "B", txt: "De vez em quando, nas menos importantes", scores: {F:3} },
      { key: "C", txt: "Bastante, me pego pensando em outra coisa", scores: {F:1} },
      { key: "D", txt: "O tempo todo, quase não consigo me concentrar", scores: {F:0} }
    ]
  },
  {
    id: 8, bloco: 'dor',
    texto: "Você consegue ler algo mais longo, um livro ou uma matéria, sem se perder no meio?",
    sub: "",
    opcoes: [
      { key: "A", txt: "Consigo, leio sem me perder", scores: {F:5} },
      { key: "B", txt: "Mais ou menos, depende do dia", scores: {F:3} },
      { key: "C", txt: "Difícil, me distraio rápido", scores: {F:1} },
      { key: "D", txt: "Quase não consigo, largo no meio", scores: {F:0} }
    ]
  },
  {
    id: 1, bloco: 'dor',
    texto: "Com que frequência você precisa do celular ou da TV ligados para não ficar inquieto?",
    sub: "",
    opcoes: [
      { key: "A", txt: "Quase nunca, fico bem no silêncio", scores: {F:5} },
      { key: "B", txt: "Às vezes, quando estou sem fazer nada", scores: {F:3} },
      { key: "C", txt: "Quase sempre, logo pego o celular", scores: {F:1} },
      { key: "D", txt: "O tempo todo, preciso de algo ligado", scores: {F:0} }
    ]
  },

  {
    id: 13, bloco: 'fundo',
    texto: "Quando o esquecimento acontece na frente dos outros, o que mais pesa em você?",
    sub: "Não existe resposta errada. É só entre você e você.",
    opcoes: [
      { key: "A", txt: "A vergonha na hora, todo mundo esperando eu lembrar", scores: {} },
      { key: "B", txt: "O medo de que seja o começo de algo mais sério", scores: {} },
      { key: "C", txt: "A sensação de estar ficando dependente dos outros", scores: {} },
      { key: "D", txt: "Ainda não me pesa, mas não quero que chegue lá", scores: {} }
    ]
  },

  {
    id: 3, bloco: 'desejo',
    texto: "Quando aparece um problema, as ideias vêm na sua cabeça ou você já corre pesquisar?",
    sub: "O que você marcou até aqui é mais comum do que parece. Agora olhe para o outro lado.",
    opcoes: [
      { key: "A", txt: "Vêm na hora, gosto de achar a saída pensando", scores: {C:5} },
      { key: "B", txt: "Penso um pouco e depois busco ajuda", scores: {C:3} },
      { key: "C", txt: "Já vou pesquisar, é mais rápido", scores: {C:1} },
      { key: "D", txt: "Quase sempre peço pra alguém ou pro celular", scores: {C:0} }
    ]
  },
  {
    id: 7, bloco: 'desejo',
    texto: "Coisas que você fazia fácil, como escrever, planejar ou contar uma história, ainda saem com a mesma facilidade?",
    sub: "",
    opcoes: [
      { key: "A", txt: "Sim, continua fácil como sempre", scores: {C:5} },
      { key: "B", txt: "Quase, algumas custam um pouco mais", scores: {C:3} },
      { key: "C", txt: "Não, hoje dá bem mais trabalho", scores: {C:1} },
      { key: "D", txt: "Sinto que perdi bastante essa facilidade", scores: {C:0} }
    ]
  },
  {
    id: 10, bloco: 'desejo',
    texto: "Quando foi a última vez que você aprendeu algo novo só porque quis?",
    sub: "",
    opcoes: [
      { key: "A", txt: "Faz pouco, isso é comum pra mim", scores: {C:5} },
      { key: "B", txt: "Faz algumas semanas", scores: {C:3} },
      { key: "C", txt: "Faz um bom tempo", scores: {C:1} },
      { key: "D", txt: "Quase nunca, a curiosidade anda quieta", scores: {C:0} }
    ]
  },
  {
    id: 5, bloco: 'desejo',
    texto: "Feche os olhos e imagine um lugar de que você gosta. A imagem aparece nítida na sua cabeça?",
    sub: "Tente de verdade e veja o que aparece.",
    opcoes: [
      { key: "A", txt: "Sim, vejo tudo com detalhe, como num filme", scores: {I:5} },
      { key: "B", txt: "Vejo mais ou menos, sem muitos detalhes", scores: {I:3} },
      { key: "C", txt: "Aparece, mas some rápido", scores: {I:1} },
      { key: "D", txt: "Quase não consigo formar a imagem", scores: {I:0} }
    ]
  },
  {
    id: 11, bloco: 'desejo',
    texto: "Você sente que já teve uma fase com a mente mais viva, com mais facilidade pra lembrar e criar?",
    sub: "",
    opcoes: [
      { key: "A", txt: "Não, continuo do mesmo jeito", scores: {I:5} },
      { key: "B", txt: "Talvez, mas nada muito diferente", scores: {I:3} },
      { key: "C", txt: "Sim, antes isso funcionava melhor em mim", scores: {I:1} },
      { key: "D", txt: "Sinto muita falta daquela fase", scores: {I:0} }
    ]
  },

  {
    id: 14, bloco: 'fundo',
    texto: "O que você já tentou para dar um jeito na memória?",
    sub: "Pode marcar o que mais se parece com você.",
    opcoes: [
      { key: "A", txt: "Nada ainda, esse é meu primeiro passo de verdade", scores: {} },
      { key: "B", txt: "Caça-palavras, sudoku ou joguinhos de celular", scores: {} },
      { key: "C", txt: "Anotar tudo, agenda, lembrete no celular", scores: {} },
      { key: "D", txt: "Chá, remédio ou suplemento por conta própria", scores: {} }
    ]
  },
  {
    id: 15, bloco: 'fundo',
    texto: "Pensando nos próximos anos, o que você menos quer que aconteça?",
    sub: "Respire e pense de verdade nessa.",
    opcoes: [
      { key: "A", txt: "Perder minha independência e precisar de ajuda pra tudo", scores: {} },
      { key: "B", txt: "Dar trabalho ou preocupação para os meus filhos", scores: {} },
      { key: "C", txt: "Deixar de ser quem eu sou, das histórias e das ideias", scores: {} },
      { key: "D", txt: "Ver isso avançar sabendo que eu podia ter agido antes", scores: {} }
    ]
  },

  {
    id: 12, bloco: 'aquecer',
    texto: "Se existisse um treino simples de 15 minutos por dia, no seu ritmo, para acordar a sua memória, você toparia?",
    sub: "Depois desta, a sua análise fica pronta.",
    opcoes: [
      { key: "A", txt: "Sim, topo e quero começar", scores: {I:5} },
      { key: "B", txt: "Provavelmente sim, quero ver como funciona", scores: {I:4} },
      { key: "C", txt: "Talvez, preciso achar que vale a pena", scores: {I:2} },
      { key: "D", txt: "Só topo depois de ver algum resultado", scores: {I:1} }
    ]
  }
];

const BLOCO_LABEL = {
  dor:     'O seu dia a dia',
  fundo:   'Um pouco mais fundo',
  desejo:  'A mente que você quer',
  aquecer: 'Falta pouco'
};

let estado = {
  fase: 'demografico',
  demo_step: 0,
  demo_respostas: {},
  perguntaAtual: 0,
  respostas: [],
  scores: { M: 0, F: 0, C: 0, I: 0 },
  respostaPendente: null,
  tempos: [],
  tQuestaoInicio: 0,
  perguntaVisivel: 0,
  emTransicao: false,
  concluido: false
};

export function calcularPerfil(scores) {
  const maxPorDim = 15;
  const pctM = Math.min(Math.round((scores.M / maxPorDim) * 100), 100);
  const pctF = Math.min(Math.round((scores.F / maxPorDim) * 100), 100);
  const pctC = Math.min(Math.round((scores.C / maxPorDim) * 100), 100);
  const pctI = Math.min(Math.round((scores.I / maxPorDim) * 100), 100);
  const total = Math.round((pctM + pctF + pctC + pctI) / 4);

  const fingerprint_key = calcularFingerprintKey(pctM, pctF, pctC, pctI);

  const { g: fingerprint_group, exact } =
    calcularFingerprintGroup(fingerprint_key, { pctM, pctF, pctC, pctI });

  const n = (p) => p < 40 ? 'B' : p < 70 ? 'M' : 'A';

  return {
    fingerprint_key,
    fingerprint_group,
    fingerprint_fallback: !exact,
    pctM, pctF, pctC, pctI,

    rawM: scores.M, rawF: scores.F, rawC: scores.C, rawI: scores.I,
    total,
    nivelM: n(pctM),
    nivelF: n(pctF),
    nivelC: n(pctC),
    nivelI: n(pctI),

    id: _legacyId(total)
  };
}

function _legacyId(total) {
  if (total <= 32) return 'critico';
  if (total <= 54) return 'dormindo';
  if (total <= 73) return 'potencial';
  return 'afiada';
}

export function calcularConsciencia(respostas) {
  const byId = {};
  (respostas || []).forEach(r => { byId[r.perguntaId] = r.opcaoKey; });

  const PRONTIDAO = { A: 100, B: 75, C: 40, D: 20 };
  const prontidao_score = PRONTIDAO[byId[12]] ?? 50;

  const AWARENESS = { A: 10, B: 40, C: 70, D: 100 };
  const aw = [byId[7], byId[11]]
    .map(k => AWARENESS[k])
    .filter(v => typeof v === 'number');
  const consciencia_score = aw.length
    ? Math.round(aw.reduce((a, b) => a + b, 0) / aw.length)
    : 50;

  const DOR = { A: 10, B: 40, C: 70, D: 100 };
  const dor = [6, 2, 9, 4, 8, 1]
    .map(id => DOR[byId[id]])
    .filter(v => typeof v === 'number');
  const dor_score = dor.length
    ? Math.round(dor.reduce((a, b) => a + b, 0) / dor.length)
    : 50;

  const nivel_consciencia = consciencia_score < 40 ? 'B'
    : consciencia_score < 70 ? 'M' : 'A';

  return { nivel_consciencia, prontidao_score, consciencia_score, dor_score };
}

function renderPreQuiz(step) {
  const STEPS = [
    {
      eyebrow: 'Antes de começar',
      titulo: 'Você se identifica como...',
      sub: null,
      campo: 'sexo',
      opcoes: ['Homem', 'Mulher', 'Prefiro não informar'],
      grid: false
    },
    {
      eyebrow: 'Mais uma coisa',
      titulo: 'Qual é a sua faixa de idade?',
      sub: null,
      campo: 'faixa_etaria',
      opcoes: ['18 a 25 anos', '25 a 34 anos', '35 a 45 anos', '45 a 54 anos', '55 a 65 anos', '65 anos ou mais'],
      grid: true
    }
  ];

  const cfg = STEPS[step];

  document.getElementById('quiz-eyebrow').textContent = cfg.eyebrow;
  document.getElementById('quiz-question').textContent = cfg.titulo;

  const subEl = document.getElementById('quiz-sub');
  if (cfg.sub) {
    subEl.textContent = cfg.sub;
    subEl.style.display = '';
  } else {
    subEl.style.display = 'none';
  }

  const optContainer = document.getElementById('quiz-options');
  optContainer.innerHTML = '';
  if (cfg.grid) {
    optContainer.style.display = 'grid';
    optContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    optContainer.style.gap = '10px';
  } else {
    optContainer.style.display = '';
    optContainer.style.gridTemplateColumns = '';
    optContainer.style.gap = '';
  }

  cfg.opcoes.forEach(txt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.dataset.valor = txt;
    btn.innerHTML = `
      <span class="option-text">${txt}</span>
      <span class="option-arrow" aria-hidden="true">→</span>
    `;
    btn.addEventListener('click', () => selecionarOpcaoDemo(txt, btn));
    optContainer.appendChild(btn);
  });

  document.getElementById('quiz-current').textContent = '–';
  document.getElementById('progress-fill').style.width = '0%';

  const nextBtn = document.getElementById('btn-next');
  nextBtn.classList.remove('visible');
  estado.respostaPendente = null;
}

function selecionarOpcaoDemo(valor, btnEl) {
  document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
  estado.respostaPendente = { valor };

  const nextBtn = document.getElementById('btn-next');
  nextBtn.classList.add('visible');
  nextBtn.classList.remove('pulse');
  void nextBtn.offsetWidth;
  nextBtn.classList.add('pulse');
  nextBtn.addEventListener('animationend', () => nextBtn.classList.remove('pulse'), { once: true });
}

function avancarPreQuiz() {
  const pendente = estado.respostaPendente;
  if (!pendente || estado.emTransicao) return;
  estado.emTransicao = true;
  estado.respostaPendente = null;
  document.getElementById('btn-next')?.classList.remove('visible');

  if (estado.demo_step === 0) {
    estado.demo_respostas.sexo = pendente.valor;
    estado.demo_step = 1;
    animarTransicao(() => {
      renderPreQuiz(1);
      estado.emTransicao = false;
    });
  } else {
    estado.demo_respostas.faixa_etaria = pendente.valor;

    const optContainer = document.getElementById('quiz-options');
    optContainer.style.display = '';
    optContainer.style.gridTemplateColumns = '';
    optContainer.style.gap = '';

    try {
      sessionStorage.setItem('jcs_demografico', JSON.stringify(estado.demo_respostas));
    } catch (_) {}
    estado.fase = 'quiz';
    animarTransicao(() => {
      renderPergunta(0);
      estado.emTransicao = false;
    });
  }
}

function renderPergunta(idx) {
  const q = QUIZ[idx];

  document.getElementById('quiz-eyebrow').textContent =
    BLOCO_LABEL[q.bloco] || `Pergunta ${String(idx + 1).padStart(2, '0')}`;
  document.getElementById('quiz-question').textContent = q.texto;

  const subEl = document.getElementById('quiz-sub');
  if (q.sub) {
    subEl.textContent = q.sub;
    subEl.style.display = '';
  } else {
    subEl.style.display = 'none';
  }

  const optContainer = document.getElementById('quiz-options');
  optContainer.innerHTML = '';
  q.opcoes.forEach(op => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.dataset.key = op.key;
    btn.innerHTML = `
      <span class="option-key">${op.key}</span>
      <span class="option-text">${op.txt}</span>
      <span class="option-arrow" aria-hidden="true">→</span>
    `;
    btn.addEventListener('click', () => selecionarOpcao(op, btn));
    optContainer.appendChild(btn);
  });

  document.getElementById('quiz-current').textContent = idx + 1;
  const pct = ((idx) / QUIZ.length) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';

  const nextBtn = document.getElementById('btn-next');
  nextBtn.classList.remove('visible');
  estado.respostaPendente = null;

  estado.tQuestaoInicio = Date.now();
  estado.perguntaVisivel = idx;
  trackQuestionView(idx);
}

function selecionarOpcao(opcao, btnEl) {

  const anterior = estado.respostaPendente;
  if (anterior && anterior.key !== opcao.key) {
    trackAnswerChange(estado.perguntaVisivel, anterior.key, opcao.key);
  }

  document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
  estado.respostaPendente = opcao;

  const nextBtn = document.getElementById('btn-next');
  nextBtn.classList.add('visible');
  nextBtn.classList.remove('pulse');
  void nextBtn.offsetWidth;
  nextBtn.classList.add('pulse');
  nextBtn.addEventListener('animationend', () => nextBtn.classList.remove('pulse'), { once: true });
}

function animarTransicao(callback) {
  const card = document.getElementById('quiz-card');
  card.classList.add('exit');
  setTimeout(() => {
    card.classList.remove('exit');
    callback();
    card.classList.add('enter');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.classList.remove('enter');
      });
    });
  }, 300);
}

export function avancarPergunta() {

  if (estado.fase === 'demografico') {
    avancarPreQuiz();
    return;
  }

  const opcao = estado.respostaPendente;

  if (!opcao || estado.emTransicao) return;
  estado.emTransicao = true;
  estado.respostaPendente = null;
  document.getElementById('btn-next')?.classList.remove('visible');

  const dwell = estado.tQuestaoInicio ? Date.now() - estado.tQuestaoInicio : 0;
  estado.tempos[estado.perguntaAtual] = dwell;
  trackQuestionAnswer(estado.perguntaAtual, opcao.key, dwell);

  estado.tQuestaoInicio = 0;

  Object.keys(opcao.scores).forEach(k => {
    estado.scores[k] = (estado.scores[k] || 0) + opcao.scores[k];
  });

  estado.respostas.push({
    perguntaId: QUIZ[estado.perguntaAtual].id,
    opcaoKey:   opcao.key,
    scores:     opcao.scores
  });

  estado.perguntaAtual++;

  if (estado.perguntaAtual < QUIZ.length) {
    animarTransicao(() => {
      renderPergunta(estado.perguntaAtual);
      estado.emTransicao = false;
    });
  } else {
    estado.concluido = true;
    estado.emTransicao = false;

    const perfil = calcularPerfil(estado.scores);
    Object.assign(perfil, calcularConsciencia(estado.respostas));
    saveData('jcs_scores',    estado.scores);
    saveData('jcs_respostas', estado.respostas);
    saveData('jcs_perfil',    perfil);

    const tempoTotal = estado.tempos.reduce((a, b) => a + (b || 0), 0);
    saveData('jcs_meta', {
      session_id:         getSessionId(),
      tempo_total_ms:     tempoTotal,
      tempo_por_pergunta: estado.tempos
    });

    trackQuizComplete(perfil);
    flushEvents();

    document.getElementById('progress-fill').style.width = '100%';
    setTimeout(() => navigateTo('loading.html'), 400);
  }
}

export function initQuiz() {

  if (estado.fase === 'demografico') {
    renderPreQuiz(0);
  } else {
    renderPergunta(0);
  }

  let abandonRegistrado = false;
  const registrarAbandono = () => {
    if (abandonRegistrado || estado.concluido) return;
    abandonRegistrado = true;

    const dwell = estado.tQuestaoInicio ? Date.now() - estado.tQuestaoInicio : 0;
    trackQuizAbandon(estado.perguntaVisivel, dwell);
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') registrarAbandono();
  });
  window.addEventListener('pagehide', registrarAbandono);

  document.getElementById('btn-next').addEventListener('click', avancarPergunta);

  document.addEventListener('keydown', e => {
    const keys = { '1':'A','2':'B','3':'C','4':'D','a':'A','b':'B','c':'C','d':'D' };
    const key = keys[e.key];
    if (key) {
      const btn = document.querySelector(`.quiz-option[data-key="${key}"]`);
      if (btn) btn.click();
    }
    if (e.key === 'Enter' && estado.respostaPendente) avancarPergunta();
  });
}
