import { useEffect, useState } from 'react';

export const reduzMovimento = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fica true na primeira vez que o elemento aparece na tela, e não volta mais. */
export function useNaTela(ref, limite = 0.15) {
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visto) return undefined;
    if (!('IntersectionObserver' in window)) {
      setVisto(true);
      return undefined;
    }
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        setVisto(true);
        observador.disconnect();
      }
    }, { threshold: limite });
    observador.observe(el);
    return () => observador.disconnect();
  }, [ref, visto, limite]);

  return visto;
}
