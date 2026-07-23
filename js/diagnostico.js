import { loadData, getFormattedDate, navigateTo, getContexto, getSessionId, sanitize } from './utils.js';
import { enriquecerRespostas, calcularAnalise, gerarInsights } from './behavioral-analysis.js';
import { animateBar, animateCounter } from './animations.js';
import {
  trackLead, trackGateView, trackCtaClick, trackDiagScroll,
  trackGateField, trackPlanoCardView, trackTimeOnPage
} from './tracking.js';
import {
  FINGERPRINT_GROUPS,
  ABERTURA_IDENTIDADE,
  CONHECIMENTO_POR_DIMENSAO,
  getFaixaDepoimentos,
  selecionarSilenciadores
} from './content-blocks.js';
import { salvarLead, keepAlive, logEvent } from './supabase-client.js';


const EMAIL_OK = /.+@.+\..+/;



const CIENCIA_POOL = {
  mem: {
    universidade: 'Hospital Sírio Libanês',
    area: 'Neurologia',
    dado: 'Não é da idade.',
    destaque: 'É um sinal precoce.',
    texto: 'O esquecimento leve do dia a dia, quando começa a se repetir, é um sinal que os médicos levam a sério. É um estágio que muita gente ignora, e é justamente ele que dá mais tempo de agir quando é percebido cedo.',
    fonte: 'Hospital Sírio Libanês'
  },
  foco: {
    universidade: 'Estudo sueco, 20 mil adultos',
    area: 'Publicado em 2026',
    dado: 'Menos tela parada,',
    destaque: 'menos risco.',
    texto: 'Trocar o tempo parado na frente da tela por uma atividade que estimula a mente reduz o risco de declínio. É esse consumo passivo que vai apagando o seu foco e a sua atenção sem você perceber, e junto arrasta a memória.',
    fonte: 'Divulgado pela CNN Brasil'
  },
  reserva: {
    universidade: 'Ciência do cérebro',
    area: 'Como a mente envelhece',
    dado: 'A mente muda',
    destaque: 'em qualquer idade.',
    texto: 'O cérebro continua criando ligações novas mesmo mais tarde na vida. É por isso que a criatividade e a imaginação voltam quando são chamadas de novo. Nada disso morreu, só ficou parado esperando ser usado, e a memória volta junto.',
    fonte: 'Estudos sobre o cérebro que envelhece'
  },
  prev: {
    universidade: 'Comissão do Lancet',
    area: 'Demência, 2024',
    dado: 'Quase metade',
    destaque: 'pode ser evitada ou adiada.',
    texto: 'A maior comissão científica sobre o tema estima que cerca de 45% dos casos de declínio poderiam ser evitados ou adiados cuidando de hábitos simples do dia a dia. Boa parte disso está na sua mão, não na sua idade.',
    fonte: 'The Lancet Commission on dementia, 2024'
  },
  habito: {
    universidade: 'Organização Mundial da Saúde',
    area: 'Diretrizes, 2019',
    dado: 'Estimular a mente',
    destaque: 'reduz o risco.',
    texto: 'A OMS recomenda de forma oficial manter a mente ativa, com leitura, escrita e desafios, junto de movimento e bom sono, para reduzir o risco de declínio. Não é só genética, é hábito no dia a dia.',
    fonte: 'Diretrizes da Organização Mundial da Saúde, 2019'
  },
  digital: {
    universidade: 'Manfred Spitzer, Univ. de Ulm',
    area: 'Autor de Demência Digital',
    dado: 'Delegar às telas',
    destaque: 'enfraquece as conexões.',
    texto: 'O neurocientista que criou o termo demência digital mostrou que, quando o aparelho lembra por você, o cérebro para de puxar a informação sozinho. As conexões que não são usadas vão enfraquecendo, e memória, atenção e raciocínio caem juntos.',
    fonte: 'Manfred Spitzer, Demência Digital'
  },
  sinais: {
    universidade: 'Drauzio Varella',
    area: 'Série Além do Esquecimento, Fantástico',
    dado: 'Perceber cedo',
    destaque: 'é o que muda o jogo.',
    texto: 'Na série sobre memória exibida no Fantástico, o alerta é o mesmo do seu mapeamento. Esquecer de vez em quando é normal. O sinal de atenção é quando começa a se repetir e atrapalhar a rotina, e quem percebe cedo tem muito mais tempo para agir.',
    fonte: 'Drauzio Varella, Fantástico'
  },
  google: {
    universidade: 'Universidade de Columbia',
    area: 'Revista Science, 2011',
    dado: 'Se o aparelho guarda,',
    destaque: 'a mente não grava.',
    texto: 'Um experimento clássico mostrou que, quando a pessoa sabe que a informação vai ficar salva no aparelho, o cérebro simplesmente não se dá ao trabalho de gravar. Ele guarda só onde encontrar depois. É o esquecimento que você mesmo pediu sem querer.',
    fonte: 'Sparrow, Liu e Wegner, Science, 2011'
  },
  tv: {
    universidade: 'University College London',
    area: 'Scientific Reports, 2019',
    dado: 'Mais de 3h30 de TV,',
    destaque: 'menos memória.',
    texto: 'Um acompanhamento de mais de 3 mil adultos com 50 anos ou mais mostrou que passar da faixa de três horas e meia de televisão por dia foi ligado a uma queda maior de memória para palavras nos seis anos seguintes. Não é a TV em si, é o tempo parado consumindo sem a mente trabalhar.',
    fonte: 'Fancourt e Steptoe, UCL, 2019'
  },
  social: {
    universidade: 'Universidade de Michigan',
    area: 'Estudo publicado em 2008',
    dado: '10 minutos de conversa',
    destaque: 'já ativam a mente.',
    texto: 'Pesquisadores descobriram que bastam dez minutos de uma boa conversa para melhorar a memória e a capacidade de raciocínio logo em seguida. Conversar obriga a mente a lembrar, escolher palavras e acompanhar o outro, tudo ao mesmo tempo. É o treino mais natural que existe.',
    fonte: 'Ybarra et al., Universidade de Michigan'
  },
  novo: {
    universidade: 'Universidade do Texas',
    area: 'Psychological Science, 2014',
    dado: 'Aprender algo difícil',
    destaque: 'melhora a memória.',
    texto: 'Idosos que passaram a aprender uma habilidade nova e exigente melhoraram a memória de fato. Quem só fez atividades leves e conhecidas não teve o mesmo ganho. O que treina a mente não é se ocupar, é o desafio de aprender algo que ela ainda não domina.',
    fonte: 'Synapse Project, Denise Park, 2014'
  },
  escrita: {
    universidade: 'Universidade da Noruega, NTNU',
    area: 'Frontiers in Psychology, 2024',
    dado: 'Escrever à mão',
    destaque: 'acende mais o cérebro.',
    texto: 'Medindo a atividade cerebral, pesquisadores viram que escrever à mão liga muito mais regiões do cérebro do que digitar. O movimento de formar cada letra ajuda a fixar o que está sendo registrado, coisa que o teclado e o ditado não fazem.',
    fonte: 'Van der Meer, NTNU, 2024'
  }
};

