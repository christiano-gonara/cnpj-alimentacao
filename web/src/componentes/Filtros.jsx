import { Info, LoaderCircle, RotateCcw, SlidersHorizontal } from 'lucide-react';

import { ATIVIDADES, ESTADOS, PORTES } from '../lib/nomes.js';
import './Filtros.css';

export const SEM_FILTRO = { uf: '', atividade: '', porte: '' };

function Seletor({ rotulo, valor, onChange, opcoes, todos }) {
  return (
    <label className="filtro">
      <span>{rotulo}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">{todos}</option>
        {opcoes.map(([v, nome]) => <option key={v} value={v}>{nome}</option>)}
      </select>
    </label>
  );
}

/** Seletores do recorte e o estado da consulta (carregando, demorando, erro). */
export default function Filtros({ filtros, onChange, opcoes, status }) {
  const mudar = (campo) => (valor) => onChange({ ...filtros, [campo]: valor });
  const algumFiltro = Object.values(filtros).some(Boolean);

  const estados = opcoes.ufs
    .filter((uf) => ESTADOS[uf] && uf !== 'EX')
    .map((uf) => [uf, ESTADOS[uf]])
    .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
  const atividades = opcoes.atividades.map((a) => [a.codigo, ATIVIDADES[a.codigo] ?? a.nome]);
  const portes = opcoes.portes.filter((p) => p !== 'Não informado').map((p) => [p, PORTES[p]]);

  return (
    <section className="filtros-wrap" id="recorte" aria-label="Recorte dos dados">
      <div className="wrap">
        <div className="filtros">
          <div className="filtros-titulo">
            <span className="ico"><SlidersHorizontal strokeWidth={2.2} /></span>
            <span><strong>Escolha um recorte</strong>todos os números da página acompanham</span>
          </div>
          <Seletor rotulo="Estado" valor={filtros.uf} onChange={mudar('uf')} opcoes={estados} todos="Brasil inteiro" />
          <Seletor rotulo="Tipo de negócio" valor={filtros.atividade} onChange={mudar('atividade')} opcoes={atividades} todos="Todos os tipos" />
          <Seletor rotulo="Porte" valor={filtros.porte} onChange={mudar('porte')} opcoes={portes} todos="Todos os portes" />
          <button type="button" className="btn btn-ghost filtros-limpar" onClick={() => onChange(SEM_FILTRO)} disabled={!algumFiltro}>
            <RotateCcw strokeWidth={2.2} />Limpar
          </button>
        </div>
        <Status {...status} />
        {filtros.porte && (
          <p className="filtros-status nota">
            <Info strokeWidth={2.2} />
            O porte do cadastro é o de hoje, e quem fechou já mudou de porte. Por isso aberturas, fechamentos e sobrevivência mostram todos os portes.
          </p>
        )}
      </div>
    </section>
  );
}

function Status({ carregando, demorando, erro, tentarDeNovo }) {
  if (erro) {
    return (
      <p className="filtros-status erro" role="alert">
        Não conseguimos buscar esse recorte agora. O servidor pode estar acordando; tente de novo em alguns segundos.
        <button type="button" onClick={tentarDeNovo}>Tentar de novo</button>
      </p>
    );
  }
  if (!carregando) return null;
  return (
    <p className="filtros-status" role="status">
      <LoaderCircle className="girando" strokeWidth={2.2} />
      {demorando
        ? 'Acordando o servidor, a primeira consulta leva até um minuto. As próximas são na hora.'
        : 'Buscando os números do recorte…'}
    </p>
  );
}
