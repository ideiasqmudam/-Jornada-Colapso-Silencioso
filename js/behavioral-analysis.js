

const TEXTOS_PERGUNTAS = {
  1:  { dim: 'F', label: 'Foco',        texto: 'Você consegue ficar um tempo só pensando, sem pegar o celular nem ligar a TV?' },
  2:  { dim: 'M', label: 'Memória',     texto: 'Tente lembrar o cheiro de um lugar da sua infância. Ele vem?' },
  3:  { dim: 'C', label: 'Criatividade',texto: 'Quando aparece um problema pra resolver, o que você faz primeiro?' },
  4:  { dim: 'F', label: 'Foco',        texto: 'Numa conversa importante, você presta atenção de verdade, ou sua cabeça já foi pra outra coisa?' },
  5:  { dim: 'I', label: 'Identidade',  texto: 'Imagine agora a casa dos seus sonhos. Você consegue ver ela na cabeça, como num filme?' },
  6:  { dim: 'M', label: 'Memória',     texto: 'Quando uma palavra ou um nome foge bem na hora de falar, como costuma ser pra você?' },
  7:  { dim: 'C', label: 'Criatividade',texto: 'Tinha algo que você fazia com facilidade — escrever, planejar, contar histórias — que hoje custa mais?' },
  8:  { dim: 'F', label: 'Foco',        texto: 'Você consegue ler um texto longo, um livro ou uma matéria, sem se perder no meio?' },
  9:  { dim: 'M', label: 'Memória',     texto: 'Na maioria dos dias, você acorda com a cabeça descansada?' },
  10: { dim: 'C', label: 'Criatividade',texto: 'Quando foi a última vez que você aprendeu algo novo porque quis, sem ninguém pedir?' },
  11: { dim: 'I', label: 'Identidade',  texto: 'Existiu uma versão sua com mais espaço pra imaginar, criar e lembrar?' },
  12: { dim: 'I', label: 'Identidade',  texto: 'Se existissem exercícios simples, sem tecnologia, pra treinar sua mente como um músculo, você toparia?' }
};

const TEXTOS_OPCOES = {
  1:  { A: 'Consigo, e até gosto. Fico à vontade com meus pensamentos', B: 'Às vezes, quando tenho um tempo mais sossegado', C: 'Quase não consigo. Logo dá vontade de pegar o celular', D: 'Nunca. Preciso sempre de alguma coisa ligada' },
  2:  { A: 'Vem na hora. Quase consigo sentir o cheiro', B: 'Vem mais ou menos, uma lembrança meio fraca', C: 'Custa vir. Sei que está lá, mas embaçado', D: 'Não consigo lembrar esse tipo de coisa' },
  3:  { A: 'Fico pensando nele até achar uma saída na minha cabeça', B: 'Penso um pouco e depois procuro ajuda ou ideias', C: 'Já vou pesquisar. É mais rápido do que ficar pensando', D: 'Quase sempre peço pra alguém ou pro celular resolver' },
  4:  { A: 'Presto atenção total. Fico ali, na conversa', B: 'Depende. Nas que importam sim, nas outras nem tanto', C: 'Muitas vezes me pego pensando em outra coisa', D: 'É raro conseguir ficar concentrado por muito tempo' },
  5:  { A: 'Sim. Vejo as cores, os móveis, tudo bem nítido', B: 'Vejo mais ou menos, uma ideia geral, sem detalhes', C: 'A imagem até aparece, mas some rápido', D: 'Eu precisaria de fotos pra conseguir imaginar' },
  6:  { A: 'Quase não acontece. A palavra vem fácil', B: 'Acontece às vezes, mas a palavra logo volta', C: 'Acontece bastante, e me incomoda ficar sem ela', D: 'Acontece muito, e às vezes a palavra nem volta' },
  7:  { A: 'Não. Continuo fazendo como sempre fiz', B: 'Algumas coisas ficaram mais difíceis, mas ainda faço bem', C: 'Sim. O que era fácil hoje dá bem mais trabalho', D: 'Sim. Sinto que perdi bastante essa facilidade' },
  8:  { A: 'Sim. Leio textos longos sem dificuldade', B: 'Mais ou menos. Depende do dia e do assunto', C: 'Tenho dificuldade. Me distraio rápido', D: 'Bem difícil. Prefiro coisas curtas e largo as longas' },
  9:  { A: 'Geralmente sim. Acordo com a cabeça leve', B: 'Às vezes. Depende de como foi a noite', C: 'Quase nunca. Já acordo com a cabeça a mil', D: 'Acordo cansado mesmo quando durmo bastante' },
  10: { A: 'Faz pouco tempo. Isso é um hábito meu', B: 'Faz algumas semanas. Acontece de vez em quando', C: 'Faz um bom tempo. Quando acontece é surpresa', D: 'Quase nunca. Minha curiosidade anda meio quieta' },
  11: { A: 'Não. Sou a mesma pessoa de sempre', B: 'Talvez, mas não vejo uma diferença grande', C: 'Sim. Antes isso funcionava melhor em mim', D: 'Com certeza. E sinto falta dessa pessoa' },
  12: { A: 'Sim. Topo e estou curioso pra tentar', B: 'Provavelmente sim. Depende de ver como funciona', C: 'Talvez. Preciso achar que vale o esforço', D: 'Tenho dúvidas. Quero ver resultado antes de me comprometer' }
};

