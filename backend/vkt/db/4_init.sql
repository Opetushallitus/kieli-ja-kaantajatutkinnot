TRUNCATE TABLE exam_event;

-- Insert exam events

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() - INTERVAL '1 MONTHS',
  NOW() - INTERVAL '2 MONTHS',
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() - INTERVAL '1 MONTHS',
  NOW() - INTERVAL '2 MONTHS',
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW(),
  NOW(),
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW(),
  NOW(),
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '1 WEEK',
  NOW(),
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
 NOW() + INTERVAL '3 MONTHS',
 NOW() + INTERVAL '2 MONTHS',
 true,
 10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '3 MONTHS',
  NOW() + INTERVAL '2 MONTHS',
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '5 MONTHS',
  NOW() + INTERVAL '4 MONTHS',
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '9 MONTHS',
  NOW() + INTERVAL '8 MONTHS',
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '12 MONTHS',
  NOW() + INTERVAL '11 MONTHS',
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '12 MONTHS',
  NOW() + INTERVAL '11 MONTHS',
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '24 MONTHS',
  NOW() + INTERVAL '22 MONTHS',
  true,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '24 MONTHS',
  NOW() + INTERVAL '22 MONTHS',
  true,
  10
);

-- Special exam events

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '5 WEEKS',
  NOW() + INTERVAL '4 WEEKS',
  true,
  8
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_visible, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + '2 WEEKS',
  NOW() + INTERVAL '1 WEEK',
  false,
  10
);
