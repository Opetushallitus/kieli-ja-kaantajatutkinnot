--
-- PostgreSQL database dump
--

--
-- Data for Name: exam_level; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO exam_level (code, created) VALUES
('PERUS',	'2022-11-30 14:13:51.538476+00'),
('KESKI',	'2022-11-30 14:13:51.539196+00'),
('YLIN',	'2022-11-30 14:13:51.539767+00');

--
-- Data for Name: language; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO language (code, created) VALUES
('fin',	'2022-11-30 14:13:51.532916+00'),
('swe',	'2022-11-30 14:13:51.533786+00'),
('eng',	'2022-11-30 14:13:51.534399+00'),
('spa',	'2022-11-30 14:13:51.534979+00'),
('ita',	'2022-11-30 14:13:51.535495+00'),
('fra',	'2022-11-30 14:13:51.536075+00'),
('sme',	'2022-11-30 14:13:51.536695+00'),
('deu',	'2022-11-30 14:13:51.537193+00'),
('rus',	'2022-11-30 14:13:51.53784+00');

--
-- Relax NOT NULL constraints not satisfiable by local seed data
--

ALTER TABLE exam_session ALTER COLUMN organizer_id DROP NOT NULL;
ALTER TABLE exam_session ALTER COLUMN organizer_id DROP DEFAULT;
ALTER TABLE registration ALTER COLUMN participant_id DROP NOT NULL;
