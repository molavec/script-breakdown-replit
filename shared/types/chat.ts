/**
 * Mensaje de interacción con el asistente de IA dentro del Drawer de Celda
 */
export interface BreakdownChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  imageUrl?: string;
  isGenerating?: boolean;
  timestamp?: number | string;
  cellId?: string;
  columnId?: string;
}

/**
 * Petición al endpoint de chat / generación de contenido
 */
export interface BreakdownChatRequest {
  prompt: string;
  isImage?: boolean;
  cellContext?: {
    cellId?: string;
    columnId?: string;
    columnName?: string;
    category?: string;
    sceneTitle?: string;
    sceneSetting?: string;
    shotNumber?: string;
    existingContent?: string;
  };
}

/**
 * Respuesta del endpoint de chat / generación
 */
export interface BreakdownChatResponse {
  type: 'text' | 'image' | 'error';
  text?: string;
  imageUrl?: string;
  error?: string;
}
