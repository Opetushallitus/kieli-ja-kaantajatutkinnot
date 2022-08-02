TRUNCATE meeting_date CASCADE ;
TRUNCATE interpreter CASCADE;
TRUNCATE email CASCADE;

-- Meeting dates
INSERT INTO meeting_date(date)
VALUES ('2020-12-30'), ('2021-03-09'), ('2021-06-10'), ('2021-08-15'), ('2021-11-18'), ('2022-01-01'), ('2022-05-14'),
       ('2022-09-25'), ('2022-12-03'), ('2023-02-28'), ('2023-04-11'), ('2023-09-09'), ('2023-11-29');

-- Interpreters

INSERT INTO interpreter(onr_id, permission_to_publish_email, permission_to_publish_phone, other_contact_information,
                        permission_to_publish_other_contact_information, extra_information)
SELECT
  '1.2.246.562.24.312345000' || lpad(i::text, 2, '0'),
  i % 9 <> 0,
  i % 8 <> 0,
  CASE mod(i, 7) WHEN 0 THEN 'Tulkintie ' || i::text || ', Kokkola' ELSE NULL END,
  i % 3 <> 0,
  CASE mod(i, 11) WHEN 0 THEN 'Extra ' || i::text ELSE NULL END
FROM generate_series(1, 53) i;

-- Qualifications

INSERT INTO qualification(interpreter_id, meeting_date_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date, diary_number)
SELECT
  interpreter_id,
  (SELECT min(meeting_date_id) FROM meeting_date),
  interpreter_id % 26 <> 0,
  CASE mod(interpreter_id, 3) WHEN 0 THEN 'OTHER' ELSE 'LEGAL_INTERPRETER_EXAM' END,
  'FI',
  langs[mod(interpreter_id, array_length(langs, 1)) + 1],
  '2020-01-01',
  '2025-01-01',
  '1234' || interpreter_id::text
FROM interpreter,
     (SELECT ('{CS, DE, EL, ES, ET, FR, IT, KO, KTU, LA, PL, PTU, SE, VKS, ZH}')::text[] AS langs) AS langs;

-- Insert some specific qualifications

INSERT INTO qualification(interpreter_id, meeting_date_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  (SELECT min(meeting_date_id) FROM meeting_date),
  TRUE,
  examination_type,
  'FI',
  'SV',
  '2018-10-03',
  '2023-10-03'
FROM qualification
WHERE interpreter_id % 4 = 0;

INSERT INTO qualification(interpreter_id, meeting_date_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  (SELECT min(meeting_date_id) FROM meeting_date),
  TRUE,
  examination_type,
  'FI',
  'EN',
  '2019-07-14',
  '2024-06-19'
FROM qualification
WHERE interpreter_id % 5 = 0;

INSERT INTO qualification(interpreter_id, meeting_date_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  (SELECT min(meeting_date_id) FROM meeting_date),
  TRUE,
  examination_type,
  'FI',
  'MK',
  '2021-05-08',
  '2026-03-10'
FROM qualification
WHERE interpreter_id % 40 = 0;

INSERT INTO qualification(interpreter_id, meeting_date_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  (SELECT min(meeting_date_id) FROM meeting_date),
  TRUE,
  examination_type,
  'FI',
  'KU',
  '2022-04-30',
  '2026-12-31'
FROM qualification
WHERE interpreter_id % 51 = 0;

INSERT INTO qualification(interpreter_id, meeting_date_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  (SELECT min(meeting_date_id) FROM meeting_date),
  TRUE,
  examination_type,
  'FI',
  'KU_K',
  '2019-08-08',
  '2024-09-09'
FROM qualification
WHERE interpreter_id % 52 = 0;

INSERT INTO qualification(interpreter_id, meeting_date_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  (SELECT min(meeting_date_id) FROM meeting_date),
  TRUE,
  examination_type,
  'FI',
  'KU_S',
  '2015-09-17',
  '2020-09-17'
FROM qualification
WHERE interpreter_id % 53 = 0;

-- Regions

INSERT INTO region(interpreter_id, code)
SELECT
  interpreter_id,
  '01'
FROM interpreter
WHERE interpreter_id % 6 = 0;

-- Some insertions are duplicate and are blocked by unique (interpreter_id, code) constraint

INSERT INTO region(interpreter_id, code)
SELECT
  interpreter_id,
  '02'
FROM region
WHERE region_id % 2 = 0
ON CONFLICT DO NOTHING;

INSERT INTO region(interpreter_id, code)
SELECT
  interpreter_id,
  '04'
FROM region
WHERE region_id % 3 = 0
ON CONFLICT DO NOTHING;

INSERT INTO region(interpreter_id, code)
SELECT
  interpreter_id,
  '06'
FROM region
WHERE region_id % 4 = 0
ON CONFLICT DO NOTHING;

INSERT INTO region(interpreter_id, code)
SELECT
  interpreter_id,
  '08'
FROM region
WHERE region_id % 5 = 0
ON CONFLICT DO NOTHING;

INSERT INTO region(interpreter_id, code)
SELECT
  interpreter_id,
  '10'
FROM region
WHERE region_id % 6 = 0
ON CONFLICT DO NOTHING;

INSERT INTO region(interpreter_id, code)
SELECT
  interpreter_id,
  '21'
FROM region
WHERE region_id % 7 = 0
ON CONFLICT DO NOTHING;

-- set random meeting dates qualifications
UPDATE qualification
SET meeting_date_id = (
    SELECT md.meeting_date_id FROM meeting_date md
    WHERE md.date < CURRENT_DATE
    ORDER BY random() + qualification_id LIMIT 1
) WHERE 1=1;

-- set qualification term begin and end dates
UPDATE qualification
SET begin_date = (
    SELECT md.date FROM meeting_date md
    WHERE md.meeting_date_id = qualification.meeting_date_id
),
end_date = (
    SELECT md.date FROM meeting_date md
    WHERE md.meeting_date_id = qualification.meeting_date_id
) + '1.5 years'::interval
    WHERE 1=1;
