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

SET default_tablespace = '';

--
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databasechangelog (
    id character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    filename character varying(255) NOT NULL,
    dateexecuted timestamp without time zone NOT NULL,
    orderexecuted integer NOT NULL,
    exectype character varying(10) NOT NULL,
    md5sum character varying(35),
    description character varying(255),
    comments character varying(255),
    tag character varying(255),
    liquibase character varying(20),
    contexts character varying(255),
    labels character varying(255),
    deployment_id character varying(10)
);


ALTER TABLE public.databasechangelog OWNER TO postgres;

--
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databasechangeloglock (
    id integer NOT NULL,
    locked boolean NOT NULL,
    lockgranted timestamp without time zone,
    lockedby character varying(255)
);


ALTER TABLE public.databasechangeloglock OWNER TO postgres;

--
-- Data for Name: databasechangelog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databasechangelog (id, author, filename, dateexecuted, orderexecuted, exectype, md5sum, description, comments, tag, liquibase, contexts, labels, deployment_id) FROM stdin;
2021-11-02-create-meeting_date-table	terova	migrations.xml	2022-01-05 13:33:37.242251	1	EXECUTED	8:a1e92c8f7fd1420049d42d979a27b93a	createTable tableName=meeting_date		\N	4.3.5	\N	\N	1382417110
2021-11-02-create-authorisation_basis-table	terova	migrations.xml	2022-01-05 13:33:37.258139	2	EXECUTED	8:e3237db0c80a738e470dbfd514e657e4	createTable tableName=authorisation_basis; insert tableName=authorisation_basis; insert tableName=authorisation_basis; insert tableName=authorisation_basis		\N	4.3.5	\N	\N	1382417110
2021-11-02-create-translator-table	terova	migrations.xml	2022-01-05 13:33:37.270252	3	EXECUTED	8:4138e47fa4d12e1540c5834e58b81c0e	createTable tableName=translator		\N	4.3.5	\N	\N	1382417110
2021-11-02-create-authorisation-table	terova	migrations.xml	2022-01-05 13:33:37.30125	4	EXECUTED	8:f3dd004c7c277327a2846b0ceae5a5ec	createTable tableName=authorisation; addForeignKeyConstraint baseTableName=authorisation, constraintName=fk_authorisation_translator, referencedTableName=translator; addForeignKeyConstraint baseTableName=authorisation, constraintName=fk_authorisat...		\N	4.3.5	\N	\N	1382417110
2021-11-02-create-language_pair-table	terova	migrations.xml	2022-01-05 13:33:37.322778	5	EXECUTED	8:fcfcaa2a32865c4929340238e497e9be	createTable tableName=language_pair; addForeignKeyConstraint baseTableName=language_pair, constraintName=fk_language_pair_authorisation, referencedTableName=authorisation; createIndex indexName=language_pair_uniq, tableName=language_pair		\N	4.3.5	\N	\N	1382417110
2021-11-02-create-authorisation_term-table	terova	migrations.xml	2022-01-05 13:33:37.343572	6	EXECUTED	8:ba5ebcbc8a372a5aca62eec5fd81c1ae	createTable tableName=authorisation_term; addForeignKeyConstraint baseTableName=authorisation_term, constraintName=fk_authorisation_term_authorisation, referencedTableName=authorisation; sql		\N	4.3.5	\N	\N	1382417110
2021-11-02-create-email-table	terova	migrations.xml	2022-01-05 13:33:37.358799	7	EXECUTED	8:d6d306a7ecd9d787ebbec875b8286b0f	createTable tableName=email		\N	4.3.5	\N	\N	1382417110
2021-11-02-create-authorisation_term_reminder-table	terova	migrations.xml	2022-01-05 13:33:37.376705	8	EXECUTED	8:fce40a40cc7077fed2c6c1b4a0d7f40d	createTable tableName=authorisation_term_reminder; addForeignKeyConstraint baseTableName=authorisation_term_reminder, constraintName=fk_authorisation_term_reminder_authorisation_term, referencedTableName=authorisation_term; addForeignKeyConstraint...		\N	4.3.5	\N	\N	1382417110
2021-12-14-create-contact_request-table	mikhuttu	migrations.xml	2022-01-05 13:33:37.389629	9	EXECUTED	8:944cf8f9fef67a908ef0ab4067bc1a8d	createTable tableName=contact_request		\N	4.3.5	\N	\N	1382417110
2021-12-14-create-contact_request_translator-table	mikhuttu	migrations.xml	2022-01-05 13:33:37.405784	10	EXECUTED	8:7165914d18b46100505d10612231dfea	createTable tableName=contact_request_translator; addForeignKeyConstraint baseTableName=contact_request_translator, constraintName=fk_contact_request_translator_contact_request, referencedTableName=contact_request; addForeignKeyConstraint baseTabl...		\N	4.3.5	\N	\N	1382417110
2021-12-17-add-language_pair-check-constraint	terova	migrations.xml	2022-01-05 13:33:37.415539	11	EXECUTED	8:7065e9d0789130793d3ad73e169b566f	sql		\N	4.3.5	\N	\N	1382417110
2021-12-21-create-shedlock-table	terova	migrations.xml	2022-01-05 13:33:37.426176	12	EXECUTED	8:8d3e6aaeff0d8838d329ebbaa95bc096	createTable tableName=shedlock		\N	4.3.5	\N	\N	1382417110
2021-12-21-add-enum-email_type	terova	migrations.xml	2022-01-05 13:33:37.444496	13	EXECUTED	8:f5dbab970582b5151424f27a79255378	createTable tableName=email_type; insert tableName=email_type; addColumn tableName=email; addForeignKeyConstraint baseTableName=email, constraintName=fk_email_email_type, referencedTableName=email_type		\N	4.3.5	\N	\N	1382417110
2021-12-21-add-column-email_ext_id	terova	migrations.xml	2022-01-05 13:33:37.453724	14	EXECUTED	8:632d0955aa7856d25b0c392dc59783f2	addColumn tableName=email		\N	4.3.5	\N	\N	1382417110
2022-01-03-add-meeting_date-date-uniq	terova	migrations.xml	2022-01-05 13:33:37.463971	15	EXECUTED	8:58bf4b3e897e582bf9547b3d380ecdbe	addUniqueConstraint tableName=meeting_date		\N	4.3.5	\N	\N	1382417110
2022-01-04-add-new-email-types	mikhuttu	migrations.xml	2022-01-05 13:33:37.473337	16	EXECUTED	8:ec8e1a91bf20320f58a443426379f1e2	insert tableName=email_type; insert tableName=email_type		\N	4.3.5	\N	\N	1382417110
2022-01-05-language_pair-uppercase	terova	migrations.xml	2022-01-05 13:33:37.485845	17	EXECUTED	8:fc41591bbfcd22b139c1735fde94590d	sql		\N	4.3.5	\N	\N	1382417110
\.


--
-- Data for Name: databasechangeloglock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databasechangeloglock (id, locked, lockgranted, lockedby) FROM stdin;
1	f	\N	\N
\.


--
-- Name: databasechangeloglock databasechangeloglock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.databasechangeloglock
    ADD CONSTRAINT databasechangeloglock_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

