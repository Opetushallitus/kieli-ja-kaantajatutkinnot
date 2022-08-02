-- Init script to be run on untuva or pallero `opppijanumerorekisteri` database
-- This script initialises ONR with contact details for to the learners created in 0_onr_create_learners.sql

-- ONR ids reserved for OTR: 1.2.246.562.24.31234500001 - 1.2.246.562.24.31234500053

-- Delete OTR contact details data

DELETE FROM yhteystiedot WHERE yhteystiedotryhma_id IN (
    SELECT id
    FROM yhteystiedotryhma
    WHERE ryhmakuvaus = 'yhteystietotyyppi13' AND ryhma_alkuperatieto = 'alkupera7'
);

DELETE FROM yhteystiedotryhma
WHERE ryhmakuvaus = 'yhteystietotyyppi13' AND ryhma_alkuperatieto = 'alkupera7';


-- Insert OTR contact details group for each learner

INSERT INTO yhteystiedotryhma(id, version, ryhmakuvaus, ryhma_alkuperatieto, henkilo_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedotryhma) + i,
    0,
    'yhteystietotyyppi13',
    'alkupera7',
    (SELECT id FROM henkilo WHERE oidhenkilo = '1.2.246.562.24.312345000' || lpad(i::text, 2, '0'))
FROM generate_series(1, 53) AS i;

-- Insert contact details for created OTR contact details groups

INSERT INTO yhteystiedot(id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedot) + i,
    0,
    'YHTEYSTIETO_SAHKOPOSTI',
    (SELECT LOWER(kutsumanimi) || '.' || LOWER(sukunimi) || '@oikeustulkki.invalid' FROM henkilo WHERE oidhenkilo = '1.2.246.562.24.312345000' || lpad(i::text, 2, '0')),
    (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || lpad(i::text, 2, '0'))
FROM generate_series(1, 53) AS i;

INSERT INTO yhteystiedot(id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedot) + i,
    0,
    'YHTEYSTIETO_PUHELINNUMERO',
    '+35840' || (1000000 + i)::text,
    (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || lpad(i::text, 2, '0'))
FROM generate_series(1, 53) AS i
WHERE mod(i, 5) <> 0;

INSERT INTO yhteystiedot(id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedot) + i,
    0,
    'YHTEYSTIETO_KATUOSOITE',
    street[mod(i, array_length(street, 1)) + 1],
    (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || lpad(i::text, 2, '0'))
FROM generate_series(1, 53) AS i,
     (SELECT ('{Malminkatu 1, Runebergintie 2, Sibeliuksenkuja 3, Veturitie 4, ' ||
              'Pirkkolantie 123}')::text[] AS street) AS street_table
WHERE mod(i, 6) = 0;

INSERT INTO yhteystiedot(id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedot) + i,
    0,
    'YHTEYSTIETO_POSTINUMERO',
    postal_code[mod(i, array_length(postal_code, 1)) + 1],
    (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || lpad(i::text, 2, '0'))
FROM generate_series(1, 53) AS i,
     (SELECT ('{00100, 01200, 06100, 13500, 31600, 48600, ' ||
              '54460}')::text[] AS postal_code) AS postal_code_table
WHERE mod(i, 3) = 0;

INSERT INTO yhteystiedot(id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedot) + i,
    0,
    'YHTEYSTIETO_KAUPUNKI',
    town[mod(i, array_length(town, 1)) + 1],
    (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || lpad(i::text, 2, '0'))
FROM generate_series(1, 53) AS i,
     (SELECT ('{Helsinki, Turku, Hämeenlinna, Kuopio, Lahti, Porvoo, Vantaa, Järvenpää, ' ||
              'Kouvola, Tampere, Oulu, Rovaniemi, Kajaani, Joensuu, Uusikaupunki, Kuopio, ' ||
              'Kotka}')::text[] AS town) AS town_table
WHERE mod(i, 2) = 0;

INSERT INTO yhteystiedot(id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedot) + i,
    0,
    'YHTEYSTIETO_MAA',
    country[mod(i, array_length(country, 1)) + 1],
    (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || lpad(i::text, 2, '0'))
FROM generate_series(1, 53) AS i,
     (SELECT ('{Suomi, suomi, SUOMI, Finland, FINLAND}')::text[] AS country) AS country_table
WHERE mod(i, 4) = 0;
