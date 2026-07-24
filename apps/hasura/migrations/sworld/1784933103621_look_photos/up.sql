-- Look app: a private, owner-only image library.
-- photos stores each image's metadata; playlist_photos is the album join
-- (mirror of playlist_audios). Additive migration — no existing table changes.

CREATE TABLE "public"."photos" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "source" text NOT NULL, "medium_url" text, "thumbnail_url" text, "blur_hash" text, "width" integer, "height" integer, "taken_at" timestamptz, "public" boolean NOT NULL DEFAULT false, "slug" text, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE cascade);COMMENT ON TABLE "public"."photos" IS E'Image metadata for the Look app';
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
CREATE TRIGGER "set_public_photos_updated_at"
BEFORE UPDATE ON "public"."photos"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_photos_updated_at" ON "public"."photos"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';

-- Junction table between photos and playlist (mirror of playlist_audios).
CREATE TABLE "public"."playlist_photos" ("created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "playlist_id" uuid NOT NULL, "photo_id" uuid NOT NULL, "position" integer NOT NULL, PRIMARY KEY ("playlist_id","photo_id") , FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("playlist_id") REFERENCES "public"."playlist"("id") ON UPDATE restrict ON DELETE cascade);COMMENT ON TABLE "public"."playlist_photos" IS E'Junction table between photos and playlist';
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
CREATE TRIGGER "set_public_playlist_photos_updated_at"
BEFORE UPDATE ON "public"."playlist_photos"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_playlist_photos_updated_at" ON "public"."playlist_photos"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
