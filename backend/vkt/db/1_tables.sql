--
-- PostgreSQL database dump
--

-- Dumped from database version 12.9 (Debian 12.9-1.pgdg110+1)
-- Dumped by pg_dump version 14.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: exam_event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_event (
    exam_event_id bigint NOT NULL,
    version integer DEFAULT 0 NOT NULL,
    created_by text,
    modified_by text,
    deleted_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    modified_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    language character varying(10) NOT NULL,
    level character varying(255) NOT NULL,
    date date NOT NULL,
    registration_closes date NOT NULL,
    is_visible boolean NOT NULL,
    max_participants integer NOT NULL,
    CONSTRAINT ck_exam_event_max_participants CHECK ((max_participants >= 0)),
    CONSTRAINT ck_exam_event_registration_closes CHECK ((registration_closes <= date))
);


ALTER TABLE public.exam_event OWNER TO postgres;

--
-- Name: exam_event_exam_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.exam_event ALTER COLUMN exam_event_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.exam_event_exam_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: exam_language; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_language (
    name character varying(10) NOT NULL
);


ALTER TABLE public.exam_language OWNER TO postgres;

--
-- Name: exam_level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_level (
    name character varying(255) NOT NULL
);


ALTER TABLE public.exam_level OWNER TO postgres;

--
-- Name: exam_event exam_event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_event
    ADD CONSTRAINT exam_event_pkey PRIMARY KEY (exam_event_id);


--
-- Name: exam_language exam_language_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_language
    ADD CONSTRAINT exam_language_pkey PRIMARY KEY (name);


--
-- Name: exam_level exam_level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_level
    ADD CONSTRAINT exam_level_pkey PRIMARY KEY (name);


--
-- Name: exam_event uk_exam_event_language_level_date; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_event
    ADD CONSTRAINT uk_exam_event_language_level_date UNIQUE (language, level, date);


--
-- Name: exam_event fk_exam_event_language; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_event
    ADD CONSTRAINT fk_exam_event_language FOREIGN KEY (language) REFERENCES public.exam_language(name);


--
-- Name: exam_event fk_exam_event_level; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_event
    ADD CONSTRAINT fk_exam_event_level FOREIGN KEY (level) REFERENCES public.exam_level(name);


--
-- PostgreSQL database dump complete
--

