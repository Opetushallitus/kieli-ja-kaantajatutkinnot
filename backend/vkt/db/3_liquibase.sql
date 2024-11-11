--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

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
2022-09-14-create-table-exam_language	mikhuttu	migrations.xml	2022-09-28 13:03:11.518594	1	EXECUTED	9:01b3c2b6d1b07e777b86ea211569ce34	createTable tableName=exam_language; insert tableName=exam_language; insert tableName=exam_language		\N	4.9.1	\N	\N	4370191374
2022-09-14-create-table-exam_level	mikhuttu	migrations.xml	2022-09-28 13:03:11.529341	2	EXECUTED	9:6b045bdd49b5a6b645f7df1821fd99a8	createTable tableName=exam_level; insert tableName=exam_level		\N	4.9.1	\N	\N	4370191374
2022-09-14-create-table-exam_event	mikhuttu	migrations.xml	2022-09-28 13:03:11.567242	3	EXECUTED	9:469ab52e24b6778fc65a208c183333df	createTable tableName=exam_event; addForeignKeyConstraint baseTableName=exam_event, constraintName=fk_exam_event_language, referencedTableName=exam_language; addForeignKeyConstraint baseTableName=exam_event, constraintName=fk_exam_event_level, ref...		\N	4.9.1	\N	\N	4370191374
2022-09-19-create-table-person	mikhuttu	migrations.xml	2022-09-28 13:03:11.580327	4	EXECUTED	9:b6d90b721004da05d10471b1252976e4	createTable tableName=person; addUniqueConstraint constraintName=uk_person_onr_id, tableName=person		\N	4.9.1	\N	\N	4370191374
2022-09-19-create-table-enrollment_status	mikhuttu	migrations.xml	2022-09-28 13:03:11.593403	5	EXECUTED	9:3d0c7bf5f1331255ce5b1ccda9c349b1	createTable tableName=enrollment_status; insert tableName=enrollment_status; insert tableName=enrollment_status; insert tableName=enrollment_status; insert tableName=enrollment_status		\N	4.9.1	\N	\N	4370191374
2022-09-19-create-table-enrollment	mikhuttu	migrations.xml	2022-09-28 13:03:11.613202	6	EXECUTED	9:abacfedebf8b66d765ed003d8f1051c4	createTable tableName=enrollment; addForeignKeyConstraint baseTableName=enrollment, constraintName=fk_enrollment_exam_event, referencedTableName=exam_event; addForeignKeyConstraint baseTableName=enrollment, constraintName=fk_enrollment_person, ref...		\N	4.9.1	\N	\N	4370191374
2022-10-12-change-person-columns	mikhuttu	migrations.xml	2022-10-12 18:42:43.132484	7	EXECUTED	9:64c7f869d68907e4e75c5640170abff0	dropColumn tableName=person; addColumn tableName=person; addUniqueConstraint constraintName=uk_person_identity_number, tableName=person		\N	4.9.1	\N	\N	5600162993
2022-10-28-create-table-reservation	terova	migrations.xml	2022-11-16 16:17:55.348633	8	EXECUTED	9:5a7ec529509bd086e2b22c8090009985	createTable tableName=reservation; addForeignKeyConstraint baseTableName=reservation, constraintName=fk_reservation_exam_event, referencedTableName=exam_event; addForeignKeyConstraint baseTableName=reservation, constraintName=fk_reservation_person...		\N	4.9.1	\N	\N	8615475122
2022-11-17-move_columns_from_person_to_enrollment	terova	migrations.xml	2022-11-17 12:16:38.355334	9	EXECUTED	9:6d847e8743a2b08a08c5be28f6180ac5	addColumn tableName=enrollment; dropColumn tableName=person		\N	4.9.1	\N	\N	8680198271
2022-11-17-rename_exam_event_visible_to_hidden	terova	migrations.xml	2022-11-17 14:08:19.109749	10	EXECUTED	9:cd1240669368efdbe8d5de4e26924cd7	renameColumn newColumnName=is_hidden, oldColumnName=is_visible, tableName=exam_event; sql		\N	4.9.1	\N	\N	8686899038
2022-12-06-create-shedlock-table	terova	migrations.xml	2022-12-06 14:21:45.036739	11	EXECUTED	9:d5d845196153f4afe595382eaf208376	createTable tableName=shedlock		\N	4.9.1	\N	\N	0336504848
2022-12-06-add-enum-email_type	terova	migrations.xml	2022-12-06 14:21:45.065383	12	EXECUTED	9:3a40f8d772c317519fdaba844e162bdb	createTable tableName=email_type; insert tableName=email_type		\N	4.9.1	\N	\N	0336504848
2022-12-06-create-email-table	terova	migrations.xml	2022-12-06 14:21:45.096787	13	EXECUTED	9:d556eb6481d5aff882b485908596202f	createTable tableName=email; addForeignKeyConstraint baseTableName=email, constraintName=fk_email_email_type, referencedTableName=email_type		\N	4.9.1	\N	\N	0336504848
2022-12-06-create-email_attachment-table	terova	migrations.xml	2022-12-06 18:42:00.87481	14	EXECUTED	9:4c7f2fe87d7688bf0654a3e6f62a9746	createTable tableName=email_attachment; addForeignKeyConstraint baseTableName=email_attachment, constraintName=fk_email_attachment_email, referencedTableName=email		\N	4.9.1	\N	\N	0352120682
2023-01-18-modify_enrollment-table_previous-enrollment-date	mikhuttu	migrations.xml	2023-05-29 09:17:57.498963	15	EXECUTED	9:3c10af2ffb29d968230e15e621c3ba6d	modifyDataType columnName=previous_enrollment_date, tableName=enrollment; renameColumn newColumnName=previous_enrollment, oldColumnName=previous_enrollment_date, tableName=enrollment		\N	4.9.1	\N	\N	5351877372
2023-02-03-add_reservation-table_renewed_at	jrkkp	migrations.xml	2023-05-29 09:17:57.503008	16	EXECUTED	9:40b3879c568d7328d1944869f9421376	addColumn tableName=reservation		\N	4.9.1	\N	\N	5351877372
2023-03-20-add_spring_session_table	jrkkp	migrations.xml	2023-05-29 09:17:57.520006	17	EXECUTED	9:9484e3d16fe0c70adca4187e9a2b453b	createTable tableName=spring_session; createIndex indexName=spring_session_expires_idx, tableName=spring_session; createIndex indexName=spring_session_principal_idx, tableName=spring_session; createTable tableName=spring_session_attributes; addPri...		\N	4.9.1	\N	\N	5351877372
2023-04-11-add_person_oid	jrkkp	migrations.xml	2023-05-29 09:17:57.530923	18	EXECUTED	9:4904dd1ca41b61cfa4a9ff05ffde1963	addColumn tableName=person; dropNotNullConstraint columnName=identity_number, tableName=person		\N	4.9.1	\N	\N	5351877372
2023-05-03-add-enrollment-to-queue-confirmation-email_type	mikhuttu	migrations.xml	2023-05-29 09:17:57.534001	19	EXECUTED	9:5cf2bfd776d0ee74ff115ecf82793fc0	insert tableName=email_type		\N	4.9.1	\N	\N	5351877372
2023-05-25-payment-table	jrkkp	migrations.xml	2023-05-29 09:17:57.545296	20	EXECUTED	9:ca4457716b237266c83dbd9e07528ae5	createTable tableName=payment; insert tableName=enrollment_status; insert tableName=enrollment_status; addForeignKeyConstraint baseTableName=payment, constraintName=fk_payment_enrollment, referencedTableName=enrollment		\N	4.9.1	\N	\N	5351877372
2023-05-30-modify_payment-table_amount	mikhuttu	migrations.xml	2023-05-30 13:31:02.784706	21	EXECUTED	9:00ea657910e9e5e2fe442fe3af4b8511	modifyDataType columnName=amount, tableName=payment		\N	4.9.1	\N	\N	5453462712
2023-06-01-enrollment-payment-link-hash	jrkkp	migrations.xml	2023-06-01 13:53:01.472105	22	EXECUTED	9:f67baa7a2e918bb953e82f030af5c78b	addColumn tableName=enrollment		\N	4.9.1	\N	\N	5627581378
2023-06-02-rename-enrollment-status-EXPECTING_PAYMENT	mikhuttu	migrations.xml	2023-06-02 08:38:57.704377	23	EXECUTED	9:d8ace0bf20260b36e2c2f0c6833f2ffe	insert tableName=enrollment_status; sql; sql		\N	4.9.1	\N	\N	5695137627
2023-06-16-person-latest-identified-at	mikhuttu	migrations.xml	2023-06-16 09:46:36.462511	24	EXECUTED	9:7151d4c1022ac9e13ea88c9c7774e579	addColumn tableName=person; sql; addNotNullConstraint columnName=latest_identified_at, tableName=person		\N	4.20.0	\N	\N	6908796433
2023-06-29-remove-person-identity_number	mikhuttu	migrations.xml	2023-06-29 09:32:48.572192	25	EXECUTED	9:687bbb81a5282eccdb83443935421340	dropColumn columnName=identity_number, tableName=person; dropColumn columnName=date_of_birth, tableName=person		\N	4.20.0	\N	\N	8031168558
2023-08-03-payment-add-refunded	jrkkp	migrations.xml	2024-11-06 13:14:31.761976	26	EXECUTED	9:a5197d8152163f63193f3ef194e246aa	addColumn tableName=payment		\N	4.29.1	\N	\N	0891671690
2024-04-08-cas-session-ticket	jrkkp	migrations.xml	2024-11-06 13:14:31.773922	27	EXECUTED	9:b6cfacfeeaaa34091bd253a2317bea3f	createTable tableName=cas_ticket		\N	4.29.1	\N	\N	0891671690
2024-05-31-free-enrollment	lket	migrations.xml	2024-11-06 13:14:31.813119	28	EXECUTED	9:804d47bd31f027ba706ff62fd67412b3	createTable tableName=free_enrollment; addForeignKeyConstraint baseTableName=free_enrollment, constraintName=fk_free_enrollment_person, referencedTableName=person; addColumn tableName=enrollment; addForeignKeyConstraint baseTableName=enrollment, c...		\N	4.29.1	\N	\N	0891671690
2024-06-18-add-uuid-to-person-postgres	pkoivisto	migrations.xml	2024-11-06 13:14:31.823681	29	EXECUTED	9:72ab649e66366bb6a154ca0ed767d919	addColumn tableName=person; sql; addNotNullConstraint columnName=uuid, tableName=person		\N	4.29.1	\N	\N	0891671690
2024-08-14-add-is-queued-to-enrollment	jrkkp	migrations.xml	2024-11-06 13:14:31.832944	30	EXECUTED	9:0c6f186a9f15e2e395cd24d1652bd239	addColumn tableName=enrollment; sql; sql		\N	4.29.1	\N	\N	0891671690
2024-08-27-all-koski-educations	pkoivisto	migrations.xml	2024-11-06 13:14:31.845359	31	EXECUTED	9:aee4a31a7eb021b38755e24b0c30070f	createTable tableName=koski_educations; addForeignKeyConstraint baseTableName=koski_educations, constraintName=fk_koski_educations_free_enrollment, referencedTableName=free_enrollment; addForeignKeyConstraint baseTableName=koski_educations, constr...		\N	4.29.1	\N	\N	0891671690
2024-09-11-registration-open-and-close-times-psql	jrkkp	migrations.xml	2024-11-06 13:14:31.862263	32	EXECUTED	9:27e10d6992e13a438d8945de985d1fa7	sql		\N	4.29.1	\N	\N	0891671690
2024-09-16-enrollment_appointment	jrkkp	migrations.xml	2024-11-06 13:14:31.874047	33	EXECUTED	9:2ac5933bca860e5cbbd3f9592c718275	createTable tableName=enrollment_appointment; addColumn tableName=payment		\N	4.29.1	\N	\N	0891671690
2024-10-04-examiner-and-municipality-tables	pkoivisto	migrations.xml	2024-11-06 13:14:31.897791	34	EXECUTED	9:17684f1fcc2b8eeda7ed7db0865b421a	createTable tableName=examiner; createTable tableName=municipality; createTable tableName=examiner_municipality; addUniqueConstraint constraintName=uk_examiner_municipality_examiner_id_municipality_id, tableName=examiner_municipality; addForeignKe...		\N	4.29.1	\N	\N	0891671690
2024-10-15-exam_event-add-reference-to-examiner	pkoivisto	migrations.xml	2024-11-06 13:14:31.905791	35	EXECUTED	9:88276462edd4a15ef2f384cd6094990c	dropUniqueConstraint constraintName=uk_exam_event_language_level_date, tableName=exam_event; addColumn tableName=exam_event; addForeignKeyConstraint baseTableName=exam_event, constraintName=fk_exam_event_examiner_id, referencedTableName=examiner		\N	4.29.1	\N	\N	0891671690
2024-10-15-exam_level-new-value	pkoivisto	migrations.xml	2024-11-06 13:14:31.909788	36	EXECUTED	9:8faf60b4438613d90a29a860678bf66e	insert tableName=exam_level		\N	4.29.1	\N	\N	0891671690
2024-10-15-unique-exam-event-language-level-date-examiner-on-psql	pkoivisto	migrations.xml	2024-11-06 13:14:31.915393	37	EXECUTED	9:b69bb176a254f507ddeb877153d6b162	sql		\N	4.29.1	\N	\N	0891671690
2024-11-04-add-enrollment_appointment-missing-fields	jrkkp	migrations.xml	2024-11-06 13:14:31.922772	38	EXECUTED	9:b982dffea40ebba3a547a1afd7a3ca6a	addColumn tableName=enrollment_appointment		\N	4.29.1	\N	\N	0891671690
2024-11-07-add-enrollment_appointment-missing-fields-2	jrkkp	migrations.xml	2024-11-07 13:17:52.164316	39	EXECUTED	9:a5aa107cb7c4dce06ff0e2bff24ed2f8	addColumn tableName=enrollment_appointment; addForeignKeyConstraint baseTableName=enrollment_appointment, constraintName=fk_enrollment_appointment_examiner_id, referencedTableName=examiner		\N	4.29.1	\N	\N	0978272132
2024-11-07-new-examiner_exam_event-table	pkoivisto	migrations.xml	2024-11-07 23:04:47.179822	40	EXECUTED	9:cf0bb0d78f0f4adddd3d7147692d1eed	createTable tableName=examiner_exam_event; addForeignKeyConstraint baseTableName=examiner_exam_event, constraintName=fk_examiner_exam_event_examiner_id, referencedTableName=examiner; addForeignKeyConstraint baseTableName=examiner_exam_event, const...		\N	4.29.1	\N	\N	1013487153
2024-11-11-grade-table	jrkkp	migrations.xml	2024-11-10 23:08:41.052724	41	EXECUTED	9:43366e2913881add0d3225014f755c64	createTable tableName=enrollment_grade; addColumn tableName=enrollment_appointment; addForeignKeyConstraint baseTableName=enrollment_appointment, constraintName=fk_enrollment_appointment_grade_id, referencedTableName=enrollment_grade		\N	4.29.1	\N	\N	1272921016
2024-11-08-add-enrollment-appointment-missing-fields-3	pkoivisto	migrations.xml	2024-11-11 11:38:45.813381	42	EXECUTED	9:c8743f2a64a80316026c89ba43ef3c1c	addColumn tableName=enrollment_appointment; addForeignKeyConstraint baseTableName=enrollment_appointment, constraintName=fk_enrollment_appointment_examiner_exam_event_id, referencedTableName=examiner_exam_event		\N	4.29.1	\N	\N	1317925790
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