const PESO_RESPOSTA = { A: 'positivo', B: 'moderado', C: 'negativo', D: 'critico' };

export const LABELS_QUALIFICACAO = {
  trabalho: { A: 'Sim, ativamente', B: 'Empreendedor/freelancer', C: 'Aposentado recentemente', D: 'Afastado/em transição' },
  incomodo:  { A: 'Constrangimento social (esquecer nomes)', B: 'Performance profissional', C: 'Sensação de envelhecer', D: 'Não ser o exemplo que quero ser' }
};

export function enriquecerRespostas(respostas, tempos) {
  return respostas.map((r, idx) => {
    const q   = TEXTOS_PERGUNTAS[r.perguntaId] || {};
    const opt = TEXTOS_OPCOES[r.perguntaId]    || {};
    return {
      perguntaId:     r.perguntaId,
      dimensao:       q.label  || '—',
      texto_pergunta: q.texto  || '',
      opcaoKey:       r.opcaoKey,
      texto_opcao:    opt[r.opcaoKey] || '',
      peso_resposta:  PESO_RESPOSTA[r.opcaoKey] || 'moderado',
      scores:         r.scores,
      dwell_ms:       tempos[idx] ?? null,
      dwell_segundos: tempos[idx] != null ? Math.round(tempos[idx] / 1000) : null
    };
  });
}

