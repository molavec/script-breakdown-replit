import type { Scene } from './scene';
import type { BreakdownColumn } from './column';

/**
 * Formato audiovisual del proyecto
 */
export type ProjectFormat =
  | 'feature_film'       // Largometraje
  | 'short_film'         // Cortometraje
  | 'series'             // Serie / Episodio
  | 'documentary'        // Documental
  | 'commercial'         // Spot Publicitario / Comercial
  | 'music_video'        // Videoclip
  | 'animation'          // Animación
  | 'other';             // Otro

/**
 * Estado general del proyecto
 */
export type ProjectStatus =
  | 'draft'              // Borrador
  | 'in_progress'        // En progreso
  | 'breakdown_review'   // En revisión de desglose
  | 'pre_production'     // Pre-producción
  | 'production'         // En rodaje
  | 'completed'          // Completado
  | 'archived';          // Archivado

/**
 * Colaborador o miembro del equipo asignado al proyecto
 */
export interface ProjectCollaborator {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  order?: number;
}

/**
 * Configuración global del proyecto
 */
export interface ProjectSettings {
  defaultCurrency?: string;      // 'USD', 'EUR', 'ARS', etc.
  aspectRatio?: string;          // '16:9', '2.39:1', '4:3', '9:16'
  frameRate?: number;            // 24, 25, 30, 60 fps
  defaultColumns?: string[];     // IDs de columnas activas por defecto
  aiModel?: string;              // Modelo de IA predeterminado para prompts
}

/**
 * Métricas y estadísticas calculadas del proyecto
 */
export interface ProjectStats {
  totalShots: number;
  totalEstimatedBudget?: number;
}

/**
 * Entidad Raíz: Proyecto Audiovisual (Project)
 * Contiene la metadata del proyecto, la colección de escenas (tablas) y la configuración de desglose.
 */
export interface Project {
  id: string;                                // ID único del proyecto
  name: string;                              // Nombre o título del proyecto (ej: 'The Wait')
  title?: string;                            // Alias para compatibilidad de nombre
  description?: string;                      // Sinopsis o descripción general
  type?: string | ProjectFormat;             // Formato/género (ej: 'Feature Film - Thriller')
  genre?: string;                            // Género principal (ej: 'Sci-Fi', 'Thriller')
  status: ProjectStatus | string;            // Estado del proyecto
  coverImage?: string;                       // URL del póster / imagen de portada
  createdAt?: string | number | Date;        // Fecha de creación
  updatedAt?: string | number | Date;        // Última modificación
  logline?: string;                          // Resumen de la trama
  director?: string;                         // Director del proyecto
  dop?: string;                              // Director de Fotografía
  estimatedRuntime?: string;                 // Duración estimada
  pageCount?: string | number;               // Cantidad de páginas del guion
  settings?: ProjectSettings;                // Ajustes globales
  stats?: ProjectStats;                      // Estadísticas acumuladas
  collaborators?: ProjectCollaborator[];     // Equipo con acceso
  scenes?: Scene[];                          // Escenas pertenecientes al proyecto
  columns?: BreakdownColumn[];               // Columnas de desglose configuradas para el proyecto
  metadata?: Record<string, unknown>;        // Metadatos extensibles
}
