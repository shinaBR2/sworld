alter table "public"."shared_video_recipients"
  add constraint "shared_video_recipients_recipient_id_fkey"
  foreign key ("recipient_id")
  references "public"."users"
  ("id") on update restrict on delete no action;
