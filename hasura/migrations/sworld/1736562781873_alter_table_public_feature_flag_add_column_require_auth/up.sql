alter table "public"."feature_flag" add column "require_auth" boolean
 not null default 'true';
