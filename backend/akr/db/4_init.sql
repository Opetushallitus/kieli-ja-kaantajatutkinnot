TRUNCATE translator CASCADE;
TRUNCATE examination_date CASCADE;
TRUNCATE meeting_date CASCADE;
TRUNCATE email CASCADE;

INSERT INTO examination_date(date)
VALUES ('2020-10-04'), ('2021-09-13'), ('2022-11-22');

INSERT INTO meeting_date(date)
VALUES ('2020-12-30'), ('2021-03-09'), ('2021-06-10'), ('2021-08-15'), ('2021-11-18'), ('2022-01-01'), ('2022-05-14'),
       ('2022-09-25'), ('2022-12-03'), ('2023-02-28'), ('2023-04-11'), ('2023-09-09'), ('2023-11-29');

INSERT INTO translator(identity_number, first_name, last_name, email, phone_number, street, town, postal_code, country,
                       extra_information, is_assurance_given)
SELECT 'id' || i::text,
       first_names[mod(i, array_length(first_names, 1)) + 1],
       last_names[mod(i, array_length(last_names, 1)) + 1],
       'translator' || i::text || '@example.invalid',
       '+35840' || (1000000 + i)::text,
       CASE mod(i, 7)
           WHEN 0 THEN initcap(reverse(street[mod(i, array_length(street, 1)) + 1]))
           ELSE street[mod(i, array_length(street, 1)) + 1] END,
       CASE mod(i, 7)
           WHEN 0 THEN initcap(reverse(town[mod(i, array_length(town, 1)) + 1]))
           ELSE town[mod(i, array_length(town, 1)) + 1] END,
       postal_code[mod(i, array_length(postal_code, 1)) + 1],
       CASE mod(i, 7)
           WHEN 0 THEN 'LVA'
           ELSE country[mod(i, array_length(country, 1)) + 1] END,
       extra_information[mod(i, array_length(extra_information, 1)) + 1],
       mod(i, 19) <> 0
FROM generate_series(1, 4900) AS i,
     (SELECT ('{Antti, Eero, Ilkka, Jari, Juha, Matti, Pekka, Timo, Iiro, Jukka, Kalle, ' ||
              'Kari, Marko, Mikko, Tapani, Ville, Anneli, Ella, Hanna, Iiris, Liisa, ' ||
              'Maria, Ninni, Viivi, Anna, Iida, Kerttu, Kristiina, Marjatta, Ronja, ' ||
              'Sara}')::text[] AS first_names) AS first_name_table,
     (SELECT ('{Aaltonen, Alanen, Eskola, Hakala, Heikkinen, Heinonen, Hiltunen, Hirvonen, ' ||
              'Hämäläinen, Kallio, Karjalainen, Kinnunen, Korhonen, Koskinen, Laakso, ' ||
              'Lahtinen, Laine, Lehtonen, Leinonen, Leppänen, Manninen, Mattila, Mäkinen, ' ||
              'Nieminen, Noronen, Ojala, Paavola, Pitkänen, Räsänen, Saarinen, Salo, ' ||
              'Salonen, Toivonen, Tuominen, Turunen, Valtonen, Virtanen, ' ||
              'Väisänen}')::text[] AS last_names) AS last_name_table,
     (SELECT ('{Malminkatu 1, Runebergintie 2, Sibeliuksenkuja 3, Veturitie 4, ' ||
              'Pirkkolantie 123}')::text[] AS street) AS street_table,
     (SELECT ('{Helsinki, Turku, Hämeenlinna, Kuopio, Lahti, Porvoo, Vantaa, Järvenpää, ' ||
              'Kouvola, Tampere, Oulu, Rovaniemi, Kajaani, Joensuu, Uusikaupunki, Kuopio, ' ||
              'Kotka}')::text[] AS town) AS town_table,
     (SELECT ('{00100, 01200, 06100, 13500, 31600, 48600, ' ||
              '54460}')::text[] AS postal_code) AS postal_code_table,
     (SELECT ('{FIN, NULL}')::text[] AS country) AS country_table,
     (SELECT ('{Osoitetiedot päivitetty 1.1.1970., ' ||
              'Kääntäjän nimeä muutettu. Vanhassa nimessä oli typo., ' ||
              'Osoitetietoja muokattu 1.5.1999. Osoitetietoja muutettu uudelleen 2.5.1999. Uusi auktorisointi lisätty kääntäjälle 12.10.2000. Auktorisointi päivitetty julkiseksi 1.1.2001. Viimeisen muutoksen tekijä: Testi Testinen, ' ||
              'Lorem ipsum dolor sit amet consectetur adipiscing elit. Ut vehicula sem nulla eu placerat libero dapibus eget. Ut ac pretium velit ac hendrerit eros. Nullam in tortor in augue dignissim vehicula. Nulla ac cursus ligula. Nulla ut magna dapibus egestas tortor eget consequat augue. Pellentesque tempor sapien ut orci commodo et commodo mi condimentum. Aliquam lacinia commodo elit id bibendum quam condimentum suscipit. Phasellus nibh turpis laoreet non gravida sed gravida ac magna. Nulla ut lectus augue. Curabitur finibus laoreet ullamcorper. Nullam id dapibus ex et fermentum nulla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Maecenas varius lectus id felis mattis ac sodales purus posuere. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed a pharetra massa., ' ||
              'NULL}')::text[] AS extra_information) AS extra_information_table;

