-- Look app: make `photos` a generic media table holding images AND videos.
-- `type` distinguishes them ('image' is the default, so every existing row stays
-- an image with no backfill). A video is "just another type of image": its HLS
-- manifest URL lives in the existing `source` column (exactly as the `videos`
-- table stores it), and `duration` holds its length in seconds. Additive — no
-- existing rows change.
ALTER TABLE "public"."photos"
  ADD COLUMN "type" text NOT NULL DEFAULT 'image',
  ADD COLUMN "duration" integer;

-- Guard the discriminator at the database floor (the always-enforced layer).
ALTER TABLE "public"."photos"
  ADD CONSTRAINT "photos_type_check" CHECK ("type" IN ('image', 'video'));
