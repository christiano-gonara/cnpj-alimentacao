# Alimentação Fora do Lar no Brasil — Panorama CNPJ

Análise nacional do setor de bares, restaurantes e alimentação fora do lar, usando os dados abertos de CNPJ da Receita Federal (competência 2026-08).

[**Abrir dashboard publicado**](https://christiano-gonara.github.io/cnpj-alimentacao/) · [**Ver notebook técnico**](notebooks/analise_cnpj.ipynb) · [**Baixar base tratada (Parquet)**](https://github.com/christiano-gonara/cnpj-alimentacao/releases/latest)

![Tour pelo dashboard](assets/dashboard-tour.gif)

## 📸 Capturas de tela

<table>
  <tr>
    <th>Panorama</th>
    <th>Perfil do setor</th>
  </tr>
  <tr>
    <td align="center"><img src="assets/01-panorama.png" alt="Topo do dashboard com o total de empresas ativas"></td>
    <td align="center"><img src="assets/02-perfil.png" alt="Perfil do setor: estabelecimentos, estado líder e porte"></td>
  </tr>
  <tr>
    <th>Aberturas e capital</th>
    <th>Estados e atividades</th>
  </tr>
  <tr>
    <td align="center"><img src="assets/03-aberturas.png" alt="Série de aberturas de 2021 a 2025 e capital social"></td>
    <td align="center"><img src="assets/04-estados-atividades.png" alt="Variação das aberturas por estado e ranking por tipo de negócio"></td>
  </tr>
</table>

## Perguntas respondidas

| Pergunta | Resposta |
|---|---|
| Quantas empresas do setor estão ativas hoje? | **1.511.132 empresas** ativas, em 1.543.267 estabelecimentos. |
| Como evoluiu a abertura nos últimos 5 anos? | **1.507.905 empresas abertas** entre 2021 e 2025. O pico foi em 2021 (356.849) e 2025 encerrou com 315.376 aberturas. |
| Qual é o porte predominante? | **MEI: 63,1%** das empresas ativas; Microempresa (ME): 32,2%; EPP: 3,9%. |

## Entregáveis

- [`index.html`](index.html): dashboard executivo para leitura rápida, em uma página estática.
- [`notebooks/analise_cnpj.ipynb`](notebooks/analise_cnpj.ipynb): análise técnica executada, com código, respostas e gráficos.
- [`scripts/01_ingestao.py`](scripts/01_ingestao.py) e [`scripts/02_tratamento.py`](scripts/02_tratamento.py): ingestão, limpeza, junção e geração da base.
- [`dados/amostra/amostra_base_afl.csv`](dados/amostra/amostra_base_afl.csv): amostra pública com 20 mil linhas.
- [Release](https://github.com/christiano-gonara/cnpj-alimentacao/releases/latest): base nacional completa em Parquet.

## Decisões técnicas

- Foram processadas as **10 partes nacionais** de Empresas e Estabelecimentos: uma parte isolada não cobre os cinco anos de forma confiável.
- O MEI foi identificado pela tabela do **Simples Nacional**, pois não aparece no campo de porte padrão da Receita.
- **DuckDB + Parquet** foram usados para tratar 72,8 milhões de estabelecimentos sem carregar toda a base na memória.

<details>
<summary>Como reproduzir</summary>

```bash
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python pandas duckdb matplotlib jupyter pyarrow
.venv/bin/python scripts/01_ingestao.py
.venv/bin/python scripts/02_tratamento.py
```

Os arquivos públicos devem ser baixados do [portal de dados abertos da Receita Federal](https://arquivos.receitafederal.gov.br/index.php/s/gn672Ad4CF8N6TK?dir=/Dados/Cadastros/CNPJ) para `dados/brutos/` antes de executar o pipeline.

</details>
