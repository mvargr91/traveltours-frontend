// ¿La imagen dibujada tiene píxeles transparentes? (revisa uno de cada 4 para ir rápido)
const tieneTransparencia = (contexto, ancho, alto) => {
  const { data } = contexto.getImageData(0, 0, ancho, alto);
  for (let i = 3; i < data.length; i += 16) {
    if (data[i] < 255) return true;
  }
  return false;
};

/**
 * Reduce una imagen en el navegador antes de subirla (fotos de celular de varios MB):
 * máximo `anchoMaximo` px de ancho y JPEG al 85 %. Un PNG solo se mantiene si tiene transparencias
 * (un PNG de una foto o de una pieza gráfica pesa varias veces más que el mismo JPEG).
 * Los GIF se suben tal cual (perderían la animación) y las imágenes ya livianas no se tocan.
 */
export const reducirImagen = (archivo, anchoMaximo = 1200) =>
  new Promise((resolve) => {
    if (archivo.type === 'image/gif') {
      resolve(archivo);
      return;
    }
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();
    imagen.onload = () => {
      URL.revokeObjectURL(url);
      if (imagen.width <= anchoMaximo && archivo.size <= 300 * 1024) {
        resolve(archivo);
        return;
      }
      const escala = Math.min(1, anchoMaximo / imagen.width);
      const lienzo = document.createElement('canvas');
      lienzo.width = Math.round(imagen.width * escala);
      lienzo.height = Math.round(imagen.height * escala);
      const contexto = lienzo.getContext('2d');
      contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
      const conTransparencia = archivo.type === 'image/png' && tieneTransparencia(contexto, lienzo.width, lienzo.height);
      if (!conTransparencia) {
        // JPEG no tiene transparencia: el fondo queda blanco en lugar de negro.
        contexto.globalCompositeOperation = 'destination-over';
        contexto.fillStyle = '#FFFFFF';
        contexto.fillRect(0, 0, lienzo.width, lienzo.height);
      }
      const tipo = conTransparencia ? 'image/png' : 'image/jpeg';
      const extension = tipo === 'image/png' ? 'png' : 'jpg';
      lienzo.toBlob(
        (blob) => resolve(blob ? new File([blob], archivo.name.replace(/\.[^.]+$/, '') + `.${extension}`, { type: tipo }) : archivo),
        tipo,
        0.85,
      );
    };
    // Si el navegador no puede leerla, se sube como está y el backend la valida.
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(archivo);
    };
    imagen.src = url;
  });
