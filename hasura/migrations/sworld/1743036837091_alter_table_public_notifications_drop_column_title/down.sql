comment on column "public"."notifications"."title" is E'Notification system';
alter table "public"."notifications" alter column "title" drop not null;
alter table "public"."notifications" add column "title" text;
