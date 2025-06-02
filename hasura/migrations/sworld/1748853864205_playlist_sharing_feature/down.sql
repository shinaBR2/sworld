-- Remove comments
COMMENT ON COLUMN "public"."playlist"."shared_recipients" IS NULL;
COMMENT ON COLUMN "public"."playlist"."shared_recipients_input" IS NULL;

-- Remove columns
ALTER TABLE "public"."playlist" 
    DROP COLUMN "shared_recipients",
    DROP COLUMN "shared_recipients_input";

-- Remove unique constraint
ALTER TABLE "public"."playlist_videos" 
    DROP CONSTRAINT "playlist_videos_playlist_id_video_id_key";
