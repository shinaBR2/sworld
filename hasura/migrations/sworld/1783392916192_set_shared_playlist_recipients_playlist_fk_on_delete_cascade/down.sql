alter table "public"."shared_playlist_recipients" drop constraint "shared_playlist_recipients_playlist_id_fkey";
alter table "public"."shared_playlist_recipients"
  add constraint "shared_playlist_recipients_playlist_id_fkey"
  foreign key ("playlist_id")
  references "public"."playlist"
  ("id") on update restrict on delete restrict;
