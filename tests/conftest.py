"""Base minúscula com números conhecidos, para os testes não dependerem da base real."""

import duckdb
import pytest
from fastapi.testclient import TestClient

from api.config import Config
from api.main import criar_app

# (cnpj_basico, situacao, data_inicio, data_fechamento, motivo, atividade, uf, municipio,
#  bairro, porte, nome_fantasia)
LINHAS = [
    # empresa 1: matriz e filial ativas em SP; conta 1 empresa e 2 estabelecimentos
    ("1", "Ativa", "2021-03-01", None, None, "5611201", "SP", "7107", "PINHEIROS", "MEI",
     "BAR DO ZE"),
    ("1", "Ativa", "2022-05-01", None, None, "5611201", "SP", "7107", "PINHEIROS", "MEI",
     "BAR DO ZE"),
    ("2", "Ativa", "2021-07-01", None, None, "5611204", "SP", "7107", "CENTRO",
     "Microempresa", "BAR DA PRACA LTDA"),
    ("3", "Baixada", "2021-01-10", "2022-01-10", "EXTINCAO VOLUNTARIA", "5611204", "SP",
     "7107", "CENTRO", "MEI", "LANCHES-DA-ANA"),
    ("4", "Baixada", "2023-02-01", "2023-08-01", "EXTINCAO VOLUNTARIA", "5611201", "PR",
     "7535", "CENTRO", "Microempresa", "RESTAURANTE SABOR"),
    ("5", "Inapta", "2023-06-01", None, None, "5611201", "PR", "7535", "BATEL", "MEI",
     None),
    ("6", "Ativa", "2024-09-01", None, None, "5611201", "PR", "7535", "BATEL", "MEI",
     "PIZZARIA SABOR"),
]


@pytest.fixture(scope="session")
def caminho_base(tmp_path_factory):
    caminho = tmp_path_factory.mktemp("dados") / "base_api.parquet"
    con = duckdb.connect()
    con.execute("""
        CREATE TABLE base (
            cnpj_basico VARCHAR, situacao VARCHAR, data_inicio DATE, data_fechamento DATE,
            motivo_fechamento VARCHAR, atividade_codigo VARCHAR, uf VARCHAR,
            municipio_codigo VARCHAR, bairro VARCHAR, porte VARCHAR, nome_fantasia VARCHAR)
    """)
    con.executemany("INSERT INTO base VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", LINHAS)
    con.execute(f"""
        COPY (
            SELECT *,
                   year(data_inicio)                         AS ano_inicio,
                   year(data_fechamento)                     AS ano_fechamento,
                   CASE atividade_codigo WHEN '5611201' THEN 'Restaurantes e similares'
                        ELSE 'Bares sem entretenimento' END  AS atividade,
                   CASE uf WHEN 'SP' THEN 'SAO PAULO' ELSE 'CURITIBA' END AS municipio
            FROM base
        ) TO '{caminho}' (FORMAT PARQUET)
    """)
    return caminho


@pytest.fixture(scope="session")
def cliente(caminho_base):
    return TestClient(criar_app(Config(caminho_base=caminho_base)))
