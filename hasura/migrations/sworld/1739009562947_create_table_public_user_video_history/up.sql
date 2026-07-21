CREATE TABLE "public"."user_video_history" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "video_id" uuid NOT NULL, "last_watched_at" timestamptz NOT NULL, "progress_seconds" numeric NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."user_video_history" IS E'Pivot table between user and video, let we know how do end user interact with video';
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
CREATE TRIGGER "set_public_user_video_history_updated_at"
BEFORE UPDATE ON "public"."user_video_history"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_user_video_history_updated_at" ON "public"."user_video_history"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
