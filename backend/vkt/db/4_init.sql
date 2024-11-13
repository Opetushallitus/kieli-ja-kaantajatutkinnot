TRUNCATE TABLE exam_event CASCADE;
TRUNCATE TABLE person CASCADE;

-- Insert exam events

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() - INTERVAL '1 MONTHS',
  NOW() - INTERVAL '2 WEEKS',
  NOW() - INTERVAL '2 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() - INTERVAL '1 MONTHS',
  NOW() - INTERVAL '2 WEEKS',
  NOW() - INTERVAL '2 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW(),
  NOW(),
  NOW(),
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW(),
  NOW(),
  NOW(),
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '1 WEEK',
  NOW() - INTERVAL '1 DAY',
  NOW(),
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
 NOW() + INTERVAL '3 MONTHS',
 NOW() + INTERVAL '1 DAY',
 NOW() + INTERVAL '2 MONTHS',
 false,
 10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '3 MONTHS',
  NOW(),
  NOW() + INTERVAL '2 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '5 MONTHS',
  NOW(),
  NOW() + INTERVAL '4 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '9 MONTHS',
  NOW(),
  NOW() + INTERVAL '8 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '12 MONTHS',
  NOW(),
  NOW() + INTERVAL '11 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '12 MONTHS',
  NOW(),
  NOW() + INTERVAL '11 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '24 MONTHS',
  NOW(),
  NOW() + INTERVAL '22 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '24 MONTHS',
  NOW(),
  NOW() + INTERVAL '22 MONTHS',
  false,
  10
);

-- Special exam events

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '5 WEEKS',
  NOW(),
  NOW() + INTERVAL '4 WEEKS',
  false,
  8
);

INSERT INTO exam_event
  (language, level, date, registration_opens, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '2 WEEKS',
  NOW(),
  NOW() + INTERVAL '1 WEEK',
  true,
  10
);

-- Insert persons
INSERT INTO person(last_name, first_name, oid, other_identifier, latest_identified_at, uuid)
SELECT
  last_names[mod(i, array_length(last_names, 1)) + 1],
  first_names[mod(i, array_length(first_names, 1)) + 1],
  CASE mod(i, 7)
    WHEN 0 THEN NULL ELSE '1.2.246.init-' || i::text END,
  CASE mod(i, 7)
    WHEN 0 THEN 'FI/init-' || i::text END,
  NOW(),
  gen_random_uuid()
FROM generate_series(1, 22) i,
   (SELECT ('{Anneli, Ella, Hanna, Iiris, Liisa, Maria, Ninni, Viivi, Sointu, Jaakko, Lasse, Kyösti, ' ||
            'Markku, Kristian, Mikael, Nooa, Otto, Olli}')::text[] AS first_names) AS first_name_table,
   (SELECT ('{Aaltonen, Alanen, Eskola, Hakala, Heikkinen, Heinonen, Hiltunen, Hirvonen, ' ||
            'Hämäläinen, Kallio, Karjalainen, Kinnunen, Korhonen, Koskinen, Laakso, ' ||
            'Lahtinen, Laine, Lehtonen, Leinonen, Leppänen}')::text[] AS last_names) AS last_name_table;