// Cada hábito exibido tem um estudo que o confirma na tela seguinte (hábito -> ciência)
const HABITO_CIENCIA = {
  'delegacao-cognitiva': 'google',
  'mao-parada':          'escrita',
  'ruido-constante':     'tv',
  'consumo-passivo':     'tv',
  'refeicao-com-tela':   'tv',
  'isolamento-intelectual': 'social',
  'sedentarismo-mental': 'novo',
  'aposentadoria-mental':'novo',
  'passatempo-raso':     'novo',
  'sono-cognitivo':      'reserva',
  'hiperst-noturna':     'reserva'
};


function selecionarCiencia(perfil, silenciadores) {
  const p = perfil || {};
  const anchor = CIENCIA_POOL.mem;
  const usados = new Set([anchor]);

  // 2º e 3º cards ecoam os hábitos que o lead acabou de ver (hábito -> estudo que o confirma)
  const cardsHabito = [];
  (silenciadores || []).forEach(s => {
    const chave = s && s.id && HABITO_CIENCIA[s.id];
    const card = chave && CIENCIA_POOL[chave];
    if (card && !usados.has(card)) { usados.add(card); cardsHabito.push(card); }
  });

  // Completa com rotação de fundo, variando por grupo, sem repetir
  const rotacao = [CIENCIA_POOL.prev, CIENCIA_POOL.habito, CIENCIA_POOL.sinais, CIENCIA_POOL.digital, CIENCIA_POOL.reserva];
  const base = (p.fingerprint_group || 10) % rotacao.length;
  const escolha = [anchor, ...cardsHabito];
  for (let i = 0; escolha.length < 3 && i < rotacao.length; i++) {
    const card = rotacao[(base + i) % rotacao.length];
    if (!usados.has(card)) { usados.add(card); escolha.push(card); }
  }
  return escolha.slice(0, 3);
}


function subEsquecimento(p) {
  const m = p.pctM ?? 50;
  if (m < 40) return 'A sua memória é o ponto que mais pede atenção agora';
  if (m < 70) return 'A sua memória ainda funciona, mas já custa mais do que antes';
  return 'A sua memória está preservada, e agora é a hora de mantê-la assim';
}

function descEsquecimento(p) {
  const memBaixa = (p.pctM ?? 50) < 55;
  const outros = [['o seu foco', p.pctF ?? 50], ['a sua criatividade', p.pctC ?? 50], ['a sua imaginação', p.pctI ?? 50]]
    .sort((a, b) => a[1] - b[1]);
  const abre = memBaixa
    ? 'O seu esquecimento já aparece bastante no dia a dia, e não é da idade. É a sua mente no piloto automático.'
    : 'A sua memória ainda segura bem, mas já dá os primeiros sinais de piloto automático.';
  return `${abre} E ele nunca vem sozinho. Junto com a memória, ${outros[0][0]} foi o que mais adormeceu, e um vai puxando o outro. Cada semana que passa assim, mais uma parte da sua mente se acomoda no automático.`;
}

function horizonteEsquecimento(respostas) {
  const r = respByIdLocal(respostas);
  const medo = MEDO_PROJECAO[r[15]];
  const semBase = 'Se ficar como está, a mente no piloto automático vai apagando mais um pouco a cada mês. O esquecimento que hoje é leve vira o seu normal, e o foco e a criatividade caem junto.';
  const comBase = 'Com poucos minutos de treino por dia, a memória volta a responder mais rápido, e o foco, a atenção e a criatividade acordam atrás dela. Nas primeiras semanas você já sente a diferença.';
  return {
    sem: medo ? `${semBase} E ${medo.sem} fica um pouco mais perto a cada mês assim.` : semBase,
    com: medo ? `${comBase} E ${medo.com} fica onde deve ficar, longe de você.` : comBase
  };
}

function respByIdLocal(respostas) {
  const r = {};
  (respostas || []).forEach(item => { r[item.perguntaId] = item.opcaoKey; });
  return r;
}

// Q13: o que mais pesa no esquecimento (custo emocional confessado)
const CUSTO_EMOCIONAL = {
  A: 'a vergonha na hora, com todo mundo esperando você lembrar',
  B: 'o medo de que seja o começo de algo mais sério',
  C: 'a sensação de estar ficando dependente dos outros'
};

// Q15: o que o lead menos quer que aconteça (usado no horizonte e no CTA)
const MEDO_PROJECAO = {
  A: { sem: 'perder a sua independência',            com: 'a sua independência',              cta: 'perder a independência' },
  B: { sem: 'virar preocupação para os seus filhos', com: 'a tranquilidade dos seus filhos',   cta: 'virar preocupação para quem você ama' },
  C: { sem: 'deixar de ser quem você é',             com: 'quem você sempre foi',              cta: 'deixar de ser quem você é' }
};

