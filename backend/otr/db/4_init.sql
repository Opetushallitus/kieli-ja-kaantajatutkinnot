TRUNCATE interpreter CASCADE;

-- Interpreters

INSERT INTO interpreter(onr_id, permission_to_publish_email, permission_to_publish_phone, other_contact_information,
                        permission_to_publish_other_contact_information, extra_information)
SELECT
  '1.2.246.test-' || i::text,
  i % 2 = 0,
  i % 3 = 0,
  CASE mod(i, 5) WHEN 0 THEN 'Tulkintie ' || i::text || ', Kokkola' ELSE NULL END,
  i % 10 = 0,
  CASE mod(i, 7) WHEN 0 THEN 'Extra ' || i::text ELSE NULL END
FROM generate_series(1, 200) i;

-- Qualifications

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type)
SELECT
  interpreter_id,
  interpreter_id % 60 <> 0,
  CASE mod(interpreter_id, 3) WHEN 0 THEN 'OTHER' ELSE 'LEGAL_INTERPRETER_EXAM' END
FROM interpreter;

-- Insert another qualification to 2 interpreters

INSERT INTO qualification(interpreter_id, permission_to_publish, examination_type)
SELECT
  interpreter_id,
  TRUE,
  'OTHER'
FROM interpreter
WHERE interpreter_id % 100 = 0;

-- Language pairs

INSERT INTO language_pair(qualification_id, from_lang, to_lang, begin_date, end_date)
SELECT
  qualification_id,
  CASE mod(qualification_id, 11) WHEN 0 THEN 'SV' ELSE 'FI' END,
  to_langs[mod(qualification_id, array_length(to_langs, 1)) + 1],
  '2020-01-01',
  '2025-01-01'
FROM qualification,
     (SELECT ('{CS, DA, DE, EL, EN, ET, FR, IS, KO, KTU, KTUR, LT, MY, NE, NL, NN, PL, PTU, PTUR, SE, SK, SO, TR, UZ, VKR, VKS, ZH}')::text[] AS to_langs) AS to_langs;

INSERT INTO language_pair(qualification_id, from_lang, to_lang, begin_date, end_date)
SELECT
  qualification_id,
  CASE from_lang = 'FI' WHEN TRUE THEN 'SV' ELSE 'FI' END,
  to_lang,
  begin_date,
  end_date
FROM language_pair
WHERE language_pair_id % 3 = 0;

-- Insert some specific language pairs

INSERT INTO language_pair(qualification_id, from_lang, to_lang, begin_date, end_date)
SELECT
  qualification_id,
  'SE',
  'FI',
  '2020-01-01',
  '2025-01-01'
FROM qualification
WHERE qualification_id % 23 = 0;

INSERT INTO language_pair(qualification_id, from_lang, to_lang, begin_date, end_date)
SELECT
  qualification_id,
  'VKS',
  'FI',
  '2020-01-01',
  '2025-01-01'
FROM qualification
WHERE qualification_id % 27 = 0;

INSERT INTO language_pair(qualification_id, from_lang, to_lang, begin_date, end_date)
SELECT
  qualification_id,
  'VKR',
  'SV',
  '2020-01-01',
  '2025-01-01'
FROM qualification
WHERE qualification_id % 31 = 0;

INSERT INTO language_pair(qualification_id, from_lang, to_lang, begin_date, end_date)
SELECT
  qualification_id,
  'KTU',
  'KTUR',
  '2020-01-01',
  '2025-01-01'
FROM qualification
WHERE qualification_id % 199 = 0;

INSERT INTO language_pair(qualification_id, from_lang, to_lang, begin_date, end_date)
SELECT
  qualification_id,
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
