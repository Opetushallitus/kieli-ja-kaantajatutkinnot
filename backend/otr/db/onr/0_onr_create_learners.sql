-- Preliminary script to be run on untuva or pallero `opppijanumerorekisteri` database
-- This script creates learners defined in backend/otr/db/4_init.sql and should only be run once

-- ONR ids reserved for OTR: 1.2.246.562.24.31234500001 - 1.2.246.562.24.31234500053

-- Create male learners

INSERT INTO henkilo(id, version, etunimet, kutsumanimi, sukunimi, hetu, oidhenkilo)
SELECT
    (SELECT MAX(id) FROM henkilo) + i,
    0,
    first_names[mod(i, array_length(first_names, 1)) + 1] || ' ' || second_names[mod(i, array_length(second_names, 1)) + 1],
    first_names[mod(i, array_length(first_names, 1)) + 1],
    last_names[mod(i, array_length(last_names, 1)) + 1],
    identity_numbers[mod(i, array_length(identity_numbers, 1)) + 1],
    '1.2.246.562.24.312345000' || lpad(i::text, 2, '0')
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

-- Create female learners

INSERT INTO henkilo(id, version, etunimet, kutsumanimi, sukunimi, hetu, oidhenkilo)
SELECT
        (SELECT MAX(id) FROM henkilo) + i - 27,
        0,
        first_names[mod(i, array_length(first_names, 1)) + 1] || ' ' || second_names[mod(i, array_length(second_names, 1)) + 1],
        first_names[mod(i, array_length(first_names, 1)) + 1],
        last_names[mod(i, array_length(last_names, 1)) + 1],
        identity_numbers[mod(i, array_length(identity_numbers, 1)) + 1],
        '1.2.246.562.24.312345000' || lpad(i::text, 2, '0')
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
