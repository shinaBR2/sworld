comment on column "public"."books"."source" is E'Final URL for the book, validated, end user can not update this field';
alter table "public"."books" alter column "source" set not null;
