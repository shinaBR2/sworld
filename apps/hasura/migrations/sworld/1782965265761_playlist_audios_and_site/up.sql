-- Add a site discriminator to playlist so each app sees only its own playlists.
-- Existing playlists are all video playlists, so backfill them to 'watch'.
ALTER TABLE "public"."playlist" ADD COLUMN "site" text;
UPDATE "public"."playlist" SET "site" = 'watch';
ALTER TABLE "public"."playlist" ALTER COLUMN "site" SET NOT NULL;
ALTER TABLE "public"."playlist" ALTER COLUMN "site" SET DEFAULT 'watch';

-- Junction table between audios and playlist (mirror of playlist_videos).
CREATE TABLE "public"."playlist_audios" ("created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "playlist_id" uuid NOT NULL, "audio_id" uuid NOT NULL, "position" integer NOT NULL, PRIMARY KEY ("playlist_id","audio_id") , FOREIGN KEY ("audio_id") REFERENCES "public"."audios"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("playlist_id") REFERENCES "public"."playlist"("id") ON UPDATE restrict ON DELETE cascade);COMMENT ON TABLE "public"."playlist_audios" IS E'Junction table between audios and playlist';
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
CREATE TRIGGER "set_public_playlist_audios_updated_at"
BEFORE UPDATE ON "public"."playlist_audios"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_playlist_audios_updated_at" ON "public"."playlist_audios"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
