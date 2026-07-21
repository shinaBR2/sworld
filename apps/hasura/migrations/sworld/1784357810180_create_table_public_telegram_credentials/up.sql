CREATE TABLE "public"."telegram_credentials" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "phone_number" text NOT NULL, "api_id" text NOT NULL, "api_hash" text NOT NULL, "session_string" text, "pending_phone_code_hash" text, PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE cascade, UNIQUE ("user_id"));COMMENT ON TABLE "public"."telegram_credentials" IS E'Per-user Telegram MTProto credentials and session. Admin-secret mediated only (no role:user permissions) - the extension never reads this directly, only through the telegram-actions Hono handlers. session_string and pending_phone_code_hash are credential-equivalent secrets.';
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
CREATE TRIGGER "set_public_telegram_credentials_updated_at"
BEFORE UPDATE ON "public"."telegram_credentials"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_telegram_credentials_updated_at" ON "public"."telegram_credentials"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
