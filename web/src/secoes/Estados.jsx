import Cabecalho from '../componentes/Cabecalho.jsx';
import Divergente from '../componentes/Divergente.jsx';
import Ranking from '../componentes/Ranking.jsx';
import Revelar from '../componentes/Revelar.jsx';
import { fmtInteiro } from '../lib/formatos.js';
import { ESTADOS, juntar, nomeAtividade, siglaOuNome, tituloMunicipio } from '../lib/nomes.js';

const ANO_DE = 2021;
const ANO_ATE = 2025;

// "Entre os 8 maiores estados, só GO e SC abriram mais negócios em 2025 do que em 2021"
function tituloVariacao(variacao, por) {
  const regioes = por === 'estado' ? 'estados' : 'municípios';
  const subiram = variacao.filter((v) => (v.variacao_percentual ?? 0) > 0).map((v) => siglaOuNome(v, por));
  const fim = `mais negócios em ${ANO_ATE} do que em ${ANO_DE}`;
  const n = variacao.length;
  if (subiram.length === 0) return `Entre os ${n} maiores ${regioes}, nenhum abriu ${fim}`;
  if (subiram.length === n) return `Os ${n} maiores ${regioes} abriram ${fim}`;
  return `Entre os ${n} maiores ${regioes}, só ${juntar(subiram)} ${subiram.length === 1 ? 'abriu' : 'abriram'} ${fim}`;
}

export default function Estados({ painel, filtrado }) {
  const { variacao, atividades, lideres_por: por } = painel;
  const regioes = por === 'estado' ? 'estados' : 'municípios';
  const lider = atividades[0]?.total ?? 1;

  const linhasVariacao = variacao.map((v) => ({
    ...v,
    rotulo: por === 'estado' ? `${ESTADOS[v.codigo] ?? v.codigo} (${v.codigo})` : tituloMunicipio(v.nome),
  }));
  const ranking = atividades.slice(0, 5).map((a) => ({
    chave: a.codigo,
    nome: nomeAtividade(a.codigo),
    valor: fmtInteiro(a.total),
    largura: (100 * a.total) / lider,
  }));

  return (
    <section className="section band" id="estados">
      <div className="wrap">
        <Cabecalho numero="03" assunto={por === 'estado' ? 'Estados e atividades' : 'Municípios e atividades'} titulo="Onde abre mais, e o que abre.">
          Variação das aberturas nos maiores {regioes} e os tipos de negócio que dominam {filtrado ? 'o recorte' : 'o setor'}.
        </Cabecalho>

        <div className="duo">
          <Revelar como="article" className="card chart-card">
            {variacao.length ? (
              <>
                <div>
                  <h3>{tituloVariacao(variacao, por)}</h3>
                  <p>Variação das aberturas de {ANO_DE} para {ANO_ATE}, nos {variacao.length} {regioes} com mais aberturas em {ANO_ATE}</p>
                </div>
                <Divergente itens={linhasVariacao} />
              </>
            ) : (
              <div><h3>Sem aberturas para comparar neste recorte</h3><p>Nenhuma abertura em {ANO_DE} ou {ANO_ATE}.</p></div>
            )}
          </Revelar>

          <Revelar como="article" className="card chart-card" atraso="1">
            <div>
              <h3>{filtrado ? 'Os tipos de negócio que lideram o recorte' : 'Lanchonetes, restaurantes e delivery lideram com folga'}</h3>
              <p>Empresas ativas por tipo de negócio; barras proporcionais ao líder</p>
            </div>
            <Ranking itens={ranking} />
          </Revelar>
        </div>
      </div>
    </section>
  );
}
