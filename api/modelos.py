"""Formato das respostas. O FastAPI usa estas classes para validar a saída e gerar o /docs."""

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


class Palavra(BaseModel):
    palavra: str
    ocorrencias: int
