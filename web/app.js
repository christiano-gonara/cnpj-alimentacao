if (window.lucide) {
  lucide.createIcons({ attrs: { 'stroke-width': 2.2 } });
}

const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Contagem do número principal
function contar(el) {
  const alvo = Number(el.dataset.count);
  const fmt = new Intl.NumberFormat('pt-BR');
  if (reduzMovimento) { el.textContent = fmt.format(alvo); return; }
  const inicio = performance.now();
  const dur = 1600;
  (function passo(t) {
    const p = Math.min((t - inicio) / dur, 1);
    el.textContent = fmt.format(Math.round(alvo * (1 - Math.pow(1 - p, 4))));
    if (p < 1) requestAnimationFrame(passo);
  })(inicio);
}

// Barras e blocos entram quando aparecem na tela
function mostrar(el) {
  el.classList.add('in');
  el.querySelectorAll('[data-w]').forEach(b => { b.style.width = b.dataset.w + '%'; });
  el.querySelectorAll('[data-count]').forEach(contar);
  if (el.querySelector('#chartAberturas')) criarGrafico();
}

const revelar = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (e.isIntersecting) { mostrar(e.target); revelar.unobserve(e.target); }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revelar.observe(el));

// Navegação: plana no topo, pílula translúcida depois de rolar
const nav = document.querySelector('.nav');
const ajustarNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
ajustarNav();
window.addEventListener('scroll', ajustarNav, { passive: true });

// Destaca na navegação a seção que está na tela
const links = [...document.querySelectorAll('.nav-links a')];
const secoes = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('section[id]').forEach(s => secoes.observe(s));

// Gráfico de área: o tempo corre da esquerda para a direita
const anos = ['2021', '2022', '2023', '2024', '2025'];
const aberturas = [356849, 282586, 268190, 284904, 315376];
// Cinza para o contexto; cor só onde está a história (pico e retomada)
const cinza = '#A7AEA9';
const corPonto = ['#D9573F', cinza, cinza, '#2E7D4F', '#2E7D4F'];
let chartAberturas = null;

function criarGrafico() {
  if (chartAberturas || !window.Chart) return;
  const canvas = document.getElementById('chartAberturas');

  chartAberturas = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: anos,
      datasets: [{
        label: 'Novas empresas',
        data: aberturas,
        borderWidth: 3,
        tension: 0,
        fill: false,
        segment: {
          borderColor: ctx => ctx.p0DataIndex >= 2 ? '#2E7D4F' : cinza
        },
        pointRadius: [7, 4, 4, 4, 7],
        pointHoverRadius: 8,
        pointBackgroundColor: corPonto,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2
      }]
    },
    plugins: [{
      // Rótulo direto em cada ponto: dispensa eixo Y e grade
      id: 'valueLabels',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const pontos = chart.getDatasetMeta(0).data;
        const notas = ['pico', '', 'piso', '', '+10,7%'];
        ctx.save();
        ctx.textAlign = 'center';
        pontos.forEach((ponto, i) => {
          const abaixo = i === 1 || i === 2;
          const y = ponto.y + (abaixo ? 30 : -18);
          ctx.font = "700 15px 'Funnel Display', sans-serif";
          ctx.fillStyle = (i === 0 || i >= 3) ? corPonto[i] : '#47524B';
          ctx.fillText(Math.round(aberturas[i] / 1000) + 'k', ponto.x, y);
          if (notas[i]) {
            ctx.font = "600 12px 'Figtree', sans-serif";
            ctx.fillStyle = '#66706A';
            ctx.fillText(notas[i], ponto.x, abaixo ? y + 16 : y - 18);
          }
        });
        ctx.restore();
      }
    }],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduzMovimento ? false : { duration: 1200, easing: 'easeOutQuart' },
      layout: { padding: { left: 20, right: 20, top: 52, bottom: 0 } },
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
          callbacks: {
            label: ctx => new Intl.NumberFormat('pt-BR').format(ctx.parsed.y) + ' novas empresas'
          }
        }
      },
      scales: {
        x: {
          offset: true,
          grid: { display: false },
          border: { display: false },
          ticks: { font: { family: "'Funnel Display', sans-serif", size: 15, weight: '700' }, color: '#47524B' }
        },
        y: { display: false, min: 200000, max: 380000 }
      }
    }
  });

  // O canvas desenha com a fonte do momento; redesenha quando a web font chegar
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => chartAberturas.update('none'));
  }
}
