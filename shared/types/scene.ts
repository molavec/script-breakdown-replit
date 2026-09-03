import type { Shot } from './shot';
import type { BreakdownColumn } from './column';


/**
 * Estructura de una Escena / Tabla de Desglose (Scene / SceneTable)
 * Representa una tabla completa de desglose que contiene múltiples tomas (filas).
 */
export interface Scene {
  id: string;                                // ID único de la escena (ej: 's1', 's4')
  projectId?: string;                        // ID del proyecto padre
  synopsis?: string;                         // Sinopsis o resumen narrativo de la escena
  order: number;                             // Orden de la escena en el guion / proyecto
  shots?: Shot[];                            // Lista de tomas (filas) pertenecientes a la escena
  customColumns?: BreakdownColumn[];         // Columnas personalizadas a nivel de escena
}