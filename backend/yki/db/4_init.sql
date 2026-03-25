--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Debian 10.4-2.pgdg90+1)
-- Dumped by pg_dump version 15.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET search_path = public;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: cas_oppija_ticketstore; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cas_oppija_ticketstore (ticket, logged_in) FROM stdin;
\.


--
-- Data for Name: cas_ticketstore; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cas_ticketstore (ticket, logged_in) FROM stdin;
\.


--
-- Data for Name: organizer; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.organizer (id, oid, agreement_start_date, agreement_end_date, contact_name, contact_email, contact_phone_number, extra, deleted_at, created, modified) FROM stdin;
1	1.2.3.4	2022-01-01	2030-12-31	Kontakti	kontakti@invalid	040123456789		\N	2022-12-01 12:21:45.778485+00	2022-12-01 12:21:45.778485+00
\.


--
-- Data for Name: contact; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.contact (id, organizer_id, name, email, phone_number, deleted_at, created, modified) FROM stdin;
\.


--
-- Data for Name: databasechangelog; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.databasechangelog (id, author, filename, dateexecuted, orderexecuted, exectype, md5sum, description, comments, tag, liquibase, contexts, labels, deployment_id) FROM stdin;
2025-10-22-create-awaiting-approval-registration-state	jrkkp	migrations.xml	2025-10-23 11:44:24.800348	7	EXECUTED	9:a7a0b779e58da5bb7a447623fc7cd02d	sql		\N	4.33.0	\N	\N	1209064340
2025-09-18-add-free-registration	jrkkp	migrations.xml	2025-09-18 15:57:59.705766	1	EXECUTED	9:f85c44190f96e4c3c603209ed1b69b2e	createTable tableName=free_registration; addColumn tableName=registration		\N	4.32.0	\N	\N	8200279238
2025-11-04-add-free-registration-is_foreign-column	pkoivisto	migrations.xml	2025-11-06 13:20:42.971072	10	EXECUTED	9:750d0faa71ac7b6f422cdc877cbb71b4	addColumn tableName=free_registration		\N	4.33.0	\N	\N	2428042445
2025-11-12-add-free-registration-base-entity	jrkkp	migrations.xml	2025-11-12 12:10:21.11799	11	EXECUTED	9:0ba9603ad0039e1b3ef0cea9e4ccd962	addColumn tableName=free_registration		\N	4.33.0	\N	\N	2942220594
\.


--
-- Data for Name: databasechangeloglock; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.databasechangeloglock (id, locked, lockgranted, lockedby) FROM stdin;
1	f	\N	\N
\.


