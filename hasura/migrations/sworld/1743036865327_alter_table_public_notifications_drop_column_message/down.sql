comment on column "public"."notifications"."message" is E'Notification system';
alter table "public"."notifications" alter column "message" drop not null;
alter table "public"."notifications" add column "message" text;