// Q14: o que já tentou -> por que não segurou (tentativas desqualificadas)
const TENTATIVA_FALHA = {
  B: {
    titulo: 'Por que os joguinhos não seguraram',
    texto: 'Caça-palavras e sudoku repetem o que a sua mente já sabe fazer. Passam a sensação de treino, mas não obrigam ela a puxar nada de volta, e é justamente esse esforço de puxar que fortalece a memória. Um estudo com idosos mostrou que só quem aprendeu algo novo e difícil melhorou de verdade, quem ficou nas atividades leves não teve o mesmo ganho.'
  },
  C: {
    titulo: 'Por que anotar tudo não resolveu',
    texto: 'Anotar salva o seu dia, mas cobra caro no longo prazo. Quando a mente sabe que está tudo no papel ou no celular, ela para de se esforçar para gravar. É a mesma delegação de antes com outro nome, e quanto mais você anota, menos ela treina.'
  },
  D: {
    titulo: 'Por que o chá ou o suplemento não bastaram',
    texto: 'Memória é treino, não química. Nenhuma substância ensina a sua mente a puxar de volta um nome ou uma ideia, isso só o uso ativo faz. Por isso a própria OMS coloca estímulo mental, leitura e desafio no centro do cuidado, não uma pílula.'
  },
  A: {
    titulo: 'Você chega no melhor ponto de partida',
    texto: 'Você disse que ainda não tentou nada, e isso é uma vantagem maior do que parece. A maioria só descobre tarde que passatempo e anotação não treinam a memória, depois de anos apostando no caminho errado. Você começa direto pelo que funciona, sem vício de muleta para desfazer.'
  }
};

function mapaEsquecimento(p) {
  const dims = [
    ['A sua memória',    p.pctM ?? 50],
    ['O seu foco',       p.pctF ?? 50],
    ['A sua criatividade', p.pctC ?? 50],
    ['A sua imaginação', p.pctI ?? 50],
  ];
  const vivo   = dims.filter(d => d[1] >= 55).map(d => `${d[0]} ainda responde bem, com ${d[1]}%`);
  const quieto = dims.filter(d => d[1] < 55).map(d => `${d[0]} começou a adormecer, com ${d[1]}%`);
  if (!vivo.length)   vivo.push('A sua vontade de resolver isso, que te trouxe até aqui');
  if (!quieto.length) quieto.push('Nada gritante ainda, mas tudo pede manutenção');
  return { vivo, quieto };
}



function dimsOrdenadasAsc(perfil) {
  const dims = { M: perfil.pctM, F: perfil.pctF, C: perfil.pctC, I: perfil.pctI };
  return Object.entries(dims)
    .filter(([, v]) => typeof v === 'number')
    .sort((a, b) => a[1] - b[1]);
}

const DIM_LABEL = { M: 'Memória', F: 'Foco', C: 'Criatividade', I: 'Identidade' };

const DIM_CONTEXT_LABELS = {
  M: [
    { max: 40,  text: 'Está pedindo cuidado agora' },
    { max: 70,  text: 'Ainda funciona, mas já custa mais' },
    { max: 100, text: 'Está boa, e precisa continuar em uso' },
  ],
  F: [
    { max: 40,  text: 'Se distrai o tempo todo' },
    { max: 70,  text: 'Vai bem, mas se perde às vezes' },
    { max: 100, text: 'Firme, e pode ir muito mais fundo' },
  ],
  C: [
    { max: 40,  text: 'Foi ficando quieta' },
    { max: 70,  text: 'Está esperando ser chamada' },
    { max: 100, text: 'Presente, e pede uso todo dia' },
  ],
  I: [
    { max: 40,  text: 'Quase não é usada' },
    { max: 70,  text: 'Ativa, mas pouco chamada' },
    { max: 100, text: 'Viva, e cresce quando você usa' },
  ],
};


function renderSinteseScore(perfil) {
  const descEl = document.getElementById('perfil-desc');
  if (!descEl) return;

  const ordenadas = dimsOrdenadasAsc(perfil);
  if (ordenadas.length < 2) return;

  const [maisBaixa, vBaixa] = ordenadas[0];
  const [maisAlta, vAlta] = ordenadas[ordenadas.length - 1];


  const texto = vAlta === vBaixa
    ? `No seu mapeamento, as quatro dimensões aparecem equilibradas em torno de ${vAlta}% — um padrão que pede consistência, não um único ajuste.`
    : `No seu mapeamento, ${DIM_LABEL[maisAlta]} é o seu ponto mais firme (${vAlta}%), enquanto ${DIM_LABEL[maisBaixa]} é onde há mais espaço para ganho (${vBaixa}%).`;

  let el = document.getElementById('perfil-sintese-score');
  if (!el) {
    el = document.createElement('p');
    el.id = 'perfil-sintese-score';
    el.className = 'perfil-sintese-score';
    descEl.insertAdjacentElement('afterend', el);
  }
  el.textContent = texto;
}

function getNivelI(perfil) {
  if (perfil.nivelI) return perfil.nivelI;
  const pct = perfil.pctI ?? 50;
  return pct < 40 ? 'B' : pct < 70 ? 'M' : 'A';
}


