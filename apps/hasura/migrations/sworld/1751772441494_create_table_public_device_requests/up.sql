CREATE TABLE "public"."device_requests" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "device_code" text NOT NULL, "user_code" text NOT NULL, "extension_id" text NOT NULL, "user_id" uuid, "status" text NOT NULL DEFAULT 'pending', "expires_at" timestamptz NOT NULL, "authorized_at" timestamptz, "ip_address" inet NOT NULL, "user_agent" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("device_code"), UNIQUE ("user_code"));COMMENT ON TABLE "public"."device_requests" IS E'Requests to authentication from other sources than the web apps, can be extensions, smart tivi apps, etc.';
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
CREATE TRIGGER "set_public_device_requests_updated_at"
BEFORE UPDATE ON "public"."device_requests"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_device_requests_updated_at" ON "public"."device_requests"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
