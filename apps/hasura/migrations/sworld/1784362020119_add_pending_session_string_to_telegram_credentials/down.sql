COMMENT ON TABLE "public"."telegram_credentials" IS E'Per-user Telegram MTProto credentials and session. Admin-secret mediated only (no role:user permissions) - the extension never reads this directly, only through the telegram-actions Hono handlers. session_string and pending_phone_code_hash are credential-equivalent secrets.';

ALTER TABLE "public"."telegram_credentials" DROP COLUMN "pending_session_string";
