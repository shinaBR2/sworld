alter table "public"."shared_video_recipients" add constraint "shared_video_recipients_video_id_recipient_id_key" unique ("video_id", "recipient_id");
