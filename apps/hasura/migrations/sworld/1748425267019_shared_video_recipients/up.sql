-- Create function for updating timestamp
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;

-- Create shared_video_recipients table with final structure
CREATE TABLE "public"."shared_video_recipients" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "receiver_id" uuid NOT NULL,
    "playlist_id" uuid,
    "video_id" uuid,
    "viewed" boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE no action,
    FOREIGN KEY ("playlist_id") REFERENCES "public"."playlist"("id") ON UPDATE restrict ON DELETE no action,
    FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON UPDATE restrict ON DELETE no action,
    CONSTRAINT "shared_video_recipients_playlist_id_video_id_receiver_id_key" 
    UNIQUE ("playlist_id", "video_id", "receiver_id")
);

COMMENT ON TABLE "public"."shared_video_recipients" 
IS E'Each video can share for many users, one user can see many shared videos';

-- Create updated_at trigger
CREATE TRIGGER "set_public_shared_video_recipients_updated_at"
BEFORE UPDATE ON "public"."shared_video_recipients"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();

COMMENT ON TRIGGER "set_public_shared_video_recipients_updated_at" ON "public"."shared_video_recipients"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';

-- Ensure pgcrypto extension exists for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;
