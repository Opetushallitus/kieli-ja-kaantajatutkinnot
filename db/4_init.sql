TRUNCATE translator CASCADE;
TRUNCATE meeting_date CASCADE;

INSERT INTO meeting_date(date)
    VALUES ('2020-12-24');

INSERT INTO translator(onr_oid)
    SELECT concat('1.2.246.562.24', '.', power(10, 10) + floor(9 * power(10, 10) * random()))
    FROM generate_series(1, 4900);

INSERT INTO authorisation(translator_id, basis, meeting_date_id, aut_date, assurance_date) (
    SELECT translator_id, 'AUT', (SELECT max(meeting_date_id) FROM meeting_date), now(), now()
    FROM translator
);

INSERT INTO authorisation_term(authorisation_id, begin_date, end_date) (
    SELECT authorisation_id, '2021-01-01', '2025-12-31'
    FROM authorisation
);
-- fi <-> sv
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FI', 'SV', true
    FROM authorisation where authorisation.authorisation_id % 2 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'SV', 'FI', true
    FROM authorisation where authorisation.authorisation_id % 3 = 0
);
-- fi <-> ru
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FI', 'RU', true
    FROM authorisation where authorisation.authorisation_id % 5 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'RU', 'FI', true
    FROM authorisation where authorisation.authorisation_id % 5 = 0
);
-- fi <-> et
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FI', 'ET', true
    FROM authorisation where authorisation.authorisation_id % 7 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'ET', 'FI', true
    FROM authorisation where authorisation.authorisation_id % 11 = 0
);
-- fi <-> de
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FI', 'DE', true
    FROM authorisation where authorisation.authorisation_id % 11 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'DE', 'FI', true
    FROM authorisation where authorisation.authorisation_id % 13 = 0
);
-- fi <-> fr
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FI', 'FR', true
    FROM authorisation where authorisation.authorisation_id % 17 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FR', 'FI', true
    FROM authorisation where authorisation.authorisation_id % 17 = 0
);
-- sv <-> fr
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'SV', 'FR', true
    FROM authorisation where authorisation.authorisation_id % 19 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FR', 'SV', true
    FROM authorisation where authorisation.authorisation_id % 19 = 0
);
-- misc languages
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'BN', 'FI', true
    FROM authorisation where authorisation.authorisation_id % 393 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'BO', 'SV', true
    FROM authorisation where authorisation.authorisation_id % 393 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FI', 'CS', true
    FROM authorisation where authorisation.authorisation_id % 397 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'SV', 'CA', true
    FROM authorisation where authorisation.authorisation_id % 397 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'DA', 'FI', true
    FROM authorisation where authorisation.authorisation_id % 399 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'EL', 'SV', true
    FROM authorisation where authorisation.authorisation_id % 399 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FI', 'FO', true
    FROM authorisation where authorisation.authorisation_id % 399 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'SV', 'FJ', true
    FROM authorisation where authorisation.authorisation_id % 399 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'GA', 'FI', true
    FROM authorisation where authorisation.authorisation_id % 401 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'HE', 'SV', true
    FROM authorisation where authorisation.authorisation_id % 401 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FI', 'HU', true
    FROM authorisation where authorisation.authorisation_id % 601 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'SV', 'HR', true
    FROM authorisation where authorisation.authorisation_id % 601 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'TT', 'FI', true
    FROM authorisation where authorisation.authorisation_id % 607 = 0
);
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'TY', 'SV', true
    FROM authorisation where authorisation.authorisation_id % 607 = 0
);

-- en - not published
INSERT INTO language_pair(authorisation_id, from_lang, to_lang, permission_to_publish) (
    SELECT authorisation_id, 'FI', 'EN', false
    FROM authorisation
);
