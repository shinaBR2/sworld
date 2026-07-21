--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.2 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: google_vacuum_mgmt; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA google_vacuum_mgmt;


--
-- Name: google_vacuum_mgmt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS google_vacuum_mgmt WITH SCHEMA google_vacuum_mgmt;


--
-- Name: EXTENSION google_vacuum_mgmt; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION google_vacuum_mgmt IS 'extension for assistive operational tooling';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: set_current_timestamp_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audio_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audio_tags (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    audio_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: TABLE audio_tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.audio_tags IS 'Junction table between audios and tags, many to many relationship';


--
-- Name: audios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    user_id uuid NOT NULL,
    thumbnail_url text,
    public boolean DEFAULT false NOT NULL,
    source text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    artist_name text NOT NULL
);


--
-- Name: TABLE audios; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.audios IS 'Audios for listen site';


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    display_order integer NOT NULL,
    site text NOT NULL
);


--
-- Name: TABLE tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tags IS 'Including all tags for all sites (watch, listen, etc). Tags can have name and slug, slug + site is unique';


--
-- Name: test; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test (
    id integer NOT NULL,
    description text NOT NULL
);


--
-- Name: TABLE test; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.test IS 'This is a workaround when running CLI to dump from Hasura Cloud does not work, so I tried to use CLI run console to connect to db, create this table to make changes to generata migration files';


--
-- Name: test_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.test_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.test_id_seq OWNED BY public.test.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    auth0_id text NOT NULL,
    username text
);


--
-- Name: video_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_tags (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    video_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: TABLE video_tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.video_tags IS 'Junction table between videos and tags which showing many to many relationship between 2 tables';


--
-- Name: video_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    video_id uuid NOT NULL,
    user_id uuid NOT NULL,
    viewed_at timestamp with time zone DEFAULT now()
);


--
-- Name: videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    video_url text NOT NULL,
    thumbnail_url text,
    user_id uuid NOT NULL,
    view_count integer DEFAULT 0,
    status text DEFAULT 'processing'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    slug character varying(255) NOT NULL,
    source text,
    public boolean DEFAULT false NOT NULL
);


--
-- Name: test id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test ALTER COLUMN id SET DEFAULT nextval('public.test_id_seq'::regclass);


--
-- Name: audio_tags audio_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_tags
    ADD CONSTRAINT audio_tags_pkey PRIMARY KEY (audio_id, tag_id);


--
-- Name: audios audios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audios
    ADD CONSTRAINT audios_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_site_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_site_key UNIQUE (slug, site);


--
-- Name: test test_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT test_pkey PRIMARY KEY (id);


--
-- Name: users users_auth0_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth0_id_key UNIQUE (auth0_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: video_tags video_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_tags
    ADD CONSTRAINT video_tags_pkey PRIMARY KEY (video_id, tag_id);


--
-- Name: video_views video_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_pkey PRIMARY KEY (id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: videos videos_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_slug_unique UNIQUE (slug);


--
-- Name: index_video_views_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_video_views_on_user_id ON public.video_views USING btree (user_id);


--
-- Name: index_video_views_on_video_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_video_views_on_video_id ON public.video_views USING btree (video_id);


--
-- Name: index_videos_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_videos_on_created_at ON public.videos USING btree (created_at);


--
-- Name: index_videos_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_videos_on_user_id ON public.videos USING btree (user_id);


--
-- Name: videos_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX videos_slug_idx ON public.videos USING btree (slug);


--
-- Name: audio_tags set_public_audio_tags_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_public_audio_tags_updated_at BEFORE UPDATE ON public.audio_tags FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_public_audio_tags_updated_at ON audio_tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER set_public_audio_tags_updated_at ON public.audio_tags IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: audios set_public_audios_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_public_audios_updated_at BEFORE UPDATE ON public.audios FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_public_audios_updated_at ON audios; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER set_public_audios_updated_at ON public.audios IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: tags set_public_tags_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_public_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_public_tags_updated_at ON tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER set_public_tags_updated_at ON public.tags IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: video_tags set_public_video_tags_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_public_video_tags_updated_at BEFORE UPDATE ON public.video_tags FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_public_video_tags_updated_at ON video_tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER set_public_video_tags_updated_at ON public.video_tags IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: audio_tags audio_tags_audio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_tags
    ADD CONSTRAINT audio_tags_audio_id_fkey FOREIGN KEY (audio_id) REFERENCES public.audios(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: audio_tags audio_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_tags
    ADD CONSTRAINT audio_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: audios audios_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audios
    ADD CONSTRAINT audios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: video_tags video_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_tags
    ADD CONSTRAINT video_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: video_tags video_tags_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_tags
    ADD CONSTRAINT video_tags_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: video_views video_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: video_views video_views_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id);


--
-- Name: videos videos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

