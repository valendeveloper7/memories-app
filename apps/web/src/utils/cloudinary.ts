/**
 * Inserta transformaciones de Cloudinary en una URL para servir una miniatura
 * optimizada (ancho fijo, calidad y formato automáticos). Aprovecha el CDN de
 * Cloudinary sin generar miniaturas nosotros. Si la URL no es de Cloudinary, la
 * devuelve sin tocar.
 */
export function cloudinaryThumb(url: string | undefined, width = 400): string | undefined {
  if (!url || !url.includes('/upload/')) return url;
  const transform = `w_${width},c_fill,q_auto,f_auto`;
  return url.replace('/upload/', `/upload/${transform}/`);
}
