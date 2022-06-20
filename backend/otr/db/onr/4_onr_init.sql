-- Init script to be run on untuva or pallero `opppijanumerorekisteri` database
-- This script initialises ONR with data respective to the learners defined in db/4_init.sql

-- ONR ids reserved for OTR: 1.2.246.562.24.31234500001 - 1.2.246.562.24.31234500053

-- Delete OTR personal data

DELETE FROM yhteystiedot WHERE yhteystiedotryhma_id IN (
    SELECT id
    FROM yhteystiedotryhma
    WHERE ryhmakuvaus = 'yhteystietotyyppi13' AND ryhma_alkuperatieto = 'alkupera7'
);

DELETE FROM henkilo WHERE id IN (
    DELETE FROM yksilointivirhe WHERE henkilo_id IN (
        DELETE FROM yhteystiedotryhma
        WHERE ryhmakuvaus = 'yhteystietotyyppi13' AND ryhma_alkuperatieto = 'alkupera7'
        RETURNING henkilo_id
    ) RETURNING henkilo_id
);

-- Initialise database

INSERT INTO henkilo(id, version, etunimet, kutsumanimi, sukunimi, hetu, oidhenkilo)
SELECT
    (SELECT MAX(id) FROM henkilo) + i,
    0,
    first_names[mod(i, array_length(first_names, 1)) + 1] || ' ' || second_names[mod(i, array_length(second_names, 1)) + 1],
    first_names[mod(i, array_length(first_names, 1)) + 1],
    last_names[mod(i, array_length(last_names, 1)) + 1],
    identity_numbers[mod(i, array_length(identity_numbers, 1)) + 1],
    CASE i < 10
        WHEN TRUE THEN '1.2.246.562.24.3123450000' || i::text
        ELSE '1.2.246.562.24.312345000' || i::text
        END
FROM generate_series(1, 27) AS i,
    (SELECT ('{Antti, Eero, Ilkka, Jari, Juha, Matti, Pekka, Timo, Iiro, Jukka, Hugo, ' ||
             'Jaakko, Lasse, Kyösti, Markku, Kristian, Mikael, Nooa, Otto, Olli, ' ||
             'Aapo}')::text[] AS first_names) AS first_name_table,
    (SELECT ('{Kalle, Kari, Marko, Mikko, Tapani, Ville, Jesse, Joose, Sakari, Tero, ' ||
             'Samu, Roope, Panu, Matias, Seppo, Rauno, ' ||
             'Aapeli}')::text[] AS second_names) AS second_name_table,
    (SELECT ('{Aaltonen, Alanen, Eskola, Hakala, Heikkinen, Heinonen, Hiltunen, Hirvonen, ' ||
             'Hämäläinen, Kallio, Karjalainen, Kinnunen, Korhonen, Koskinen, Laakso, ' ||
             'Lahtinen, Laine, Lehtonen, Leinonen, Leppänen, Manninen, Mattila, Mäkinen, ' ||
             'Nieminen, Noronen, Ojala, Paavola, Pitkänen, Räsänen, Saarinen, Salo, ' ||
             'Salonen, Toivonen, Tuominen, Turunen, Valtonen, Virtanen, ' ||
             'Väisänen}')::text[] AS last_names) AS last_name_table,
    (SELECT ('{290473-991R, 220468-941A, 261159-9052, 291153-951X, 280770-9137, 070511-947X, ' ||
             '101018-9615, 090108-921C, 020353-929B, 300333-933C, 181101-955J, 300356-9850, ' ||
             '050595-9392, 260673-9835, 291054-933T, 120436-947T, 290813-971U, 190307-9792, ' ||
             '290758-9831, 140387-9418, 290678-9090, 220911-937H, 290196-903D, 220657-993S, ' ||
             '291116-903U, 080912-955A, 240206-905U}')::text[] AS identity_numbers) AS identity_number_table;

INSERT INTO henkilo(id, version, etunimet, kutsumanimi, sukunimi, hetu, oidhenkilo)
SELECT
        (SELECT MAX(id) FROM henkilo) + i - 27,
        0,
        first_names[mod(i, array_length(first_names, 1)) + 1] || ' ' || second_names[mod(i, array_length(second_names, 1)) + 1],
        first_names[mod(i, array_length(first_names, 1)) + 1],
        last_names[mod(i, array_length(last_names, 1)) + 1],
        identity_numbers[mod(i, array_length(identity_numbers, 1)) + 1],
        '1.2.246.562.24.312345000' || i::text
