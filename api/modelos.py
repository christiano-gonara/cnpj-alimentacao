"""Formato das respostas. O FastAPI usa estas classes para validar a saída e gerar o /docs."""

from typing import Literal

from pydantic import BaseModel, Field


class Atividade(BaseModel):
    codigo: str = Field(description="CNAE principal, 7 dígitos")
    nome: str


class Municipio(BaseModel):
    codigo: str = Field(description="código de município da Receita (não é o do IBGE)")
    nome: str


class FaixaDeAnos(BaseModel):
    primeiro: int
    ultimo: int


class Opcoes(BaseModel):
    ufs: list[str]
    atividades: list[Atividade]
    portes: list[str]
    anos: FaixaDeAnos


class Resumo(BaseModel):
    empresas_ativas: int
    estabelecimentos_ativos: int
    estabelecimentos_registrados: int = Field(
        description="inclui baixados, inaptos, suspensos e nulos")
    percentual_matriz: float | None = Field(
        description="estabelecimentos ativos que são matriz, não filial")
    capital_social_mediana: float | None
    capital_social_p90: float | None = Field(
        description="90% dos estabelecimentos ativos declaram até este capital")


class AberturasNoAno(BaseModel):
    ano: int
    aberturas: int


class SaldoDoAno(BaseModel):
    ano: int
    aberturas: int
    fechamentos: int
    saldo: int


class Coorte(BaseModel):
    ano: int = Field(description="ano de abertura")
    abertos: int
    ativos: int
    fechados: int
    percentual_ativos: float


class Sobrevivencia(BaseModel):
    mediana_anos_ate_fechar: float | None = Field(
        description="entre os que já fecharam; coortes recentes ainda não tiveram tempo de "
                    "fechar tarde, então o número tende a subir com os anos")
    coortes: list[Coorte]


class ItemRanking(BaseModel):
    codigo: str | None = None
    nome: str
    total: int
    percentual: float


class Variacao(BaseModel):
    codigo: str
    nome: str
    inicio: int = Field(description="aberturas no primeiro ano do período")
    fim: int = Field(description="aberturas no último ano do período")
    variacao_percentual: float | None


class Painel(BaseModel):
    """Tudo o que o dashboard mostra, numa requisição só."""

    resumo: Resumo
    porte: list[ItemRanking]
    lideres_por: Literal["estado", "municipio"]
    lideres: list[ItemRanking]
    atividades: list[ItemRanking]
    aberturas: list[AberturasNoAno]
    variacao: list[Variacao]
    saldo: list[SaldoDoAno]
    sobrevivencia: Sobrevivencia
    historico_ignora_porte: bool = Field(
        description="aberturas, variação, saldo e sobrevivência não usam o filtro de porte: "
                    "o porte gravado é o de hoje, e quem fechou já mudou de porte")


class Palavra(BaseModel):
    palavra: str
    ocorrencias: int
