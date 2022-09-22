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
2022-09-22-create-table-interpreter	mikhuttu	migrations.xml	2022-09-22 12:19:20.169426	1	EXECUTED	8:86935821439a283b83dd9ff5d446fa92	createTable tableName=interpreter		\N	4.9.1	\N	\N	3849160009
2022-09-22-create-region-table	mikhuttu	migrations.xml	2022-09-22 12:19:20.194608	2	EXECUTED	8:ae11dbb53c29b256931aef5f12e1decd	createTable tableName=region; addUniqueConstraint constraintName=uk_region_interpreter_code, tableName=region; addForeignKeyConstraint baseTableName=region, constraintName=fk_region_interpreter, referencedTableName=interpreter		\N	4.9.1	\N	\N	3849160009
2022-09-22-create-meeting_date-table	mikhuttu	migrations.xml	2022-09-22 12:19:20.207057	3	EXECUTED	8:38cb174f5fb5a94de89639f7b5f0a77a	createTable tableName=meeting_date		\N	4.9.1	\N	\N	3849160009
2022-09-22-create-table-qualification_examination_type	mikhuttu	migrations.xml	2022-09-22 12:19:20.21703	4	EXECUTED	8:cf4ed4472f54defd248f83b321940f75	createTable tableName=qualification_examination_type; insert tableName=qualification_examination_type; insert tableName=qualification_examination_type		\N	4.9.1	\N	\N	3849160009
2022-09-22-create-table-qualification	mikhuttu	migrations.xml	2022-09-22 12:19:20.246084	5	EXECUTED	8:f760468a65f66cf2ccf749a73e8baedd	createTable tableName=qualification; addForeignKeyConstraint baseTableName=qualification, constraintName=fk_qualification_interpreter, referencedTableName=interpreter; addForeignKeyConstraint baseTableName=qualification, constraintName=fk_qualific...		\N	4.9.1	\N	\N	3849160009
2022-09-22-create-email_type-table	mikhuttu	migrations.xml	2022-09-22 12:19:20.259508	6	EXECUTED	8:07939e2b88abb87262f962f407998a24	createTable tableName=email_type; insert tableName=email_type		\N	4.9.1	\N	\N	3849160009
2022-09-22-create-email-table	mikhuttu	migrations.xml	2022-09-22 12:19:20.269592	7	EXECUTED	8:17e854bddbb47386c35009576c7cee04	createTable tableName=email; addForeignKeyConstraint baseTableName=email, constraintName=fk_email_email_type, referencedTableName=email_type		\N	4.9.1	\N	\N	3849160009
2022-09-22-create-qualification_reminder-table	mikhuttu	migrations.xml	2022-09-22 12:19:20.279691	8	EXECUTED	8:583c66a6e3ff8c13a295f3ef99347f59	createTable tableName=qualification_reminder; addForeignKeyConstraint baseTableName=qualification_reminder, constraintName=fk_qualification_reminder_qualification, referencedTableName=qualification; addForeignKeyConstraint baseTableName=qualificat...		\N	4.9.1	\N	\N	3849160009
2022-09-22-create-shedlock-table	mikhuttu	migrations.xml	2022-09-22 12:19:20.284515	9	EXECUTED	8:8d3e6aaeff0d8838d329ebbaa95bc096	createTable tableName=shedlock		\N	4.9.1	\N	\N	3849160009
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

