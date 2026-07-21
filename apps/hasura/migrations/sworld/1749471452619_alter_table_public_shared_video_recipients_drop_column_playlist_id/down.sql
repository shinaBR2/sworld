comment on column "public"."shared_video_recipients"."playlist_id" is E'Each video can share for many users, one user can see many shared videos';
alter table "public"."shared_video_recipients" add constraint "shared_video_recipients_playlist_id_video_id_receiver_id_key" unique (receiver_id, video_id, playlist_id);
alter table "public"."shared_video_recipients" alter column "playlist_id" drop not null;
alter table "public"."shared_video_recipients" add column "playlist_id" uuid;
