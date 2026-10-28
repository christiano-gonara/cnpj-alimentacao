"""Recortes que o cliente pode pedir: onde, que tipo de negócio, que porte, que período."""

from dataclasses import dataclass

PORTES = ("MEI", "Microempresa", "Empresa de pequeno porte", "Demais", "Não informado")


@dataclass(frozen=True)
class Filtros:
    """
    Recorte da base. Campo None significa "sem filtro" naquela dimensão.

    É imutável de propósito: assim pode ser chave de cache, e a mesma pergunta não roda a
    consulta duas vezes.
    """

    uf: str | None = None
    municipio: str | None = None
    atividade: str | None = None
    porte: str | None = None

    def para_sql(self) -> tuple[str, list]:
        """
        Devolve o trecho do WHERE e os parâmetros.

        O valor do usuário nunca entra no texto do SQL, só como parâmetro '?': é isso que
        impede injeção de SQL.
        """
        colunas = {
            "uf": self.uf,
            "municipio_codigo": self.municipio,
            "atividade_codigo": self.atividade,
            "porte": self.porte,
        }
        usados = {coluna: valor for coluna, valor in colunas.items() if valor is not None}
        trecho = " AND ".join(f"{coluna} = ?" for coluna in usados) or "TRUE"
        return trecho, list(usados.values())


@dataclass(frozen=True)
class Periodo:
    # 2026 fica de fora por padrão: a competência é de agosto, então o ano está pela metade
    # e pareceria uma queda que não existe.
    ano_de: int = 2021
    ano_ate: int = 2025

    def __post_init__(self) -> None:
        if self.ano_de > self.ano_ate:
            raise ValueError("ano_de não pode ser maior que ano_ate")
