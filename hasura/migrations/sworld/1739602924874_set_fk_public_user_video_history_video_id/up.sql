alter table "public"."user_video_history" drop constraint "user_video_history_video_id_fkey",
  add constraint "user_video_history_video_id_fkey"
  foreign key ("video_id")
  references "public"."videos"
  ("id") on update restrict on delete cascade;
