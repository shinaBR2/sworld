CREATE TABLE "public"."subtitles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "video_id" uuid NOT NULL, "lang" text NOT NULL, "url" text NOT NULL, "default" boolean NOT NULL DEFAULT false, PRIMARY KEY ("id") , FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON UPDATE restrict ON DELETE cascade);COMMENT ON TABLE "public"."subtitles" IS E'Subtitles for video';
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
CREATE TRIGGER "set_public_subtitles_updated_at"
BEFORE UPDATE ON "public"."subtitles"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_subtitles_updated_at" ON "public"."subtitles"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
