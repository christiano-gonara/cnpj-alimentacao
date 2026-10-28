"""
04_painel_web.py — Grava o painel nacional em JSON para o dashboard abrir sem esperar a API.

A API no plano grátis do Render dorme depois de um tempo parada e leva quase um minuto para
acordar. O dashboard mostra estes números na hora e só chama a API quando alguém filtra.
Usa o mesmo serviço da API, então os números são exatamente os que ela devolveria.
"""

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ))

from api.config import Config  # noqa: E402
from api.filtros import Filtros  # noqa: E402
from api.repositorio import EstabelecimentoRepositorio  # noqa: E402
from api.servico import IndicadoresServico  # noqa: E402

DESTINO = RAIZ / "web" / "src" / "dados" / "painel-nacional.json"


def main() -> None:
    servico = IndicadoresServico(EstabelecimentoRepositorio(Config.do_ambiente()))
    painel = servico.painel(Filtros()).model_dump(mode="json")
    opcoes = servico.opcoes().model_dump(mode="json")
    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text(json.dumps({"painel": painel, "opcoes": opcoes}, ensure_ascii=False,
                                  indent=1) + "\n")
    print(f"painel-nacional.json  {DESTINO.stat().st_size / 1e3:.0f} KB")


if __name__ == "__main__":
    main()