export function renderDiagnostico() {
  const perfil    = loadData('jcs_perfil');
  const respostas = loadData('jcs_respostas') || [];
  const lead      = loadData('jcs_lead') || {};

  if (!perfil) { navigateTo('index.html'); return; }


  const groupId = perfil.fingerprint_group || 10;
  const grupo   = FINGERPRINT_GROUPS.find(g => g.id === groupId) || FINGERPRINT_GROUPS[9];
  const nome    = lead.nome ? lead.nome.split(' ')[0] : '';

  
  document.getElementById('diag-date').textContent = getFormattedDate();

  
  const nivelI = getNivelI(perfil);
  const saudEl = document.getElementById('perfil-saudacao');
  if (saudEl) saudEl.textContent = ABERTURA_IDENTIDADE[nivelI](nome);

  document.getElementById('perfil-nome').textContent = grupo.nome;

  const subEl = document.getElementById('perfil-sub');
  if (subEl) { subEl.textContent = subEsquecimento(perfil); subEl.style.color = grupo.cor; }

  document.getElementById('perfil-desc').textContent = descEsquecimento(perfil);


  renderSinteseScore(perfil);


  const pullquoteEl = document.getElementById('perfil-pullquote');
  if (pullquoteEl && grupo.pullquote) pullquoteEl.textContent = grupo.pullquote;


  if (groupId === 19) {
    let urgEl = document.getElementById('perfil-urgencia-aaaa');
    if (!urgEl) {
      urgEl = document.createElement('p');
      urgEl.id = 'perfil-urgencia-aaaa';
      urgEl.className = 'perfil-urgencia-aaaa';
      const sinteseEl = document.getElementById('perfil-sintese-score');
      const refEl = sinteseEl || document.getElementById('perfil-desc');
      if (refEl) refEl.insertAdjacentElement('afterend', urgEl);
    }
    urgEl.textContent = 'Mentes que pontuam alto sem prática intencional são as mais vulneráveis ao declínio abrupto — porque o funcionamento aparente mascara o desgaste silencioso. O fato de estar bem hoje não é garantia de amanhã. É o ponto de partida para cuidado ativo.';
  }

  
  animateCounter(document.getElementById('score-total'), perfil.total, 1600, 400);
  _animateBars(perfil);
  _renderDimLabels(perfil);

  
  const silTitEl = document.getElementById('silenciadores-titulo');
  if (silTitEl && nome) {
    silTitEl.textContent = `${nome}, os hábitos que estão apagando a sua memória`;
  }
  const fingerprintKey = perfil.fingerprint_key || 'MMMM';
  const silenciadores  = selecionarSilenciadores(fingerprintKey, respostas);
  const silContainer   = document.getElementById('silenciadores-list');


  let silIntroEl = document.getElementById('silenciadores-intro');
  if (!silIntroEl && silContainer) {
    silIntroEl = document.createElement('p');
    silIntroEl.id = 'silenciadores-intro';
    silIntroEl.className = 'silenciadores-intro';
    silContainer.insertAdjacentElement('beforebegin', silIntroEl);
  }
  if (silIntroEl) {
    silIntroEl.textContent = nome
      ? `${nome}, olha só. Encontramos ${silenciadores.length} hábitos do seu dia a dia que vão apagando a sua memória sem você perceber, e é isso que puxa para baixo as notas que você viu ali em cima.`
      : `Encontramos ${silenciadores.length} hábitos do seu dia a dia que vão apagando a sua memória sem você perceber, e é isso que puxa para baixo as notas acima.`;
  }
  if (silContainer) {
    silContainer.innerHTML = silenciadores.map(s => `
      <div class="silenciador-card">
        <div class="silenciador-icone" aria-hidden="true">${s.icone}</div>
        <div class="silenciador-body">
          <div class="silenciador-nome">${sanitize(s.nome)}</div>
          <p class="silenciador-desc">${sanitize(s.desc)}</p>
        </div>
      </div>
    `).join('');

    // A sacada do diagnóstico: os hábitos visíveis são só a superfície, os ocultos ficam pro método
    let sacadaEl = document.getElementById('silenciadores-sacada');
    if (!sacadaEl) {
      sacadaEl = document.createElement('p');
      sacadaEl.id = 'silenciadores-sacada';
      sacadaEl.className = 'diag-gancho';
      silContainer.insertAdjacentElement('afterend', sacadaEl);
    }
    sacadaEl.textContent = 'Esses são os hábitos que dá pra enxergar de fora. Os mais perigosos são os que ninguém percebe sozinho, e é por eles que o método começa.';

    renderCustoEmocional(respostas, silContainer.closest('.silenciadores-section') || silContainer.parentElement);
  }

  
  const cienciaContainer = document.getElementById('ciencia-grid');
  if (cienciaContainer) {
    cienciaContainer.innerHTML = selecionarCiencia(perfil, silenciadores).map(c => `
      <div class="ciencia-card">
        <div class="ciencia-header">
          <div class="ciencia-uni">${sanitize(c.universidade)}</div>
          <div class="ciencia-area">${sanitize(c.area)}</div>
        </div>
        <div class="ciencia-dado">
          <span class="ciencia-num">${sanitize(c.dado)}</span>
          <span class="ciencia-destaque">${sanitize(c.destaque)}</span>
        </div>
        <p class="ciencia-texto">${sanitize(c.texto)}</p>
        <div class="ciencia-fonte">${sanitize(c.fonte)}</div>
      </div>
    `).join('');
  }


  renderEspelhoCenas(respostas, nome);
  renderTentativa(respostas, nome);
  ecoarCtaFinal(respostas);

  const mapaTitEl = document.getElementById('mapa-titulo');
  if (mapaTitEl && nome) {
    mapaTitEl.textContent = `${nome}, o que ainda está firme, e o que já começou a adormecer`;
  }
  const vivoList  = document.getElementById('mapa-vivo');
  const quietoList = document.getElementById('mapa-quieto');
  const mapa = mapaEsquecimento(perfil);
  if (vivoList)   vivoList.innerHTML  = mapa.vivo.map(t  => `<li>${t}</li>`).join('');
  if (quietoList) quietoList.innerHTML = mapa.quieto.map(t => `<li>${t}</li>`).join('');

  
  const semEl    = document.getElementById('horizonte-sem');
  const comEl    = document.getElementById('horizonte-com');
  const horiz = horizonteEsquecimento(respostas);
  if (semEl) semEl.textContent = horiz.sem;
  if (comEl) comEl.textContent = horiz.com;

  
  initCarrossel(groupId);

  
  renderPlanoInicial(perfil, nome);
  initPlanoCardViews();

  
  initScrollDepth();
  initTimeOnPage();
}


// Espelho: as cenas que o próprio lead confirmou (C/D), na voz dele, antes dos números
const CENA_POR_PERGUNTA = {
  6:  'O nome ou a palavra some bem na hora de falar',
  2:  'Você entra num cômodo e esquece o que foi fazer ali',
  9:  'Termina de ler e quase não fica nada do que leu',
  4:  'No meio de uma conversa que importa, a cabeça já foi para outra',
  8:  'Começa um texto mais longo e se perde antes do fim',
  7:  'Coisas que faziam fácil, hoje custam mais para sair',
  10: 'Faz tempo que você não aprende algo novo só porque quis',
  5:  'A imagem de um lugar querido não vem mais tão nítida'
};

