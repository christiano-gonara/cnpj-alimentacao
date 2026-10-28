import { useEffect, useState } from 'react';

import Filtros, { SEM_FILTRO } from './componentes/Filtros.jsx';
import Nav from './componentes/Nav.jsx';
import Rodape from './componentes/Rodape.jsx';
import { consulta } from './lib/api.js';
import { opcoesNacionais, usePainel } from './lib/usePainel.js';
import Aberturas from './secoes/Aberturas.jsx';
import Chamada from './secoes/Chamada.jsx';
import Estados from './secoes/Estados.jsx';
import Frase from './secoes/Frase.jsx';
import Hero from './secoes/Hero.jsx';
import Perfil from './secoes/Perfil.jsx';
import Sobrevivencia from './secoes/Sobrevivencia.jsx';
import nacional from './dados/painel-nacional.json';

// O recorte fica no endereço (?uf=PR&porte=MEI): dá para mandar o link de um recorte pronto.
// Valor que não existe nas opções é ignorado, em vez de virar uma consulta que falha.
function filtrosDaUrl() {
  const p = new URLSearchParams(window.location.search);
  const valido = (valor, lista) => (lista.includes(valor) ? valor : '');
  return {
    uf: valido(p.get('uf')?.toUpperCase(), opcoesNacionais.ufs),
    atividade: valido(p.get('atividade'), opcoesNacionais.atividades.map((a) => a.codigo)),
    porte: valido(p.get('porte'), opcoesNacionais.portes),
  };
}

export default function App() {
  const [filtros, setFiltros] = useState(() => ({ ...SEM_FILTRO, ...filtrosDaUrl() }));
  const { painel, tentarDeNovo, ...status } = usePainel(filtros);
  const filtrado = Object.values(filtros).some(Boolean);

  useEffect(() => {
    const busca = consulta(filtros);
    const endereco = `${window.location.pathname}${busca ? `?${busca}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', endereco);
  }, [filtros]);

  const props = { painel, filtros, filtrado };
  return (
    <>
      <Nav />
      <Hero painel={nacional.painel} />
      <Frase painel={nacional.painel} />
      <Filtros filtros={filtros} onChange={setFiltros} opcoes={opcoesNacionais} status={{ ...status, tentarDeNovo }} />
      <main className={status.carregando ? 'carregando' : undefined} aria-busy={status.carregando}>
        <Perfil {...props} />
        <Aberturas {...props} />
        <Estados {...props} />
        <Sobrevivencia {...props} />
      </main>
      <Chamada />
      <Rodape />
    </>
  );
}
