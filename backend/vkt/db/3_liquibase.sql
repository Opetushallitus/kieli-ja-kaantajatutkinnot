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
2022-09-14-create-table-exam_language	mikhuttu	migrations.xml	2022-09-28 13:03:11.518594	1	EXECUTED	8:17db073b8f9d1a3557a6147981fd256e	createTable tableName=exam_language; insert tableName=exam_language; insert tableName=exam_language		\N	4.9.1	\N	\N	4370191374
2022-09-14-create-table-exam_level	mikhuttu	migrations.xml	2022-09-28 13:03:11.529341	2	EXECUTED	8:e8ac8e8266550d06f311340105eb558e	createTable tableName=exam_level; insert tableName=exam_level		\N	4.9.1	\N	\N	4370191374
2022-09-14-create-table-exam_event	mikhuttu	migrations.xml	2022-09-28 13:03:11.567242	3	EXECUTED	8:78e5d79871764de23d08742187c4be83	createTable tableName=exam_event; addForeignKeyConstraint baseTableName=exam_event, constraintName=fk_exam_event_language, referencedTableName=exam_language; addForeignKeyConstraint baseTableName=exam_event, constraintName=fk_exam_event_level, ref...		\N	4.9.1	\N	\N	4370191374
2022-09-19-create-table-person	mikhuttu	migrations.xml	2022-09-28 13:03:11.580327	4	EXECUTED	8:1218e1e61ba39ea9793c670923ee5a80	createTable tableName=person; addUniqueConstraint constraintName=uk_person_onr_id, tableName=person		\N	4.9.1	\N	\N	4370191374
2022-09-19-create-table-enrollment_status	mikhuttu	migrations.xml	2022-09-28 13:03:11.593403	5	EXECUTED	8:cb6dc3009864c99347b4097cd3d777a1	createTable tableName=enrollment_status; insert tableName=enrollment_status; insert tableName=enrollment_status; insert tableName=enrollment_status; insert tableName=enrollment_status		\N	4.9.1	\N	\N	4370191374
2022-09-19-create-table-enrollment	mikhuttu	migrations.xml	2022-09-28 13:03:11.613202	6	EXECUTED	8:edba4d8326701eb21ede9eb4afb6c628	createTable tableName=enrollment; addForeignKeyConstraint baseTableName=enrollment, constraintName=fk_enrollment_exam_event, referencedTableName=exam_event; addForeignKeyConstraint baseTableName=enrollment, constraintName=fk_enrollment_person, ref...		\N	4.9.1	\N	\N	4370191374
2022-10-12-change-person-columns	mikhuttu	migrations.xml	2022-10-12 18:42:43.132484	7	EXECUTED	8:d27f77bcff4989716b0be1fb83639ccf	dropColumn tableName=person; addColumn tableName=person; addUniqueConstraint constraintName=uk_person_identity_number, tableName=person		\N	4.9.1	\N	\N	5600162993
2022-10-28-create-table-reservation	terova	migrations.xml	2022-11-16 16:17:55.348633	8	EXECUTED	8:c4a64bee6d57de586b962e6b334cacbf	createTable tableName=reservation; addForeignKeyConstraint baseTableName=reservation, constraintName=fk_reservation_exam_event, referencedTableName=exam_event; addForeignKeyConstraint baseTableName=reservation, constraintName=fk_reservation_person...		\N	4.9.1	\N	\N	8615475122
2022-11-17-move_columns_from_person_to_enrollment	terova	migrations.xml	2022-11-17 12:16:38.355334	9	EXECUTED	8:5a6e66e03fe569e12cab0910180472d2	addColumn tableName=enrollment; dropColumn tableName=person		\N	4.9.1	\N	\N	8680198271
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

