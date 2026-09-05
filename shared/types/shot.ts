import type { BreakdownCell } from './cell';

/**
 * Opciones de configuración adicionales para una toma
 */
export interface ShotOptions {
  height?: number;               // Alto en píxeles
  [key: string]: any;            // Otras opciones extensibles
}

/**
 * Estructura de una Toma / Fila de Desglose (Shot / BreakdownRow)
 * Representa una fila dentro de la tabla de la escena.
 */
export interface Shot {
  id: string;                                // ID único de la toma (ej: 'r1', 'shot_101')
  sceneId?: string;                          // ID de la escena a la que pertenece
  order: number;                             // Orden secuencial de la toma en la escena
  options?: ShotOptions;                     // Configuración específica de la toma
  cells: Record<string, BreakdownCell>;      // Mapa de celdas indexadas por columnId: { [columnId]: BreakdownCell }
}

/**
 * Alias de Shot para mantener compatibilidad semántica con filas de tabla
 */
export type BreakdownRow = Shot;
