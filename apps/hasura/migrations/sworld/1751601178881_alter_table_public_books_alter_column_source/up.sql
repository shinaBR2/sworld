alter table "public"."books" alter column "source" drop not null;
comment on column "public"."books"."source" is E'Final URL for the book, validated, end user can not update this field. This can be null for offline books';
