alter table "public"."shared_video_recipients"
  add constraint "shared_video_recipients_receiver_id_fkey"
  foreign key ("receiver_id")
  references "public"."users"
  ("id") on update restrict on delete no action;
