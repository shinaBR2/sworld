comment on column "public"."shared_video_recipients"."receiver_id" is E'Each video can share for many users, one user can see many shared videos';
alter table "public"."shared_video_recipients" alter column "receiver_id" drop not null;
alter table "public"."shared_video_recipients" add column "receiver_id" uuid;
