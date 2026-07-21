alter table "public"."tasks" drop constraint "tasks_entity_type_entity_id_type_key";
alter table "public"."tasks" add constraint "tasks_entity_type_entity_id_key" unique ("entity_type", "entity_id");
