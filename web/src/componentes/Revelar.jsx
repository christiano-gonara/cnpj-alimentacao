import { useRef } from 'react';

import { useNaTela } from '../lib/movimento.js';

/** Bloco que entra suave quando aparece na tela; as barras dentro dele crescem junto. */
export default function Revelar({ como: Tag = 'div', atraso, className = '', children, ...resto }) {
  const ref = useRef(null);
  const visto = useNaTela(ref);
  const classes = ['reveal', visto && 'in', className].filter(Boolean).join(' ');
  return (
    <Tag ref={ref} className={classes} data-delay={atraso} {...resto}>
      {children}
    </Tag>
  );
}
