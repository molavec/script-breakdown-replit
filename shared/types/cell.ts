import type { CellContentType } from './column';

/**
 * Estado de completitud o aprobación de una celda
 */
export type CellStatus = 'empty' | 'draft' | 'in_review' | 'approved';

/**
 * Elemento multimedia adjunto a una celda (imágenes, referencias, audios, storyboards generados)
 */
export interface CellMediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  title?: string;
  thumbnailUrl?: string;
  promptUsed?: string;          // Si fue generado mediante IA
  aspectRatio?: string;         // '16:9', '9:16', '1:1', '2.39:1'
  fileSize?: number;
  mimeType?: string;
  createdAt?: string;
}

/**
 * Etiqueta de entidad vinculada a una celda (ej. Personajes de la toma, utilería específica)
 */
export interface CellEntityTag {
  id: string;
  label: string;
  category?: string;
  color?: string;
}

/**
 * Metadatos asociados a la generación y asistencia con IA para una celda
 */
export interface CellAiMetadata {
  lastPrompt?: string;
  modelUsed?: string;
  generatedAt?: string;
  isGenerating?: boolean;
  version?: number;
  generationType?: 'text_completion' | 'image_generation' | 'breakdown_extraction' | 'budget_estimate';
}

/**
 * Tipo de bloque dentro de una celda.
 */
export type CellBlockType = 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'file' 
  | 'entity_tag'      // Representa un tag dentro del array de bloques
  | 'checklist_item'; // Representa un item en una lista

/**
 * Bloque individual de contenido dentro de una celda para preservar el orden
 * de elementos intercalados (ej. texto, imagen, texto).
 */
export interface CellBlock {
  id: string;
  type: CellBlockType;
  content: string;               // Texto, HTML, URL, o el nombre del tag
  metadata?: Record<string, any>; // Color de tag, id de entidad, aspectRatio, etc.
}

/**
 * Estructura de una Celda de Desglose
 * Representa la intersección entre una Toma (Fila) y una Categoría/Columna.
 */
export interface BreakdownCell {
  id: string;
  shotId?: string;
  columnId: string;
  
  // El núcleo del contenido de la celda es ahora la lista de bloques
  blocks: CellBlock[];

  // Campo estrictamente numérico para efectos de cálculo (ej. Budget)
  numericValue?: number;

  aiMetadata?: CellAiMetadata;
  status?: CellStatus;
  updatedAt?: string | number;
}
