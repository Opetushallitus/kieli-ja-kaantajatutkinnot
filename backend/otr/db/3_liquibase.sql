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
init-01	terova	migrations.xml	2022-04-07 16:54:20.550261	1	EXECUTED	8:e2aeda9a17a461846cc10ade0158f4d0	createTable tableName=tulkki		\N	4.5.0	\N	\N	9339660474
init-02	terova	migrations.xml	2022-04-07 16:54:20.563265	2	EXECUTED	8:3eb621bb86460a069d5dceec1d30e864	createTable tableName=oikeustulkki		\N	4.5.0	\N	\N	9339660474
init-03	terova	migrations.xml	2022-04-07 16:54:20.571585	3	EXECUTED	8:73a3935e77c992fb8d39a66c244e4181	createTable tableName=kielipari		\N	4.5.0	\N	\N	9339660474
init-04	terova	migrations.xml	2022-04-07 16:54:20.579541	4	EXECUTED	8:87397f973268bb78ce19c64931e13a1e	createTable tableName=sijainti		\N	4.5.0	\N	\N	9339660474
init-05	terova	migrations.xml	2022-04-07 16:54:20.589817	5	EXECUTED	8:3bec30fada54b59df4263e5d42d257ae	createTable tableName=oikeustulkki_muokkaus		\N	4.5.0	\N	\N	9339660474
init-06	terova	migrations.xml	2022-04-07 16:54:20.599375	6	EXECUTED	8:74e7092ee93480941378d5e8a3cdffa0	createTable tableName=sahkoposti_muistutus		\N	4.5.0	\N	\N	9339660474
init-07	terova	migrations.xml	2022-04-07 16:54:20.60764	7	EXECUTED	8:8548dabb8f5e532dbbf6aa26fde4f3d5	addUniqueConstraint constraintName=kielipari_oikeustulkki_kielesta_kieleen_key, tableName=kielipari		\N	4.5.0	\N	\N	9339660474
init-08	terova	migrations.xml	2022-04-07 16:54:20.615279	8	EXECUTED	8:bc3b8807a2866f4b6c3a130ab45a1916	addForeignKeyConstraint baseTableName=kielipari, constraintName=kielipari_oikeustulkki_fkey, referencedTableName=oikeustulkki		\N	4.5.0	\N	\N	9339660474
init-09	terova	migrations.xml	2022-04-07 16:54:20.621674	9	EXECUTED	8:0a10aee2461f357882f6c3bf95585067	addForeignKeyConstraint baseTableName=oikeustulkki_muokkaus, constraintName=oikeustulkki_muokkaus_oikeustulkki_fkey, referencedTableName=oikeustulkki		\N	4.5.0	\N	\N	9339660474
init-10	terova	migrations.xml	2022-04-07 16:54:20.627762	10	EXECUTED	8:ead91e5f64a0c6a1d064550494f55e11	addForeignKeyConstraint baseTableName=oikeustulkki, constraintName=oikeustulkki_tulkki_fkey, referencedTableName=tulkki		\N	4.5.0	\N	\N	9339660474
init-11	terova	migrations.xml	2022-04-07 16:54:20.634326	11	EXECUTED	8:e5a5b27aa0d1c52be24038e0121b02fb	addForeignKeyConstraint baseTableName=sahkoposti_muistutus, constraintName=sahkoposti_muistutus_oikeustulkki_fkey, referencedTableName=oikeustulkki		\N	4.5.0	\N	\N	9339660474
init-12	terova	migrations.xml	2022-04-07 16:54:20.640644	12	EXECUTED	8:dd2a0eae5421a4306aaeea9258fe8c5d	addForeignKeyConstraint baseTableName=sijainti, constraintName=sijainti_oikeustulkki_fkey, referencedTableName=oikeustulkki		\N	4.5.0	\N	\N	9339660474
init-13	terova	migrations.xml	2022-04-07 16:54:20.650289	13	EXECUTED	8:7084da9fde16104e8e58ec08f47fb9a4	sql		\N	4.5.0	\N	\N	9339660474
init-14	terova	migrations.xml	2022-04-07 16:54:20.656394	14	EXECUTED	8:3cb8287f563e09298bb546a334db76c3	sql		\N	4.5.0	\N	\N	9339660474
2022-05-04-interpreter-table-changes	mikhuttu	migrations.xml	2022-05-11 13:10:27.188286	15	EXECUTED	8:75cda5ba2e53d7686f3cad2db0e54fac	dropForeignKeyConstraint baseTableName=oikeustulkki, constraintName=oikeustulkki_tulkki_fkey; renameColumn newColumnName=interpreter_id, oldColumnName=id, tableName=tulkki; renameColumn newColumnName=modified_at, oldColumnName=muokattu, tableName=...		\N	4.5.0	\N	\N	2274626756
2022-05-04-qualification-table-changes	mikhuttu	migrations.xml	2022-05-11 13:10:27.268907	16	EXECUTED	8:5281e6260fe37a209170d3dee0eff8e4	dropForeignKeyConstraint baseTableName=kielipari, constraintName=kielipari_oikeustulkki_fkey; dropForeignKeyConstraint baseTableName=oikeustulkki_muokkaus, constraintName=oikeustulkki_muokkaus_oikeustulkki_fkey; dropForeignKeyConstraint baseTableN...		\N	4.5.0	\N	\N	2274626756
2022-05-04-language-pair-table-changes	mikhuttu	migrations.xml	2022-05-11 13:10:27.304451	17	EXECUTED	8:15db1e7a8707cb73517c9c3523b78475	dropUniqueConstraint constraintName=kielipari_oikeustulkki_kielesta_kieleen_key, tableName=kielipari; renameColumn newColumnName=language_pair_id, oldColumnName=id, tableName=kielipari; renameColumn newColumnName=qualification_id, oldColumnName=oi...		\N	4.5.0	\N	\N	2274626756
2022-05-04-region-table-changes	mikhuttu	migrations.xml	2022-05-11 13:10:27.345069	18	EXECUTED	8:f6bccea541d6861fddde547f28840b2b	renameColumn newColumnName=region_id, oldColumnName=id, tableName=sijainti; renameColumn newColumnName=interpreter_id, oldColumnName=oikeustulkki, tableName=sijainti; renameColumn newColumnName=code, oldColumnName=koodi, tableName=sijainti; sql; d...		\N	4.5.0	\N	\N	2274626756
2022-05-04-add-dropped-foreign-key-constraints	mikhuttu	migrations.xml	2022-05-11 13:10:27.357561	19	EXECUTED	8:10a16dbe330c032202cabd57f9f77d40	addForeignKeyConstraint baseTableName=oikeustulkki_muokkaus, constraintName=fk_oikeustulkki_muokkaus_oikeustulkki, referencedTableName=qualification; addForeignKeyConstraint baseTableName=sahkoposti_muistutus, constraintName=fk_sahkoposti_muistutu...		\N	4.5.0	\N	\N	2274626756
2022-05-04-rename-sequences	mikhuttu	migrations.xml	2022-05-11 13:10:27.370048	20	EXECUTED	8:d71fa904173fb1cae72d50650380228f	sql; sql; sql; sql		\N	4.5.0	\N	\N	2274626756
2022-05-16-drop-table-oikeustulkki_muokkaus	mikhuttu	migrations.xml	2022-05-25 09:06:10.418392	21	EXECUTED	8:dca6458dfebc8502819254d6c24f561b	dropTable tableName=oikeustulkki_muokkaus; sql		\N	4.5.0	\N	\N	3469570229
2022-05-16-drop-table-sahkoposti_muistutus	mikhuttu	migrations.xml	2022-05-25 09:06:10.428584	22	EXECUTED	8:c81b92e5f498db9d0df05e75ff86a280	dropTable tableName=sahkoposti_muistutus; sql		\N	4.5.0	\N	\N	3469570229
2022-05-16-move-language-pair-under-qualification	mikhuttu	migrations.xml	2022-05-25 09:06:10.465108	23	EXECUTED	8:075bec4b649efe4256037404a1a63c9c	addColumn tableName=qualification; sql; dropTable tableName=language_pair; sql; sql; addNotNullConstraint columnName=from_lang, tableName=qualification; addNotNullConstraint columnName=to_lang, tableName=qualification; addNotNullConstraint columnN...		\N	4.5.0	\N	\N	3469570229
2022-05-16-add-diary-number-to-qualification	mikhuttu	migrations.xml	2022-05-25 09:06:10.469013	24	EXECUTED	8:6ddf477b9f0177424baff20ba163fbc2	addColumn tableName=qualification		\N	4.5.0	\N	\N	3469570229
2022-05-20-create-email_type-table	mikhuttu	migrations.xml	2022-05-25 09:06:10.483589	25	EXECUTED	8:07939e2b88abb87262f962f407998a24	createTable tableName=email_type; insert tableName=email_type		\N	4.5.0	\N	\N	3469570229
2022-05-20-create-email-table	mikhuttu	migrations.xml	2022-05-25 09:06:10.496692	26	EXECUTED	8:494bdd4265fc4b1d40ac0e4601c64ecb	createTable tableName=email; addForeignKeyConstraint baseTableName=email, constraintName=fk_email_email_type, referencedTableName=email_type		\N	4.5.0	\N	\N	3469570229
2021-11-02-create-qualification_reminder-table	mikhuttu	migrations.xml	2022-05-25 09:06:10.507125	27	EXECUTED	8:c1799406058d3dc5666ab6e05813a2c1	createTable tableName=qualification_reminder; addForeignKeyConstraint baseTableName=qualification_reminder, constraintName=fk_qualification_reminder_qualification, referencedTableName=qualification; addForeignKeyConstraint baseTableName=qualificat...		\N	4.5.0	\N	\N	3469570229
2022-05-20-create-shedlock-table	mikhuttu	migrations.xml	2022-05-25 09:06:10.513148	28	EXECUTED	8:8d3e6aaeff0d8838d329ebbaa95bc096	createTable tableName=shedlock		\N	4.5.0	\N	\N	3469570229
2022-05-25-qualification-from_lang-constraint	mikhuttu	migrations.xml	2022-05-25 10:26:06.079658	29	EXECUTED	8:8f0bf74902bb4a3960c328ca2c8ec108	sql		\N	4.5.0	\N	\N	3474365948
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