--
-- Data for Name: exam_date; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exam_date (id, exam_date, registration_start_date, registration_end_date, created, modified, post_admission_end_date, post_admission_start_date, post_admission_enabled, deleted_at) FROM stdin;
1	2018-01-27	2017-12-01	2017-12-08	2022-11-30 14:13:51.540324+00	2022-11-30 14:13:51.540324+00	\N	\N	f	\N
2	2018-10-27	2018-09-03	2018-09-28	2022-11-30 14:13:51.542191+00	2022-11-30 14:13:51.542191+00	\N	\N	f	\N
3	2018-11-10	2018-09-03	2018-09-28	2022-11-30 14:13:51.543629+00	2022-11-30 14:13:51.543629+00	\N	\N	f	\N
4	2018-11-17	2018-09-03	2018-09-28	2022-11-30 14:13:51.545045+00	2022-11-30 14:13:51.545045+00	\N	\N	f	\N
5	2019-01-26	2018-12-03	2018-12-14	2022-11-30 14:13:51.548082+00	2022-11-30 14:13:51.548082+00	\N	\N	f	\N
6	2019-03-23	2019-02-01	2019-02-28	2022-11-30 14:13:51.549588+00	2022-11-30 14:13:51.549588+00	\N	\N	f	\N
7	2019-04-06	2019-02-01	2019-02-28	2022-11-30 14:13:51.552759+00	2022-11-30 14:13:51.552759+00	\N	\N	f	\N
8	2019-04-13	2019-02-01	2019-02-28	2022-11-30 14:13:51.55392+00	2022-11-30 14:13:51.55392+00	\N	\N	f	\N
9	2019-05-18	2019-04-15	2019-04-30	2022-11-30 14:13:51.556157+00	2022-11-30 14:13:51.556157+00	\N	\N	f	\N
10	2019-08-31	2019-06-03	2019-06-14	2022-11-30 14:13:51.557461+00	2022-11-30 14:13:51.557461+00	\N	\N	f	\N
11	2019-10-05	2019-08-19	2019-08-30	2022-11-30 14:13:51.559516+00	2022-11-30 14:13:51.559516+00	\N	\N	f	\N
12	2019-10-26	2019-09-02	2019-09-30	2022-11-30 14:13:51.560811+00	2022-11-30 14:13:51.560811+00	\N	\N	f	\N
13	2019-11-09	2019-09-02	2019-09-30	2022-11-30 14:13:51.562416+00	2022-11-30 14:13:51.562416+00	\N	\N	f	\N
14	2019-11-16	2019-09-02	2019-09-30	2022-11-30 14:13:51.563825+00	2022-11-30 14:13:51.563825+00	\N	\N	f	\N
15	2020-01-25	2019-12-02	2019-12-13	2022-11-30 14:13:51.566457+00	2022-11-30 14:13:51.566457+00	\N	\N	f	\N
16	2020-03-14	2020-02-02	2020-02-28	2022-11-30 14:13:51.56759+00	2022-11-30 14:13:51.56759+00	\N	\N	f	\N
17	2020-03-28	2020-02-03	2020-02-28	2022-11-30 14:13:51.570018+00	2022-11-30 14:13:51.570018+00	\N	\N	f	\N
18	2020-04-04	2020-02-03	2020-02-28	2022-11-30 14:13:51.571101+00	2022-11-30 14:13:51.571101+00	\N	\N	f	\N
19	2020-05-23	2020-04-20	2020-04-30	2022-11-30 14:13:51.573215+00	2022-11-30 14:13:51.573215+00	\N	\N	f	\N
20	2020-08-29	2020-06-01	2020-06-12	2022-11-30 14:13:51.574288+00	2022-11-30 14:13:51.574288+00	\N	\N	f	\N
21	2020-10-03	2020-08-17	2020-08-31	2022-11-30 14:13:51.576109+00	2022-11-30 14:13:51.576109+00	\N	\N	f	\N
22	2020-10-23	2020-09-01	2020-09-30	2022-11-30 14:13:51.577177+00	2022-11-30 14:13:51.577177+00	\N	\N	f	\N
23	2020-10-24	2020-09-01	2020-09-30	2022-11-30 14:13:51.578231+00	2022-11-30 14:13:51.578231+00	\N	\N	f	\N
24	2020-11-07	2020-09-01	2020-09-30	2022-11-30 14:13:51.579499+00	2022-11-30 14:13:51.579499+00	\N	\N	f	\N
25	2020-11-14	2020-09-01	2020-09-30	2022-11-30 14:13:51.580628+00	2022-11-30 14:13:51.580628+00	\N	\N	f	\N
26	2021-01-30	2020-12-01	2020-12-11	2022-11-30 14:13:51.58286+00	2022-11-30 14:13:51.58286+00	\N	\N	f	\N
27	2020-08-22	2020-06-01	2020-06-12	2022-11-30 14:13:51.663754+00	2022-11-30 14:13:51.663754+00	\N	\N	f	\N
28	2025-07-21	2025-06-23	2025-07-23	2022-12-01 12:21:45.787236+00	2022-12-01 12:21:45.787236+00	2025-02-20	2025-02-01	f	\N
29	2025-07-20	2025-11-18	2025-05-06	2025-11-18 12:07:49.547263+00	2025-11-18 12:07:49.547263+00	\N	\N	f	\N
30	2025-03-25	2025-11-18	2025-05-06	2025-11-18 12:07:49.547263+00	2025-11-18 12:07:49.547263+00	\N	\N	f	\N
31	2026-11-30	2025-11-18	2025-05-06	2025-11-18 12:07:49.547263+00	2025-11-18 12:07:49.547263+00	\N	\N	f	\N
32	2026-10-23	2025-11-18	2025-05-06	2025-11-18 12:07:49.547263+00	2025-11-18 12:07:49.547263+00	\N	\N	f	\N
33	2026-12-30	2025-11-18	2025-05-06	2025-11-18 12:07:49.547263+00	2025-11-18 12:07:49.547263+00	\N	\N	f	\N
34	2026-09-01	2025-11-18	2025-05-06	2025-11-18 12:07:49.547263+00	2025-11-18 12:07:49.547263+00	\N	\N	f	\N
35	2026-11-22	2025-11-18	2025-05-06	2025-11-18 12:07:49.547263+00	2025-11-18 12:07:49.547263+00	\N	\N	f	\N
36	2026-09-05	2025-11-18	2025-05-06	2025-11-18 12:07:49.547263+00	2025-11-18 12:07:49.547263+00	\N	\N	f	\N
37	2026-10-18	2025-11-18	2025-05-06	2025-11-18 12:07:49.547263+00	2025-11-18 12:07:49.547263+00	\N	\N	f	\N
38	2025-07-20	2025-12-02	2025-05-06	2025-12-02 15:33:16.721932+00	2025-12-02 15:33:16.721932+00	\N	\N	f	\N
39	2025-03-25	2025-12-02	2025-05-06	2025-12-02 15:33:16.721932+00	2025-12-02 15:33:16.721932+00	\N	\N	f	\N
40	2026-11-30	2025-12-02	2025-05-06	2025-12-02 15:33:16.721932+00	2025-12-02 15:33:16.721932+00	\N	\N	f	\N
41	2026-10-23	2025-12-02	2025-05-06	2025-12-02 15:33:16.721932+00	2025-12-02 15:33:16.721932+00	\N	\N	f	\N
42	2026-12-30	2025-12-02	2025-05-06	2025-12-02 15:33:16.721932+00	2025-12-02 15:33:16.721932+00	\N	\N	f	\N
43	2026-09-01	2025-12-02	2025-05-06	2025-12-02 15:33:16.721932+00	2025-12-02 15:33:16.721932+00	\N	\N	f	\N
44	2026-11-22	2025-12-02	2025-05-06	2025-12-02 15:33:16.721932+00	2025-12-02 15:33:16.721932+00	\N	\N	f	\N
45	2026-09-05	2025-12-02	2025-05-06	2025-12-02 15:33:16.721932+00	2025-12-02 15:33:16.721932+00	\N	\N	f	\N
46	2026-10-18	2025-12-02	2025-05-06	2025-12-02 15:33:16.721932+00	2025-12-02 15:33:16.721932+00	\N	\N	f	\N
\.


--
-- Data for Name: exam_level; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exam_level (code, created) FROM stdin;
PERUS	2022-11-30 14:13:51.538476+00
KESKI	2022-11-30 14:13:51.539196+00
YLIN	2022-11-30 14:13:51.539767+00
\.


