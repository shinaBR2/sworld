-- Reverse of up.sql: drop the join table first (it FKs photos), then photos.
-- The updated_at triggers are dropped automatically with their tables.
DROP TABLE "public"."playlist_photos";
DROP TABLE "public"."photos";
