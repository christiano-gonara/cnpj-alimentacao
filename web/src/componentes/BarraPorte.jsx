import { fmtMilCurto, fmtPct } from '../lib/formatos.js';
import { PORTES } from '../lib/nomes.js';
import Barra from './Barra.jsx';
import './BarraPorte.css';

// Do maior para o menor porte em participação: o verde clareia junto com a fatia
const CORES = {
  MEI: 'var(--basil)',
  Microempresa: '#5FA578',
  'Empresa de pequeno porte': '#A9D3B7',
  Demais: '#D7E9DC',
  'Não informado': '#E5E3DB',
};

// Abaixo disso o número não cabe dentro do segmento e fica só na legenda
const MINIMO_PARA_ROTULO = 10;

/** Barra empilhada com a fatia de cada porte e a legenda embaixo. */
export default function BarraPorte({ porte }) {
  const descricao = porte.map((p) => `${PORTES[p.nome]} ${fmtPct(p.percentual)}`).join(', ');
  return (
    <div className="split">
      <div className="split-bar" role="img" aria-label={descricao}>
        {porte.map((p) => (
          <Barra como="div" key={p.nome} className="split-seg" largura={p.percentual} style={{ background: CORES[p.nome] }}>
            {p.percentual >= MINIMO_PARA_ROTULO ? fmtPct(p.percentual) : null}
          </Barra>
        ))}
      </div>
      <div className="split-key">
        {porte.map((p) => (
          <div className="split-key-item" key={p.nome}>
            <span className="swatch" style={{ background: CORES[p.nome] }} />
            <div><strong>{PORTES[p.nome]}</strong><span className="pct">{fmtMilCurto(p.total)} · {fmtPct(p.percentual)}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
