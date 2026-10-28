import Revelar from '../componentes/Revelar.jsx';
import { fmtInteiro } from '../lib/formatos.js';
import './Frase.css';

/** O setor resumido numa frase, com os números do Brasil inteiro. */
export default function Frase({ painel }) {
  return (
    <section className="summary">
      <Revelar className="wrap">
        <div className="summary-emojis" aria-hidden="true">
          <img className="emoji" src={`${import.meta.env.BASE_URL}assets/emoji/cerveja.png`} alt="" width="256" height="256" />
          <img className="emoji emoji-prato" src={`${import.meta.env.BASE_URL}assets/emoji/prato.png`} alt="" width="256" height="256" />
        </div>
        <p>
          “Um setor de <strong>pequenos negócios</strong>: quase dois terços são MEI, a mediana de capital é de{' '}
          <strong>R$ {fmtInteiro(Math.round(painel.resumo.capital_social_mediana / 1000))} mil</strong> e, depois do piso de 2023, as aberturas voltaram a crescer.”
        </p>
      </Revelar>
    </section>
  );
}
