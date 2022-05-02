TRUNCATE tulkki CASCADE;

INSERT INTO tulkki(henkilo_oid, luoja)
SELECT i::text, 'init'
FROM generate_series(1, 101) i;

INSERT INTO oikeustulkki(tulkki, luoja, tutkinto_tyyppi, julkaisulupa)
SELECT id, 'init', 'OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO', true
FROM tulkki;

INSERT INTO kielipari(oikeustulkki, kielesta, kieleen, voimassaolo_alkaa, voimassaolo_paattyy)
SELECT id, 'FI', 'SV', now(), now() + interval '200 days'
FROM oikeustulkki;

INSERT INTO sijainti(oikeustulkki, tyyppi, koodi)
SELECT id, 'KOKO_SUOMI', null
FROM oikeustulkki;
