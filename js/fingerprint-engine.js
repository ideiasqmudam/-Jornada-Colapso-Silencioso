

export const FINGERPRINT_KEYS = [
  'BBBB',
  'BBBM',
  'BBBA',
  'BMBB',
  'BMMM',
  'MBBB',
  'MBBM',
  'MMBM',
  'MMBB',
  'MMMM',
  'MMMA',
  'AMMB',
  'AMAM',
  'MABB',
  'AABM',
  'AAMM',
  'AAMA',
  'AAAM',
  'AAAA',
  'MBAM',
];

export function nivelParaChar(pct) {
  if (pct < 40) return 'B';
  if (pct < 70) return 'M';
  return 'A';
}

export function calcularFingerprintKey(pctM, pctF, pctC, pctI) {
  return (
    nivelParaChar(pctM) +
    nivelParaChar(pctF) +
    nivelParaChar(pctC) +
    nivelParaChar(pctI)
  );
}

const PCT_REPRESENTATIVO = { B: 20, M: 55, A: 85 };

export function calcularFingerprintGroup(key, pcts) {

  const exactIdx = FINGERPRINT_KEYS.indexOf(key);
  if (exactIdx !== -1) return { g: exactIdx + 1, exact: true };

  const lvl = { B: 0, M: 1, A: 2 };
  const alvo = pcts
    ? [pcts.pctM, pcts.pctF, pcts.pctC, pcts.pctI]
    : null;

  let bestIdx = 0;
  let minDist = Infinity;

  FINGERPRINT_KEYS.forEach((gKey, i) => {
    let dist = 0;
    if (alvo) {

      for (let j = 0; j < 4; j++) {
        const d = alvo[j] - PCT_REPRESENTATIVO[gKey[j]];
        dist += d * d;
      }
    } else {

      for (let j = 0; j < 4; j++) {
        dist += Math.abs(lvl[key[j]] - lvl[gKey[j]]);
      }
    }
    if (dist < minDist) {
      minDist = dist;
      bestIdx = i;
    }
  });

  return { g: bestIdx + 1, exact: false };
}
