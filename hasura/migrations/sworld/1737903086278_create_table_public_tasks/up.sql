CREATE TABLE "public"."tasks" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "task_id" uuid NOT NULL, "type" text NOT NULL, "metadata" jsonb NOT NULL, "completed" boolean NOT NULL DEFAULT false, "entity_type" text NOT NULL, "entity_id" uuid NOT NULL, "status" text NOT NULL, PRIMARY KEY ("id") , UNIQUE ("task_id"), UNIQUE ("entity_id", "entity_type"));COMMENT ON TABLE "public"."tasks" IS E'Reference for Cloud Tasks, the goal is idempotent for Cloud Tasks';
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
CREATE TRIGGER "set_public_tasks_updated_at"
BEFORE UPDATE ON "public"."tasks"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_tasks_updated_at" ON "public"."tasks"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
