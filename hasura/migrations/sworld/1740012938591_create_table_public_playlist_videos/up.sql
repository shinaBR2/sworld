CREATE TABLE "public"."playlist_videos" ("created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "playlist_id" uuid NOT NULL, "video_id" uuid NOT NULL, "position" integer NOT NULL, PRIMARY KEY ("playlist_id","video_id") , FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("playlist_id") REFERENCES "public"."playlist"("id") ON UPDATE restrict ON DELETE cascade);COMMENT ON TABLE "public"."playlist_videos" IS E'Junction table between videos and playlist';
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
CREATE TRIGGER "set_public_playlist_videos_updated_at"
BEFORE UPDATE ON "public"."playlist_videos"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_playlist_videos_updated_at" ON "public"."playlist_videos"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
