# Pendências

O que falta para o dashboard funcionar com filtros no site publicado, e o que ficou para decidir.

## Para colocar a API no ar

- [ ] **Anexar a base da API à release.** O Render baixa a base de lá durante o build. Na pasta do projeto:
  ```bash
  .venv/bin/python scripts/03_base_api.py          # se dados/api/base_api.parquet ainda não existir
  gh release upload v1.0.0 dados/api/base_api.parquet
  ```
- [ ] **Criar o serviço no Render**: New > Blueprint e escolher este repositório. O `render.yaml` já tem o build, o comando de start e o health check.
- [ ] **Conferir o endereço da API.** O dashboard espera `https://cnpj-alimentacao-api.onrender.com`. Se o Render der outro nome, criar a variável `API_URL` em Settings > Variables do repositório e rodar de novo o workflow "Publicar dashboard".
- [ ] **Fazer o merge do PR do dashboard em React** (#3) e conferir um recorte no site, por exemplo `?uf=PR`.

Enquanto a API não estiver no ar, o site funciona sem filtro (usa o painel nacional gravado em JSON) e mostra um aviso quando alguém filtra.

## Base tratada

- [ ] **Regerar a base completa da release.** O `base_afl.parquet` publicado ainda tem `capital_social` como texto com vírgula. A correção já está no `02_tratamento.py`; falta rodar de novo (lê os 72 milhões de linhas) e substituir o arquivo:
  ```bash
  .venv/bin/python scripts/02_tratamento.py
  gh release upload v1.0.0 dados/tratados/base_afl.parquet --clobber
  ```

## Para decidir

- **"Empresas" ou "estabelecimentos".** Parte dos textos da visão nacional chama de empresas números que são estabelecimentos, como os 427.708 de SP e as 1.507.905 aberturas. A diferença é pequena (filiais são 2,4%), mas o texto fica impreciso. Mantive o texto original na migração para React.
- **Nomes de município sem acento** ("Sao Paulo"). A Receita grava assim. Corrigir exigiria juntar com a tabela de municípios do IBGE.
- **Emojis do hero.** Foram para os cantos do cartão, fora do título. Se a ideia for trocar por ícones (Lucide, que o site já usa), é só substituir as duas imagens.
