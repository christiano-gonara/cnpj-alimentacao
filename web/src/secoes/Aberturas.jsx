import Cabecalho from '../componentes/Cabecalho.jsx';
import GraficoAberturas from '../componentes/GraficoAberturas.jsx';
import Revelar from '../componentes/Revelar.jsx';
import { urlPublica } from '../lib/caminhos.js';
import { fmtGrande, fmtInteiro, fmtMoeda } from '../lib/formatos.js';

const FOTO = urlPublica('assets/foto-restaurante.jpg');

const diasNoPeriodo = (de, ate) => (Date.UTC(ate + 1, 0, 1) - Date.UTC(de, 0, 1)) / 864e5;

export default function Aberturas({ painel, filtrado }) {
  const { aberturas, resumo } = painel;
  const primeiro = aberturas[0];
  const ultimo = aberturas[aberturas.length - 1];
  const total = aberturas.reduce((soma, a) => soma + a.aberturas, 0);
  const porDia = total / diasNoPeriodo(primeiro.ano, ultimo.ano);
  // Num recorte pequeno a média diária vira "≈ 0"; por semana ainda diz alguma coisa
  const [rotuloMedia, media] = porDia >= 1 ? ['Média por dia', porDia] : ['Média por semana', porDia * 7];

  let titulo = 'Queda até 2023, retomada desde 2024.';
  if (filtrado) {
    titulo = ultimo.aberturas >= primeiro.aberturas
      ? `Mais aberturas em ${ultimo.ano} do que em ${primeiro.ano}.`
      : `Menos aberturas em ${ultimo.ano} do que em ${primeiro.ano}.`;
  }

  return (
    <section className="section band" id="aberturas">
      <div className="wrap">
        <Cabecalho numero="02" assunto="Ritmo de abertura e capital" titulo={titulo}>
          Novas empresas do setor ano a ano, de {primeiro.ano} a {ultimo.ano}, e o capital social que declaram ao abrir.
          {painel.historico_ignora_porte && ' As aberturas incluem todos os portes.'}
        </Cabecalho>

        <div className="bento aberturas">
          <Revelar como="article" className="card big">
            <div className="card-photo" style={{ '--foto': `url('${FOTO}')`, '--foto-pos': 'center' }} aria-hidden="true" />
            <div className="card-top">
              <span className="label">Empresas abertas</span>
              <span className="tag">{primeiro.ano}–{ultimo.ano}</span>
            </div>
            <div className="value">{fmtGrande(total)}</div>
            <div className="card-foot">
              <div className="detail">{fmtInteiro(total)} empresas abertas</div>
              <div className="sub">Novos CNPJs {filtrado ? 'do recorte' : 'do setor'} em cinco anos</div>
            </div>
            <dl className="big-extra big-facts">
              <div><dt>Média por ano</dt><dd>{fmtGrande(Math.round(total / aberturas.length))}</dd></div>
              <div><dt>{rotuloMedia}</dt><dd>≈ {fmtInteiro(Math.round(media))}</dd></div>
            </dl>
          </Revelar>

          <Revelar como="article" className="card chart-card area-c" atraso="1">
            <div>
              <h3>Novas empresas por ano</h3>
              <p>Empresas de alimentação fora do lar abertas a cada ano, de {primeiro.ano} a {ultimo.ano}</p>
            </div>
            <GraficoAberturas serie={aberturas} />
          </Revelar>

          <Revelar como="article" className="card indicador area-a" atraso="2">
            <div className="card-top">
              <span className="label">Capital social</span>
              <span className="tag">Mediana</span>
            </div>
            <div className="value">{resumo.capital_social_mediana != null ? fmtMoeda(resumo.capital_social_mediana) : '—'}</div>
            <div className="card-foot">
              <div className="detail">Valor mediano declarado na abertura</div>
              {resumo.capital_social_p90 != null && (
                <div className="sub">90% dos negócios abrem com até {fmtMoeda(resumo.capital_social_p90)}</div>
              )}
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
