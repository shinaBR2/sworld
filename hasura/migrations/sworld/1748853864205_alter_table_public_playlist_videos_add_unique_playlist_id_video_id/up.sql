alter table "public"."playlist_videos" add constraint "playlist_videos_playlist_id_video_id_key" unique ("playlist_id", "video_id");
