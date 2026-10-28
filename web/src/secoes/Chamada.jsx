import { BadgeCheck, Database, Download, Zap } from 'lucide-react';

import Revelar from '../componentes/Revelar.jsx';
import './Chamada.css';

const PASSOS = [
  [Database, '10 partes nacionais', 'Empresas e Estabelecimentos completos'],
  [BadgeCheck, 'MEI pelo Simples Nacional', 'o porte padrão da Receita não o identifica'],
  [Zap, 'DuckDB + Parquet', '72,8 milhões de linhas sem estourar a memória'],
];

/** Chamada final: como a base foi feita e onde baixar. */
export default function Chamada() {
  return (
    <section>
      <div className="wrap">
        <Revelar className="cta">
          <div>
            <h2 className="display">Dados abertos. <span>A base tratada também.</span></h2>
            <p>O cadastro nacional da Receita Federal, filtrado para alimentação fora do lar e pronto para análise em Parquet.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="https://github.com/christiano-gonara/cnpj-alimentacao/releases/latest" target="_blank" rel="noopener">
                <Download strokeWidth={2.2} />Baixar base (Parquet)
              </a>
              <a className="btn btn-ghost" href="https://github.com/christiano-gonara/cnpj-alimentacao" target="_blank" rel="noopener">Código no GitHub</a>
            </div>
          </div>
          <ol className="cta-steps">
            {PASSOS.map(([Icone, titulo, texto]) => (
              <li key={titulo}>
                <span className="ico"><Icone strokeWidth={2.2} /></span>
                <span><strong>{titulo}</strong>{texto}</span>
              </li>
            ))}
          </ol>
        </Revelar>
      </div>
    </section>
  );
}
