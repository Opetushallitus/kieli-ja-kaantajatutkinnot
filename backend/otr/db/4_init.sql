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
  CASE mod(i, 3) WHEN 0 THEN 'Extra ' || i::text ELSE NULL END
FROM generate_series(1, 200) i;

-- Qualifications

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date, diary_number)
SELECT
  interpreter_id,
  interpreter_id % 60 <> 0,
  CASE mod(interpreter_id, 3) WHEN 0 THEN 'OTHER' ELSE 'LEGAL_INTERPRETER_EXAM' END,
  'FI',
  to_langs[mod(interpreter_id, array_length(to_langs, 1)) + 1],
  '2020-01-01',
  '2025-01-01',
  '1234' || interpreter_id::text
FROM interpreter,
     (SELECT ('{CS, DA, DE, EL, EN, ET, FR, IS, KO, KTU, KTUR, LT, MY, NE, NL, NN, PL, PTU, PTUR, SE, SK, SO, TR, UZ, VKR, VKS, ZH}')::text[] AS to_langs) AS to_langs;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date, diary_number)
SELECT
    interpreter_id,
    interpreter_id % 61 <> 0,
  CASE mod(interpreter_id, 3) WHEN 0 THEN 'OTHER' ELSE 'LEGAL_INTERPRETER_EXAM' END,
  'SV',
  to_langs[mod(interpreter_id, array_length(to_langs, 1)) + 1],
  '2018-10-13',
  '2023-09-29',
  '2345' || interpreter_id::text
FROM interpreter,
     (SELECT ('{CS, DA, DE, EL, EN, ET, FR, IS, KO, KTU, KTUR, LT, MY, NE, NL, NN, PL, PTU, PTUR, SE, SK, SO, TR, UZ, VKR, VKS, ZH}')::text[] AS to_langs) AS to_langs
WHERE
  interpreter_id % 2 = 0;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'SE',
    'FI',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE qualification_id % 23 = 0;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'VKS',
    'FI',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE qualification_id % 27 = 0;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'VKR',
    'SV',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE qualification_id % 31 = 0;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'KTU',
    'KTUR',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE qualification_id % 199 = 0;

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type, from_lang, to_lang, begin_date,
                          end_date)
SELECT
    interpreter_id,
    TRUE,
    examination_type,
    'PTU',
    'PTUR',
    '2020-01-01',
    '2025-01-01'
FROM qualification
WHERE qualification_id % 200 = 0;

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
