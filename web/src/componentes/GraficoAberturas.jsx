import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';

import { fmtInteiro, fmtRotulo, fmtVariacao, variacaoPercentual } from '../lib/formatos.js';
import { reduzMovimento, useNaTela } from '../lib/movimento.js';

// Cinza para o contexto; cor só onde está a história (pico e retomada)
const CINZA = '#A7AEA9';
const VERDE = '#2E7D4F';
const TOMATE = '#D9573F';
const TEXTO = '#47524B';
const NOTA = '#66706A';

/**
 * Onde a série tem pico, piso e retomada. Vale para qualquer recorte: o pico ganha tomate,
 * e o que vem depois do piso ganha verde, se houver algo depois dele.
 */
function destaques(valores) {
  const ultimo = valores.length - 1;
  const pico = valores.indexOf(Math.max(...valores));
  const piso = valores.indexOf(Math.min(...valores));
  const retomada = (i) => piso < ultimo && i > piso;

  const notas = valores.map(() => '');
  notas[pico] = 'pico';
  if (piso !== pico) notas[piso] = 'piso';
  if (!notas[ultimo] && ultimo > 0) {
    notas[ultimo] = fmtVariacao(variacaoPercentual(valores[ultimo - 1], valores[ultimo]));
  }

  return {
    notas,
    corPonto: valores.map((_, i) => (i === pico ? TOMATE : retomada(i) ? VERDE : CINZA)),
    corRotulo: valores.map((_, i) => (i === pico ? TOMATE : retomada(i) ? VERDE : TEXTO)),
    // Entre o pico e o piso a linha desce: o rótulo vai para baixo para não cruzar a linha
    abaixo: valores.map((_, i) => i === piso || (pico < piso && i > pico && i < piso)),
    raio: valores.map((_, i) => (i === pico || i === ultimo ? 7 : 4)),
    segmentoVerde: (inicio) => piso < ultimo && inicio >= piso,
  };
}

function configuracao(anos, valores) {
  const d = destaques(valores);
  const menor = Math.min(...valores);
  const maior = Math.max(...valores);
  const folga = maior - menor || Math.max(maior, 1);

  return {
    type: 'line',
    data: {
      labels: anos,
      datasets: [{
        label: 'Aberturas',
        data: valores,
        borderWidth: 3,
        tension: 0,
        fill: false,
        segment: { borderColor: (ctx) => (d.segmentoVerde(ctx.p0DataIndex) ? VERDE : CINZA) },
        pointRadius: d.raio,
        pointHoverRadius: 8,
        pointBackgroundColor: d.corPonto,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      }],
    },
    plugins: [{
      // Rótulo direto em cada ponto: dispensa eixo Y e grade
      id: 'rotulos',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.textAlign = 'center';
        chart.getDatasetMeta(0).data.forEach((ponto, i) => {
          const y = ponto.y + (d.abaixo[i] ? 36 : -22);
          ctx.font = "700 19px 'Funnel Display', sans-serif";
          ctx.fillStyle = d.corRotulo[i];
          ctx.fillText(fmtRotulo(valores[i]), ponto.x, y);
          if (d.notas[i]) {
            ctx.font = "600 14.5px 'Figtree', sans-serif";
            ctx.fillStyle = NOTA;
            ctx.fillText(d.notas[i], ponto.x, d.abaixo[i] ? y + 20 : y - 22);
          }
        });
        ctx.restore();
      },
    }],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduzMovimento() ? false : { duration: 1200, easing: 'easeOutQuart' },
      layout: { padding: { left: 24, right: 24, top: 64, bottom: 0 } },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#16201A',
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: 'Figtree', size: 13, weight: '700' },
          bodyFont: { family: 'Figtree', size: 13 },
          displayColors: false,
          callbacks: { label: (ctx) => `${fmtInteiro(ctx.parsed.y)} aberturas` },
        },
      },
      scales: {
        x: {
          offset: true,
          grid: { display: false },
          border: { display: false },
          ticks: { font: { family: "'Funnel Display', sans-serif", size: 15, weight: '700' }, color: TEXTO },
        },
        // Folga embaixo para os rótulos que ficam sob a linha
        y: { display: false, min: Math.max(0, menor - folga * 0.8), max: maior + folga * 0.25 },
      },
    },
  };
}

/** Linha das aberturas por ano, desenhada quando entra na tela e refeita a cada recorte. */
export default function GraficoAberturas({ serie }) {
  const caixa = useRef(null);
  const canvas = useRef(null);
  const visto = useNaTela(caixa);

  useEffect(() => {
    if (!visto) return undefined;
    const anos = serie.map((p) => String(p.ano));
    const valores = serie.map((p) => p.aberturas);
    const grafico = new Chart(canvas.current, configuracao(anos, valores));
    // O canvas desenha com a fonte do momento; redesenha quando a web font chegar
    document.fonts?.ready.then(() => grafico.ctx && grafico.update('none'));
    return () => grafico.destroy();
  }, [visto, serie]);

  const descricao = serie.map((p) => `${p.ano}, ${fmtInteiro(p.aberturas)}`).join('; ');
  return (
    <div className="chart-box" ref={caixa}>
      <canvas ref={canvas} role="img" aria-label={`Aberturas por ano: ${descricao}`} />
    </div>
  );
}
