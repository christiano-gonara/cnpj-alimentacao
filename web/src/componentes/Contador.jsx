import { useEffect, useRef, useState } from 'react';

import { fmtInteiro } from '../lib/formatos.js';
import { reduzMovimento, useNaTela } from '../lib/movimento.js';

const DURACAO_MS = 1600;

/** Número que conta até o valor; quando o recorte muda, conta do valor anterior até o novo. */
export default function Contador({ valor }) {
  const ref = useRef(null);
  const visto = useNaTela(ref);
  const [mostrado, setMostrado] = useState(0);
  const atual = useRef(0);

  useEffect(() => {
    if (!visto) return undefined;
    const de = atual.current;
    if (reduzMovimento()) {
      atual.current = valor;
      setMostrado(valor);
      return undefined;
    }
    const inicio = performance.now();
    let quadro;
    const passo = (agora) => {
      const p = Math.min((agora - inicio) / DURACAO_MS, 1);
      atual.current = Math.round(de + (valor - de) * (1 - (1 - p) ** 4));
      setMostrado(atual.current);
      if (p < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor, visto]);

  return <span ref={ref}>{fmtInteiro(mostrado)}</span>;
}
