import Barra from './Barra.jsx';
import './Ranking.css';

/** Lista numerada com barra. `largura` de cada item já vem em % (do líder ou do total). */
export default function Ranking({ itens, compacto = false, numerado = true }) {
  return (
    <ol className={['rank', compacto && 'compacto', !numerado && 'sem-numero'].filter(Boolean).join(' ')}>
      {itens.map((item, i) => (
        <li key={item.chave}>
          {numerado && <span className="pos">{i + 1}</span>}
          <span className="name">{item.nome}</span>
          <span className="val">{item.valor}</span>
          <span className="bar"><Barra largura={item.largura} /></span>
        </li>
      ))}
    </ol>
  );
}
