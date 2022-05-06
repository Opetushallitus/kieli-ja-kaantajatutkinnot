--
-- PostgreSQL database dump
--

-- Dumped from database version 12.9 (Debian 12.9-1.pgdg110+1)
-- Dumped by pg_dump version 14.2

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
2021-11-02-create-meeting_date-table	terova	migrations.xml	2022-05-03 13:42:07.392281	1	EXECUTED	8:a1e92c8f7fd1420049d42d979a27b93a	createTable tableName=meeting_date		\N	4.5.0	\N	\N	1585327221
2021-11-02-create-authorisation_basis-table	terova	migrations.xml	2022-05-03 13:42:07.399276	2	EXECUTED	8:e3237db0c80a738e470dbfd514e657e4	createTable tableName=authorisation_basis; insert tableName=authorisation_basis; insert tableName=authorisation_basis; insert tableName=authorisation_basis		\N	4.5.0	\N	\N	1585327221
2021-11-02-create-translator-table	terova	migrations.xml	2022-05-03 13:42:07.406728	3	EXECUTED	8:4138e47fa4d12e1540c5834e58b81c0e	createTable tableName=translator		\N	4.5.0	\N	\N	1585327221
2021-11-02-create-authorisation-table	terova	migrations.xml	2022-05-03 13:42:07.433229	4	EXECUTED	8:f3dd004c7c277327a2846b0ceae5a5ec	createTable tableName=authorisation; addForeignKeyConstraint baseTableName=authorisation, constraintName=fk_authorisation_translator, referencedTableName=translator; addForeignKeyConstraint baseTableName=authorisation, constraintName=fk_authorisat...		\N	4.5.0	\N	\N	1585327221
2021-11-02-create-language_pair-table	terova	migrations.xml	2022-05-03 13:42:07.446474	5	EXECUTED	8:fcfcaa2a32865c4929340238e497e9be	createTable tableName=language_pair; addForeignKeyConstraint baseTableName=language_pair, constraintName=fk_language_pair_authorisation, referencedTableName=authorisation; createIndex indexName=language_pair_uniq, tableName=language_pair		\N	4.5.0	\N	\N	1585327221
2021-11-02-create-authorisation_term-table	terova	migrations.xml	2022-05-03 13:42:07.454859	6	EXECUTED	8:ba5ebcbc8a372a5aca62eec5fd81c1ae	createTable tableName=authorisation_term; addForeignKeyConstraint baseTableName=authorisation_term, constraintName=fk_authorisation_term_authorisation, referencedTableName=authorisation; sql		\N	4.5.0	\N	\N	1585327221
2021-11-02-create-email-table	terova	migrations.xml	2022-05-03 13:42:07.465917	7	EXECUTED	8:d6d306a7ecd9d787ebbec875b8286b0f	createTable tableName=email		\N	4.5.0	\N	\N	1585327221
2021-11-02-create-authorisation_term_reminder-table	terova	migrations.xml	2022-05-03 13:42:07.475541	8	EXECUTED	8:fce40a40cc7077fed2c6c1b4a0d7f40d	createTable tableName=authorisation_term_reminder; addForeignKeyConstraint baseTableName=authorisation_term_reminder, constraintName=fk_authorisation_term_reminder_authorisation_term, referencedTableName=authorisation_term; addForeignKeyConstraint...		\N	4.5.0	\N	\N	1585327221
2021-12-14-create-contact_request-table	mikhuttu	migrations.xml	2022-05-03 13:42:07.481725	9	EXECUTED	8:944cf8f9fef67a908ef0ab4067bc1a8d	createTable tableName=contact_request		\N	4.5.0	\N	\N	1585327221
2021-12-14-create-contact_request_translator-table	mikhuttu	migrations.xml	2022-05-03 13:42:07.49034	10	EXECUTED	8:7165914d18b46100505d10612231dfea	createTable tableName=contact_request_translator; addForeignKeyConstraint baseTableName=contact_request_translator, constraintName=fk_contact_request_translator_contact_request, referencedTableName=contact_request; addForeignKeyConstraint baseTabl...		\N	4.5.0	\N	\N	1585327221
2021-12-17-add-language_pair-check-constraint	terova	migrations.xml	2022-05-03 13:42:07.493803	11	EXECUTED	8:7065e9d0789130793d3ad73e169b566f	sql		\N	4.5.0	\N	\N	1585327221
2021-12-21-create-shedlock-table	terova	migrations.xml	2022-05-03 13:42:07.497906	12	EXECUTED	8:8d3e6aaeff0d8838d329ebbaa95bc096	createTable tableName=shedlock		\N	4.5.0	\N	\N	1585327221
2021-12-21-add-enum-email_type	terova	migrations.xml	2022-05-03 13:42:07.508465	13	EXECUTED	8:f5dbab970582b5151424f27a79255378	createTable tableName=email_type; insert tableName=email_type; addColumn tableName=email; addForeignKeyConstraint baseTableName=email, constraintName=fk_email_email_type, referencedTableName=email_type		\N	4.5.0	\N	\N	1585327221
2021-12-21-add-column-email_ext_id	terova	migrations.xml	2022-05-03 13:42:07.511155	14	EXECUTED	8:632d0955aa7856d25b0c392dc59783f2	addColumn tableName=email		\N	4.5.0	\N	\N	1585327221
2022-01-03-add-meeting_date-date-uniq	terova	migrations.xml	2022-05-03 13:42:07.518768	15	EXECUTED	8:58bf4b3e897e582bf9547b3d380ecdbe	addUniqueConstraint tableName=meeting_date		\N	4.5.0	\N	\N	1585327221
2022-01-04-add-new-email-types	mikhuttu	migrations.xml	2022-05-03 13:42:07.522519	16	EXECUTED	8:ec8e1a91bf20320f58a443426379f1e2	insert tableName=email_type; insert tableName=email_type		\N	4.5.0	\N	\N	1585327221
2022-01-05-language_pair-uppercase	terova	migrations.xml	2022-05-03 13:42:07.530392	17	EXECUTED	8:fc41591bbfcd22b139c1735fde94590d	sql		\N	4.5.0	\N	\N	1585327221
2022-01-07-add-person_details	terova	migrations.xml	2022-05-03 13:42:07.537383	18	EXECUTED	8:103587d2cafb92743989f5e1c05021fe	dropColumn tableName=translator; addColumn tableName=translator		\N	4.5.0	\N	\N	1585327221
2022-01-14-move_language_pair_to_authorisation	terova	migrations.xml	2022-05-03 13:42:07.544324	19	EXECUTED	8:c6119c02b1bdfe30db84c0a58e3d3c50	addColumn tableName=authorisation; dropTable tableName=language_pair		\N	4.5.0	\N	\N	1585327221
2022-01-20-add-column-authorisation_diary_number	mikhuttu	migrations.xml	2022-05-03 13:42:07.550094	20	EXECUTED	8:3e43e94da3d6257a9d6ab89a16c53183	addColumn tableName=authorisation		\N	4.5.0	\N	\N	1585327221
2022-01-21-change_email_columns	mikhuttu	migrations.xml	2022-05-03 13:42:07.554426	21	EXECUTED	8:f5dbcf2cce10ccee99da3b4b1f60799f	dropColumn tableName=email; addColumn tableName=email; renameColumn newColumnName=recipient_address, oldColumnName=recipient, tableName=email		\N	4.5.0	\N	\N	1585327221
2022-01-21-modify_translator_email	mikhuttu	migrations.xml	2022-05-03 13:42:07.564388	22	EXECUTED	8:4f224d2fe743d0f5bb6ccb68d77853aa	modifyDataType columnName=email, tableName=translator; addUniqueConstraint tableName=translator		\N	4.5.0	\N	\N	1585327221
2022-02-01-new_contact_request_email_types	mikhuttu	migrations.xml	2022-05-03 13:42:07.568007	23	EXECUTED	8:3e31435286a431bdec520a7b01a537ab	insert tableName=email_type; insert tableName=email_type		\N	4.5.0	\N	\N	1585327221
2022-02-01-rename_email_type_contact_request	mikhuttu	migrations.xml	2022-05-03 13:42:07.572405	24	EXECUTED	8:636e63499d0a369945bd90269688102d	insert tableName=email_type; update tableName=email; delete tableName=email_type		\N	4.5.0	\N	\N	1585327221
2022-02-08-check_from_lang_and_to_lang	terova	migrations.xml	2022-05-03 13:42:07.575449	25	EXECUTED	8:b4c7cad76249520a682116e1b3e936ae	sql		\N	4.5.0	\N	\N	1585327221
2022-02-09-add-column-translator_extra_information	mikhuttu	migrations.xml	2022-05-03 13:42:07.577888	26	EXECUTED	8:529f01eadf925629f9f9f5a85f25dadc	addColumn tableName=translator		\N	4.5.0	\N	\N	1585327221
2022-02-28-move_authorisation_term_contents_under_authorisation	mikhuttu	migrations.xml	2022-05-03 13:42:07.588848	27	EXECUTED	8:aa2182fccae1c40bc76f6e82cc068187	dropForeignKeyConstraint baseTableName=authorisation_term, constraintName=fk_authorisation_term_authorisation; dropForeignKeyConstraint baseTableName=authorisation_term_reminder, constraintName=fk_authorisation_term_reminder_authorisation_term; de...		\N	4.5.0	\N	\N	1585327221
2022-03-03-drop_authorisation_unused_date_columns	mikhuttu	migrations.xml	2022-05-03 13:42:07.59616	28	EXECUTED	8:772ddd0214963788b04ff8a118db6c37	sql; sql; dropColumn columnName=kkt_check, tableName=authorisation; dropColumn columnName=vir_date, tableName=authorisation; dropColumn columnName=assurance_date, tableName=authorisation		\N	4.5.0	\N	\N	1585327221
2022-03-03-nullable_authorisation_diary_number	mikhuttu	migrations.xml	2022-05-03 13:42:07.600192	29	EXECUTED	8:4b9a27fa6f1252767f46578d7ae94f32	dropColumn columnName=diary_number, tableName=authorisation; addColumn tableName=authorisation		\N	4.5.0	\N	\N	1585327221
2022-03-04-add_translator_is_assurance_given	mikhuttu	migrations.xml	2022-05-03 13:42:07.603542	30	EXECUTED	8:9a36f41e82b79a4eadcbc5632c78de37	addColumn tableName=translator; dropDefaultValue columnName=is_assurance_given, tableName=translator		\N	4.5.0	\N	\N	1585327221
2022-03-11-modify_authorisation_aut_date_constraint	mikhuttu	migrations.xml	2022-05-03 13:42:07.607196	31	EXECUTED	8:7102b99cd73c0a549ca2e3969f2953f9	sql; sql		\N	4.5.0	\N	\N	1585327221
2022-03-24-translator_named_constraints_postgresql	terova	migrations.xml	2022-05-03 13:42:07.614338	32	EXECUTED	8:f53e6500c41e723a255f7f0c26f6cf3f	dropUniqueConstraint constraintName=translator_identity_number_key, tableName=translator; addUniqueConstraint constraintName=uk_translator_identity_number, tableName=translator; dropUniqueConstraint constraintName=translator_email_key, tableName=t...		\N	4.5.0	\N	\N	1585327221
2021-04-25-create-examination_date-table	mikhuttu	migrations.xml	2022-05-03 13:42:07.623155	33	EXECUTED	8:b6d0691a5c36deebd7c2287f1087a8b2	createTable tableName=examination_date		\N	4.5.0	\N	\N	1585327221
2022-04-25-change_authorisation_aut_date_to_examination_date	mikhuttu	migrations.xml	2022-05-03 13:42:07.629119	34	EXECUTED	8:fcfe8eb5b9a6983794c0d20cf8e59363	sql; dropColumn columnName=aut_date, tableName=authorisation; addColumn tableName=authorisation; addForeignKeyConstraint baseTableName=authorisation, constraintName=fk_authorisation_examination_date, referencedTableName=examination_date; sql		\N	4.5.0	\N	\N	1585327221
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

