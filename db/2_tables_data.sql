--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2 (Debian 11.2-1.pgdg90+1)
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
-- Data for Name: authorisation_basis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authorisation_basis (name) FROM stdin;
AUT
KKT
VIR
\.


--
-- Data for Name: email_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_type (name) FROM stdin;
CONTACT_REQUEST
AUTHORISATION_EXPIRY
INFORMAL
\.


--
-- PostgreSQL database dump complete
--

