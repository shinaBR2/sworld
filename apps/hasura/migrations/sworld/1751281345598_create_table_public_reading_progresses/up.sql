CREATE TABLE "public"."reading_progresses" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "book_id" uuid NOT NULL, "user_id" uuid NOT NULL, "last_read_at" timestamptz NOT NULL, "current_page" integer NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("user_id", "book_id"));COMMENT ON TABLE "public"."reading_progresses" IS E'Track how far end user read a book';
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
CREATE TRIGGER "set_public_reading_progresses_updated_at"
BEFORE UPDATE ON "public"."reading_progresses"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_reading_progresses_updated_at" ON "public"."reading_progresses"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
