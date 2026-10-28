// Formatos de número usados na página, todos no padrão brasileiro.

const inteiro = new Intl.NumberFormat('pt-BR');

export const fmtInteiro = (n) => inteiro.format(n);

export const fmtDecimal = (n, casas = 1) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

export const fmtPct = (n) => `${fmtDecimal(n)}%`;

// 1.543.267 -> "1,54 M"; 301.581 -> "301,6 mil"; 826 -> "826"
export function fmtGrande(n) {
  if (n >= 1e6) return `${fmtDecimal(n / 1e6, 2)} M`;
  if (n >= 1e4) return `${fmtDecimal(n / 1e3)} mil`;
  return fmtInteiro(n);
}

// Legenda curta, sempre para baixo: 953.769 -> "953 mil"
export const fmtMilCurto = (n) => (n >= 1000 ? `${fmtInteiro(Math.floor(n / 1000))} mil` : fmtInteiro(n));

// 12.570 -> "12,6k"; 986 -> "986"
export const fmtK = (n) => (n >= 1000 ? `${fmtDecimal(n / 1e3)}k` : fmtInteiro(n));

// Rótulo dos pontos do gráfico: arredonda para mil inteiro quando o número é grande
export const fmtRotulo = (n) => (n >= 1e4 ? `${Math.round(n / 1e3)}k` : fmtK(n));

export function fmtMoeda(n) {
  if (n >= 1e6) return `R$ ${fmtDecimal(n / 1e6)} mi`;
  if (n >= 1e4) return `R$ ${fmtInteiro(Math.round(n / 1e3))} mil`;
  return `R$ ${fmtInteiro(n)}`;
}

// +18,3% / −4,8% (sinal de menos de verdade, não hífen)
export function fmtVariacao(v) {
  if (v === null || v === undefined) return 'novo';
  const sinal = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${sinal}${fmtDecimal(Math.abs(v))}%`;
}

export function variacaoPercentual(de, para) {
  return de ? (100 * (para - de)) / de : null;
}
