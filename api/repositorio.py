"""Acesso aos dados. É a única camada que conhece o DuckDB e escreve SQL."""

import duckdb

from api.config import Config
from api.filtros import Filtros, Periodo

# Dimensões que podem virar ranking: nome público -> (coluna do código, expressão do nome).
# É uma lista fechada porque o nome da coluna entra no texto do SQL e não pode vir do usuário.
DIMENSOES = {
    "estado": ("uf", "uf"),
    "municipio": ("municipio_codigo", "any_value(municipio)"),
    "atividade": ("atividade_codigo", "any_value(atividade)"),
    "bairro": ("bairro", "bairro"),
}


class EstabelecimentoRepositorio:
    def __init__(self, config: Config) -> None:
        if not config.caminho_base.exists():
            raise FileNotFoundError(
                f"base da API não encontrada: {config.caminho_base} "
                "(gere com scripts/03_base_api.py)")
        self._con = duckdb.connect()
        self._con.execute(f"SET memory_limit = '{config.limite_memoria}'")
        self._con.execute(f"""
            CREATE VIEW base AS SELECT * FROM read_parquet('{config.caminho_base}')
        """)

    def _linhas(self, sql: str, parametros: list | None = None) -> list[dict]:
        # O FastAPI atende cada requisição numa thread. Uma conexão DuckDB não pode ser
        # usada por duas threads ao mesmo tempo; o cursor é uma conexão própria sobre o
        # mesmo banco.
        cursor = self._con.cursor()
        try:
            resultado = cursor.execute(sql, parametros or [])
            nomes = [coluna[0] for coluna in resultado.description]
            return [dict(zip(nomes, linha)) for linha in resultado.fetchall()]
        finally:
            cursor.close()

    # --- opções para os filtros ---------------------------------------------------------

    def ufs(self) -> list[str]:
        linhas = self._linhas("SELECT DISTINCT uf FROM base WHERE uf IS NOT NULL ORDER BY uf")
        return [linha["uf"] for linha in linhas]

    def atividades(self) -> list[dict]:
        return self._linhas("""
            SELECT atividade_codigo AS codigo, any_value(atividade) AS nome
            FROM base GROUP BY 1 ORDER BY 2
        """)

    def municipios(self, uf: str) -> list[dict]:
        return self._linhas("""
            SELECT municipio_codigo AS codigo, any_value(municipio) AS nome
            FROM base WHERE uf = ? GROUP BY 1 ORDER BY 2
        """, [uf])

    def faixa_de_anos(self) -> dict:
        return self._linhas("""
            SELECT min(ano_inicio) AS primeiro, max(ano_inicio) AS ultimo FROM base
        """)[0]

    # --- indicadores --------------------------------------------------------------------

    def resumo(self, filtros: Filtros) -> dict:
        trecho, parametros = filtros.para_sql()
        return self._linhas(f"""
            SELECT
                count(DISTINCT cnpj_basico) FILTER (WHERE situacao = 'Ativa') AS empresas_ativas,
                count(*) FILTER (WHERE situacao = 'Ativa')                  AS estabelecimentos_ativos,
                count(*)                                                    AS estabelecimentos_registrados,
                round(100 * avg((matriz_filial = 'Matriz')::INTEGER)
                    FILTER (WHERE situacao = 'Ativa'), 1)                   AS percentual_matriz,
                median(capital_social) FILTER (WHERE situacao = 'Ativa')    AS capital_social_mediana,
                quantile_disc(capital_social, 0.9)
                    FILTER (WHERE situacao = 'Ativa')                       AS capital_social_p90
            FROM base WHERE {trecho}
        """, parametros)[0]

    def aberturas_por_ano(self, filtros: Filtros, periodo: Periodo) -> dict[int, int]:
        return self._contagem_por_ano("ano_inicio", filtros, periodo)

    def fechamentos_por_ano(self, filtros: Filtros, periodo: Periodo) -> dict[int, int]:
        return self._contagem_por_ano("ano_fechamento", filtros, periodo)

    def _contagem_por_ano(self, coluna_ano: str, filtros: Filtros,
                          periodo: Periodo) -> dict[int, int]:
        trecho, parametros = filtros.para_sql()
        linhas = self._linhas(f"""
            SELECT {coluna_ano} AS ano, count(*) AS total
            FROM base
            WHERE {trecho} AND {coluna_ano} BETWEEN ? AND ?
            GROUP BY 1
        """, [*parametros, periodo.ano_de, periodo.ano_ate])
        return {linha["ano"]: linha["total"] for linha in linhas}

    def coortes(self, filtros: Filtros, periodo: Periodo) -> list[dict]:
        """Para cada ano de abertura, quantos seguem ativos e quantos já fecharam hoje."""
        trecho, parametros = filtros.para_sql()
        return self._linhas(f"""
            SELECT
                ano_inicio                                    AS ano,
                count(*)                                      AS abertos,
                count(*) FILTER (WHERE situacao = 'Ativa')    AS ativos,
                count(*) FILTER (WHERE situacao = 'Baixada')  AS fechados
            FROM base
            WHERE {trecho} AND ano_inicio BETWEEN ? AND ?
            GROUP BY 1 ORDER BY 1
        """, [*parametros, periodo.ano_de, periodo.ano_ate])

    def mediana_dias_ate_fechar(self, filtros: Filtros, periodo: Periodo) -> float | None:
        trecho, parametros = filtros.para_sql()
        # Há poucos registros com fechamento anterior à abertura (erro de cadastro): saem
        # da conta para não puxar a mediana para baixo.
        return self._linhas(f"""
            SELECT median(date_diff('day', data_inicio, data_fechamento)) AS dias
            FROM base
            WHERE {trecho} AND ano_inicio BETWEEN ? AND ?
              AND data_fechamento >= data_inicio
        """, [*parametros, periodo.ano_de, periodo.ano_ate])[0]["dias"]

    def motivos_fechamento(self, filtros: Filtros, periodo: Periodo,
                           limite: int) -> list[dict]:
        trecho, parametros = filtros.para_sql()
        return self._linhas(f"""
            SELECT
                motivo_fechamento        AS nome,
                count(*)                 AS total,
                sum(count(*)) OVER ()    AS total_geral
            FROM base
            WHERE {trecho} AND ano_fechamento BETWEEN ? AND ?
            GROUP BY 1 ORDER BY 2 DESC LIMIT ?
        """, [*parametros, periodo.ano_de, periodo.ano_ate, limite])

    def empresas_ativas_por_porte(self, filtros: Filtros) -> list[dict]:
        # Porte é atributo da empresa, não do estabelecimento: conta cada CNPJ básico uma vez.
        trecho, parametros = filtros.para_sql()
        return self._linhas(f"""
            SELECT
                porte                                   AS nome,
                count(DISTINCT cnpj_basico)             AS total,
                sum(count(DISTINCT cnpj_basico)) OVER () AS total_geral
            FROM base
            WHERE {trecho} AND situacao = 'Ativa'
            GROUP BY 1 ORDER BY 2 DESC
        """, parametros)

    def ativos_por(self, dimensao: str, filtros: Filtros, limite: int) -> list[dict]:
        coluna, nome = DIMENSOES[dimensao]
        trecho, parametros = filtros.para_sql()
        # total_geral é calculado antes do LIMIT, então o percentual é sobre o recorte todo
        # e não só sobre as linhas que aparecem no ranking.
        return self._linhas(f"""
            SELECT
                {coluna}               AS codigo,
                {nome}                 AS nome,
                count(*)               AS total,
                sum(count(*)) OVER ()  AS total_geral
            FROM base
            WHERE {trecho} AND situacao = 'Ativa' AND {coluna} IS NOT NULL
            GROUP BY 1 ORDER BY 3 DESC, 2 LIMIT ?
        """, [*parametros, limite])

    def aberturas_inicio_e_fim_por(self, dimensao: str, filtros: Filtros, periodo: Periodo,
                                   limite: int) -> list[dict]:
        """Aberturas no primeiro e no último ano do período, nos maiores do último ano."""
        coluna, nome = DIMENSOES[dimensao]
        trecho, parametros = filtros.para_sql()
        return self._linhas(f"""
            SELECT
                {coluna}                                              AS codigo,
                {nome}                                                AS nome,
                count(*) FILTER (WHERE ano_inicio = ?)                AS inicio,
                count(*) FILTER (WHERE ano_inicio = ?)                AS fim
            FROM base
            WHERE {trecho} AND ano_inicio IN (?, ?) AND {coluna} IS NOT NULL
            GROUP BY 1 ORDER BY 4 DESC, 1 LIMIT ?
        """, [periodo.ano_de, periodo.ano_ate, *parametros, periodo.ano_de, periodo.ano_ate,
              limite])

    def palavras_nome_fantasia(self, filtros: Filtros, ignorar: list[str],
                               limite: int) -> list[dict]:
        trecho, parametros = filtros.para_sql()
        # Pontuação e números viram espaço antes de quebrar o nome em palavras, para
        # "LANCHES-DO-ZE" e "LANCHES DO ZE" contarem igual.
        return self._linhas(f"""
            WITH palavras AS (
                SELECT unnest(string_split_regex(
                    trim(regexp_replace(upper(nome_fantasia), '[^A-ZÀ-Ü]+', ' ', 'g')),
                    ' ')) AS palavra
                FROM base
                WHERE {trecho} AND situacao = 'Ativa' AND nome_fantasia IS NOT NULL
            )
            SELECT palavra, count(*) AS ocorrencias
            FROM palavras
            WHERE length(palavra) >= 3 AND NOT list_contains(?, palavra)
            GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT ?
        """, [*parametros, ignorar, limite])
