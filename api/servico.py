"""Regras de negócio: transforma as contagens do repositório nos indicadores da API."""

from dataclasses import replace
from functools import lru_cache
from typing import Protocol

from api.filtros import PORTES, Filtros, Periodo
from api.modelos import (AberturasNoAno, Coorte, FaixaDeAnos, ItemRanking, Opcoes, Painel,
                         Palavra, Resumo, SaldoDoAno, Sobrevivencia, Variacao)

# Palavras que aparecem em quase todo nome fantasia e não dizem nada sobre o negócio.
PALAVRAS_IGNORADAS = [
    "DAS", "DOS", "COM", "PARA", "POR", "LTDA", "EIRELI", "EPP", "CIA", "COMERCIO",
    "SERVICOS", "SERVICO", "ALIMENTOS", "ALIMENTACAO", "EMPRESA", "THE",
]


class Repositorio(Protocol):
    """O que o serviço precisa do banco. Nos testes, qualquer objeto com estes métodos serve."""

    def ufs(self) -> list[str]: ...
    def atividades(self) -> list[dict]: ...
    def municipios(self, uf: str) -> list[dict]: ...
    def faixa_de_anos(self) -> dict: ...
    def resumo(self, filtros: Filtros) -> dict: ...
    def aberturas_por_ano(self, filtros: Filtros, periodo: Periodo) -> dict[int, int]: ...
    def fechamentos_por_ano(self, filtros: Filtros, periodo: Periodo) -> dict[int, int]: ...
    def coortes(self, filtros: Filtros, periodo: Periodo) -> list[dict]: ...
    def mediana_dias_ate_fechar(self, filtros: Filtros, periodo: Periodo) -> float | None: ...
    def motivos_fechamento(self, filtros: Filtros, periodo: Periodo,
                           limite: int) -> list[dict]: ...
    def empresas_ativas_por_porte(self, filtros: Filtros) -> list[dict]: ...
    def ativos_por(self, dimensao: str, filtros: Filtros, limite: int) -> list[dict]: ...
    def aberturas_inicio_e_fim_por(self, dimensao: str, filtros: Filtros, periodo: Periodo,
                                   limite: int) -> list[dict]: ...
    def palavras_nome_fantasia(self, filtros: Filtros, ignorar: list[str],
                               limite: int) -> list[dict]: ...


def _sem_porte(filtros: Filtros) -> Filtros:
    """
    O porte gravado é o de hoje: quem fecha sai do MEI e muda de porte no cadastro. Filtrar
    aberturas antigas ou fechamentos por porte contaria só os sobreviventes (das empresas
    marcadas como MEI, quase nenhuma aparece baixada). Por isso o histórico ignora o porte.
    """
    return replace(filtros, porte=None)


def _percentual(parte: int, total: int) -> float:
    return round(100 * parte / total, 1) if total else 0.0


def _ranking(linhas: list[dict]) -> list[ItemRanking]:
    return [
        ItemRanking(codigo=linha.get("codigo"), nome=linha["nome"], total=linha["total"],
                    percentual=_percentual(linha["total"], linha["total_geral"]))
        for linha in linhas
    ]


