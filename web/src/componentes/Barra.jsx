/** Barra que cresce até `largura` (em %) quando o bloco em volta entra na tela. */
export default function Barra({ como: Tag = 'b', largura, className = '', style, children, ...resto }) {
  return (
    <Tag className={`cresce ${className}`.trim()} style={{ '--w': `${largura}%`, ...style }} {...resto}>
      {children}
    </Tag>
  );
}