function renderEspelhoCenas(respostas, nome) {
  const r = respByIdLocal(respostas);
  const fortes = [], medias = [];
  Object.keys(CENA_POR_PERGUNTA).forEach(id => {
    if (r[id] === 'D') fortes.push(CENA_POR_PERGUNTA[id]);
    else if (r[id] === 'C') medias.push(CENA_POR_PERGUNTA[id]);
  });
  const cenas = fortes.concat(medias).slice(0, 3);
  if (cenas.length < 2) return; // sem material suficiente (lead leve ou antigo): não renderiza

  const hero = document.querySelector('.perfil-hero');
  if (!hero) return;
  let bloco = document.getElementById('espelho-cenas');
  if (!bloco) {
    bloco = document.createElement('section');
    bloco.id = 'espelho-cenas';
    bloco.className = 'espelho-section reveal';
    hero.insertAdjacentElement('afterend', bloco);
  }
  const titulo = nome ? `${nome}, foi você mesmo que contou isto` : 'Foi você mesmo que contou isto';
  bloco.innerHTML = `
    <div class="diag-section-inner">
      <div class="section-label">O retrato começa aqui</div>
      <h3 class="diag-section-titulo">${sanitize(titulo)}</h3>
      <ul class="espelho-list">
        ${cenas.map(c => `<li>${sanitize(c)}</li>`).join('')}
      </ul>
      <p class="diag-section-intro">Não é impressão sua e não é frescura. É um padrão, e padrão tem causa. Veja o que os números mostram.</p>
    </div>`;
}

function renderCustoEmocional(respostas, secaoAncora) {
  const r = respByIdLocal(respostas);
  const chave = r[13];
  if (!chave || !secaoAncora) return;

  const texto = chave === 'D'
    ? 'Você disse que ainda não pesa. Guarde uma coisa. É exatamente agora, antes de pesar, que reverter é mais rápido e mais fácil. Quem espera pesar começa em desvantagem.'
    : `E o preço não é só esquecer. Você mesmo disse que o que mais pesa é ${CUSTO_EMOCIONAL[chave]}. É isso que fica em jogo enquanto esses hábitos seguem no comando da sua mente.`;

  let el = document.getElementById('custo-emocional');
  if (!el) {
    el = document.createElement('p');
    el.id = 'custo-emocional';
    el.className = 'diag-custo reveal';
    secaoAncora.insertAdjacentElement('afterend', el);
  }
  el.textContent = texto;
}

function renderTentativa(respostas, nome) {
  const r = respByIdLocal(respostas);
  const dados = TENTATIVA_FALHA[r[14]];
  if (!dados) return;

  const horizonte = document.querySelector('.horizonte-section');
  const ancora = horizonte || document.querySelector('.mapa-section');
  if (!ancora) return;

  let bloco = document.getElementById('tentativa-section');
  if (!bloco) {
    bloco = document.createElement('section');
    bloco.id = 'tentativa-section';
    bloco.className = 'tentativa-section reveal';
    ancora.insertAdjacentElement('beforebegin', bloco);
  }
  bloco.innerHTML = `
    <div class="diag-section-inner">
      <div class="section-label">O que você já tentou</div>
      <h3 class="diag-section-titulo">${sanitize(dados.titulo)}</h3>
      <p class="diag-section-intro">${sanitize(dados.texto)}</p>
    </div>`;
}

function ecoarCtaFinal(respostas) {
  const r = respByIdLocal(respostas);
  const medo = MEDO_PROJECAO[r[15]];
  if (!medo) return;
  const el = document.querySelector('.diag-cta-text');
  if (!el) return;
  el.innerHTML = `<strong>Isso pode ser treinado.</strong> Existe um caminho específico para o padrão que o seu mapeamento revelou, e para o futuro que você quer evitar: ${sanitize(medo.cta)}. 23 desafios práticos. 15 minutos por dia. Nas primeiras semanas, você começa a notar.`;
}

function renderPlanoInicial(perfil, nome) {
  const ancora = document.querySelector('.diag-cta-section') || document.getElementById('diag-section');
  if (!ancora) return;

  const ordenadas = dimsOrdenadasAsc(perfil);
  const dims = Object.fromEntries(ordenadas);
  const prioridades = ordenadas.slice(0, 2).map(([k]) => k);
  if (!prioridades.length) return;

  const cards = prioridades.map(dim => {
    const c = CONHECIMENTO_POR_DIMENSAO[dim];
    if (!c) return '';
    return `
      <div class="plano-card">
        <div class="plano-card-dim">${sanitize(c.label)} · ${sanitize(String(dims[dim]))}%</div>
        <div class="plano-card-nome">${sanitize(c.pratica.nome)}</div>
        <p class="plano-card-como">${sanitize(c.pratica.como)}</p>
        <p class="plano-card-porque"><strong>Por que funciona.</strong> ${sanitize(c.pratica.porque)}</p>
        <div class="plano-card-ciencia">${sanitize(c.ciencia.dado)}<span class="plano-card-fonte">${sanitize(c.ciencia.fonte)}</span></div>
      </div>`;
  }).join('');

  const titulo = nome
    ? `${nome}, por onde começar esta semana`
    : 'Por onde começar esta semana';

  let bloco = document.getElementById('plano-inicial');
  if (!bloco) {
    bloco = document.createElement('section');
    bloco.id = 'plano-inicial';
    bloco.className = 'plano-inicial reveal';
    ancora.parentNode.insertBefore(bloco, ancora);
  }
  bloco.innerHTML = `
    <div class="plano-inicial-inner">
      <h3 class="plano-inicial-titulo"></h3>
      <p class="plano-inicial-sub">Duas práticas de 15 minutos focadas nas dimensões com mais espaço para ganho no seu mapeamento.</p>
      <div class="plano-cards">${cards}</div>
    </div>`;
  bloco.querySelector('.plano-inicial-titulo').textContent = titulo;
}

