"""Endpoints HTTP. Só traduzem a requisição em Filtros/Periodo e repassam ao serviço."""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from api.filtros import Filtros, Periodo
from api.modelos import (AberturasNoAno, ItemRanking, Municipio, Opcoes, Painel, Palavra,
                         Resumo, SaldoDoAno, Sobrevivencia, Variacao)
from api.servico import IndicadoresServico

rotas = APIRouter()


def servico(request: Request) -> IndicadoresServico:
    return request.app.state.servico


def filtros(
    uf: Annotated[str | None, Query(pattern="^[A-Za-z]{2}$", examples=["SP"])] = None,
    municipio: Annotated[str | None, Query(
        pattern=r"^\d{4}$", description="código da Receita, ver /opcoes/municipios")] = None,
    atividade: Annotated[str | None, Query(
        pattern=r"^\d{7}$", description="CNAE, ver /opcoes")] = None,
    porte: Annotated[Literal["MEI", "Microempresa", "Empresa de pequeno porte", "Demais",
                             "Não informado"] | None, Query()] = None,
) -> Filtros:
    return Filtros(uf=uf.upper() if uf else None, municipio=municipio,
                   atividade=atividade, porte=porte)


def periodo(
    ano_de: Annotated[int, Query(ge=1900, le=2100)] = Periodo.ano_de,
    ano_ate: Annotated[int, Query(ge=1900, le=2100)] = Periodo.ano_ate,
) -> Periodo:
    try:
        return Periodo(ano_de, ano_ate)
    except ValueError as erro:
        raise HTTPException(status_code=422, detail=str(erro)) from erro


Servico = Annotated[IndicadoresServico, Depends(servico)]
FiltrosDep = Annotated[Filtros, Depends(filtros)]
PeriodoDep = Annotated[Periodo, Depends(periodo)]
Limite = Annotated[int, Query(ge=1, le=100)]


@rotas.get("/saude", tags=["infra"])
def saude() -> dict:
    return {"status": "ok"}


@rotas.get("/opcoes", tags=["opções"])
def opcoes(s: Servico) -> Opcoes:
    """Valores aceitos em cada filtro, para montar os seletores do dashboard."""
    return s.opcoes()


@rotas.get("/opcoes/municipios", tags=["opções"])
def municipios(s: Servico,
               uf: Annotated[str, Query(pattern="^[A-Za-z]{2}$")]) -> list[Municipio]:
    return s.municipios(uf.upper())


@rotas.get("/painel", tags=["dashboard"])
def painel(s: Servico, f: FiltrosDep) -> Painel:
    """Tudo o que o dashboard mostra para um recorte, numa requisição só."""
    return s.painel(f)


@rotas.get("/indicadores/resumo", tags=["indicadores"])
def resumo(s: Servico, f: FiltrosDep) -> Resumo:
    return s.resumo(f)


@rotas.get("/indicadores/aberturas", tags=["indicadores"])
def aberturas(s: Servico, f: FiltrosDep, p: PeriodoDep) -> list[AberturasNoAno]:
    """Estabelecimentos abertos por ano."""
    return s.aberturas(f, p)


@rotas.get("/indicadores/saldo", tags=["indicadores"])
def saldo(s: Servico, f: FiltrosDep, p: PeriodoDep) -> list[SaldoDoAno]:
    """Aberturas menos fechamentos (baixas) por ano: mostra se o setor cresce ou só gira."""
    return s.saldo(f, p)


@rotas.get("/indicadores/sobrevivencia", tags=["indicadores"])
def sobrevivencia(s: Servico, f: FiltrosDep, p: PeriodoDep) -> Sobrevivencia:
    """Dos abertos em cada ano, quantos seguem ativos hoje."""
    return s.sobrevivencia(f, p)


@rotas.get("/indicadores/motivos-fechamento", tags=["indicadores"])
def motivos_fechamento(s: Servico, f: FiltrosDep, p: PeriodoDep,
                       limite: Limite = 10) -> list[ItemRanking]:
    """Motivos das baixas ocorridas no período."""
    return s.motivos_fechamento(f, p, limite)


@rotas.get("/indicadores/porte", tags=["indicadores"])
def porte(s: Servico, f: FiltrosDep) -> list[ItemRanking]:
    """Empresas ativas por porte, com MEI separado da microempresa."""
    return s.porte(f)


@rotas.get("/rankings/{dimensao}", tags=["rankings"])
def ranking(s: Servico, f: FiltrosDep,
            dimensao: Literal["estado", "municipio", "atividade", "bairro"],
            limite: Limite = 10) -> list[ItemRanking]:
    """Estabelecimentos ativos agrupados por estado, município, atividade ou bairro."""
    # O mesmo nome de bairro existe em centenas de cidades ("Centro"): somar entre elas
    # não significa nada.
    if dimensao == "bairro" and f.municipio is None:
        raise HTTPException(status_code=422,
                            detail="ranking de bairros precisa do filtro municipio")
    return s.ranking(dimensao, f, limite)


@rotas.get("/rankings/{dimensao}/variacao", tags=["rankings"])
def variacao(s: Servico, f: FiltrosDep, p: PeriodoDep,
             dimensao: Literal["estado", "municipio", "atividade"],
             limite: Limite = 8) -> list[Variacao]:
    """Os que mais abriram no último ano do período, com a variação desde o primeiro."""
    return s.variacao(dimensao, f, p, limite)


@rotas.get("/nomes", tags=["rankings"])
def nomes(s: Servico, f: FiltrosDep, limite: Limite = 20) -> list[Palavra]:
    """Palavras mais usadas no nome fantasia dos estabelecimentos ativos."""
    return s.nomes(f, limite)
