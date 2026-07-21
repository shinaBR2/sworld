CREATE TABLE "public"."user_settings" (
  "user_id" uuid NOT NULL,
  "data" jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY ("user_id"),
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
COMMENT ON TABLE "public"."user_settings" IS 'Per-user, per-app UI preferences. The `data` blob is site-scoped ({ watch: { standaloneMode }, ... }); its structure and defaults live in the frontend core package, not the DB.';