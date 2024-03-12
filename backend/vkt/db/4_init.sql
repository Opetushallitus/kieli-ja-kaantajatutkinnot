TRUNCATE TABLE exam_event CASCADE;
TRUNCATE TABLE person CASCADE;

-- Insert exam events

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() - INTERVAL '1 MONTHS',
  NOW() - INTERVAL '2 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() - INTERVAL '1 MONTHS',
  NOW() - INTERVAL '2 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW(),
  NOW(),
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW(),
  NOW(),
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '1 WEEK',
  NOW(),
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
 NOW() + INTERVAL '3 MONTHS',
 NOW() + INTERVAL '2 MONTHS',
 false,
 10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '3 MONTHS',
  NOW() + INTERVAL '2 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '5 MONTHS',
  NOW() + INTERVAL '4 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '9 MONTHS',
  NOW() + INTERVAL '8 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '12 MONTHS',
  NOW() + INTERVAL '11 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '12 MONTHS',
  NOW() + INTERVAL '11 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'FI',
  'EXCELLENT',
  NOW() + INTERVAL '24 MONTHS',
  NOW() + INTERVAL '22 MONTHS',
  false,
  10
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '24 MONTHS',
  NOW() + INTERVAL '22 MONTHS',
  false,
  10
);

-- Special exam events

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '5 WEEKS',
  NOW() + INTERVAL '4 WEEKS',
  false,
  8
);

INSERT INTO exam_event
  (language, level, date, registration_closes, is_hidden, max_participants)
VALUES (
  'SV',
  'EXCELLENT',
  NOW() + INTERVAL '2 WEEKS',
  NOW() + INTERVAL '1 WEEK',
  true,
  10
);

-- Insert persons
INSERT INTO person(last_name, first_name, oid, other_identifier, latest_identified_at)
SELECT
  last_names[mod(i, array_length(last_names, 1)) + 1],
  first_names[mod(i, array_length(first_names, 1)) + 1],
  CASE mod(i, 7)
    WHEN 0 THEN NULL ELSE '1.2.246.init-' || i::text END,
  CASE mod(i, 7)
    WHEN 0 THEN 'FI/init-' || i::text END,
  NOW()
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
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country, is_anonymized)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 1), person_id,
       true, true, true,
       true, true, true, true,
       'PAID', true,
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
           END,
       false
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
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country, is_anonymized)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2), person_id,
       true, true, true,
       true, true, true, true,
       'PAID', true,
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
           END,
       false
FROM person,
     (SELECT ('{Erottajankatu 1, Mäkelänkatu 70, Postikatu 2, Hamngatan 4}')::text[] AS streets) AS street_table,
     (SELECT ('{00130, 00610, 33100, 111 47}')::text[] AS postal_codes) AS postal_code_table,
     (SELECT ('{Helsinki, Helsinki, Tampere, Stockholm}')::text[] AS towns) AS town_table,
     (SELECT ('{Suomi, Finland, SUOMI, Sverige}')::text[] AS countries) AS country_table
ORDER BY person_id LIMIT (SELECT max_participants FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 2);
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country, is_anonymized)
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
           END,
       false
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
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country, is_anonymized)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3), person_id,
       true, true, true,
       true, true, true, true,
       'PAID', true,
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
           END,
      false
FROM person,
     (SELECT ('{Erottajankatu 1, Mäkelänkatu 70, Postikatu 2, Hamngatan 4}')::text[] AS streets) AS street_table,
     (SELECT ('{00130, 00610, 33100, 111 47}')::text[] AS postal_codes) AS postal_code_table,
     (SELECT ('{Helsinki, Helsinki, Tampere, Stockholm}')::text[] AS towns) AS town_table,
     (SELECT ('{Suomi, Finland, SUOMI, Sverige}')::text[] AS countries) AS country_table ORDER BY person_id LIMIT (SELECT max_participants / 2 FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3);
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country, is_anonymized)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 3), person_id,
       true, true, true,
       true, true, true, true,
       'SHIFTED_FROM_QUEUE', true,
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
           END,
       false
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
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country, is_anonymized)
SELECT (SELECT exam_event_id FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 4), person_id,
       true, true, true,
       true, true, true, true,
       'PAID', true,
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
           END,
       false
FROM person,
     (SELECT ('{Erottajankatu 1, Mäkelänkatu 70, Postikatu 2, Hamngatan 4}')::text[] AS streets) AS street_table,
     (SELECT ('{00130, 00610, 33100, 111 47}')::text[] AS postal_codes) AS postal_code_table,
     (SELECT ('{Helsinki, Helsinki, Tampere, Stockholm}')::text[] AS towns) AS town_table,
     (SELECT ('{Suomi, Finland, SUOMI, Sverige}')::text[] AS countries) AS country_table ORDER BY person_id LIMIT (SELECT max_participants - 1 FROM exam_event ORDER BY exam_event_id DESC LIMIT 1 OFFSET 4);

-- Insert one cancelled enrollment to all
INSERT INTO enrollment(exam_event_id, person_id,
                       skill_oral, skill_textual, skill_understanding,
                       partial_exam_speaking, partial_exam_speech_comprehension, partial_exam_writing, partial_exam_reading_comprehension,
                       status, digital_certificate_consent, email, phone_number, street, postal_code, town, country, is_anonymized)
SELECT exam_event_id, (SELECT max(person_id) FROM person),
       true, true, true,
       true, true, true, true,
       'CANCELED', true,
       'foo@bar.invalid', '0404040404', null, null, null, null, false
FROM exam_event;