--
-- Data for Name: language; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.language (code, created) FROM stdin;
fin	2022-11-30 14:13:51.532916+00
swe	2022-11-30 14:13:51.533786+00
eng	2022-11-30 14:13:51.534399+00
spa	2022-11-30 14:13:51.534979+00
ita	2022-11-30 14:13:51.535495+00
fra	2022-11-30 14:13:51.536075+00
sme	2022-11-30 14:13:51.536695+00
deu	2022-11-30 14:13:51.537193+00
rus	2022-11-30 14:13:51.53784+00
\.


--
-- Data for Name: exam_date_language; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exam_date_language (id, exam_date_id, language_code, created, level_code, deleted_at) FROM stdin;
1	1	fin	2022-11-30 14:13:51.54109+00	PERUS	\N
2	2	eng	2022-11-30 14:13:51.542867+00	PERUS	\N
3	3	fin	2022-11-30 14:13:51.544216+00	PERUS	\N
4	4	spa	2022-11-30 14:13:51.545728+00	PERUS	\N
5	4	sme	2022-11-30 14:13:51.546481+00	PERUS	\N
6	4	deu	2022-11-30 14:13:51.54734+00	PERUS	\N
7	5	fin	2022-11-30 14:13:51.548712+00	PERUS	\N
8	6	eng	2022-11-30 14:13:51.550378+00	PERUS	\N
9	6	ita	2022-11-30 14:13:51.551374+00	PERUS	\N
10	6	rus	2022-11-30 14:13:51.55207+00	PERUS	\N
11	7	fin	2022-11-30 14:13:51.553319+00	PERUS	\N
12	8	fra	2022-11-30 14:13:51.554467+00	PERUS	\N
13	8	swe	2022-11-30 14:13:51.555007+00	PERUS	\N
14	8	sme	2022-11-30 14:13:51.555542+00	PERUS	\N
15	9	fin	2022-11-30 14:13:51.556751+00	PERUS	\N
16	10	fin	2022-11-30 14:13:51.55812+00	PERUS	\N
17	10	swe	2022-11-30 14:13:51.55882+00	PERUS	\N
18	11	fin	2022-11-30 14:13:51.560183+00	PERUS	\N
19	12	eng	2022-11-30 14:13:51.561594+00	PERUS	\N
20	13	fin	2022-11-30 14:13:51.563124+00	PERUS	\N
21	14	spa	2022-11-30 14:13:51.564497+00	PERUS	\N
22	14	swe	2022-11-30 14:13:51.565137+00	PERUS	\N
23	14	deu	2022-11-30 14:13:51.565797+00	PERUS	\N
24	15	fin	2022-11-30 14:13:51.567+00	PERUS	\N
25	16	eng	2022-11-30 14:13:51.568242+00	PERUS	\N
26	16	ita	2022-11-30 14:13:51.568893+00	PERUS	\N
27	16	rus	2022-11-30 14:13:51.569457+00	PERUS	\N
28	17	fin	2022-11-30 14:13:51.570526+00	PERUS	\N
29	18	fra	2022-11-30 14:13:51.571587+00	PERUS	\N
30	18	swe	2022-11-30 14:13:51.572114+00	PERUS	\N
31	18	sme	2022-11-30 14:13:51.572661+00	PERUS	\N
32	19	fin	2022-11-30 14:13:51.573736+00	PERUS	\N
33	20	swe	2022-11-30 14:13:51.574781+00	PERUS	\N
34	20	fin	2022-11-30 14:13:51.575501+00	PERUS	\N
35	21	fin	2022-11-30 14:13:51.576624+00	PERUS	\N
36	22	fin	2022-11-30 14:13:51.577679+00	PERUS	\N
37	23	eng	2022-11-30 14:13:51.57886+00	PERUS	\N
38	24	fin	2022-11-30 14:13:51.580015+00	PERUS	\N
39	25	spa	2022-11-30 14:13:51.581154+00	PERUS	\N
40	25	swe	2022-11-30 14:13:51.581682+00	PERUS	\N
41	25	deu	2022-11-30 14:13:51.582265+00	PERUS	\N
42	26	fin	2022-11-30 14:13:51.583361+00	PERUS	\N
43	27	eng	2022-11-30 14:13:51.664733+00	PERUS	\N
44	27	fra	2022-11-30 14:13:51.665696+00	PERUS	\N
45	28	fin	2022-12-01 12:21:45.799331+00	PERUS	\N
\.


--
-- Data for Name: evaluation; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.evaluation (id, exam_date_id, exam_date_language_id, evaluation_start_date, evaluation_end_date, deleted_at) FROM stdin;
\.


--
-- Data for Name: evaluation_order; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.evaluation_order (id, evaluation_id, first_names, last_name, email, birthdate, extra, created, deleted_at) FROM stdin;
\.


--
-- Data for Name: subtest; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.subtest (code, created) FROM stdin;
READING	2022-11-30 14:13:51.713412+00
LISTENING	2022-11-30 14:13:51.713412+00
WRITING	2022-11-30 14:13:51.713412+00
SPEAKING	2022-11-30 14:13:51.713412+00
\.


--
-- Data for Name: evaluation_order_subtest; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.evaluation_order_subtest (id, evaluation_order_id, subtest, created, deleted_at) FROM stdin;
\.


--
-- Data for Name: evaluation_payment; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.evaluation_payment (id, state, evaluation_order_id, amount, lang, reference_number, order_number, external_payment_id, payment_method, payed_at, created, modified) FROM stdin;
\.


--
-- Data for Name: evaluation_payment_config; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.evaluation_payment_config (id, merchant_id, merchant_secret, email, test_mode) FROM stdin;
1	\N	\N	placeholder@testi.fi	f
\.


