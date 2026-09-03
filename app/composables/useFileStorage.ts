import { ref } from 'vue';

const getUploadErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const uploadError = error as {
      data?: { statusMessage?: unknown; message?: unknown };
      statusMessage?: unknown;
      message?: unknown;
    };

    const possibleMessages = [
      uploadError.data?.statusMessage,
      uploadError.statusMessage,
      uploadError.data?.message,
      uploadError.message,
    ];
    const message = possibleMessages.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );

    if (message) {
      return message;
    }
  }

  return 'Failed to upload files';
};

export const useFileStorage = () => {
  const isUploading = ref(false);
  const uploadError = ref<string | null>(null);

  /**
   * Sube un array de archivos al endpoint de Replit App Storage.
   * Retorna un array con las URLs de los archivos subidos.
   */
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    isUploading.value = true;
    uploadError.value = null;
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await $fetch<{ urls: string[] }>('/api/upload', {
        method: 'POST',
        body: formData,
      });

      return response.urls;
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      uploadError.value = getUploadErrorMessage(err);
      throw err;
    } finally {
      isUploading.value = false;
    }
  };

  /**
   * Utilidad para convertir un string Base64 (Data URL) a un objeto File
   */
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const [metadata = '', contents] = dataurl.split(',', 2);
    if (!contents) {
      throw new Error('Invalid image data URL');
    }

    const mime = metadata.match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(contents);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  /**
   * Busca imágenes en base64 u otros blobs dentro de un string HTML.
   * Si encuentra archivos incrustados, los sube al servidor y reemplaza los `src`
   * por las URLs persistentes reales. Retorna el HTML modificado.
   */
  const processHtmlAndUploadImages = async (htmlContent: string): Promise<string> => {
    if (!htmlContent.includes('data:image') && !htmlContent.includes('blob:')) {
      // Optimizacion: si no hay data:image o blob:, no hacemos nada
      // (Asumimos que el AI Chat podría generar URLs que el usuario añade.
      // Si el bot genera blob URLs, esto también lo procesará, aunque
      // blob a File es un poco diferente. Por ahora manejaremos base64 que es
      // lo típico cuando se pega una imagen del portapapeles).
      
      // Nota: Extraer de blob: requiere un fetch. Lo implementaremos para
      // manejar ambos casos por robustez.
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const images = tempDiv.querySelectorAll('img');
    const filesToUpload: { imgElement: HTMLImageElement, file: File }[] = [];

    // Usamos un bucle for clásico para poder usar await dentro si es necesario para los blobs
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img) continue;

      if (img.src.startsWith('data:image')) {
        const ext = img.src.split(';')[0]?.split('/')[1] || 'png';
        const file = dataURLtoFile(img.src, `pasted_image_${Date.now()}_${i}.${ext}`);
        filesToUpload.push({ imgElement: img, file });
      } else if (img.src.startsWith('blob:')) {
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const ext = blob.type.split('/')[1] || 'png';
          const file = new File([blob], `blob_image_${Date.now()}_${i}.${ext}`, { type: blob.type });
          filesToUpload.push({ imgElement: img, file });
        } catch (e) {
          console.error("No se pudo obtener el blob para subir", e);
        }
      } else if (img.src.startsWith('http') && !img.src.includes(window.location.host)) {
        // Guardamos también las imágenes generadas por la IA (externas)
        // para que sus URLs no expiren.
        try {
           const response = await fetch(img.src);
           const blob = await response.blob();
           const ext = blob.type.split('/')[1] || 'png';
           const file = new File([blob], `external_image_${Date.now()}_${i}.${ext}`, { type: blob.type });
           filesToUpload.push({ imgElement: img, file });
        } catch(e) {
           console.warn("No se pudo descargar la imagen externa para guardarla en App Storage", e);
        }
      }
    }

    if (filesToUpload.length > 0) {
      try {
        const urls = await uploadFiles(filesToUpload.map(f => f.file));
        
        // Actualizamos los srcs con las nuevas URLs devueltas por el servidor
        filesToUpload.forEach((item, index) => {
          if (urls[index]) {
            item.imgElement.src = urls[index];
            // Removemos el srcset por si acaso, para evitar comportamientos raros
            item.imgElement.removeAttribute('srcset');
          }
        });
      } catch (e) {
        console.error("Falló la subida de las imágenes incrustadas", e);
      }
    }

    return tempDiv.innerHTML;
  };

  return {
    isUploading,
    uploadError,
    uploadFiles,
    processHtmlAndUploadImages
  };
};
