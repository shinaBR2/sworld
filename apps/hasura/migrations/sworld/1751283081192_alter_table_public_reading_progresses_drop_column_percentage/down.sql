comment on column "public"."reading_progresses"."percentage" is E'Track how far end user read a book';
alter table "public"."reading_progresses" alter column "percentage" drop not null;
alter table "public"."reading_progresses" add column "percentage" int4;
