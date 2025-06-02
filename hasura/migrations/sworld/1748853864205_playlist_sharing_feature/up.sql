-- Add unique constraint to playlist_videos
ALTER TABLE "public"."playlist_videos" 
    ADD CONSTRAINT "playlist_videos_playlist_id_video_id_key" 
    UNIQUE ("playlist_id", "video_id");

-- Add shared recipients columns to playlist
ALTER TABLE "public"."playlist"
    ADD COLUMN "shared_recipients_input" jsonb NULL,
    ADD COLUMN "shared_recipients" jsonb NULL;

-- Add comments for clarity
COMMENT ON COLUMN "public"."playlist"."shared_recipients_input" 
    IS E'List of recipient emails from user input, not validated yet. End user can update this.';

COMMENT ON COLUMN "public"."playlist"."shared_recipients" 
    IS E'List of shared recipient emails after validated by the system, should use this field to show for end users. Only system can update this field. End user should NOT know the real shared user ids.';