-- insert authorisations for translators, for some we add multiple authorisations
WITH translator_ids AS (
    SELECT translator_id, translator_id AS i
    FROM translator
    UNION ALL
    SELECT translator_id, translator_id + 1 AS i
    FROM translator
    WHERE mod(translator_id, 13) = 0
    UNION ALL
    SELECT translator_id, translator_id + 2 AS i
    FROM translator
    WHERE mod(translator_id, 15) = 0
    UNION ALL
    SELECT translator_id, translator_id + 3 AS i
    FROM translator
    WHERE mod(translator_id, 17) = 0
    UNION ALL
    SELECT translator_id, translator_id + 4 AS i
    FROM translator
    WHERE mod(translator_id, 19) = 0
    UNION ALL
    SELECT translator_id, translator_id + 5 AS i
    FROM translator
    WHERE mod(translator_id, 20) = 0
    UNION ALL
    SELECT translator_id, translator_id + 6 AS i
    FROM translator
    WHERE mod(translator_id, 21) = 0
    UNION ALL
    SELECT translator_id, translator_id + 7 AS i
    FROM translator
    WHERE mod(translator_id, 22) = 0
    UNION ALL
    SELECT translator_id, translator_id + 8 AS i
    FROM translator
    WHERE mod(translator_id, 23) = 0
    UNION ALL
    SELECT translator_id, translator_id + 9 AS i
    FROM translator
    WHERE mod(translator_id, 24) = 0
)
INSERT
INTO authorisation(translator_id, basis, meeting_date_id, examination_date_id, from_lang, to_lang, permission_to_publish,
                   term_begin_date, term_end_date)
SELECT translator_id,
       -- 11 KKT
       -- 13 VIR
       -- 17 VIR-unauthorised
       -- else AUT
       CASE
           WHEN mod(i, 11) = 0 THEN 'KKT'
           WHEN mod(i, 13) = 0 THEN 'VIR'
           WHEN mod(i, 17) = 0 THEN 'VIR'
           ELSE 'AUT' END,
       CASE
           WHEN mod(i, 11) = 0 THEN (SELECT min(meeting_date_id) FROM meeting_date)
           WHEN mod(i, 13) = 0 THEN (SELECT min(meeting_date_id) FROM meeting_date)
           WHEN mod(i, 17) = 0 THEN NULL
           ELSE (SELECT min(meeting_date_id) FROM meeting_date) END,
       CASE
           WHEN mod(i, 11) = 0 THEN NULL
           WHEN mod(i, 13) = 0 THEN NULL
           WHEN mod(i, 17) = 0 THEN NULL
           ELSE (SELECT min(examination_date_id) FROM examination_date) END,
       from_langs[mod(i, array_length(from_langs, 1)) + 1],
       to_langs[mod(i, array_length(to_langs, 1)) + 1],
       mod(i, 21) <> 0,
       -- Set preliminary term_end and begin dates for inserting authorisation rows, these are changed later
       CASE
         WHEN mod(i, 11) = 0 THEN NOW()
         WHEN mod(i, 13) = 0 THEN NOW()
         WHEN mod(i, 17) = 0 THEN NULL
         ELSE NOW() END,
       CASE
         WHEN mod(i, 11) = 0 THEN NOW() + '1 day'::interval
         WHEN mod(i, 13) = 0 THEN NULL
         WHEN mod(i, 17) = 0 THEN NULL
         ELSE NOW() + '1 day'::interval END