function mediana(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function coefVariacao(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  if (mean === 0) return 0;
  const variance = arr.reduce((acc, v) => acc + (v - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance) / mean;
}

export function calcularAnalise(respostas_ricas, tempos) {
  const validos = tempos.filter(t => t != null && t > 0);
  if (validos.length < 3) {
    return { dados_insuficientes: true };
  }

  const total_ms  = validos.reduce((a, b) => a + b, 0);
  const media_ms  = total_ms / validos.length;
  const med_ms    = mediana(validos);
  const cv        = coefVariacao(validos);

  const primeiro_terco = tempos.slice(0, 4).filter(t => t > 0);
  const ultimo_terco   = tempos.slice(8).filter(t => t > 0);
  const media_inicio   = primeiro_terco.reduce((a, b) => a + b, 0) / (primeiro_terco.length || 1);
  const media_fim      = ultimo_terco.reduce((a, b) => a + b, 0)   / (ultimo_terco.length || 1);

  let padrao_engajamento;
  if (cv > 1.0)                          padrao_engajamento = 'erratico';
  else if (cv < 0.4)                     padrao_engajamento = 'consistente';
  else if (media_fim > media_inicio * 1.4) padrao_engajamento = 'crescente';
  else if (media_inicio > media_fim * 1.4) padrao_engajamento = 'decrescente';
  else                                   padrao_engajamento = 'equilibrado';

  const perguntas_hesitadas = [];
  const perguntas_rapidas   = [];
  tempos.forEach((t, i) => {
    if (t == null || t <= 0) return;
    if (t > med_ms * 2.5) perguntas_hesitadas.push({ perguntaId: i + 1, dwell_s: Math.round(t / 1000), dimensao: TEXTOS_PERGUNTAS[i + 1]?.label || '—' });
    if (t < med_ms * 0.35) perguntas_rapidas.push({ perguntaId: i + 1, dwell_s: Math.round(t / 1000), dimensao: TEXTOS_PERGUNTAS[i + 1]?.label || '—' });
  });

  const sinais_de_luta = respostas_ricas
    .filter(r => (r.peso_resposta === 'negativo' || r.peso_resposta === 'critico') && r.dwell_ms > med_ms * 1.8)
    .map(r => ({ perguntaId: r.perguntaId, dimensao: r.dimensao, dwell_s: r.dwell_segundos, opcao: r.opcaoKey }));

  let coerentes = 0;
  respostas_ricas.forEach(r => {
    if (r.dwell_ms == null) return;
    const longo  = r.dwell_ms > med_ms * 1.2;
    const negat  = r.peso_resposta === 'negativo' || r.peso_resposta === 'critico';
    const posit  = r.peso_resposta === 'positivo' || r.peso_resposta === 'moderado';
    if ((negat && longo) || (posit && !longo)) coerentes++;
  });
  const coerencia_score = Math.round((coerentes / respostas_ricas.length) * 100);

  let ritmo_geral;
  if (total_ms < 60000)  ritmo_geral = 'muito_rapido';
  else if (total_ms < 180000) ritmo_geral = 'rapido';
  else if (total_ms < 360000) ritmo_geral = 'reflexivo';
  else                   ritmo_geral = 'muito_cuidadoso';

  const resumo = _gerarResumoBehavioral(perguntas_hesitadas, sinais_de_luta, padrao_engajamento, ritmo_geral);

  return {
    tempo_total_segundos:           Math.round(total_ms / 1000),
    tempo_total_minutos:            parseFloat((total_ms / 60000).toFixed(1)),
    tempo_medio_por_pergunta_s:     Math.round(media_ms / 1000),
    ritmo_geral,
    padrao_engajamento,
    coeficiente_variacao:           parseFloat(cv.toFixed(2)),
    perguntas_hesitadas,
    perguntas_rapidas,
    sinais_de_luta,
    coerencia_score,
    resumo_comportamental: resumo
  };
}

function _gerarResumoBehavioral(hesitadas, lutas, padrao, ritmo) {
  const partes = [];

  if (ritmo === 'muito_rapido') {
    partes.push('Respondeu em menos de 1 minuto — ritmo de quem está testando ou com pressa.');
  } else if (ritmo === 'muito_cuidadoso') {
    partes.push('Levou mais de 6 minutos — perfil altamente reflexivo ou com resistência a algumas perguntas.');
  }

  if (hesitadas.length > 0) {
    const dims = [...new Set(hesitadas.map(h => h.dimensao))].join(' e ');
    partes.push(`Hesitou significativamente nas perguntas de ${dims} — sinal de que essas áreas tocaram um ponto real.`);
  }

  if (lutas.length > 0) {
    const dims = [...new Set(lutas.map(l => l.dimensao))].join(' e ');
    partes.push(`Confirmação de dor real em ${dims}: resposta negativa com tempo longo.`);
  }

  if (padrao === 'crescente') {
    partes.push('Ficou mais engajado conforme o quiz avançou.');
  } else if (padrao === 'erratico') {
    partes.push('Ritmo errático — pode indicar ansiedade ou ambiente com interrupções.');
  } else if (padrao === 'consistente') {
    partes.push('Ritmo muito consistente — perfil metódico.');
  }

  return partes.join(' ') || 'Padrão de resposta dentro do esperado.';
}

export function gerarInsights(perfil, analise) {
  const { pctM, pctF, pctC, pctI, nivel_consciencia, prontidao_score, fingerprint_key, fingerprint_group } = perfil;

  const dims = [
    { key: 'M', label: 'Memória',      pct: pctM },
    { key: 'F', label: 'Foco',         pct: pctF },
    { key: 'C', label: 'Criatividade', pct: pctC },
    { key: 'I', label: 'Identidade',   pct: pctI }
  ].filter(d => d.pct != null);

  dims.sort((a, b) => a.pct - b.pct);
  const mais_fraca   = dims[0];
  const mais_forte   = dims[dims.length - 1];
  const qtd_baixas   = dims.filter(d => d.pct < 40).length;
  const qtd_medias   = dims.filter(d => d.pct >= 40 && d.pct < 70).length;

  const urgencia = qtd_baixas >= 3 ? 'alta' : qtd_baixas >= 2 ? 'media' : 'baixa';

  let proximo_produto_ideal;
  if (urgencia === 'alta' && nivel_consciencia === 'A') proximo_produto_ideal = 'programa-completo';
  else if (urgencia === 'alta')                         proximo_produto_ideal = 'programa-basico';
  else if (prontidao_score >= 75)                       proximo_produto_ideal = 'programa-avancado';
  else                                                  proximo_produto_ideal = 'programa-basico';

  let nivel_nurturing;
  if (nivel_consciencia === 'A' && urgencia === 'alta')  nivel_nurturing = 'minimo';
  else if (nivel_consciencia === 'A')                    nivel_nurturing = 'baixo';
  else if (nivel_consciencia === 'M')                    nivel_nurturing = 'medio';
  else                                                   nivel_nurturing = 'alto';

  let trigger_emocional;
  if (dims[0]?.key === 'I' || (analise?.sinais_de_luta || []).some(l => l.dimensao === 'Identidade')) {
    trigger_emocional = 'luto-cognitivo';
  } else if (dims[0]?.key === 'M') {
    trigger_emocional = 'medo-de-esquecer';
  } else if (dims[0]?.key === 'F') {
    trigger_emocional = 'dispersao-cronica';
  } else {
    trigger_emocional = 'perda-criativa';
  }

  const angulos_copy = {
    'BBBB': 'Sua mente não quebrou. Está operando no limite. Há um caminho de volta.',
    'BBBA': 'Você já sabe que precisa de algo diferente. A questão é: quando você começa?',
    'BBBM': 'A abertura está lá. O que falta é o primeiro passo estruturado.',
    'MMMM': 'O declínio silencioso é o mais perigoso. Você ainda não perdeu — mas está perdendo.',
    'MMMA': 'Você sabe que algo pode ser diferente. Essa consciência é o ativo mais valioso.',
    'AAAA': 'Manter isso requer intenção. A queda não avisa quando vem.',
    'AABM': 'Memória e foco intactos. Criatividade esperando ser despertada.',
  };
  const angulo_copy = angulos_copy[fingerprint_key]
    || (urgencia === 'alta'
        ? `Você não está esquecendo por causa da idade. ${mais_fraca?.label || 'Uma dimensão'} está pedindo atenção urgente.`
        : `Sua mente tem muito mais capacidade do que está usando agora.`);

  const consciencia_tag = nivel_consciencia === 'A' ? 'alta-consciencia' : nivel_consciencia === 'M' ? 'media-consciencia' : 'baixa-consciencia';
  const lookalike_tag = `${fingerprint_key}-${consciencia_tag}-${urgencia}`;

  const segmento_marketing = `${urgencia === 'alta' ? 'urgente' : urgencia === 'media' ? 'potencial' : 'manutencao'}-${mais_fraca?.label?.toLowerCase() || 'geral'}`;

  let sinal_principal = null;
  if (analise && !analise.dados_insuficientes) {
    if (analise.sinais_de_luta?.length > 0) {
      const s = analise.sinais_de_luta[0];
      sinal_principal = `Confirmação de dor real: demorou ${s.dwell_s}s na pergunta de ${s.dimensao} com resposta negativa.`;
    } else if (analise.perguntas_hesitadas?.length > 0) {
      const h = analise.perguntas_hesitadas[0];
      sinal_principal = `Hesitou ${h.dwell_s}s na pergunta de ${h.dimensao} — área de sensibilidade real.`;
    } else if (analise.ritmo_geral === 'muito_rapido') {
      sinal_principal = 'Respondeu muito rápido — lead pode estar testando ou com baixo engajamento emocional.';
    }
  }

  return {
    dimensao_critica:      mais_fraca?.label  || '—',
    dimensao_preservada:   mais_forte?.label  || '—',
    urgencia,
    nivel_nurturing,
    proximo_produto_ideal,
    trigger_emocional,
    angulo_copy,
    segmento_marketing,
    lookalike_tag,
    sinal_principal,

    resumo_perfil: `${mais_forte?.label || '—'} preservada (${mais_forte?.pct || 0}%). ${mais_fraca?.label || '—'} é onde há mais espaço para ganho (${mais_fraca?.pct || 0}%). Urgência ${urgencia}.`
  };
}
