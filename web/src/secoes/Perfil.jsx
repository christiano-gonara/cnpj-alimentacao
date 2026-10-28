import Barra from '../componentes/Barra.jsx';
import BarraPorte from '../componentes/BarraPorte.jsx';
import Cabecalho from '../componentes/Cabecalho.jsx';
import Revelar from '../componentes/Revelar.jsx';
import { urlPublica } from '../lib/caminhos.js';
import { fmtGrande, fmtInteiro, fmtPct } from '../lib/formatos.js';
import { nomeRegiao, PORTES, siglaOuNome } from '../lib/nomes.js';
import './Perfil.css';

const FOTO = urlPublica('assets/foto-cozinha.jpg');

export default function Perfil({ painel, filtros, filtrado }) {
  const { resumo, porte, lideres, lideres_por: por } = painel;
  const matriz = resumo.percentual_matriz ?? 0;
  const [lider, segundo] = lideres;
  const pequenos = porte
    .filter((p) => p.nome === 'MEI' || p.nome === 'Microempresa')
    .reduce((soma, p) => soma + p.percentual, 0);

  let tituloPorte = `MEI e microempresas somam ${Math.round(pequenos)}% ${filtrado ? 'do recorte' : 'do setor'}`;
  if (filtros.porte) tituloPorte = `Recorte só com ${PORTES[filtros.porte]}`;

  return (
    <section className="section" id="perfil">
      <div className="wrap">
        <Cabecalho
          numero="01"
          assunto="Perfil do setor hoje"
          titulo={filtrado ? 'O perfil de quem está ativo no recorte.' : 'Pequenas, de um endereço só e concentradas em SP.'}
        >
          O porte, a estrutura e a localização das empresas ativas do setor.
        </Cabecalho>

        <div className="bento perfil">
          <Revelar como="article" className="card big">
            <div className="card-photo" style={{ '--foto': `url('${FOTO}')`, '--foto-pos': '70% center' }} aria-hidden="true" />
            <div className="card-top"><span className="label">Estabelecimentos</span></div>
            <div className="value">{fmtGrande(resumo.estabelecimentos_ativos)}</div>
            <div className="card-foot">
              <div className="detail">{fmtInteiro(resumo.estabelecimentos_ativos)} estabelecimentos ativos</div>
              <div className="sub">
                {matriz >= 90
                  ? `Quase toda empresa ${filtrado ? '' : 'do setor '}funciona num endereço só`
                  : `${fmtPct(matriz)} dos estabelecimentos são matriz`}
              </div>
            </div>
            <div className="big-extra">
              <div className="split-thin" role="img" aria-label={`${fmtPct(matriz)} só matriz, ${fmtPct(100 - matriz)} com filiais`}>
                <Barra como="span" largura={matriz} />
                <Barra como="span" largura={100 - matriz} />
              </div>
              <div className="split-thin-key"><span>{fmtPct(matriz)} só matriz</span><span>{fmtPct(100 - matriz)} com filiais</span></div>
            </div>
          </Revelar>

          <Revelar como="article" className="card area-a" atraso="1">
            <div className="card-top">
              <span className="label">{por === 'estado' ? 'Estado líder' : 'Município líder'}</span>
              {lider && <span className="tag">{fmtPct(lider.percentual)}</span>}
            </div>
            <div className="value">{lider ? siglaOuNome(lider, por) : '—'}</div>
            <div className="card-foot">
              <div className="detail">{lider ? `${fmtInteiro(lider.total)} empresas ativas` : 'Nenhuma empresa ativa no recorte'}</div>
              {lider && (
                <div className="sub">
                  {segundo
                    ? `${nomeRegiao(segundo, por)} vem em seguida, com ${fmtPct(segundo.percentual)}`
                    : 'É o único com empresas ativas no recorte'}
                </div>
              )}
            </div>
          </Revelar>

          <Revelar como="article" className="card chart-card area-c" atraso="2">
            <div>
              <h3>{tituloPorte}</h3>
              <p>Fatia das empresas ativas por porte, com MEI identificado pelo Simples Nacional</p>
            </div>
            <BarraPorte porte={porte} />
          </Revelar>
        </div>
      </div>
    </section>
  );
}
