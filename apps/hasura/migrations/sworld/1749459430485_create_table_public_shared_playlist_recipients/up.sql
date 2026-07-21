CREATE TABLE "public"."shared_playlist_recipients" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "playlist_id" uuid NOT NULL, "recipient_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("playlist_id") REFERENCES "public"."playlist"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("playlist_id", "recipient_id"));COMMENT ON TABLE "public"."shared_playlist_recipients" IS E'This table tell us what playlist is shared to whom. All videos in the playlist should be shared, not selective';
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
CREATE TRIGGER "set_public_shared_playlist_recipients_updated_at"
BEFORE UPDATE ON "public"."shared_playlist_recipients"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_shared_playlist_recipients_updated_at" ON "public"."shared_playlist_recipients"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
