alter table "public"."finance_transactions" add constraint "positive" check (amount > 0);