-- Insert enrollments to 2nd event by id: full, all paid
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 1), person_id,
       true, true, true,
       true, true, true, true,
       'COMPLETED', true,
       'person' || person_id::text || '@example.invalid',
       '+35840' || (1000000 + person_id)::text,
       CASE mod(person_id, 5)
           WHEN 0 THEN streets[mod(person_id / 5 - 1, array_length(streets, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN postal_codes[mod(person_id / 5 - 1, array_length(postal_codes, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN towns[mod(person_id / 5 - 1, array_length(towns, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN countries[mod(person_id / 5 - 1, array_length(countries, 1)) + 1]
           END
FROM person,
     (SELECT ('{Erottajankatu 1, Mäkelänkatu 70, Postikatu 2, Hamngatan 4}')::text[] AS streets) AS street_table,
     (SELECT ('{00130, 00610, 33100, 111 47}')::text[] AS postal_codes) AS postal_code_table,
     (SELECT ('{Helsinki, Helsinki, Tampere, Stockholm}')::text[] AS towns) AS town_table,
     (SELECT ('{Suomi, Finland, SUOMI, Sverige}')::text[] AS countries) AS country_table
ORDER BY person_id LIMIT (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 1);

-- Insert enrollments to 3rd event by id: full and queue
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2), person_id,
       true, true, true,
       true, true, true, true,
       'COMPLETED', true,
       'person' || person_id::text || '@example.invalid',
       '+35840' || (1000000 + person_id)::text,
       CASE mod(person_id, 5)
           WHEN 0 THEN streets[mod(person_id / 5 - 1, array_length(streets, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN postal_codes[mod(person_id / 5 - 1, array_length(postal_codes, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN towns[mod(person_id / 5 - 1, array_length(towns, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN countries[mod(person_id / 5 - 1, array_length(countries, 1)) + 1]
           END
FROM person,
     (SELECT ('{Erottajankatu 1, Mäkelänkatu 70, Postikatu 2, Hamngatan 4}')::text[] AS streets) AS street_table,
     (SELECT ('{00130, 00610, 33100, 111 47}')::text[] AS postal_codes) AS postal_code_table,
     (SELECT ('{Helsinki, Helsinki, Tampere, Stockholm}')::text[] AS towns) AS town_table,
     (SELECT ('{Suomi, Finland, SUOMI, Sverige}')::text[] AS countries) AS country_table
ORDER BY person_id LIMIT (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2);
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2), person_id,
       true, true, true,
       true, true, true, true,
       'QUEUED', true,
       'person' || person_id::text || '@example.invalid',
       '+35840' || (1000000 + person_id)::text,
       CASE mod(person_id, 5)
           WHEN 0 THEN streets[mod(person_id / 5 - 1, array_length(streets, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN postal_codes[mod(person_id / 5 - 1, array_length(postal_codes, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN towns[mod(person_id / 5 - 1, array_length(towns, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN countries[mod(person_id / 5 - 1, array_length(countries, 1)) + 1]
           END
FROM person,
     (SELECT ('{Erottajankatu 1, Mäkelänkatu 70, Postikatu 2, Hamngatan 4}')::text[] AS streets) AS street_table,
     (SELECT ('{00130, 00610, 33100, 111 47}')::text[] AS postal_codes) AS postal_code_table,
     (SELECT ('{Helsinki, Helsinki, Tampere, Stockholm}')::text[] AS towns) AS town_table,
     (SELECT ('{Suomi, Finland, SUOMI, Sverige}')::text[] AS countries) AS country_table
ORDER BY person_id
            LIMIT (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2)
            OFFSET (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2);

-- Insert enrollments to 4th event by id: full, half paid
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3), person_id,
       true, true, true,
       true, true, true, true,
       'COMPLETED', true,
       'person' || person_id::text || '@example.invalid',
       '+35840' || (1000000 + person_id)::text,
       CASE mod(person_id, 5)
           WHEN 0 THEN streets[mod(person_id / 5 - 1, array_length(streets, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN postal_codes[mod(person_id / 5 - 1, array_length(postal_codes, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN towns[mod(person_id / 5 - 1, array_length(towns, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN countries[mod(person_id / 5 - 1, array_length(countries, 1)) + 1]
           END
FROM person,
     (SELECT ('{Erottajankatu 1, Mäkelänkatu 70, Postikatu 2, Hamngatan 4}')::text[] AS streets) AS street_table,
     (SELECT ('{00130, 00610, 33100, 111 47}')::text[] AS postal_codes) AS postal_code_table,
     (SELECT ('{Helsinki, Helsinki, Tampere, Stockholm}')::text[] AS towns) AS town_table,
     (SELECT ('{Suomi, Finland, SUOMI, Sverige}')::text[] AS countries) AS country_table ORDER BY person_id LIMIT (SELECT max_participants / 2 FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3);
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3), person_id,
       true, true, true,
       true, true, true, true,
       'AWAITING_PAYMENT', true,
       'person' || person_id::text || '@example.invalid',
       '+35840' || (1000000 + person_id)::text,
       CASE mod(person_id, 5)
           WHEN 0 THEN streets[mod(person_id / 5 - 1, array_length(streets, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN postal_codes[mod(person_id / 5 - 1, array_length(postal_codes, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN towns[mod(person_id / 5 - 1, array_length(towns, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN countries[mod(person_id / 5 - 1, array_length(countries, 1)) + 1]
           END
FROM person,
     (SELECT ('{Erottajankatu 1, Mäkelänkatu 70, Postikatu 2, Hamngatan 4}')::text[] AS streets) AS street_table,
     (SELECT ('{00130, 00610, 33100, 111 47}')::text[] AS postal_codes) AS postal_code_table,
     (SELECT ('{Helsinki, Helsinki, Tampere, Stockholm}')::text[] AS towns) AS town_table,
     (SELECT ('{Suomi, Finland, SUOMI, Sverige}')::text[] AS countries) AS country_table ORDER BY person_id
            LIMIT (SELECT max_participants / 2 FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3)
            OFFSET (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3);

-- Insert enrollments to 5th event by id: 9/10 of places taken
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 4), person_id,
       true, true, true,
       true, true, true, true,
       'COMPLETED', true,
       'person' || person_id::text || '@example.invalid',
       '+35840' || (1000000 + person_id)::text,
       CASE mod(person_id, 5)
           WHEN 0 THEN streets[mod(person_id / 5 - 1, array_length(streets, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN postal_codes[mod(person_id / 5 - 1, array_length(postal_codes, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN towns[mod(person_id / 5 - 1, array_length(towns, 1)) + 1]
           END,
       CASE mod(person_id, 5)
           WHEN 0 THEN countries[mod(person_id / 5 - 1, array_length(countries, 1)) + 1]
           END
FROM person,
     (SELECT ('{Erottajankatu 1, Mäkelänkatu 70, Postikatu 2, Hamngatan 4}')::text[] AS streets) AS street_table,
     (SELECT ('{00130, 00610, 33100, 111 47}')::text[] AS postal_codes) AS postal_code_table,
     (SELECT ('{Helsinki, Helsinki, Tampere, Stockholm}')::text[] AS towns) AS town_table,
     (SELECT ('{Suomi, Finland, SUOMI, Sverige}')::text[] AS countries) AS country_table ORDER BY person_id LIMIT (SELECT max_participants - 1 FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 4);

-- Insert one cancelled enrollment to all
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country)
SELECT exam_event_id, (SELECT max(person_id) FROM person),
       true, true, true,
       true, true, true, true,
       'CANCELED', true,
       'foo@bar.invalid', '0404040404', null, null, null, null
FROM exam_event;

-- Insert municipality
INSERT INTO municipality(version, code, name_fi, name_sv)
VALUES (1, '564', 'Oulu', 'Uleåborg');

-- Insert examiner
INSERT INTO examiner(version, oid, email, phone_number, last_name, first_name, nickname, exam_language_finnish, exam_language_swedish, is_public)
VALUES (1, '1.2.246.562.10.10000000001', 'examiner@example.invalid', '04040404040', 'Tessilä', 'Testi', 'Tessa', true, true, true);

-- Insert municipality
INSERT INTO examiner_municipality(municipality_id, examiner_id)
VALUES (1, 1);

-- insert examiner_exam_event
INSERT INTO examiner_exam_event(version, date, language, examiner_id, is_hidden, registration_closes, max_participants, municipality_id, location)
VALUES (
  1,
  now() + interval '5 weeks',
  'FI',
  1,
  false,
  now() + interval '2 weeks',
  10,
  1,
  'tylypahka'
);

-- Insert enrollment appointment
INSERT INTO enrollment_appointment(person_id, examiner_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country,
                       first_name, last_name, message, previous_enrollment)
VALUES (null, 1,
       true, true, true,
       true, true, true, true,
       'CONTACT_CREATED', false,
       'foo@bar.invalid', '0404040404', null, null, null, null,
       'Teppo', 'Testaaja', 'Tämä on viesti', 'Edellinen ilmoittautuminen vuonna 1999');

-- Insert enrollment appointment
INSERT INTO enrollment_appointment(person_id, examiner_id, examiner_exam_event_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country, first_name, last_name)
VALUES (1, 1, 1,
       true, true, true,
       true, true, true, true,
       'WAITING_AUTHENTICATION', false,
       'foo@bar.invalid', '0404040404', null, null, null, null,
       'Teppo', 'Testinen');