--
-- Data for Name: evaluation_payment_new; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.evaluation_payment_new (id, state, evaluation_order_id, amount, reference, transaction_id, href, paid_at, created, modified) FROM stdin;
\.


--
-- Data for Name: exam_language; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exam_language (id, language_code, level_code, organizer_id, created) FROM stdin;
1	fin	PERUS	1	2022-12-01 12:21:45.802568+00
\.


--
-- Data for Name: exam_session; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exam_session (id, organizer_id, language_code, level_code, exam_date_id, max_participants, office_oid, published_at, created, modified, post_admission_start_date, post_admission_active, post_admission_quota, post_admission_activated_at) FROM stdin;
1	1	fin	PERUS	28	11	4.3.2.1	2022-12-01 12:21:45.804827+00	2022-12-01 12:21:45.804827+00	2022-12-01 12:21:45.804827+00	2022-12-01	f	5	\N
2	1	swe	KESKI	30	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
3	1	swe	KESKI	30	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
4	1	fin	PERUS	29	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
5	1	fin	KESKI	34	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
6	1	deu	YLIN	32	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
7	1	swe	PERUS	31	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
8	1	swe	YLIN	33	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
9	1	fin	KESKI	36	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
10	1	deu	YLIN	37	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
11	1	swe	PERUS	35	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
12	1	swe	PERUS	35	11	\N	\N	2025-11-18 12:07:49.548566+00	2025-11-18 12:07:49.548566+00	\N	f	\N	\N
13	1	swe	KESKI	39	11	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
14	1	swe	KESKI	39	11	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
15	1	fin	PERUS	38	11	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
16	1	fin	KESKI	43	11	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
17	1	deu	YLIN	41	11	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
18	1	swe	PERUS	40	11	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
19	1	swe	YLIN	42	11	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
20	1	fin	KESKI	45	0	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
21	1	deu	YLIN	46	0	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
22	1	swe	PERUS	44	0	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
23	1	swe	PERUS	44	0	\N	\N	2025-12-02 15:33:16.761716+00	2025-12-02 15:33:16.761716+00	\N	f	\N	\N
\.


--
-- Data for Name: participant; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.participant (id, external_user_id, email, created) FROM stdin;
722	cbe644c3-7676-41e6-9326-14cc3838eb9e	\N	2025-07-10 09:50:34.881499+00
742	b5038e82-cd44-4e81-ad29-104b5eb518a2	\N	2025-07-15 20:02:12.490452+00
745	1b53b157-012c-498f-9619-c6af709630b8	\N	2025-07-15 20:15:31.038301+00
723	a8c47a0c-227d-4f5a-a7b2-1733683506dd	\N	2025-07-10 09:50:34.881472+00
743	892dad98-3bb4-4934-975b-3dd69edbc54e	\N	2025-07-15 20:02:12.490461+00
744	28000d3f-e265-4447-a490-60b80ea22806	\N	2025-07-15 20:15:31.038229+00
724	c7fac521-d8ea-41c0-8e12-9b316ab65949	\N	2025-07-14 19:21:27.815814+00
747	a9147275-3c5c-4620-9a69-5db8395bd7e7	\N	2025-07-17 10:44:47.216387+00
725	a2a86cef-2f91-4b44-b1f2-b4e5e1e5fd02	\N	2025-07-14 19:21:27.815816+00
746	7042b4bb-8898-4a55-b898-55a7d5179b93	\N	2025-07-17 10:44:47.215381+00
726	43d3f7e3-6458-4958-9454-1bed4b71a70b	\N	2025-07-14 19:23:02.562616+00
729	c85c7e92-7d3e-46c6-a459-5fd54b9a174c	\N	2025-07-14 19:23:20.703974+00
730	9e07339c-7ea5-4506-87a2-eac506599ca6	\N	2025-07-14 19:23:35.869273+00
748	51c0e540-b444-4311-a369-5ca927ec6e10	\N	2025-07-17 11:24:40.907361+00
727	3c8477d2-4684-405a-af40-3aa9c24e41ec	\N	2025-07-14 19:23:02.562507+00
728	05ae0ef9-5d4d-4fb1-87fd-0de5c4991ea0	\N	2025-07-14 19:23:20.703981+00
731	da572b46-e1e1-449b-be3e-0dddce383332	\N	2025-07-14 19:23:35.868046+00
749	89e6562d-ffc7-4e19-9239-4b693f233405	\N	2025-07-17 11:24:40.907312+00
732	bdc7056c-c49f-45db-95fc-d7ae1744f2a9	\N	2025-07-14 20:06:17.34792+00
733	8ffa281f-ae11-4bac-905e-5036be197c73	\N	2025-07-14 20:06:17.347934+00
734	dfad4968-738d-41db-91b2-dca42020c2e2	\N	2025-07-14 20:37:50.395299+00
737	8397e8fb-5927-4b26-a07c-d1934c4c42ee	\N	2025-07-14 20:40:14.051155+00
739	f4f5850e-56e5-4373-ad56-3701c8843940	\N	2025-07-14 20:40:18.324849+00
735	217b2366-36a8-4212-9b96-4cd3b567e804	\N	2025-07-14 20:37:50.397486+00
736	382b0e83-0d3e-46e7-b326-0b1c28c943bd	\N	2025-07-14 20:40:14.051116+00
738	2c1a2f8b-6101-4e81-a16e-eb1fe373dea7	\N	2025-07-14 20:40:18.324417+00
720	556a98fb-0b2e-4ab8-947b-fe2563f87365	\N	2025-07-10 09:31:15.07226+00
740	b4b53a22-a134-4a5f-a08f-9080732e2ece	\N	2025-07-15 20:01:42.124119+00
721	210281-9988	\N	2025-07-10 09:31:15.072333+00
741	7f1ab062-d252-445d-9608-ab9c5798bf45	\N	2025-07-15 20:01:42.124169+00
750	1.2.246.562.24.82364099322	\N	2025-11-18 12:07:49.546249+00
\.


