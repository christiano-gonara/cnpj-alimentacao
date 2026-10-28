import Revelar from './Revelar.jsx';

/** Abertura de cada seção: número, assunto, título e uma frase de contexto. */
export default function Cabecalho({ numero, assunto, titulo, children }) {
  return (
    <Revelar className="section-head">
      <div>
        <span className="eyebrow"><span className="num">{numero}</span>{assunto}</span>
        <h2 className="display">{titulo}</h2>
      </div>
      <p>{children}</p>
    </Revelar>
  );
}
