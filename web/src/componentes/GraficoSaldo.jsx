import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';

import { fmtInteiro, fmtK } from '../lib/formatos.js';
import { reduzMovimento, useNaTela } from '../lib/movimento.js';
import './GraficoSaldo.css';

const VERDE = '#2E7D4F';
const TOMATE = '#D9573F';
const TINTA = '#16201A';
const TEXTO = '#47524B';

function configuracao(saldo) {
  const maior = Math.max(...saldo.flatMap((a) => [a.aberturas, a.fechamentos]), 1);
  return {
    type: 'bar',
    data: {
      labels: saldo.map((a) => String(a.ano)),
      datasets: [
        { label: 'Aberturas', data: saldo.map((a) => a.aberturas), backgroundColor: VERDE },
        { label: 'Fechamentos', data: saldo.map((a) => a.fechamentos), backgroundColor: TOMATE },
      ].map((ds) => ({ ...ds, borderRadius: 6, categoryPercentage: 0.7, barPercentage: 0.9 })),
    },
    plugins: [{
      // O saldo do ano escrito acima de cada par de barras
      id: 'saldo',
      afterDatasetsDraw(chart) {
        const { ctx, scales } = chart;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = "700 14px 'Funnel Display', sans-serif";
        saldo.forEach((a, i) => {
          const topo = scales.y.getPixelForValue(Math.max(a.aberturas, a.fechamentos));
          ctx.fillStyle = a.saldo >= 0 ? TINTA : TOMATE;
          const sinal = a.saldo > 0 ? '+' : a.saldo < 0 ? '−' : '';
          ctx.fillText(`${sinal}${fmtK(Math.abs(a.saldo))}`, scales.x.getPixelForValue(i), topo - 10);
        });
        ctx.restore();
      },
    }],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduzMovimento() ? false : { duration: 1000, easing: 'easeOutQuart' },
      layout: { padding: { top: 28 } },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: TINTA,
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: 'Figtree', size: 13, weight: '700' },
          bodyFont: { family: 'Figtree', size: 13 },
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${fmtInteiro(ctx.parsed.y)}`,
            footer: (itens) => `Saldo: ${fmtInteiro(saldo[itens[0].dataIndex].saldo)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { font: { family: "'Funnel Display', sans-serif", size: 15, weight: '700' }, color: TEXTO },
        },
        y: { display: false, min: 0, max: maior * 1.1 },
      },
    },
  };
}

/** Aberturas e fechamentos lado a lado, com o saldo do ano em cima. */
export default function GraficoSaldo({ saldo }) {
  const caixa = useRef(null);
  const canvas = useRef(null);
  const visto = useNaTela(caixa);

  useEffect(() => {
    if (!visto) return undefined;
    const grafico = new Chart(canvas.current, configuracao(saldo));
    document.fonts?.ready.then(() => grafico.ctx && grafico.update('none'));
    return () => grafico.destroy();
  }, [visto, saldo]);

  const descricao = saldo
    .map((a) => `${a.ano}: ${fmtInteiro(a.aberturas)} aberturas, ${fmtInteiro(a.fechamentos)} fechamentos`)
    .join('; ');
  return (
    <>
      <div className="chart-box" ref={caixa}>
        <canvas ref={canvas} role="img" aria-label={descricao} />
      </div>
      <div className="legenda">
        <span><i style={{ background: VERDE }} />Aberturas</span>
        <span><i style={{ background: TOMATE }} />Fechamentos</span>
        <span className="legenda-nota">número em cima: saldo do ano</span>
      </div>
    </>
  );
}
