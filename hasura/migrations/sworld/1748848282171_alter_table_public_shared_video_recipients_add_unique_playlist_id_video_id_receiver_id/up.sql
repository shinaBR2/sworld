alter table "public"."shared_video_recipients" add constraint "shared_video_recipients_playlist_id_video_id_receiver_id_key" unique ("playlist_id", "video_id", "receiver_id");
