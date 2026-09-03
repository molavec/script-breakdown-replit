ALTER TABLE "breakdown_cells" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "breakdown_cells" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "breakdown_cells" DROP COLUMN "media_urls";--> statement-breakpoint
ALTER TABLE "breakdown_cells" DROP COLUMN "media";--> statement-breakpoint
ALTER TABLE "breakdown_cells" DROP COLUMN "entities";--> statement-breakpoint
ALTER TABLE "breakdown_cells" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "breakdown_columns" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "breakdown_columns" DROP COLUMN "width";--> statement-breakpoint
ALTER TABLE "breakdown_cells" ALTER COLUMN "blocks" SET DEFAULT '[]';