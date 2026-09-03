CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_user_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"title" varchar(255),
	"description" text,
	"type" varchar(100),
	"genre" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"cover_image" varchar(1024),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"settings" jsonb,
	"stats" jsonb,
	"collaborators" jsonb,
	"metadata" jsonb
);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "owner_user_id" varchar(255);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scenes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"synopsis" text,
	"order" integer NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "breakdown_columns" (
	"id" varchar(100) PRIMARY KEY,
	"project_id" uuid,
	"scene_id" uuid,
	"name" varchar(255) NOT NULL,
	"cell_type" varchar(50) NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"color" varchar(50),
	"is_system" boolean DEFAULT false NOT NULL,
	"options" jsonb
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"scene_id" uuid NOT NULL,
	"order" integer NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "breakdown_cells" (
	"id" varchar(100) PRIMARY KEY,
	"shot_id" uuid NOT NULL,
	"column_id" varchar(100) NOT NULL,
	"blocks" jsonb DEFAULT '[]',
	"numeric_value" real,
	"ai_metadata" jsonb,
	"status" varchar(50),
	"updated_at" timestamp DEFAULT now()
);--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "scenes" ADD CONSTRAINT "scenes_project_id_projects_id_fkey"
		FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "breakdown_columns" ADD CONSTRAINT "breakdown_columns_project_id_projects_id_fkey"
		FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "breakdown_columns" ADD CONSTRAINT "breakdown_columns_scene_id_scenes_id_fkey"
		FOREIGN KEY ("scene_id") REFERENCES "scenes"("id") ON DELETE CASCADE;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "shots" ADD CONSTRAINT "shots_scene_id_scenes_id_fkey"
		FOREIGN KEY ("scene_id") REFERENCES "scenes"("id") ON DELETE CASCADE;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "breakdown_cells" ADD CONSTRAINT "breakdown_cells_shot_id_shots_id_fkey"
		FOREIGN KEY ("shot_id") REFERENCES "shots"("id") ON DELETE CASCADE;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "breakdown_cells" ADD CONSTRAINT "breakdown_cells_column_id_breakdown_columns_id_fkey"
		FOREIGN KEY ("column_id") REFERENCES "breakdown_columns"("id") ON DELETE CASCADE;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;