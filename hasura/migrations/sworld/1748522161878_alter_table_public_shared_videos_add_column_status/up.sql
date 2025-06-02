alter table "public"."shared_videos" add column "status" text
 not null default 'processing';
