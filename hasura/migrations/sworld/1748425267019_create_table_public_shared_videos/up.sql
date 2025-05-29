CREATE TABLE "public"."shared_videos" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "video_id" uuid NOT NULL, "playlist_id" uuid, "owner_id" uuid NOT NULL, "active" boolean NOT NULL DEFAULT true, PRIMARY KEY ("id") , FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("playlist_id") REFERENCES "public"."playlist"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."shared_videos" IS E'User can share their own videos with other users';
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
CREATE TRIGGER "set_public_shared_videos_updated_at"
BEFORE UPDATE ON "public"."shared_videos"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_shared_videos_updated_at" ON "public"."shared_videos"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
