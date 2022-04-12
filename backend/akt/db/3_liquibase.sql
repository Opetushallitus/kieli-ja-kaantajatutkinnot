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
2021-11-02-create-meeting_date-table	terova	migrations.xml	2022-01-14 12:10:40.050854	1	EXECUTED	8:a1e92c8f7fd1420049d42d979a27b93a	createTable tableName=meeting_date		\N	4.3.5	\N	\N	2155039865
2021-11-02-create-authorisation_basis-table	terova	migrations.xml	2022-01-14 12:10:40.075783	2	EXECUTED	8:e3237db0c80a738e470dbfd514e657e4	createTable tableName=authorisation_basis; insert tableName=authorisation_basis; insert tableName=authorisation_basis; insert tableName=authorisation_basis		\N	4.3.5	\N	\N	2155039865
2021-11-02-create-translator-table	terova	migrations.xml	2022-01-14 12:10:40.093065	3	EXECUTED	8:4138e47fa4d12e1540c5834e58b81c0e	createTable tableName=translator		\N	4.3.5	\N	\N	2155039865
2021-11-02-create-authorisation-table	terova	migrations.xml	2022-01-14 12:10:40.134579	4	EXECUTED	8:f3dd004c7c277327a2846b0ceae5a5ec	createTable tableName=authorisation; addForeignKeyConstraint baseTableName=authorisation, constraintName=fk_authorisation_translator, referencedTableName=translator; addForeignKeyConstraint baseTableName=authorisation, constraintName=fk_authorisat...		\N	4.3.5	\N	\N	2155039865
2021-11-02-create-language_pair-table	terova	migrations.xml	2022-01-14 12:10:40.160362	5	EXECUTED	8:fcfcaa2a32865c4929340238e497e9be	createTable tableName=language_pair; addForeignKeyConstraint baseTableName=language_pair, constraintName=fk_language_pair_authorisation, referencedTableName=authorisation; createIndex indexName=language_pair_uniq, tableName=language_pair		\N	4.3.5	\N	\N	2155039865
2021-11-02-create-authorisation_term-table	terova	migrations.xml	2022-01-14 12:10:40.185983	6	EXECUTED	8:ba5ebcbc8a372a5aca62eec5fd81c1ae	createTable tableName=authorisation_term; addForeignKeyConstraint baseTableName=authorisation_term, constraintName=fk_authorisation_term_authorisation, referencedTableName=authorisation; sql		\N	4.3.5	\N	\N	2155039865
2021-11-02-create-email-table	terova	migrations.xml	2022-01-14 12:10:40.202415	7	EXECUTED	8:d6d306a7ecd9d787ebbec875b8286b0f	createTable tableName=email		\N	4.3.5	\N	\N	2155039865
2021-11-02-create-authorisation_term_reminder-table	terova	migrations.xml	2022-01-14 12:10:40.222647	8	EXECUTED	8:fce40a40cc7077fed2c6c1b4a0d7f40d	createTable tableName=authorisation_term_reminder; addForeignKeyConstraint baseTableName=authorisation_term_reminder, constraintName=fk_authorisation_term_reminder_authorisation_term, referencedTableName=authorisation_term; addForeignKeyConstraint...		\N	4.3.5	\N	\N	2155039865
2021-12-14-create-contact_request-table	mikhuttu	migrations.xml	2022-01-14 12:10:40.23801	9	EXECUTED	8:944cf8f9fef67a908ef0ab4067bc1a8d	createTable tableName=contact_request		\N	4.3.5	\N	\N	2155039865
2021-12-14-create-contact_request_translator-table	mikhuttu	migrations.xml	2022-01-14 12:10:40.256869	10	EXECUTED	8:7165914d18b46100505d10612231dfea	createTable tableName=contact_request_translator; addForeignKeyConstraint baseTableName=contact_request_translator, constraintName=fk_contact_request_translator_contact_request, referencedTableName=contact_request; addForeignKeyConstraint baseTabl...		\N	4.3.5	\N	\N	2155039865
2021-12-17-add-language_pair-check-constraint	terova	migrations.xml	2022-01-14 12:10:40.268206	11	EXECUTED	8:7065e9d0789130793d3ad73e169b566f	sql		\N	4.3.5	\N	\N	2155039865
2021-12-21-create-shedlock-table	terova	migrations.xml	2022-01-14 12:10:40.280826	12	EXECUTED	8:8d3e6aaeff0d8838d329ebbaa95bc096	createTable tableName=shedlock		\N	4.3.5	\N	\N	2155039865
2021-12-21-add-enum-email_type	terova	migrations.xml	2022-01-14 12:10:40.300106	13	EXECUTED	8:f5dbab970582b5151424f27a79255378	createTable tableName=email_type; insert tableName=email_type; addColumn tableName=email; addForeignKeyConstraint baseTableName=email, constraintName=fk_email_email_type, referencedTableName=email_type		\N	4.3.5	\N	\N	2155039865
2021-12-21-add-column-email_ext_id	terova	migrations.xml	2022-01-14 12:10:40.311172	14	EXECUTED	8:632d0955aa7856d25b0c392dc59783f2	addColumn tableName=email		\N	4.3.5	\N	\N	2155039865
2022-01-03-add-meeting_date-date-uniq	terova	migrations.xml	2022-01-14 12:10:40.323629	15	EXECUTED	8:58bf4b3e897e582bf9547b3d380ecdbe	addUniqueConstraint tableName=meeting_date		\N	4.3.5	\N	\N	2155039865
2022-01-04-add-new-email-types	mikhuttu	migrations.xml	2022-01-14 12:10:40.33484	16	EXECUTED	8:ec8e1a91bf20320f58a443426379f1e2	insert tableName=email_type; insert tableName=email_type		\N	4.3.5	\N	\N	2155039865
2022-01-05-language_pair-uppercase	terova	migrations.xml	2022-01-14 12:10:40.349389	17	EXECUTED	8:fc41591bbfcd22b139c1735fde94590d	sql		\N	4.3.5	\N	\N	2155039865
2022-01-07-add-person_details	terova	migrations.xml	2022-01-14 12:10:40.378113	18	EXECUTED	8:103587d2cafb92743989f5e1c05021fe	dropColumn tableName=translator; addColumn tableName=translator		\N	4.3.5	\N	\N	2155039865
2022-01-14-move_language_pair_to_authorisation	terova	migrations.xml	2022-01-14 12:10:40.396453	19	EXECUTED	8:c6119c02b1bdfe30db84c0a58e3d3c50	addColumn tableName=authorisation; dropTable tableName=language_pair		\N	4.3.5	\N	\N	2155039865
2022-01-20-add-column-authorisation_diary_number	mikhuttu	migrations.xml	2022-01-20 14:36:57.58396	20	EXECUTED	8:3e43e94da3d6257a9d6ab89a16c53183	addColumn tableName=authorisation		\N	4.3.5	\N	\N	2689417384
2022-01-21-change_email_columns	mikhuttu	migrations.xml	2022-01-21 09:29:52.090978	21	EXECUTED	8:f5dbcf2cce10ccee99da3b4b1f60799f	dropColumn tableName=email; addColumn tableName=email; renameColumn newColumnName=recipient_address, oldColumnName=recipient, tableName=email		\N	4.3.5	\N	\N	2757391940
2022-01-21-modify_translator_email	mikhuttu	migrations.xml	2022-01-21 09:29:52.156223	22	EXECUTED	8:4f224d2fe743d0f5bb6ccb68d77853aa	modifyDataType columnName=email, tableName=translator; addUniqueConstraint tableName=translator		\N	4.3.5	\N	\N	2757391940
2022-02-01-new_contact_request_email_types	mikhuttu	migrations.xml	2022-02-01 08:51:57.257592	23	EXECUTED	8:3e31435286a431bdec520a7b01a537ab	insert tableName=email_type; insert tableName=email_type		\N	4.3.5	\N	\N	3705517103
2022-02-01-rename_email_type_contact_request	mikhuttu	migrations.xml	2022-02-01 08:51:57.274921	24	EXECUTED	8:636e63499d0a369945bd90269688102d	insert tableName=email_type; update tableName=email; delete tableName=email_type		\N	4.3.5	\N	\N	3705517103
2022-02-08-check_from_lang_and_to_lang	terova	migrations.xml	2022-02-09 15:53:47.664419	25	EXECUTED	8:b4c7cad76249520a682116e1b3e936ae	sql		\N	4.3.5	\N	\N	4422027486
2022-02-09-add-column-translator_extra_information	mikhuttu	migrations.xml	2022-02-09 15:53:47.676833	26	EXECUTED	8:529f01eadf925629f9f9f5a85f25dadc	addColumn tableName=translator		\N	4.3.5	\N	\N	4422027486
2022-02-28-move_authorisation_term_contents_under_authorisation	mikhuttu	migrations.xml	2022-02-28 10:33:22.318797	27	EXECUTED	8:aa2182fccae1c40bc76f6e82cc068187	dropForeignKeyConstraint baseTableName=authorisation_term, constraintName=fk_authorisation_term_authorisation; dropForeignKeyConstraint baseTableName=authorisation_term_reminder, constraintName=fk_authorisation_term_reminder_authorisation_term; de...		\N	4.3.5	\N	\N	6044401975
2022-03-03-drop_authorisation_unused_date_columns	mikhuttu	migrations.xml	2022-03-03 13:29:48.667704	28	EXECUTED	8:772ddd0214963788b04ff8a118db6c37	sql; sql; dropColumn columnName=kkt_check, tableName=authorisation; dropColumn columnName=vir_date, tableName=authorisation; dropColumn columnName=assurance_date, tableName=authorisation		\N	4.3.5	\N	\N	6314188424
2022-03-03-nullable_authorisation_diary_number	mikhuttu	migrations.xml	2022-03-03 13:29:48.68439	29	EXECUTED	8:4b9a27fa6f1252767f46578d7ae94f32	dropColumn columnName=diary_number, tableName=authorisation; addColumn tableName=authorisation		\N	4.3.5	\N	\N	6314188424
2022-03-04-add_translator_is_assurance_given	mikhuttu	migrations.xml	2022-03-09 07:50:59.720426	30	EXECUTED	8:9a36f41e82b79a4eadcbc5632c78de37	addColumn tableName=translator; dropDefaultValue columnName=is_assurance_given, tableName=translator		\N	4.3.5	\N	\N	6812259593
2022-03-11-modify_authorisation_aut_date_constraint	mikhuttu	migrations.xml	2022-03-11 13:58:56.831191	31	EXECUTED	8:7102b99cd73c0a549ca2e3969f2953f9	sql; sql		\N	4.3.5	\N	\N	7007136607
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

