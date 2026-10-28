"""Testes de ponta a ponta: requisição HTTP -> serviço -> DuckDB sobre a base de teste."""


def test_resumo_conta_empresa_uma_vez_e_estabelecimentos_separados(cliente):
    resposta = cliente.get("/indicadores/resumo").json()
    assert resposta == {"empresas_ativas": 3, "estabelecimentos_ativos": 4,
                        "estabelecimentos_registrados": 7, "percentual_matriz": 75.0,
                        "capital_social_mediana": 3000.0, "capital_social_p90": 20000.0}


def test_filtros_se_combinam(cliente):
    assert cliente.get("/indicadores/resumo?uf=sp").json()["estabelecimentos_ativos"] == 3
    resposta = cliente.get("/indicadores/resumo?uf=SP&porte=MEI").json()
    assert (resposta["empresas_ativas"], resposta["estabelecimentos_ativos"],
            resposta["estabelecimentos_registrados"]) == (1, 2, 3)


def test_aberturas_preenche_ano_sem_abertura_com_zero(cliente):
    resposta = cliente.get("/indicadores/aberturas").json()
    assert resposta == [{"ano": 2021, "aberturas": 3}, {"ano": 2022, "aberturas": 1},
                        {"ano": 2023, "aberturas": 2}, {"ano": 2024, "aberturas": 1},
                        {"ano": 2025, "aberturas": 0}]


def test_saldo_e_aberturas_menos_fechamentos(cliente):
    resposta = cliente.get("/indicadores/saldo?ano_de=2021&ano_ate=2023").json()
    assert [(a["ano"], a["fechamentos"], a["saldo"]) for a in resposta] == [
        (2021, 0, 3), (2022, 1, 0), (2023, 1, 1)]


def test_sobrevivencia_por_coorte(cliente):
    resposta = cliente.get("/indicadores/sobrevivencia").json()
    assert resposta["coortes"][0] == {"ano": 2021, "abertos": 3, "ativos": 2, "fechados": 1,
                                      "percentual_ativos": 66.7}
    # fechamentos com 365 e 181 dias: mediana de 273 dias
    assert resposta["mediana_anos_ate_fechar"] == 0.7


def test_motivos_fechamento(cliente):
    assert cliente.get("/indicadores/motivos-fechamento").json() == [
        {"codigo": None, "nome": "EXTINCAO VOLUNTARIA", "total": 2, "percentual": 100.0}]


def test_porte_conta_empresas_ativas(cliente):
    resposta = cliente.get("/indicadores/porte").json()
    assert [(p["nome"], p["total"], p["percentual"]) for p in resposta] == [
        ("MEI", 2, 66.7), ("Microempresa", 1, 33.3)]


def test_ranking_de_estados(cliente):
    resposta = cliente.get("/rankings/estado").json()
    assert [(r["codigo"], r["total"], r["percentual"]) for r in resposta] == [
        ("SP", 3, 75.0), ("PR", 1, 25.0)]


def test_percentual_do_ranking_e_sobre_o_recorte_todo(cliente):
    resposta = cliente.get("/rankings/estado?limite=1").json()
    assert resposta == [{"codigo": "SP", "nome": "SP", "total": 3, "percentual": 75.0}]


def test_ranking_de_bairros_exige_municipio(cliente):
    assert cliente.get("/rankings/bairro").status_code == 422
    resposta = cliente.get("/rankings/bairro?municipio=7107").json()
    assert [(r["nome"], r["total"]) for r in resposta] == [("PINHEIROS", 2), ("CENTRO", 1)]


def test_nomes_ignora_palavras_vazias(cliente):
    resposta = cliente.get("/nomes").json()
    assert resposta == [{"palavra": "BAR", "ocorrencias": 3},
                        {"palavra": "PIZZARIA", "ocorrencias": 1},
                        {"palavra": "PRACA", "ocorrencias": 1},
                        {"palavra": "SABOR", "ocorrencias": 1}]


def test_opcoes(cliente):
    resposta = cliente.get("/opcoes").json()
    assert resposta["ufs"] == ["PR", "SP"]
    assert resposta["anos"] == {"primeiro": 2021, "ultimo": 2024}
    assert cliente.get("/opcoes/municipios?uf=sp").json() == [
        {"codigo": "7107", "nome": "SAO PAULO"}]


def test_entradas_invalidas_viram_422(cliente):
    assert cliente.get("/indicadores/resumo?uf=XYZ").status_code == 422
    assert cliente.get("/indicadores/resumo?porte=Gigante").status_code == 422
    assert cliente.get("/indicadores/resumo?municipio=1;DROP").status_code == 422
    assert cliente.get("/indicadores/aberturas?ano_de=2025&ano_ate=2020").status_code == 422
    assert cliente.get("/rankings/cep").status_code == 422


def test_variacao_entre_primeiro_e_ultimo_ano(cliente):
    resposta = cliente.get("/rankings/estado/variacao?ano_de=2021&ano_ate=2023").json()
    # SP: 3 aberturas em 2021 e nenhuma em 2023; PR: nenhuma em 2021, sem base de comparação
    assert [(v["codigo"], v["inicio"], v["fim"], v["variacao_percentual"]) for v in resposta] == [
        ("PR", 0, 2, None), ("SP", 3, 0, -100.0)]


def test_painel_desce_para_municipios_quando_ha_uf(cliente):
    nacional = cliente.get("/painel").json()
    assert nacional["lideres_por"] == "estado"
    assert nacional["resumo"]["estabelecimentos_ativos"] == 4
    assert [a["aberturas"] for a in nacional["aberturas"]] == [3, 1, 2, 1, 0]

    parana = cliente.get("/painel?uf=PR").json()
    assert parana["lideres_por"] == "municipio"
    assert [l["nome"] for l in parana["lideres"]] == ["CURITIBA"]
