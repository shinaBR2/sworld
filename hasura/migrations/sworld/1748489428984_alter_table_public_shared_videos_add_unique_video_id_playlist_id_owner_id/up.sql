alter table "public"."shared_videos" add constraint "shared_videos_video_id_playlist_id_owner_id_key" unique ("video_id", "playlist_id", "owner_id");