--
-- Data for Name: registration; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.registration (id, state, exam_session_id, participant_id, started_at, form, form_version, person_oid, original_exam_session_id, created, modified, kind, quarantine_id, reviewed, is_transfered, expires_at, exam_fee, lifted_from_queue_at, ui_language, free_registration_id) FROM stdin;
175	COMPLETED	5	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "fi", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.636056+00	2025-12-02 15:34:28.636056+00	ADMISSION	\N	\N	f	\N	\N	\N	\N	\N
176	PAID_AND_CANCELLED	6	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "de", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.636056+00	2025-12-02 15:34:28.636056+00	ADMISSION	\N	\N	f	\N	\N	\N	\N	\N
177	CANCELLED	7	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "de", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.636056+00	2025-12-02 15:34:28.636056+00	ADMISSION	\N	\N	f	\N	\N	\N	\N	\N
178	SUBMITTED	8	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "de", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.636056+00	2025-12-02 15:34:28.636056+00	ADMISSION	\N	\N	f	\N	\N	\N	\N	\N
179	SUBMITTED	20	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "fi", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.667504+00	2025-12-02 15:34:28.667504+00	QUEUE	\N	\N	f	\N	\N	\N	\N	\N
180	EXPIRED	21	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "de", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.667504+00	2025-12-02 15:34:28.667504+00	QUEUE	\N	\N	f	\N	\N	\N	\N	\N
181	CANCELLED	23	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "sv", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.667504+00	2025-12-02 15:34:28.667504+00	QUEUE	\N	\N	f	\N	\N	\N	\N	\N
182	SUBMITTED	22	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "sv", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.667504+00	2025-12-02 15:34:28.667504+00	QUEUE	\N	\N	f	\N	\N	\N	\N	\N
183	COMPLETED	4	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "fi", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.685691+00	2025-12-02 15:34:28.685691+00	ADMISSION	\N	\N	f	\N	\N	\N	\N	\N
184	CANCELLED	2	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "sv", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.685691+00	2025-12-02 15:34:28.685691+00	ADMISSION	\N	\N	f	\N	\N	\N	\N	\N
185	COMPLETED	3	750	\N	{"zip": "33100", "email": "aino.osallistuja@loremipsum.fi", "gender": "2", "birthdate": "1990-01-01", "exam_lang": "sv", "last_name": "Osallistuja", "first_name": "Aino", "post_office": "Tampere", "phone_number": "+358 401234567", "nationalities": ["246"], "street_address": "Katuosoite 123", "certificate_lang": "fi", "nationality_desc": "Suomi"}	\N	1.2.246.562.24.82364099322	\N	2025-12-02 15:34:28.685691+00	2025-12-02 15:34:28.685691+00	ADMISSION	\N	\N	f	\N	\N	\N	\N	\N
\.


--
-- Data for Name: exam_payment_new; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exam_payment_new (id, state, registration_id, amount, reference, transaction_id, href, paid_at, created, modified) FROM stdin;
\.


--
-- Data for Name: exam_session_contact; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exam_session_contact (id, exam_session_id, contact_id, created, deleted_at) FROM stdin;
\.


