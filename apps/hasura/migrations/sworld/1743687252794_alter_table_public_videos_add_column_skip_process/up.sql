alter table "public"."videos" add column "skip_process" boolean
 not null default 'false';
