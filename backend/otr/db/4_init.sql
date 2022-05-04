TRUNCATE tulkki CASCADE;

INSERT INTO tulkki(henkilo_oid, luoja)
SELECT i::text, 'init'
FROM generate_series(1, 101) i;

INSERT INTO oikeustulkki(tulkki, luoja, tutkinto_tyyppi, julkaisulupa)
SELECT id, 'init', 'OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO', true
FROM tulkki;

UPDATE oikeustulkki SET julklaisulupa_email = true WHERE id % 2 = 0;
UPDATE oikeustulkki SET julklaisulupa_puhelinnumero = true WHERE id % 3 = 0;
UPDATE oikeustulkki SET julklaisulupa_muu_yhteystieto = true WHERE id % 5 = 0;
UPDATE oikeustulkki SET muu_yhteystieto = 'Tulkintie ' || id::text WHERE julklaisulupa_muu_yhteystieto AND id % 2 = 0;
UPDATE oikeustulkki SET julkaisulupa = false WHERE id % 50 = 0;
UPDATE oikeustulkki SET lisatiedot = 'Extra' || id::text WHERE id % 7 = 0;

INSERT INTO kielipari(oikeustulkki, kielesta, kieleen, voimassaolo_alkaa, voimassaolo_paattyy)
SELECT id, 'FI', 'SV', now(), now() + interval '200 days'
FROM oikeustulkki;

INSERT INTO sijainti(oikeustulkki, tyyppi, koodi)
SELECT id, 'KOKO_SUOMI', null
FROM oikeustulkki;
