import { fmtK, fmtVariacao } from '../lib/formatos.js';
import Barra from './Barra.jsx';
import './Divergente.css';

// A maior variação ocupa quase meia trilha; as outras ficam proporcionais a ela
const MEIA_TRILHA = 47;

/** Barras que saem do centro: para a direita o que subiu, para a esquerda o que caiu. */
export default function Divergente({ itens }) {
  const maior = Math.max(...itens.map((i) => Math.abs(i.variacao_percentual ?? 0)), 1);
  return (
    <div className="diverge">
      <div className="diverge-row diverge-axis">
        <span />
        <div className="diverge-hint"><span>← caiu</span><span>subiu →</span></div>
        <span />
      </div>
      {itens.map((item) => {
        const v = item.variacao_percentual ?? 0;
        const subiu = v > 0;
        return (
          <div className="diverge-row" key={item.codigo}>
            <div className="diverge-name">
              {item.rotulo}
              <span className="pct">{fmtK(item.inicio)} → {fmtK(item.fim)}</span>
            </div>
            <div className="diverge-track">
              <Barra className={`diverge-bar ${subiu ? 'pos' : 'neg'}`} largura={(Math.abs(v) / maior) * MEIA_TRILHA} />
            </div>
            <div className={`diverge-val${subiu ? ' pos' : ''}`}>{fmtVariacao(item.variacao_percentual)}</div>
          </div>
        );
      })}
    </div>
  );
}
