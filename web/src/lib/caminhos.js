/**
 * Endereço completo de um arquivo de public/.
 *
 * Um url() relativo dentro de variável CSS (--foto) é resolvido a partir do arquivo .css,
 * que no build fica em assets/: "./assets/foto.jpg" virava "assets/assets/foto.jpg" e dava
 * 404 no site publicado. Com o endereço completo não há o que resolver.
 */
export const urlPublica = (caminho) => new URL(`${import.meta.env.BASE_URL}${caminho}`, document.baseURI).href;
