CREATE TABLE "public"."finance_transaction_templates" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "title" text NOT NULL, "name" text NOT NULL, "note" text, "category" text NOT NULL DEFAULT 'must', "user_id" uuid NOT NULL, "amount" numeric NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE cascade);COMMENT ON TABLE "public"."finance_transaction_templates" IS E'Reusable quick-fill templates for personal finance transactions';
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
CREATE TRIGGER "set_public_finance_transaction_templates_updated_at"
BEFORE UPDATE ON "public"."finance_transaction_templates"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_finance_transaction_templates_updated_at" ON "public"."finance_transaction_templates"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
alter table "public"."finance_transaction_templates" add constraint "positive" check (amount > 0);
comment on column "public"."finance_transaction_templates"."category" is E'Should be either must, nice or waste';
