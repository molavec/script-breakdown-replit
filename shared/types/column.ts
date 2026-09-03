/**
 * Categorías estándar de desglose cinematográfico (Script Breakdown Categories)
 */
export type BreakdownCategory =
  | 'script'          // Guion literario / Acción
  | 'cast'            // Personajes / Actores / Extras
  | 'camera'          // Cámara / Lentes / Ángulos / Movimiento
  | 'lighting'        // Iluminación / Esquemas de luz / Grip
  | 'sound'           // Sonido directo / SFX / Foley / Microfonía
  | 'art_props'       // Arte / Utilería / Escenografía
  | 'wardrobe'        // Vestuario
  | 'makeup_hair'     // Maquillaje y Peinado
  | 'vfx'             // Efectos Visuales (CGI / Chroma)
  | 'sfx'             // Efectos Especiales Físicos (Lluvia, humo, explosiones)
  | 'stunts'          // Especialistas / Dobles de acción
  | 'vehicles'        // Vehículos en escena (Picture cars)
  | 'locations'       // Locaciones / Permisos / Set notes
  | 'budget'          // Presupuesto / Costos estimados
  | 'storyboard'      // Storyboard / Concept visual / IA Images
  | 'notes'           // Notas generales de dirección o producción
  | 'custom';         // Columna personalizada

/**
 * Tipos de contenido/renderizado para una celda
 */
export type CellContentType =
  | 'text'            // Editor de texto (texto, rich text, mixed)
  | 'media'           // Uploader/visor visual (imágenes, video)
  | 'tags'            // Multiselect/input de etiquetas
  | 'number';         // Input numérico directo / formateado

/**
 * Opciones de configuración adicionales para una columna
 */
export interface ColumnOptions {
  currencyCode?: string;         // 'USD', 'EUR', etc.
  placeholder?: string;
  defaultPrompt?: string;        // Prompt base para generación con IA
  width?: number;                // Ancho en píxeles
}

/**
 * Definición de una columna en la tabla de desglose
 */
export interface BreakdownColumn {
  id: string;                    // Identificador único (ej: 'col_script', 'col_actors')
  name: string;                  // Nombre visible en la cabecera (ej: 'Literary Script')
  cellType: CellContentType;     // Tipo de contenido por defecto de la celda
  description?: string;          // Descripción o tooltip informativo
  order: number;                 // Orden posicional en la tabla
  color?: string;                // Código de color de identificación visual (badge/strip)
  isSystem?: boolean;            // Si es una columna fija del sistema o creada por usuario
  options?: ColumnOptions;       // Configuración específica de la columna
}
