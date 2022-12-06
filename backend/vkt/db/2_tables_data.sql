--
-- PostgreSQL database dump
--

-- Dumped from database version 12.9 (Debian 12.9-1.pgdg110+1)
-- Dumped by pg_dump version 14.0

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

--
-- Data for Name: email_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_type (name) FROM stdin;
ENROLLMENT_CONFIRMATION
\.


--
-- Data for Name: enrollment_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollment_status (name) FROM stdin;
PAID
EXPECTING_PAYMENT
QUEUED
CANCELED
\.


--
-- Data for Name: exam_language; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exam_language (name) FROM stdin;
FI
SV
\.


--
-- Data for Name: exam_level; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exam_level (name) FROM stdin;
EXCELLENT
\.


--
-- PostgreSQL database dump complete
--