function initScrollDepth() {

  const marcos = { 25: false, 50: false, 75: false, 90: false };
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (max <= 0) return;
    const pct = (h.scrollTop / max) * 100;
    [25, 50, 75].forEach(m => {
      if (!marcos[m] && pct >= m) { marcos[m] = true; trackDiagScroll(m); }
    });
    if (!marcos[90] && pct >= 90) {
      marcos[90] = true; trackDiagScroll(90);
      window.removeEventListener('scroll', onScroll);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}


function initPlanoCardViews() {
  const cards = document.querySelectorAll('#plano-inicial .plano-card');
  if (!cards.length || typeof IntersectionObserver === 'undefined') return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const dim = e.target.querySelector('.plano-card-dim')?.textContent || null;
        trackPlanoCardView(dim);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  cards.forEach(c => obs.observe(c));
}


function initTimeOnPage() {
  const inicio = Date.now();
  let registrado = false;
  const registrar = () => {
    if (registrado) return;
    registrado = true;
    trackTimeOnPage('diagnostico', Date.now() - inicio);
  };
  window.addEventListener('pagehide', registrar);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') registrar();
  });
}


function buildCard(t) {
  return `
    <div class="mq-card">
      <div class="mq-card-top">
        <div class="mq-stars">★★★★★</div>
        <div class="mq-resultado">${sanitize(t.resultado)}</div>
      </div>
      <p class="mq-texto">"${sanitize(t.texto)}"</p>
      <div class="mq-autor">
        <div class="mq-avatar">${sanitize(t.iniciais)}</div>
        <div class="mq-info">
          <span class="mq-nome">${sanitize(t.nome)}</span>
          <span class="mq-meta">${sanitize(t.idade)} · ${sanitize(t.cidade)}</span>
        </div>
      </div>
    </div>`;
}

function fillTrack(trackEl, items) {
  const html = [...items, ...items, ...items].map(buildCard).join('');
  trackEl.innerHTML = html;
}

function initCarrossel(fingerprintGroup) {
  const items = getFaixaDepoimentos(fingerprintGroup);
  if (!items.length) return;

  const track1 = document.getElementById('marquee-track-1');
  if (!track1) return;

  fillTrack(track1, items);

  requestAnimationFrame(() => {
    track1.style.cssText += 'animation: marqueeLeft 38s linear infinite !important;';
  });

  const row = track1.closest('.marquee-row');
  row?.addEventListener('mouseenter', () => { track1.style.animationPlayState = 'paused'; });
  row?.addEventListener('mouseleave', () => { track1.style.animationPlayState = 'running'; });
}



export function initGate() {

  keepAlive().catch(() => {});


  trackGateView();


  const ctaMetodo = document.getElementById('btn-ver-metodo');
  if (ctaMetodo) {
    ctaMetodo.addEventListener('click', () => trackCtaClick('diagnostico'));
  }


  document.querySelectorAll('.cta-inline-btn').forEach(btn => {
    btn.addEventListener('click', () => trackCtaClick(btn.dataset.origem || 'diag_inline'));
  });

  const form = document.getElementById('gate-form');
  if (!form) return;


  form.querySelectorAll('input, select, textarea').forEach(campo => {
    const nome = campo.id || campo.name || 'campo';
    campo.addEventListener('focus', () => trackGateField(nome, 'focus'), { passive: true });
    campo.addEventListener('blur',  () => trackGateField(nome, 'blur'),  { passive: true });
  });

  const phoneInput = document.getElementById('gate-phone');


  function normalizarDigitosCelular(raw) {
    let d = raw.replace(/\D/g, '');
    if ((d.length === 13 || d.length === 12) && d.startsWith('55')) d = d.slice(2);
    return d.slice(0, 11);
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', e => {
      const digits = normalizarDigitosCelular(e.target.value);
      let f = digits;
      if (digits.length > 2) f = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
      if (digits.length > 7) f = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
      e.target.value = f;
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();


    if (document.getElementById('hp-website')?.value) return;

    const nome              = document.getElementById('gate-name')?.value.trim();
    const email             = document.getElementById('gate-email')?.value.trim();
    const celularRaw        = phoneInput?.value.trim() || '';
    const maior_dificuldade = document.getElementById('gate-dificuldade')?.value.trim() || '';


    const celular = normalizarDigitosCelular(celularRaw);
    const phoneValido = celular.length === 11 && celular[2] === '9';

    const sinalErro = (el, msg) => {
      el.style.borderColor = 'var(--score-critical)';
      el.style.boxShadow   = '0 0 0 3px rgba(224,82,82,.18)';
      const group = el.closest('.form-group');
      let errEl = group && group.querySelector('.form-erro');
      if (group && !errEl) {
        errEl = document.createElement('p');
        errEl.className = 'form-erro';
        errEl.setAttribute('role', 'alert');
        group.appendChild(errEl);
      }
      if (errEl) errEl.textContent = msg || '';
      const limpar = () => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
        if (errEl) errEl.textContent = '';
      };
      el.addEventListener('input', limpar, { once: true });
      el.focus();
    };

    const nomeEl  = document.getElementById('gate-name');
    const emailEl = document.getElementById('gate-email');
    if (!nome)                 { sinalErro(nomeEl, 'Digite o seu nome'); return; }
    if (!EMAIL_OK.test(email))  { sinalErro(emailEl, 'Confira o seu email, parece que falta alguma coisa'); return; }
    if (!phoneValido)          { sinalErro(phoneInput, 'Confira o celular, ele precisa do DDD e do 9 na frente'); return; }


    const leadData = { nome, email, celular, maior_dificuldade };
    try { sessionStorage.setItem('jcs_lead', JSON.stringify(leadData)); } catch(_) {}


    trackLead();


    const perfil    = loadData('jcs_perfil') || {};
    const respostas = loadData('jcs_respostas') || [];
    const meta      = loadData('jcs_meta') || {};
    const rawUtms   = loadData('jcs_utm') || {};
    const utms = {
      utm_source:   rawUtms.source   || null,
      utm_medium:   rawUtms.medium   || null,
      utm_campaign: rawUtms.campaign || null,
      utm_content:  rawUtms.content  || null,
      utm_term:     rawUtms.term     || null,
    };
    const fbclid = rawUtms.fbclid || null;


    if (perfil && perfil.fingerprint_key) {
      const contexto = getContexto();


      const demografico = JSON.parse(sessionStorage.getItem('jcs_demografico') || '{}');


      const tempos            = meta.tempo_por_pergunta || [];
      const respostas_ricas   = enriquecerRespostas(respostas, tempos);
      const analise           = calcularAnalise(respostas_ricas, tempos);
      const insights          = gerarInsights(perfil, analise);

      salvarLead({
        ...leadData, ...perfil, ...meta,
        respostas: respostas_ricas,
        analise_comportamental: analise,
        insights_automaticos:   insights,
        fbclid,
        ...utms,
        contexto,
        sexo:         demografico.sexo         || null,
        faixa_etaria: demografico.faixa_etaria || null,
      })
        .then(({ error }) => {

          if (error) {
            logEvent('lead_save_error',
              { code: error.code || null, message: error.message || String(error) },
              meta.session_id || getSessionId());
          }
        })
        .catch((err) => {
          logEvent('lead_save_error',
            { message: err?.message || String(err) },
            meta.session_id || getSessionId());
        });
    }


    const gateSec = document.getElementById('gate-section');
    const diagSec = document.getElementById('diag-section');
    if (gateSec && diagSec) {
      gateSec.style.display = 'none';
      diagSec.style.display = 'block';
      window.scrollTo(0, 0);
      renderDiagnostico();
    }
  });
}


