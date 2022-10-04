TRUNCATE TABLE exam_event CASCADE;
TRUNCATE TABLE person CASCADE;

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
  NOW() + INTERVAL '2 WEEKS',
  NOW() + INTERVAL '1 WEEK',
  false,
  10
);

-- Insert persons
INSERT INTO person(onr_id)
SELECT ('1.2.246.562.24.312345000' || lpad(i::text, 2, '0'))
FROM generate_series(1, 22) i;

-- Insert enrollments to 2nd event by id: full, all paid
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 1), person_id,
       true, true, true,
       true, true, true, true,
       'PAID', true
FROM person ORDER BY person_id LIMIT (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 1);

-- Insert enrollments to 3rd event by id: full and queue
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2), person_id,
       true, true, true,
       true, true, true, true,
       'PAID', true
FROM person ORDER BY person_id LIMIT (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2);
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2), person_id,
       true, true, true,
       true, true, true, true,
       'QUEUED', true
FROM person ORDER BY person_id
            LIMIT (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2)
            OFFSET (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2);

-- Insert enrollments to 4th event by id: full, half paid
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3), person_id,
       true, true, true,
       true, true, true, true,
       'PAID', true
FROM person ORDER BY person_id LIMIT (SELECT max_participants / 2 FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3);
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3), person_id,
       true, true, true,
       true, true, true, true,
       'EXPECTING_PAYMENT', true
FROM person ORDER BY person_id
            LIMIT (SELECT max_participants / 2 FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3)
            OFFSET (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3);

-- Insert one cancelled enrollment to all
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent)
SELECT exam_event_id, (SELECT max(person_id) FROM person),
       true, true, true,
       true, true, true, true,
       'CANCELED', true
FROM exam_event;
