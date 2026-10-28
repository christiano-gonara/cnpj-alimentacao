import { ArrowDown, Flag, TrendingDown, TrendingUp } from 'lucide-react';

import Barra from '../componentes/Barra.jsx';
import Contador from '../componentes/Contador.jsx';
import Revelar from '../componentes/Revelar.jsx';
import { fmtDecimal, fmtInteiro, fmtPct, fmtVariacao, variacaoPercentual } from '../lib/formatos.js';
import { ATIVIDADES_NA_FRASE, ESTADOS } from '../lib/nomes.js';
import './Hero.css';

const asset = (nome) => `${import.meta.env.BASE_URL}assets/${nome}`;
const fmtAberturas = (n) => (n >= 1000 ? `${fmtDecimal(n / 1e3)} mil` : fmtInteiro(n));

/** Abertura da página. Sempre mostra o Brasil inteiro: é a apresentação, não o recorte. */
export default function Hero({ painel }) {
  const { resumo, porte, lideres, atividades, aberturas } = painel;
  const mei = porte.find((p) => p.nome === 'MEI')?.percentual ?? 0;
  const lider = lideres[0];
  const atividade = atividades[0];

  const ultimo = aberturas[aberturas.length - 1];
  const penultimo = aberturas[aberturas.length - 2];
  const variacao = variacaoPercentual(penultimo.aberturas, ultimo.aberturas);
  const pico = aberturas.reduce((a, b) => (b.aberturas > a.aberturas ? b : a));
  const Tendencia = variacao >= 0 ? TrendingUp : TrendingDown;

  const linhas = [
    ['São MEI', mei],
    [`Estão em ${ESTADOS[lider.codigo]}`, lider.percentual],
    [`São ${ATIVIDADES_NA_FRASE[atividade.codigo]}`, atividade.percentual],
  ];

  return (
    <header className="hero">
      <div className="wrap hero-grid">
        <div>
          <Revelar como="p" className="kicker"><span><b>Dados abertos</b> da Receita Federal · CNPJ de ago/2026</span></Revelar>

          <Revelar como="h1" className="display" atraso="1">
            Bares <img className="emoji" src={asset('emoji/cerveja.png')} alt="" width="256" height="256" /> e restaurantes{' '}
            <img className="emoji" src={asset('emoji/prato.png')} alt="" width="256" height="256" /> do Brasil, <span className="marker">em números.</span>
          </Revelar>

          <Revelar como="p" className="hero-lede" atraso="2">
            Quantos negócios de alimentação fora do lar existem, de que tamanho são, onde estão e como as aberturas evoluíram de 2021 a 2025, tudo a partir do cadastro oficial de CNPJ.
          </Revelar>

          <Revelar className="hero-actions" atraso="3">
            <a className="btn btn-primary" href="#recorte">Explorar o panorama <ArrowDown strokeWidth={2.2} /></a>
            <a className="btn btn-ghost" href="#aberturas">Ver as aberturas</a>
          </Revelar>
        </div>

        <Revelar className="hero-visual" atraso="2">
          <div className="preview">
            <div className="preview-head">
              <span>Empresas ativas hoje</span>
              <span className="live"><i />Ago/2026</span>
            </div>
            <div className="preview-number display"><Contador valor={resumo.empresas_ativas} /></div>
            <p className="preview-caption">de bares, restaurantes, lanchonetes, delivery e padarias</p>

            <div className="preview-rows">
              {linhas.map(([rotulo, pct]) => (
                <div className="preview-row" key={rotulo}>
                  <span>{rotulo}</span><em>{fmtPct(pct)}</em>
                  <div className="meter"><Barra largura={pct} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="float-chip chip-a" aria-hidden="true">
            <span className="ico"><Tendencia strokeWidth={2.2} /></span>
            <span>
              <strong>{fmtVariacao(variacao)} em {ultimo.ano}</strong>
              {variacao >= 0 ? 'retomada das aberturas' : 'queda nas aberturas'}
            </span>
          </div>
          <div className="float-chip chip-b" aria-hidden="true">
            <span className="ico"><Flag strokeWidth={2.2} /></span>
            <span><strong>Pico em {pico.ano}</strong>{fmtAberturas(pico.aberturas)} aberturas</span>
          </div>
        </Revelar>
      </div>
    </header>
  );
}
