// Nomes para leitura: a base traz siglas, códigos de CNAE e municípios em caixa alta.

export const ESTADOS = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MG: 'Minas Gerais', MS: 'Mato Grosso do Sul', MT: 'Mato Grosso', PA: 'Pará',
  PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul',
  SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins', EX: 'Exterior',
};

// Nome curto de cada CNAE do setor; a descrição oficial é longa demais para um ranking.
export const ATIVIDADES = {
  5611203: 'Lanchonetes e Sucos',
  5611201: 'Restaurantes',
  5620104: 'Delivery / Marmitas',
  5611204: 'Bares Tradicionais',
  4721102: 'Padarias com Revenda',
  5611205: 'Bares com Entretenimento',
};

export const PORTES = {
  MEI: 'MEI',
  Microempresa: 'Microempresa (ME)',
  'Empresa de pequeno porte': 'Pequeno Porte (EPP)',
  Demais: 'Demais portes',
  'Não informado': 'Não informado',
};

const MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

// "SAO JOSE DOS PINHAIS" -> "Sao Jose dos Pinhais" (a Receita grava sem acento)
export function tituloMunicipio(nome) {
  return nome
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');
}

export const nomeAtividade = (codigo) => ATIVIDADES[codigo] ?? codigo;

// Nome de uma linha de ranking regional, que pode ser estado ou município
export function nomeRegiao(item, por) {
  return por === 'estado' ? ESTADOS[item.codigo] ?? item.codigo : tituloMunicipio(item.nome);
}

export function siglaOuNome(item, por) {
  return por === 'estado' ? item.codigo : tituloMunicipio(item.nome);
}

// O mesmo tipo de negócio dentro de uma frase ("São lanchonetes")
export const ATIVIDADES_NA_FRASE = {
  5611203: 'lanchonetes',
  5611201: 'restaurantes',
  5620104: 'delivery e marmitas',
  5611204: 'bares tradicionais',
  4721102: 'padarias',
  5611205: 'bares com entretenimento',
};

// "GO e SC"; "Goiás, Santa Catarina e Paraná"
export function juntar(nomes) {
  if (nomes.length < 2) return nomes.join('');
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}