function _animateBars(perfil) {
  [
    { bar: 'bar-m', val: 'val-m', pct: perfil.pctM },
    { bar: 'bar-c', val: 'val-c', pct: perfil.pctC },
    { bar: 'bar-i', val: 'val-i', pct: perfil.pctI },
    { bar: 'bar-f', val: 'val-f', pct: perfil.pctF },
  ].forEach(({ bar, val, pct }, idx) => {
    animateBar(document.getElementById(bar), pct, 600 + idx * 150);
    animateCounter(document.getElementById(val), pct, 1200, 600 + idx * 150);
  });
}

function _renderDimLabels(perfil) {
  const map = { M: perfil.pctM, C: perfil.pctC, I: perfil.pctI, F: perfil.pctF };
  Object.entries(map).forEach(([dim, pct]) => {
    const el = document.getElementById('label-' + dim.toLowerCase());
    if (!el) return;
    const val = typeof pct === 'number' ? pct : 50;
    const entry = DIM_CONTEXT_LABELS[dim].find(e => val <= e.max);
    if (entry) el.textContent = entry.text;
  });
}


function renderScorePreview(perfil) {
  const groupId = perfil.fingerprint_group || 10;
  const grupo   = FINGERPRINT_GROUPS.find(g => g.id === groupId) || FINGERPRINT_GROUPS[9];


  const dateEl = document.getElementById('diag-date');
  if (dateEl) dateEl.textContent = getFormattedDate();


  const nomeEl = document.getElementById('perfil-nome');
  if (nomeEl) nomeEl.textContent = grupo.nome;

  const subEl = document.getElementById('perfil-sub');
  if (subEl) { subEl.textContent = subEsquecimento(perfil); subEl.style.color = grupo.cor; }

  const descEl = document.getElementById('perfil-desc');
  if (descEl) descEl.textContent = descEsquecimento(perfil);


  const pullquoteEl = document.getElementById('perfil-pullquote');
  if (pullquoteEl && grupo.pullquote) pullquoteEl.textContent = grupo.pullquote;


  animateCounter(document.getElementById('score-total'), perfil.total, 1600, 400);
  _animateBars(perfil);
  _renderDimLabels(perfil);


  document.querySelectorAll('.perfil-hero.reveal, .score-section.reveal')
    .forEach(el => el.classList.add('revealed'));
}


function revelarDiagnostico() {

  gateResolvido = true;
  clearTimeout(gateHideTimer);

  const popup = document.getElementById('popup-gate');
  if (popup) { popup.classList.remove('popup-visible'); popup.style.display = 'none'; }

  const el = document.getElementById('conteudo-bloqueado');
  if (el) {
    el.classList.remove('bloqueado');
    el.classList.add('blur-lifting');
    requestAnimationFrame(() => { el.classList.add('blur-lifted'); });
    setTimeout(() => { el.classList.remove('blur-lifting', 'blur-lifted'); }, 700);
  }

  renderDiagnostico();


  document.querySelectorAll('#conteudo-bloqueado .reveal')
    .forEach(node => node.classList.add('revealed'));
}


