-- Drop trigger first
DROP TRIGGER IF EXISTS "set_public_shared_video_recipients_updated_at" ON "public"."shared_video_recipients";

-- Drop table
DROP TABLE IF EXISTS "public"."shared_video_recipients";