--
-- Data for Name: exam_session_location; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exam_session_location (id, name, street_address, post_office, zip, other_location_info, extra_information, lang, exam_session_id, created) FROM stdin;
1	sessiolinna	opintokuja	posti	numero		\N	fi	1	2022-12-01 12:21:45.806316+00
2	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	fi	2	2025-11-18 12:07:49.553345+00
3	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	sv	2	2025-11-18 12:07:49.553345+00
4	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	en	2	2025-11-18 12:07:49.553345+00
5	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	fi	3	2025-11-18 12:07:49.553345+00
6	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	sv	3	2025-11-18 12:07:49.553345+00
7	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	en	3	2025-11-18 12:07:49.553345+00
8	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	fi	4	2025-11-18 12:07:49.553345+00
9	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	sv	4	2025-11-18 12:07:49.553345+00
10	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	en	4	2025-11-18 12:07:49.553345+00
11	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	fi	5	2025-11-18 12:07:49.553345+00
12	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	sv	5	2025-11-18 12:07:49.553345+00
13	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	en	5	2025-11-18 12:07:49.553345+00
14	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	fi	9	2025-11-18 12:07:49.553345+00
15	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	sv	9	2025-11-18 12:07:49.553345+00
16	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	en	9	2025-11-18 12:07:49.553345+00
17	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	fi	10	2025-11-18 12:07:49.553345+00
18	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	sv	10	2025-11-18 12:07:49.553345+00
19	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	en	10	2025-11-18 12:07:49.553345+00
20	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	fi	6	2025-11-18 12:07:49.553345+00
21	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	sv	6	2025-11-18 12:07:49.553345+00
22	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	en	6	2025-11-18 12:07:49.553345+00
23	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	fi	11	2025-11-18 12:07:49.553345+00
24	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	sv	11	2025-11-18 12:07:49.553345+00
25	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	en	11	2025-11-18 12:07:49.553345+00
26	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	fi	11	2025-11-18 12:07:49.553345+00
27	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	sv	11	2025-11-18 12:07:49.553345+00
28	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	en	11	2025-11-18 12:07:49.553345+00
29	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	fi	7	2025-11-18 12:07:49.553345+00
30	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	sv	7	2025-11-18 12:07:49.553345+00
31	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	en	7	2025-11-18 12:07:49.553345+00
32	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	fi	8	2025-11-18 12:07:49.553345+00
33	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	sv	8	2025-11-18 12:07:49.553345+00
34	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	en	8	2025-11-18 12:07:49.553345+00
35	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	fi	2	2025-12-02 15:33:16.822162+00
36	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	sv	2	2025-12-02 15:33:16.822162+00
37	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	en	2	2025-12-02 15:33:16.822162+00
38	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	fi	3	2025-12-02 15:33:16.822162+00
39	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	sv	3	2025-12-02 15:33:16.822162+00
40	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	en	3	2025-12-02 15:33:16.822162+00
41	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	fi	4	2025-12-02 15:33:16.822162+00
42	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	sv	4	2025-12-02 15:33:16.822162+00
43	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	en	4	2025-12-02 15:33:16.822162+00
44	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	fi	5	2025-12-02 15:33:16.822162+00
45	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	sv	5	2025-12-02 15:33:16.822162+00
46	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	en	5	2025-12-02 15:33:16.822162+00
47	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	fi	9	2025-12-02 15:33:16.822162+00
48	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	sv	9	2025-12-02 15:33:16.822162+00
49	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	en	9	2025-12-02 15:33:16.822162+00
50	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	fi	10	2025-12-02 15:33:16.822162+00
51	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	sv	10	2025-12-02 15:33:16.822162+00
52	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	en	10	2025-12-02 15:33:16.822162+00
53	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	fi	6	2025-12-02 15:33:16.822162+00
54	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	sv	6	2025-12-02 15:33:16.822162+00
55	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	en	6	2025-12-02 15:33:16.822162+00
56	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	fi	11	2025-12-02 15:33:16.822162+00
57	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	sv	11	2025-12-02 15:33:16.822162+00
58	Testipaikan nimi	Kajaanikatu 123	Kajaani	12345	\N	\N	en	11	2025-12-02 15:33:16.822162+00
59	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	fi	11	2025-12-02 15:33:16.822162+00
60	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	sv	11	2025-12-02 15:33:16.822162+00
61	Lassilan koulu	Lassilassinkatu 12	Lassila	54321	\N	\N	en	11	2025-12-02 15:33:16.822162+00
62	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	fi	7	2025-12-02 15:33:16.822162+00
63	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	sv	7	2025-12-02 15:33:16.822162+00
64	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	en	7	2025-12-02 15:33:16.822162+00
65	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	fi	8	2025-12-02 15:33:16.822162+00
66	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	sv	8	2025-12-02 15:33:16.822162+00
67	Lorem ipsun oppilaitos	Loremipsuminkatu 12	Helsinki	00100	\N	\N	en	8	2025-12-02 15:33:16.822162+00
\.


--
-- Data for Name: exam_session_queue; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exam_session_queue (id, email, lang, exam_session_id, last_notified_at, created) FROM stdin;
\.


--
-- Data for Name: free_registration; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.free_registration (free_registration_id, source, type, matriculation_exam, higher_education_concluded, higher_education_enrolled, eb, dia, other, registration_id, is_foreign, version, created_by, modified_by, deleted_by, created_at, modified_at, deleted_at) FROM stdin;
4	KOSKI	HigherEducationEnrolled	f	f	f	f	f	f	168	f	0	\N	\N	\N	2025-11-12 10:10:21.091727+00	2025-11-12 10:10:21.091727+00	\N
5	KOSKI	HigherEducationEnrolled	f	f	f	f	f	f	185	f	0	\N	\N	\N	2025-11-12 10:10:21.091727+00	2025-11-12 10:10:21.091727+00	\N
6	KOSKI	HigherEducationEnrolled	f	f	f	f	f	f	176	f	0	\N	\N	\N	2025-11-12 10:10:21.091727+00	2025-11-12 10:10:21.091727+00	\N
7	KOSKI	HigherEducationEnrolled	f	f	f	f	f	f	177	f	0	\N	\N	\N	2025-11-12 10:10:21.091727+00	2025-11-12 10:10:21.091727+00	\N
8	KOSKI	HigherEducationEnrolled	f	f	f	f	f	f	178	f	0	\N	\N	\N	2025-11-12 10:10:21.091727+00	2025-11-12 10:10:21.091727+00	\N
\.


--
-- Data for Name: login_link; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.login_link (id, code, participant_id, exam_session_id, registration_id, type, expired_link_redirect, success_redirect, expires_at, user_data, created, modified) FROM stdin;
\.


--
-- Data for Name: participant_onr; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.participant_onr (oid, participant_id, oppijanumero, is_individualized, modified) FROM stdin;
\.


--
-- Data for Name: participant_sync_status; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.participant_sync_status (id, exam_session_id, success_at, failed_at, created, relocated_at) FROM stdin;
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.payment (id, state, registration_id, amount, lang, reference_number, order_number, external_payment_id, payment_method, payed_at, created, modified) FROM stdin;
\.


--
-- Data for Name: payment_config; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.payment_config (id, organizer_id, merchant_id, merchant_secret, test_mode) FROM stdin;
1	1	13466	6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ	t
\.


