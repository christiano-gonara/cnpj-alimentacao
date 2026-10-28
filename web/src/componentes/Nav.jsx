import { useEffect, useState } from 'react';

import './Nav.css';

const SECOES = [
  ['perfil', 'Perfil'],
  ['aberturas', 'Aberturas'],
  ['estados', 'Estados'],
  ['sobrevivencia', 'Sobrevivência'],
];

export default function Nav() {
  const [rolou, setRolou] = useState(false);
  const [ativa, setAtiva] = useState(null);

  // Plana no topo, pílula translúcida depois de rolar. São dois limites, não um: ao encolher,
  // o menu fica 16 px mais baixo e o navegador compensa a rolagem nesses 16 px. Com um limite
  // só, essa compensação cruzava o limite de volta e o menu ficava crescendo e encolhendo.
  useEffect(() => {
    const ajustar = () => setRolou((antes) => (antes ? window.scrollY > 16 : window.scrollY > 64));
    ajustar();
    window.addEventListener('scroll', ajustar, { passive: true });
    return () => window.removeEventListener('scroll', ajustar);
  }, []);

  // Destaca a seção que está no meio da tela
  useEffect(() => {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => e.isIntersecting && setAtiva(e.target.id));
    }, { rootMargin: '-45% 0px -50% 0px' });
    SECOES.forEach(([id]) => {
      const secao = document.getElementById(id);
      if (secao) observador.observe(secao);
    });
    return () => observador.disconnect();
  }, []);

  return (
    <nav className={`nav${rolou ? ' is-scrolled' : ''}`} aria-label="Seções do painel">
      <Marca href="#topo" />
      <ul className="nav-links">
        {SECOES.map(([id, nome]) => (
          <li key={id}>
            <a href={`#${id}`} className={ativa === id ? 'is-active' : undefined}>{nome}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Marca({ href }) {
  const conteudo = (
    <>
      <img className="brand-mark" src={`${import.meta.env.BASE_URL}assets/logo.svg`} alt="" width="34" height="34" />
      <span className="brand-text">
        <strong>Alimentação Fora do Lar</strong>
        <span>Panorama CNPJ · Receita Federal</span>
      </span>
    </>
  );
  return href
    ? <a className="brand" href={href} aria-label="Voltar ao início">{conteudo}</a>
    : <div className="brand">{conteudo}</div>;
}