class IndicadoresServico:
    """
    Os dados não mudam enquanto a API está no ar (a base é uma foto de 2026-08), então cada
    resposta é guardada em cache pela combinação de filtros: a segunda pessoa que pedir
    "bares em SP" não espera a consulta de novo.
    """

    def __init__(self, repositorio: Repositorio) -> None:
        self._repo = repositorio

    @lru_cache(maxsize=1)
    def opcoes(self) -> Opcoes:
        return Opcoes(ufs=self._repo.ufs(), atividades=self._repo.atividades(),
                      portes=list(PORTES), anos=FaixaDeAnos(**self._repo.faixa_de_anos()))

    @lru_cache(maxsize=32)
    def municipios(self, uf: str) -> list[dict]:
        return self._repo.municipios(uf)

    @lru_cache(maxsize=512)
    def resumo(self, filtros: Filtros) -> Resumo:
        return Resumo(**self._repo.resumo(filtros))

    @lru_cache(maxsize=512)
    def aberturas(self, filtros: Filtros, periodo: Periodo) -> list[AberturasNoAno]:
        por_ano = self._repo.aberturas_por_ano(_sem_porte(filtros), periodo)
        # Ano sem nenhuma abertura não vem do banco; aparece com zero para o gráfico não
        # pular o ano.
        return [AberturasNoAno(ano=ano, aberturas=por_ano.get(ano, 0))
                for ano in range(periodo.ano_de, periodo.ano_ate + 1)]

    @lru_cache(maxsize=512)
    def saldo(self, filtros: Filtros, periodo: Periodo) -> list[SaldoDoAno]:
        filtros = _sem_porte(filtros)
        aberturas = self._repo.aberturas_por_ano(filtros, periodo)
        fechamentos = self._repo.fechamentos_por_ano(filtros, periodo)
        return [
            SaldoDoAno(ano=ano, aberturas=aberturas.get(ano, 0),
                       fechamentos=fechamentos.get(ano, 0),
                       saldo=aberturas.get(ano, 0) - fechamentos.get(ano, 0))
            for ano in range(periodo.ano_de, periodo.ano_ate + 1)
        ]

    @lru_cache(maxsize=512)
    def sobrevivencia(self, filtros: Filtros, periodo: Periodo) -> Sobrevivencia:
        filtros = _sem_porte(filtros)
        dias = self._repo.mediana_dias_ate_fechar(filtros, periodo)
        coortes = [
            Coorte(**linha, percentual_ativos=_percentual(linha["ativos"], linha["abertos"]))
            for linha in self._repo.coortes(filtros, periodo)
        ]
        return Sobrevivencia(
            mediana_anos_ate_fechar=round(dias / 365.25, 1) if dias is not None else None,
            coortes=coortes)

    @lru_cache(maxsize=512)
    def motivos_fechamento(self, filtros: Filtros, periodo: Periodo,
                           limite: int) -> list[ItemRanking]:
        return _ranking(self._repo.motivos_fechamento(_sem_porte(filtros), periodo, limite))

    @lru_cache(maxsize=512)
    def porte(self, filtros: Filtros) -> list[ItemRanking]:
        return _ranking(self._repo.empresas_ativas_por_porte(filtros))

    @lru_cache(maxsize=1024)
    def ranking(self, dimensao: str, filtros: Filtros, limite: int) -> list[ItemRanking]:
        return _ranking(self._repo.ativos_por(dimensao, filtros, limite))

    @lru_cache(maxsize=512)
    def variacao(self, dimensao: str, filtros: Filtros, periodo: Periodo,
                 limite: int) -> list[Variacao]:
        """Quem mais abriu no último ano do período e quanto isso mudou desde o primeiro."""
        itens = [
            Variacao(**linha, variacao_percentual=(
                round(100 * (linha["fim"] - linha["inicio"]) / linha["inicio"], 1)
                if linha["inicio"] else None))
            for linha in self._repo.aberturas_inicio_e_fim_por(dimensao, _sem_porte(filtros),
                                                               periodo, limite)
        ]
        return sorted(itens, key=lambda item: item.variacao_percentual or 0, reverse=True)

    @lru_cache(maxsize=512)
    def painel(self, filtros: Filtros) -> Painel:
        """
        Junta os indicadores do dashboard numa resposta só.

        Com um estado filtrado, ranking e variação por estado teriam uma linha só; nesse caso
        o recorte desce para os municípios daquele estado.
        """
        regiao = "municipio" if filtros.uf else "estado"
        periodo = Periodo()
        return Painel(
            resumo=self.resumo(filtros),
            porte=self.porte(filtros),
            lideres_por=regiao,
            lideres=self.ranking(regiao, filtros, 2),
            atividades=self.ranking("atividade", filtros, 6),
            aberturas=self.aberturas(filtros, periodo),
            variacao=self.variacao(regiao, filtros, periodo, 8),
            saldo=self.saldo(filtros, periodo),
            # Mesmo período do saldo, ao lado no dashboard: os dois cartões ficam do mesmo tamanho
            sobrevivencia=self.sobrevivencia(filtros, periodo),
            historico_ignora_porte=filtros.porte is not None,
        )

    @lru_cache(maxsize=512)
    def nomes(self, filtros: Filtros, limite: int) -> list[Palavra]:
        return [Palavra(**linha) for linha in
                self._repo.palavras_nome_fantasia(filtros, PALAVRAS_IGNORADAS, limite)]
