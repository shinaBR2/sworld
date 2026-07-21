alter table "public"."playlist" add constraint "playlist_user_id_slug_key" unique ("user_id", "slug");
