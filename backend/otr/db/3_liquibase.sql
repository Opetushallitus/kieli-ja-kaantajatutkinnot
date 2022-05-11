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