--
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.person (oid, first_name, last_name, email, created, modified, phone_number, street_address, post_office, zip, nationality_code, gender) FROM stdin;
1.2.246.562.24.12308879060	Teppo	Testi	test@test.invalid	2025-10-07 11:56:32.997123+00	2025-10-07 11:56:32.997123+00	\N	\N	\N	\N	\N	\N
1.2.246.562.24.82364099322	Aino	Osallistuja	aino.osallistuja@loremipsum.fi	2025-11-18 12:07:49.543991+00	2025-11-18 12:07:49.543991+00	+358 401234567	Katuosoite 123	Tampere	33100	\N	\N
\.


--
-- Data for Name: person_sync_status; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.person_sync_status (id, person_oid, success_at, failed_at, should_retry, created) FROM stdin;
\.


--
-- Data for Name: pgqueues; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.pgqueues (id, name, priority, data, deleted) FROM stdin;
\.


--
-- Data for Name: quarantine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quarantine (id, language_code, end_date, birthdate, first_name, last_name, ssn, email, phone_number, created, updated, diary_number, deleted_at, start_date) FROM stdin;
9	eng	2023-12-29	2018-02-01	Testi	Testinen	201190-9012	email@invalid.invalid	0401234567	2022-12-28 13:11:14.718074+00	2023-01-05 11:11:04.894015+00	912352	\N	2022-12-28
10	fin	2023-12-26	1999-04-03	Testi	Testinen	201190-9012	email@invalid.invalid	0401234567	2022-12-28 13:23:09.711442+00	2023-01-05 11:12:05.992913+00	10123421	\N	2022-12-28
11	fin	2023-02-26	2022-12-06	Testinen	Testi	\N	test@invalid.invalid	0401234567	2022-12-29 09:58:30.342062+00	2023-01-05 11:32:05.599048+00	111234221	\N	2022-12-29
12	fin	2023-12-29	2018-02-01	Testi	Testinen	201190-9012	email@invalid.invalid	0401234567	2022-12-29 13:01:49.496899+00	2023-01-05 12:06:42.827034+00	121234	\N	2022-12-29
\.


--
-- Data for Name: quarantine_review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quarantine_review (id, quarantine_id, registration_id, quarantined, created, updated, reviewer_oid) FROM stdin;
\.


--
-- Data for Name: ragtime_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.ragtime_migrations (id, created_at) FROM stdin;
001-create-tables.0.1.0	2022-11-30T14:13:51.526
002-init-base-data.0.1.0	2022-11-30T14:13:51.586
003-create-task-lock.0.1.0	2022-11-30T14:13:51.598
004-session-participant-limit-trigger	2022-11-30T14:13:51.613
005-create-queue-table.0.1.0	2022-11-30T14:13:51.624
006-create-post-admission-tables.0.1.0	2022-11-30T14:13:51.636
007-new-db-structure-for-post-admission.0.1.0	2022-11-30T14:13:51.651
008-update-participant-trigger-to-be-pa-aware.0.1.0	2022-11-30T14:13:51.659
                                                009-add-exam-date-and-languages.0.1.0	2022-11-30T14:13:51.668
                                                010-add-participant-sync-relocated-column.0.1.0	2022-11-30T14:13:51.674
                                                011-alter-exam-session-post-admission-columns.0.1.0	2022-11-30T14:13:51.679
012-drop-exam-date-language-constraint.0.1.0	2022-11-30T14:13:51.687
013-update-exam-date-and-language.0.1.0	2022-11-30T14:13:51.697
                                                                         014-create-organizer-contact.0.1.0	2022-11-30T14:13:51.710
015-create-re-evaluation-table.0.1.0	2022-11-30T14:13:51.734
016-create-index.0.1.0	2022-11-30T14:13:51.741
017-create-new-exam-payment-table.0.1.0	2022-11-30T14:13:51.753
018-create-new-evaluation-payment-table.0.1.0	2022-11-30T14:13:51.765
019-create-index-on-payment-timestamp.0.1.0	2022-11-30T14:13:51.772
020-rename-updated-column-to-modified.0.1.0	2022-11-30T14:13:51.777
021-create-quarantine-table.0.1.0	2022-12-01T12:23:19.541
022-create-quarantine-review-trigger.0.1.0	2023-01-05T11:31:15.741
023-add-start-date-to-quarantine-table.0.1.0	2023-05-11T12:12:45.038
024-drop-table-attachment_metadata.0.1.0	2023-08-21T10:53:19.882
025-create-cas-oppija-ticketstore-table.0.1.0	2025-06-24T13:45:30.739
026-exam_session_queue_new-index-and-removal-task-lock.0.1.0	2025-06-24T13:45:30.768
027-create-index-on-exam_date.0.1.0	2025-06-24T13:45:30.777
028-create-index-on-login_link.0.1.0	2025-06-24T13:45:30.787
029-create-participant_onr-table.0.1.0	2025-06-24T13:45:30.807
030-sync-onr-participant-data-task-lock.0.1.0	2025-06-24T13:45:30.814
031-add-registration-transfer-used-column.0.1.0	2025-06-24T13:45:30.828
032-add-person-contacts-column.0.1.0	2025-06-25T14:24:05.806
033-add-person-contact-details.0.1.0	2025-06-25T14:24:05.817
034-utility-functions-to-check-if-registration-can-be-cancelled-or-transferred.0.1.0	2025-06-25T14:24:05.833
035-add-explicit-expiration-date-and-exam-fee-to-registration-table.0.1.0	2025-06-25T14:24:05.840
035-migrate-person-task-lock.0.1.0	2025-06-25T14:24:05.847
036-new-queueing-functionality.0.1.0	2025-06-25T14:24:05.861
037-add-new-login-link-type-for-person.0.1.0	2025-11-17T15:03:46.471
037-add-registration-ui-language-field.0.1.0	2025-11-17T15:03:46.492
038-create-index-on-registration-person_oid.0.1.0	2025-11-17T15:03:46.510
039-new-person_sync_status-table.0.1.0	2025-11-17T15:03:46.536
040-add-columns-for-nationality-and-gender-in-person-table.0.1.0	2025-11-17T15:04:21.924
\.


