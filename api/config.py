"""Configuração da API, lida do ambiente para o mesmo código rodar local e no deploy."""

import os
from dataclasses import dataclass
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Config:
    caminho_base: Path
    # O plano grátis do Render tem 512 MB de RAM. O DuckDB respeita o limite usando disco,
    # em vez de estourar a memória e derrubar o processo.
    limite_memoria: str = "350MB"

    @classmethod
    def do_ambiente(cls) -> "Config":
        return cls(
            caminho_base=Path(os.environ.get(
                "CNPJ_BASE", RAIZ / "dados" / "api" / "base_api.parquet")),
            limite_memoria=os.environ.get("CNPJ_LIMITE_MEMORIA", cls.limite_memoria),
        )
