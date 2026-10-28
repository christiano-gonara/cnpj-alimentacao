"""
03_base_api.py — Gera a base enxuta que a API consulta.

Lê base_afl.parquet e grava dados/api/base_api.parquet só com as colunas que os endpoints
usam. Ficam de fora razão social, logradouro, número, CEP e CNPJ completo: a API só devolve
agregados, e boa parte dos MEI tem o nome e o endereço de casa do titular nesses campos.
"""

from pathlib import Path

import duckdb

RAIZ = Path(__file__).resolve().parents[1]
ORIGEM = RAIZ / "dados" / "tratados" / "base_afl.parquet"
DESTINO = RAIZ / "dados" / "api" / "base_api.parquet"


def main() -> None:
    if not ORIGEM.exists():
        raise FileNotFoundError(f"base tratada não encontrada: {ORIGEM} (rode o 02 antes)")
    DESTINO.parent.mkdir(parents=True, exist_ok=True)

    con = duckdb.connect()
    con.execute("SET memory_limit = '4GB'")
    # Ordenar por UF e município deixa as linhas de um mesmo lugar juntas no Parquet: um
    # filtro por estado lê só os blocos daquele estado em vez do arquivo inteiro.
    con.execute(f"""
        COPY (
            SELECT
                cnpj_basico,
                matriz_filial,
                nome_fantasia,
                situacao,
                data_inicio,
                ano_inicio,
                -- data_situacao de uma empresa baixada é a data em que ela fechou
                CASE WHEN situacao = 'Baixada' THEN data_situacao END     AS data_fechamento,
                CASE WHEN situacao = 'Baixada' THEN year(data_situacao) END
                                                                          AS ano_fechamento,
                CASE WHEN situacao = 'Baixada' THEN motivo_situacao END   AS motivo_fechamento,
                cnae_principal                                            AS atividade_codigo,
                cnae_descricao                                            AS atividade,
                bairro,
                municipio_codigo,
                municipio,
                uf,
                natureza_juridica_desc                                    AS natureza_juridica,
                -- Bases geradas antes da correção do 02 têm o capital como texto com
                -- vírgula; passar por VARCHAR converte as duas versões do mesmo jeito.
                try_cast(replace(CAST(capital_social AS VARCHAR), ',', '.')
                         AS DECIMAL(18, 2))                               AS capital_social,
                -- MEI é regime tributário, não porte; para quem lê, porém, é uma categoria
                -- de tamanho, então ele substitui o porte quando a empresa é MEI.
                CASE WHEN mei = 'MEI' THEN 'MEI' ELSE porte END           AS porte
            FROM read_parquet('{ORIGEM}')
            ORDER BY uf, municipio_codigo
        ) TO '{DESTINO}' (FORMAT PARQUET, COMPRESSION ZSTD)
    """)

    linhas, tamanho = con.execute(
        f"SELECT count(*) FROM read_parquet('{DESTINO}')"
    ).fetchone()[0], DESTINO.stat().st_size
    print(f"base_api.parquet  {linhas:>12,} linhas | {tamanho / 1e6:.0f} MB")


if __name__ == "__main__":
    main()
