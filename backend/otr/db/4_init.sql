TRUNCATE interpreter CASCADE;

-- Interpreters

INSERT INTO interpreter(onr_id, permission_to_publish_email, permission_to_publish_phone, other_contact_information,
                        permission_to_publish_other_contact_information, extra_information)
SELECT
        '1.2.246.test-' || i::text,
        i % 4 <> 0,
  i % 3 <> 0,
  CASE mod(i, 5) WHEN 0 THEN 'Tulkintie ' || i::text || ', Kokkola' ELSE NULL END,
  i % 2 <> 0,
  CASE mod(i, 7) WHEN 0 THEN 'Extra ' || i::text ELSE NULL END
FROM generate_series(1, 200) i;

-- Qualifications

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date, diary_number)
SELECT
    interpreter_id,
    interpreter_id % 60 <> 0,
  CASE mod(interpreter_id, 3) WHEN 0 THEN 'OTHER' ELSE 'LEGAL_INTERPRETER_EXAM' END,
  'FI',
  langs_1[mod(interpreter_id, array_length(langs_1, 1)) + 1],
  '2020-01-01',
  '2025-01-01',
  '1234' || interpreter_id::text
FROM interpreter,
     (SELECT ('{CS, DA, DE, EL, EN, ES, ET, FR, IS, KO, KTU, LT, MY}')::text[] AS langs_1) AS langs_1
ON CONFLICT DO NOTHING;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date, diary_number)
SELECT
    interpreter_id,
    interpreter_id % 61 <> 0,
  CASE mod(interpreter_id, 3) WHEN 0 THEN 'OTHER' ELSE 'LEGAL_INTERPRETER_EXAM' END,
  'FI',
  langs_2[mod(interpreter_id, array_length(langs_2, 1)) + 1],
  '2018-10-13',
  '2023-09-29',
  '2345' || interpreter_id::text
FROM interpreter,
     (SELECT ('{NL, NN, PL, PTU, SE, SK, SO, SV, TR, UK, UZ, VKS, ZH}')::text[] AS langs_2) AS langs_2
WHERE interpreter_id % 2 = 0
ON CONFLICT DO NOTHING;

-- Insert some specific qualifications

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'FI',
    'IT',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE interpreter_id % 23 = 0
ON CONFLICT DO NOTHING;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'FI',
    'LA',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE interpreter_id % 27 = 0
ON CONFLICT DO NOTHING;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'FI',
    'MK',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE interpreter_id % 31 = 0
ON CONFLICT DO NOTHING;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'FI',
    'KU',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE interpreter_id % 198 = 0
ON CONFLICT DO NOTHING;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'FI',
    'KU_K',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE interpreter_id % 199 = 0
ON CONFLICT DO NOTHING;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'FI',
    'KU_S',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE interpreter_id % 200 = 0
ON CONFLICT DO NOTHING;

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
