alter table "public"."shared_video_recipients"
  add constraint "shared_video_recipients_playlist_id_fkey"
  foreign key ("playlist_id")
  references "public"."playlist"
  ("id") on update restrict on delete restrict;
