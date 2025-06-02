CREATE TABLE "public"."shared_video_recipients" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "shared_video_id" uuid NOT NULL, "receiver_id" uuid NOT NULL, "viewed" boolean NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE no action, FOREIGN KEY ("shared_video_id") REFERENCES "public"."shared_videos"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."shared_video_recipients" IS E'Each video can share for many users, one user can see many shared videos';
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
CREATE TRIGGER "set_public_shared_video_recipients_updated_at"
BEFORE UPDATE ON "public"."shared_video_recipients"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_shared_video_recipients_updated_at" ON "public"."shared_video_recipients"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