--
-- Data for Name: task_lock; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.task_lock (task, last_executed, worker_id) FROM stdin;
SYNC_ONR_PARTICIPANT_DATA_HANDLER	2025-07-18 11:04:27.953864+00	7e846e4c-3879-4973-a7e9-cdbc2f54c1af
MIGRATE_PERSON_HANDLER	2025-07-18 11:05:07.948123+00	f3d05aa0-de83-477b-99cb-c79652d97835
PARTICIPANTS_SYNC_HANDLER	2025-07-17 10:45:32.747894+00	9c525046-80e2-4786-8788-e51a94fde640
REMOVE_OLD_DATA_HANDLER	2025-07-18 09:02:27.378359+00	632e3c2c-b2c8-453f-8692-b3ea212068a6
EXAM_SESSION_QUEUE_HANDLER	2025-06-25 11:20:59.630594+00	2630b6d9-dced-4e83-88f7-996109709032
REGISTRATION_STATE_HANDLER	2025-07-18 11:25:27.956449+00	12b86c1c-887b-4b50-8c0f-2745306e8869
REGISTRATION_QUEUE_HANDLER	2025-07-18 11:25:27.956791+00	6f0a7505-34ff-4224-ae68-1100829109c5
PERSONS_SYNC_HANDLER	-infinity	\N
\.


--
-- Name: contact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.contact_id_seq', 1, false);


--
-- Name: contact_organizer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.contact_organizer_id_seq', 1, false);


--
-- Name: evaluation_exam_date_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_exam_date_id_seq', 1, false);


--
-- Name: evaluation_exam_date_language_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_exam_date_language_id_seq', 1, false);


--
-- Name: evaluation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_id_seq', 1, false);


--
-- Name: evaluation_order_evaluation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_order_evaluation_id_seq', 1, false);


--
-- Name: evaluation_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_order_id_seq', 1, false);


--
-- Name: evaluation_order_subtest_evaluation_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_order_subtest_evaluation_order_id_seq', 1, false);


--
-- Name: evaluation_order_subtest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_order_subtest_id_seq', 1, false);


--
-- Name: evaluation_payment_evaluation_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_payment_evaluation_order_id_seq', 1, false);


--
-- Name: evaluation_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_payment_id_seq', 1, false);


--
-- Name: evaluation_payment_new_evaluation_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_payment_new_evaluation_order_id_seq', 1, false);


--
-- Name: evaluation_payment_new_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_payment_new_id_seq', 1, false);


--
-- Name: evaluation_payment_order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluation_payment_order_number_seq', 1, false);


--
-- Name: exam_date_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_date_id_seq', 46, true);


--
-- Name: exam_date_language_exam_date_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_date_language_exam_date_id_seq', 1, false);


--
-- Name: exam_date_language_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_date_language_id_seq', 45, true);


--
-- Name: exam_language_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_language_id_seq', 1, true);


--
-- Name: exam_language_organizer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_language_organizer_id_seq', 1, false);


--
-- Name: exam_payment_new_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_payment_new_id_seq', 1, false);


--
-- Name: exam_payment_new_registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_payment_new_registration_id_seq', 1, false);


--
-- Name: exam_session_contact_contact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_session_contact_contact_id_seq', 1, false);


--
-- Name: exam_session_contact_exam_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_session_contact_exam_session_id_seq', 1, false);


--
-- Name: exam_session_contact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_session_contact_id_seq', 1, false);


--
-- Name: exam_session_exam_date_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_session_exam_date_id_seq', 1, false);


--
-- Name: exam_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_session_id_seq', 23, true);


--
-- Name: exam_session_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_session_location_id_seq', 67, true);


--
-- Name: exam_session_organizer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_session_organizer_id_seq', 1, false);


--
-- Name: exam_session_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exam_session_queue_id_seq', 1, false);


--
-- Name: free_registration_free_registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.free_registration_free_registration_id_seq', 8, true);


--
-- Name: free_registration_registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.free_registration_registration_id_seq', 1, true);


--
-- Name: login_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.login_link_id_seq', 2, true);


--
-- Name: login_link_participant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.login_link_participant_id_seq', 1, false);


--
-- Name: organizer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.organizer_id_seq', 1, true);


--
-- Name: participant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.participant_id_seq', 750, true);


--
-- Name: participant_onr_participant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.participant_onr_participant_id_seq', 1, false);


--
-- Name: participant_sync_status_exam_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.participant_sync_status_exam_session_id_seq', 1, false);


--
-- Name: participant_sync_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.participant_sync_status_id_seq', 1, false);


--
-- Name: payment_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.payment_config_id_seq', 1, true);


--
-- Name: payment_config_organizer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.payment_config_organizer_id_seq', 1, false);


--
-- Name: payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.payment_id_seq', 1, false);


--
-- Name: payment_order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.payment_order_number_seq', 1, false);


--
-- Name: payment_registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.payment_registration_id_seq', 1, false);


--
-- Name: person_sync_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.person_sync_status_id_seq', 1, false);


--
-- Name: pgqueues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.pgqueues_id_seq', 1, true);


--
-- Name: quarantine_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quarantine_id_seq', 12, true);


--
-- Name: quarantine_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quarantine_review_id_seq', 24, true);


--
-- Name: registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.registration_id_seq', 185, true);


--
-- PostgreSQL database dump complete
--

