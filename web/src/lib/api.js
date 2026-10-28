// Conversa com a API. O endereço vem do build (VITE_API_URL) para trocar sem mexer no código.

const BASE = (import.meta.env.VITE_API_URL || 'https://cnpj-alimentacao-api.onrender.com').replace(/\/$/, '');

// Os dados não mudam enquanto a página está aberta: voltar a um recorte já visto é instantâneo.
const cache = new Map();

export function consulta(filtros) {
  const pares = Object.entries(filtros).filter(([, valor]) => valor);
  return new URLSearchParams(pares).toString();
}

export async function buscarPainel(filtros, sinal) {
  const chave = consulta(filtros);
  if (cache.has(chave)) return cache.get(chave);
  const resposta = await fetch(`${BASE}/painel?${chave}`, { signal: sinal });
  if (!resposta.ok) throw new Error(`a API respondeu ${resposta.status}`);
  const painel = await resposta.json();
  cache.set(chave, painel);
  return painel;
}