FROM translator_ids,
     (SELECT ('{FI, SEIN, SEKO, SEPO}')::text[] AS from_langs) AS from_langs_table,
     (SELECT ('{BN, CA, CS, DA, DE, EL, EN, ET, FJ, FO, FR, GA, HE, HR, HU, JA, RU, SV, TT, TY, UG, UK, VI}')::text[] AS to_langs) AS to_langs_table
;

-- translators with VIR-unauthorised authorisation should not have other types of authorisations
DELETE FROM authorisation WHERE meeting_date_id IS NOT NULL AND translator_id IN (
    SELECT translator_id
    FROM authorisation
    WHERE meeting_date_id IS NULL
);

-- add inverse language pairs related to most non VIR-unauthorised authorisations
INSERT INTO authorisation(translator_id, basis, meeting_date_id, examination_date_id, from_lang, to_lang, permission_to_publish, term_begin_date, term_end_date)
SELECT translator_id,
       basis,
       meeting_date_id,
       examination_date_id,
       -- note to_lang and from_lang are swapped
       to_lang,
       from_lang,
       mod(translator_id, 98) <> 0,
       term_begin_date,
       term_end_date
FROM authorisation
WHERE meeting_date_id IS NOT NULL AND mod(authorisation_id, 20) <> 0;

-- add inverse language pairs related to some VIR-unauthorised authorisations
INSERT INTO authorisation(translator_id, basis, from_lang, to_lang, permission_to_publish, term_begin_date, term_end_date)
SELECT translator_id,
       basis,
       -- note to_lang and from_lang are swapped
       to_lang,
       from_lang,
       mod(translator_id, 98) <> 0,
       term_begin_date,
       term_end_date
FROM authorisation
WHERE meeting_date_id IS NULL AND mod(authorisation_id, 29) = 0;

-- set diary numbers to match the ids of authorisations
UPDATE authorisation
SET diary_number = authorisation_id
WHERE 1 = 1;

-- set random meeting dates for non VIR-unauthorised authorisations
UPDATE authorisation
SET meeting_date_id = (
    SELECT md.meeting_date_id FROM meeting_date md
    WHERE md.date < CURRENT_DATE
    ORDER BY random() + authorisation_id LIMIT 1
) WHERE meeting_date_id IS NOT NULL;

-- set authorisation term begin dates
UPDATE authorisation
SET term_begin_date = (
    SELECT md.date FROM meeting_date md
    WHERE md.meeting_date_id = authorisation.meeting_date_id
) WHERE meeting_date_id IS NOT NULL;

-- set authorisation term end dates
UPDATE authorisation
SET term_end_date = term_begin_date + '6 months'::interval
WHERE basis <> 'VIR';

-- set some translator fields to null
UPDATE translator
SET identity_number = NULL
WHERE mod(translator_id, 50) = 0;

UPDATE translator
SET email = NULL
WHERE mod(translator_id, 11) = 0;

UPDATE translator
SET phone_number = NULL
WHERE mod(translator_id, 12) = 0;

UPDATE translator
SET street = NULL
WHERE mod(translator_id, 13) = 0;

UPDATE translator
SET town = NULL
WHERE mod(translator_id, 14) = 0;

UPDATE translator
SET postal_code = NULL
WHERE mod(translator_id, 15) = 0;

-- set some foreign countries
UPDATE translator
SET town = 'Alta',
    country = 'NOR'
WHERE mod(translator_id, 17) = 0;

UPDATE translator
SET town = 'Berlin',
    country = 'DEU'
WHERE mod(translator_id, 18) = 0;
