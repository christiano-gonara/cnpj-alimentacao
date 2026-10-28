"""Testes do serviço isolado: um repositório falso no lugar do banco."""

from api.filtros import Filtros, Periodo
from api.servico import IndicadoresServico


class RepositorioFalso:
    def __init__(self) -> None:
        self.consultas = 0

    def aberturas_por_ano(self, filtros, periodo):
        self.consultas += 1
        return {2021: 5, 2023: 2}

    def fechamentos_por_ano(self, filtros, periodo):
        return {2022: 4}


def test_saldo_completa_anos_que_o_banco_nao_devolveu():
    servico = IndicadoresServico(RepositorioFalso())
    saldo = servico.saldo(Filtros(), Periodo(2021, 2023))
    assert [(a.ano, a.aberturas, a.fechamentos, a.saldo) for a in saldo] == [
        (2021, 5, 0, 5), (2022, 0, 4, -4), (2023, 2, 0, 2)]


def test_mesma_pergunta_nao_consulta_o_banco_de_novo():
    repositorio = RepositorioFalso()
    servico = IndicadoresServico(repositorio)
    servico.aberturas(Filtros(uf="SP"), Periodo())
    servico.aberturas(Filtros(uf="SP"), Periodo())
    servico.aberturas(Filtros(uf="PR"), Periodo())
    assert repositorio.consultas == 2
