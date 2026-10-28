import Cabecalho from '../componentes/Cabecalho.jsx';
import GraficoSaldo from '../componentes/GraficoSaldo.jsx';
import Ranking from '../componentes/Ranking.jsx';
import Revelar from '../componentes/Revelar.jsx';
import { fmtDecimal, fmtPct, variacaoPercentual } from '../lib/formatos.js';

export default function Sobrevivencia({ painel }) {
  const { saldo, sobrevivencia } = painel;
  const { coortes, mediana_anos_ate_fechar: mediana } = sobrevivencia;
  const maisAntiga = coortes[0];

  const fechamentos = variacaoPercentual(saldo[0].fechamentos, saldo[saldo.length - 1].fechamentos);
  const periodo = `de ${saldo[0].ano} a ${saldo[saldo.length - 1].ano}`;
  const tituloSaldo = fechamentos === null
    ? `Aberturas e fechamentos ${periodo}`
    : `Os fechamentos ${fechamentos >= 0 ? 'subiram' : 'caíram'} ${fmtPct(Math.abs(fechamentos))} ${periodo}`;

  const titulo = maisAntiga
    ? `Dos abertos em ${maisAntiga.ano}, ${maisAntiga.percentual_ativos < 50 ? 'só ' : ''}${Math.round(maisAntiga.percentual_ativos)}% seguem ativos.`
    : 'Quanto tempo os negócios duram.';

  const linhas = coortes.map((c) => ({
    chave: c.ano,
    nome: `Abertos em ${c.ano}`,
    valor: fmtPct(c.percentual_ativos),
    largura: c.percentual_ativos,
  }));

  return (
    <section className="section" id="sobrevivencia">
      <div className="wrap">
        <Cabecalho numero="04" assunto="Quanto tempo duram" titulo={titulo}>
          Quantos dos negócios abertos a cada ano continuam ativos hoje, e o saldo entre aberturas e fechamentos.
          {painel.historico_ignora_porte && ' Aqui entram todos os portes.'}
        </Cabecalho>

        <div className="duo">
          <Revelar como="article" className="card chart-card">
            <div>
              <h3>{tituloSaldo}</h3>
              <p>Aberturas e fechamentos (baixas no cadastro) por ano, com o saldo em cima</p>
            </div>
            <GraficoSaldo saldo={saldo} />
          </Revelar>

          <Revelar como="article" className="card chart-card" atraso="1">
            <div>
              <h3>De cada 100 abertos, quantos seguem ativos</h3>
              <p>Por ano de abertura, na foto do cadastro de ago/2026</p>
            </div>
            <Ranking itens={linhas} compacto numerado={false} />
            {mediana != null && (
              <p className="sub">
                Entre os abertos desde {maisAntiga.ano} que já fecharam, a mediana foi de {fmtDecimal(mediana)} {mediana < 2 ? 'ano' : 'anos'} de portas abertas.
              </p>
            )}
          </Revelar>
        </div>
      </div>
    </section>
  );
}
