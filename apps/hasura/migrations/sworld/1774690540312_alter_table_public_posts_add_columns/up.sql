ALTER TABLE "public"."posts" ADD COLUMN "status" text NOT NULL DEFAULT 'draft';
ALTER TABLE "public"."posts" ADD COLUMN "visibility" text NOT NULL DEFAULT 'private';
ALTER TABLE "public"."posts" ADD COLUMN "author_id" text NOT NULL DEFAULT '';

-- Update existing data to preserve previous visibility
UPDATE "public"."posts" SET "status" = 'published', "visibility" = 'public';
