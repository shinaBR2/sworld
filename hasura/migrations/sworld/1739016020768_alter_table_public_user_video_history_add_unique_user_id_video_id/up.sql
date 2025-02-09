alter table "public"."user_video_history" add constraint "user_video_history_user_id_video_id_key" unique ("user_id", "video_id");
