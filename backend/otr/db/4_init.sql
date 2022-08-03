TRUNCATE interpreter CASCADE;
TRUNCATE email CASCADE;

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

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date, diary_number)
SELECT
  interpreter_id,
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

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  TRUE,
  examination_type,
  'FI',
  'SV',
  '2018-10-03',
  '2023-10-03'
FROM qualification
WHERE interpreter_id % 4 = 0;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  TRUE,
  examination_type,
  'FI',
  'EN',
  '2019-07-14',
  '2024-06-19'
FROM qualification
WHERE interpreter_id % 5 = 0;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  TRUE,
  examination_type,
  'FI',
  'MK',
  '2021-05-08',
  '2026-03-10'
FROM qualification
WHERE interpreter_id % 40 = 0;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  TRUE,
  examination_type,
  'FI',
  'KU',
  '2022-04-30',
  '2026-12-31'
FROM qualification
WHERE interpreter_id % 51 = 0;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
  TRUE,
  examination_type,
  'FI',
  'KU_K',
  '2019-08-08',
  '2024-09-09'
FROM qualification
WHERE interpreter_id % 52 = 0;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
  interpreter_id,
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
