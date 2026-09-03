import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  real
} from 'drizzle-orm/pg-core';

import type {
  ProjectSettings,
  ProjectStats,
  ColumnOptions,
  CellAiMetadata,
  CellBlock,
} from '../../shared/types';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Null keeps pre-authentication projects inaccessible rather than assigning them
  // to whichever user happens to sign in first.
  ownerUserId: varchar('owner_user_id', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  type: varchar('type', { length: 100 }), // feature_film, short_film, etc.
  genre: varchar('genre', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  coverImage: varchar('cover_image', { length: 1024 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  settings: jsonb('settings').$type<ProjectSettings>(),
  stats: jsonb('stats').$type<ProjectStats>(),
  collaborators: jsonb('collaborators'), // Can type this further if needed
  metadata: jsonb('metadata'),
});

export const scenes = pgTable('scenes', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  synopsis: text('synopsis'),
  order: integer('order').notNull(),
});

export const breakdownColumns = pgTable('breakdown_columns', {
  id: varchar('id', { length: 100 }).primaryKey(), // Using varchar to support IDs like 'col_script'
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  sceneId: uuid('scene_id').references(() => scenes.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  cellType: varchar('cell_type', { length: 50 }).notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  color: varchar('color', { length: 50 }),
  isSystem: boolean('is_system').default(false).notNull(),
  options: jsonb('options').$type<ColumnOptions>(),
});

export const shots = pgTable('shots', {
  id: uuid('id').defaultRandom().primaryKey(),
  sceneId: uuid('scene_id').references(() => scenes.id, { onDelete: 'cascade' }).notNull(),
  order: integer('order').notNull(),
});

export const breakdownCells = pgTable('breakdown_cells', {
  id: varchar('id', { length: 100 }).primaryKey(), // Using varchar to support IDs like 'c1_script'
  shotId: uuid('shot_id').references(() => shots.id, { onDelete: 'cascade' }).notNull(),
  columnId: varchar('column_id', { length: 100 }).references(() => breakdownColumns.id, { onDelete: 'cascade' }).notNull(),

  // El contenido completo reside aquí:
  blocks: jsonb('blocks').$type<CellBlock[]>().default([]),

  // Strict numeric column for calculations (Budget)
  numericValue: real('numeric_value'),

  aiMetadata: jsonb('ai_metadata').$type<CellAiMetadata>(),
  status: varchar('status', { length: 50 }),
  updatedAt: timestamp('updated_at').defaultNow(),
});
