import { Github } from 'lucide-react';

import { Marca } from './Nav.jsx';
import './Rodape.css';

export default function Rodape() {
  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <Marca />
          <p style={{ marginTop: 14 }}>Bares, restaurantes e lanchonetes do Brasil, a partir do cadastro oficial de CNPJ.</p>
        </div>
        <div>
          <span className="footer-label">Autoria e dados</span>
          <p className="footer-name">Christiano Gonçalves Araujo</p>
          <p>Base pública da Receita Federal, processada com DuckDB e Parquet</p>
          <p>Fotos: Unsplash (restaurante por K8) e Wikimedia Commons (CC0)</p>
        </div>
        <div className="footer-links">
          <a className="footer-link" href="https://github.com/christiano-gonara/cnpj-alimentacao" target="_blank" rel="noopener">
            <Github strokeWidth={2.2} />Repositório no GitHub
          </a>
          <a className="footer-top" href="#topo">↑ Voltar ao topo</a>
        </div>
      </div>
    </footer>
  );
}