FROM generate_series(28, 53) AS i,
     (SELECT ('{Anneli, Ella, Hanna, Iiris, Liisa, Maria, Ninni, Viivi, Sointu, ' ||
              'Ulla, Varpu, Raili, Neea, Noora, Mirka, Oona, Jonna, Jaana, Katja, ' ||
              'Jenni, Reija}')::text[] AS first_names) AS first_name_table,
     (SELECT ('{Anna, Iida, Kerttu, Kristiina, Marjatta, Ronja, Sara, Helena, ' ||
              'Aino, Erika, Emmi, Aada, Eveliina, Nanna, Olga, Inkeri, ' ||
              'Petra}')::text[] AS second_names) AS second_name_table,
     (SELECT ('{Aaltonen, Alanen, Eskola, Hakala, Heikkinen, Heinonen, Hiltunen, Hirvonen, ' ||
              'Hämäläinen, Kallio, Karjalainen, Kinnunen, Korhonen, Koskinen, Laakso, ' ||
              'Lahtinen, Laine, Lehtonen, Leinonen, Leppänen, Manninen, Mattila, Mäkinen, ' ||
              'Nieminen, Noronen, Ojala, Paavola, Pitkänen, Räsänen, Saarinen, Salo, ' ||
              'Salonen, Toivonen, Tuominen, Turunen, Valtonen, Virtanen, ' ||
              'Väisänen}')::text[] AS last_names) AS last_name_table,
     (SELECT ('{020794-9240, 100822-996P, 170461-930X, 030804-976W, 050905-956L, 051103-962W, ' ||
              '110169-952D, 091181-910X, 171112-948H, 160689-9968, 300572-976E, 240733-960L, ' ||
              '291005-942E, 280973-976M, 240267-938M, 290795-9384, 110622-994N, 100572-948M, ' ||
              '291170-984C, 171017-9546, 200284-970F, 301091-9640, 210701-9481, 290757-954U, ' ||
              '070635-998K, 080219-990L}')::text[] AS identity_numbers) AS identity_number_table;

-- Insert OTR contact details group for each interpreter person

INSERT INTO yhteystiedotryhma(id, version, ryhmakuvaus, ryhma_alkuperatieto, henkilo_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedotryhma) + i,
    0,
    'yhteystietotyyppi13',
    'alkupera7',
    CASE i < 10
        WHEN TRUE THEN (SELECT id FROM henkilo WHERE oidhenkilo = '1.2.246.562.24.3123450000' || i::text)
        ELSE (SELECT id FROM henkilo WHERE oidhenkilo = '1.2.246.562.24.312345000' || i::text)
        END
FROM generate_series(1, 53) AS i;

-- Insert contact details for created OTR contact details groups

INSERT INTO yhteystiedot(id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedot) + i,
    0,
    'YHTEYSTIETO_SAHKOPOSTI',
    CASE i < 10
        WHEN TRUE THEN (SELECT LOWER(kutsumanimi) || '.' || LOWER(sukunimi) || '@oikeustulkki.invalid' FROM henkilo WHERE oidhenkilo = '1.2.246.562.24.3123450000' || i::text)
        ELSE (SELECT LOWER(kutsumanimi) || '.' || LOWER(sukunimi) || '@oikeustulkki.invalid' FROM henkilo WHERE oidhenkilo = '1.2.246.562.24.312345000' || i::text)
        END,
    CASE i < 10
        WHEN TRUE THEN (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.3123450000' || i::text)
        ELSE (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || i::text)
        END
FROM generate_series(1, 53) AS i;

INSERT INTO yhteystiedot(id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedot) + i,
    0,
    'YHTEYSTIETO_PUHELINNUMERO',
    '+35840' || (1000000 + i)::text,
    CASE i < 10
        WHEN TRUE THEN (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.3123450000' || i::text)
        ELSE (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || i::text)
        END
FROM generate_series(1, 53) AS i
WHERE mod(i, 5) <> 0;

INSERT INTO yhteystiedot(id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id)
SELECT
    (SELECT MAX(id) FROM yhteystiedot) + i,
    0,
    'YHTEYSTIETO_KATUOSOITE',
    street[mod(i, array_length(street, 1)) + 1],
    CASE i < 10
        WHEN TRUE THEN (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.3123450000' || i::text)
        ELSE (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || i::text)
        END
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
    CASE i < 10
        WHEN TRUE THEN (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.3123450000' || i::text)
        ELSE (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || i::text)
        END
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
    CASE i < 10
        WHEN TRUE THEN (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.3123450000' || i::text)
    ELSE (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || i::text)
    END
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
        CASE i < 10
            WHEN TRUE THEN (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.3123450000' || i::text)
    ELSE (SELECT yr.id FROM yhteystiedotryhma yr, henkilo h WHERE yr.henkilo_id = h.id AND h.oidhenkilo = '1.2.246.562.24.312345000' || i::text)
END
FROM generate_series(1, 53) AS i,
     (SELECT ('{Suomi, suomi, SUOMI, Finland, FINLAND}')::text[] AS country) AS country_table
WHERE mod(i, 4) = 0;
