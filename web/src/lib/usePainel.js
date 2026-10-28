import { useEffect, useState } from 'react';

import nacional from '../dados/painel-nacional.json';
import { buscarPainel, consulta } from './api.js';

// A API grátis do Render dorme quando fica parada. Passado este tempo sem resposta, a página
// avisa que a primeira consulta pode demorar, em vez de parecer travada.
const AVISO_DE_DEMORA_MS = 4000;

const inicial = { painel: nacional.painel, carregando: false, demorando: false, erro: null };

/**
 * Painel do recorte pedido. Sem filtro, usa o JSON gravado no build e não chama a API: a
 * página abre na hora mesmo com o servidor dormindo.
 */
export function usePainel(filtros) {
  const chave = consulta(filtros);
  const [estado, setEstado] = useState(inicial);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!chave) {
      setEstado(inicial);
      return undefined;
    }
    const controle = new AbortController();
    setEstado((e) => ({ ...e, carregando: true, demorando: false, erro: null }));
    const aviso = setTimeout(() => setEstado((e) => ({ ...e, demorando: true })), AVISO_DE_DEMORA_MS);

    buscarPainel(filtros, controle.signal)
      .then((painel) => setEstado({ painel, carregando: false, demorando: false, erro: null }))
      .catch((erro) => {
        if (erro.name !== 'AbortError') {
          setEstado((e) => ({ ...e, carregando: false, demorando: false, erro }));
        }
      })
      .finally(() => clearTimeout(aviso));

    return () => {
      controle.abort();
      clearTimeout(aviso);
    };
    // `filtros` muda de identidade a cada render; a chave é o que de fato identifica o recorte
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, tentativa]);

  return { ...estado, tentarDeNovo: () => setTentativa((n) => n + 1) };
}

export const opcoesNacionais = nacional.opcoes;