function initPopupGate() {
  const form       = document.getElementById('popup-gate-form');
  const phoneInput = document.getElementById('popup-phone');
  if (!form) return;


  form.querySelectorAll('input, textarea').forEach(campo => {
    const id = campo.id || campo.name || 'campo';
    campo.addEventListener('focus', () => trackGateField(id, 'focus'), { passive: true });
    campo.addEventListener('blur',  () => trackGateField(id, 'blur'),  { passive: true });
  });

  function normalizarDigitosCelular(raw) {
    let d = raw.replace(/\D/g, '');
    if ((d.length === 13 || d.length === 12) && d.startsWith('55')) d = d.slice(2);
    return d.slice(0, 11);
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', e => {
      const digits = normalizarDigitosCelular(e.target.value);
      let f = digits;
      if (digits.length > 2) f = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
      if (digits.length > 7) f = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
      e.target.value = f;
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();


    if (document.getElementById('hp-website')?.value) return;

    const nome  = document.getElementById('popup-name')?.value.trim();
    const email = document.getElementById('popup-email')?.value.trim();
    const celularRaw = phoneInput?.value.trim() || '';
    const maior_dificuldade = document.getElementById('popup-dificuldade')?.value.trim() || '';


    const celular = normalizarDigitosCelular(celularRaw);
    const phoneValido = celular.length === 11 && celular[2] === '9';

    const sinalErro = (el, msg) => {
      el.style.borderColor = 'var(--score-critical)';
      el.style.boxShadow   = '0 0 0 3px rgba(224,82,82,.18)';
      const group = el.closest('.form-group');
      let errEl = group && group.querySelector('.form-erro');
      if (group && !errEl) {
        errEl = document.createElement('p');
        errEl.className = 'form-erro';
        errEl.setAttribute('role', 'alert');
        group.appendChild(errEl);
      }
      if (errEl) errEl.textContent = msg || '';
      const limpar = () => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
        if (errEl) errEl.textContent = '';
      };
      el.addEventListener('input', limpar, { once: true });
      el.focus();
    };

    if (!nome)                 { sinalErro(document.getElementById('popup-name'), 'Digite o seu nome'); return; }
    if (!EMAIL_OK.test(email))  { sinalErro(document.getElementById('popup-email'), 'Confira o seu email, parece que falta alguma coisa'); return; }
    if (!phoneValido)          { sinalErro(phoneInput, 'Confira o celular, ele precisa do DDD e do 9 na frente'); return; }

    const leadData = { nome, email, celular, maior_dificuldade };
    try { sessionStorage.setItem('jcs_lead', JSON.stringify(leadData)); } catch(_) {}

    trackLead();


    const perfil    = loadData('jcs_perfil') || {};
    const respostas = loadData('jcs_respostas') || [];
    const meta      = loadData('jcs_meta') || {};
    const rawUtms   = loadData('jcs_utm') || {};
    const utms = {
      utm_source:   rawUtms.source   || null,
      utm_medium:   rawUtms.medium   || null,
      utm_campaign: rawUtms.campaign || null,
      utm_content:  rawUtms.content  || null,
      utm_term:     rawUtms.term     || null,
    };
    const fbclid = rawUtms.fbclid || null;

    if (perfil && perfil.fingerprint_key) {
      const contexto   = getContexto();
      const demografico = JSON.parse(sessionStorage.getItem('jcs_demografico') || '{}');
      const tempos      = meta.tempo_por_pergunta || [];
      const respostas_ricas = enriquecerRespostas(respostas, tempos);
      const analise     = calcularAnalise(respostas_ricas, tempos);
      const insights    = gerarInsights(perfil, analise);

      salvarLead({
        ...leadData, ...perfil, ...meta,
        respostas: respostas_ricas,
        analise_comportamental: analise,
        insights_automaticos:   insights,
        fbclid,
        ...utms,
        contexto,
        sexo:         demografico.sexo         || null,
        faixa_etaria: demografico.faixa_etaria || null,
      })
        .then(({ error }) => {
          if (error) {
            logEvent('lead_save_error',
              { code: error.code || null, message: error.message || String(error) },
              meta.session_id || getSessionId());
          }
        })
        .catch((err) => {
          logEvent('lead_save_error',
            { message: err?.message || String(err) },
            meta.session_id || getSessionId());
        });
    }


    document.dispatchEvent(new CustomEvent('jcs:lead-captured', { detail: { email } }));

    revelarDiagnostico();
  });
}


let gateHideTimer  = null;
let gateViewTracked = false;
let gateResolvido   = false;


function abrirGate() {
  if (gateResolvido) return;
  const popupEl = document.getElementById('popup-gate');
  if (!popupEl) return;

  clearTimeout(gateHideTimer);
  popupEl.style.display = 'flex';

  void popupEl.offsetWidth;
  popupEl.classList.add('popup-visible');

  if (!gateViewTracked) { gateViewTracked = true; trackGateView(); }
}


function fecharGate() {
  const popupEl = document.getElementById('popup-gate');
  if (!popupEl) return;

  popupEl.classList.remove('popup-visible');
  clearTimeout(gateHideTimer);
  gateHideTimer = setTimeout(() => {
    if (!popupEl.classList.contains('popup-visible')) popupEl.style.display = 'none';
  }, 650);
}


function armGateOnScroll() {
  const bloqueado = document.getElementById('conteudo-bloqueado');
  if (!bloqueado) return;

  const ABRIR = 0.5, FECHAR = 0.65;
  let aberto = false;

  const check = () => {
    if (gateResolvido) return;
    const vh  = window.innerHeight;
    const top = bloqueado.getBoundingClientRect().top;

    const passouDoMapa = window.scrollY > 8 && top <= vh * ABRIR;
    const voltouAoMapa = top > vh * FECHAR;
    if (!aberto && passouDoMapa)     { aberto = true;  abrirGate(); }
    else if (aberto && voltouAoMapa) { aberto = false; fecharGate(); }
  };


  setTimeout(() => {
    window.addEventListener('scroll', check, { passive: true });
    check();
  }, 500);
}


export function initDiagnostico() {
  keepAlive().catch(() => {});


  const ctaMetodo = document.getElementById('btn-ver-metodo');
  if (ctaMetodo) {
    ctaMetodo.addEventListener('click', () => trackCtaClick('diagnostico'));
  }
  document.querySelectorAll('.cta-inline-btn').forEach(btn => {
    btn.addEventListener('click', () => trackCtaClick(btn.dataset.origem || 'diag_inline'));
  });

  const perfil = loadData('jcs_perfil');
  const lead   = loadData('jcs_lead');


  if (!perfil) {
    document.getElementById('gate-section').style.display = 'block';
    document.getElementById('diag-section').style.display = 'none';
    initGate();
    return;
  }


  if (lead && lead.email) {
    document.getElementById('gate-section').style.display = 'none';
    document.getElementById('diag-section').style.display = 'block';
    const popup = document.getElementById('popup-gate');
    if (popup) popup.style.display = 'none';
    renderDiagnostico();
    return;
  }


  document.getElementById('gate-section').style.display = 'none';
  document.getElementById('diag-section').style.display = 'block';
  window.scrollTo(0, 0);

  const bloqueado = document.getElementById('conteudo-bloqueado');
  if (bloqueado) bloqueado.classList.add('bloqueado');

  renderScorePreview(perfil);
  initPopupGate();
  armGateOnScroll();
}
