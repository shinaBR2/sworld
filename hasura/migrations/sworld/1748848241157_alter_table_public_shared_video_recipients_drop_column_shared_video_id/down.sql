comment on column "public"."shared_video_recipients"."shared_video_id" is E'Each video can share for many users, one user can see many shared videos';
alter table "public"."shared_video_recipients" alter column "shared_video_id" drop not null;
alter table "public"."shared_video_recipients" add column "shared_video_id" uuid;
