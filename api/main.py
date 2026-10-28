"""
API do panorama de alimentação fora do lar.

Rodar local:  .venv/bin/uvicorn api.main:criar_app --factory --reload
Documentação: http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import Config
from api.repositorio import EstabelecimentoRepositorio
from api.rotas import rotas
from api.servico import IndicadoresServico


def criar_app(config: Config | None = None) -> FastAPI:
    """Monta a aplicação. Receber a Config de fora é o que deixa os testes usarem outra base."""
    config = config or Config.do_ambiente()
    app = FastAPI(
        title="Panorama CNPJ: alimentação fora do lar",
        description="Indicadores do setor a partir dos dados abertos de CNPJ da Receita "
                    "Federal (competência 2026-08). Só agregados, sem dados de pessoas.",
        version="1.0.0",
    )
    app.state.servico = IndicadoresServico(EstabelecimentoRepositorio(config))
    # Dados públicos e só leitura: qualquer origem pode consultar, inclusive o GitHub Pages.
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"])
    app.include_router(rotas)
    return app

