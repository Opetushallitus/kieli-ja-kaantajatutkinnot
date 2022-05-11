-- Some test data that can be used for checking that when db.changelog-2.0.xml migrations
-- are run against production database, no errors should occur.

-- This can for example be inserted in untuva and pallero before deploying new versions there where
-- those liquibase migrations are run.

TRUNCATE tulkki CASCADE;

-- 8 interpreters, 2 deleted
INSERT INTO tulkki(henkilo_oid, luoja) VALUES('1.246.1', 'test');
INSERT INTO tulkki(henkilo_oid, luoja) VALUES('1.246.2', 'test');
INSERT INTO tulkki(henkilo_oid, luoja) VALUES('1.246.3', 'test');
INSERT INTO tulkki(henkilo_oid, luoja) VALUES('1.246.4', 'test');
INSERT INTO tulkki(henkilo_oid, luoja) VALUES('1.246.5', 'test');
INSERT INTO tulkki(henkilo_oid, luoja) VALUES('1.246.6', 'test');
INSERT INTO tulkki(henkilo_oid, luoja) VALUES('1.246.7', 'test');
INSERT INTO tulkki(henkilo_oid, luoja) VALUES('1.246.8', 'test');

UPDATE tulkki SET muokattu = now(), muokkaaja = 'test' WHERE henkilo_oid = '1.246.5';
UPDATE tulkki SET muokattu = now(), muokkaaja = 'test' WHERE henkilo_oid = '1.246.6';
UPDATE tulkki SET muokattu = now(), muokkaaja = 'test', poistettu = true, poistohetki = now(), poistaja = 'test' WHERE henkilo_oid = '1.246.7';
UPDATE tulkki SET muokattu = now(), muokkaaja = 'test', poistettu = true, poistohetki = now(), poistaja = 'test' WHERE henkilo_oid = '1.246.8';

-- 11 qualifications, 4 deleted
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.1'), 'test', '11', 'OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO');
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.2'), 'test', '21', 'OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO');
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.3'), 'test', '31', 'MUU_KORKEAKOULUTUTKINTO');
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.4'), 'test', '41', 'MUU_KORKEAKOULUTUTKINTO');
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.5'), 'test', '51', 'MUU_KORKEAKOULUTUTKINTO');
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.5'), 'test', '52', 'MUU_KORKEAKOULUTUTKINTO');
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.6'), 'test', '61', 'OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO');
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.6'), 'test', '62', 'OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO');
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.6'), 'test', '63', 'MUU_KORKEAKOULUTUTKINTO');
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.7'), 'test', '71', 'MUU_KORKEAKOULUTUTKINTO');
INSERT INTO oikeustulkki(tulkki, luoja, lisatiedot, tutkinto_tyyppi) VALUES((SELECT(id) FROM tulkki WHERE henkilo_oid = '1.246.8'), 'test', '81', 'OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO');

-- Set custom details for non-deleted qualifications
UPDATE oikeustulkki SET julklaisulupa_email = true, julkaisulupa = true WHERE lisatiedot = '11';
UPDATE oikeustulkki SET julklaisulupa_email = true, julklaisulupa_puhelinnumero = true, julkaisulupa = true WHERE lisatiedot = '21';
UPDATE oikeustulkki SET julklaisulupa_muu_yhteystieto = true, muu_yhteystieto = 'muu31', julkaisulupa = true WHERE lisatiedot = '31';
UPDATE oikeustulkki SET julklaisulupa_email = true, julklaisulupa_puhelinnumero = true, julklaisulupa_muu_yhteystieto = true, muu_yhteystieto = 'muu41', julkaisulupa = true WHERE lisatiedot = '41';
UPDATE oikeustulkki SET julklaisulupa_email = true, julkaisulupa = false WHERE lisatiedot = '51';
UPDATE oikeustulkki SET julklaisulupa_puhelinnumero = true, julklaisulupa_muu_yhteystieto = true, muu_yhteystieto = 'muu61', julkaisulupa = true WHERE lisatiedot = '61';
UPDATE oikeustulkki SET julklaisulupa_email = true, julklaisulupa_puhelinnumero = true, julklaisulupa_muu_yhteystieto = true, muu_yhteystieto = 'muu71', julkaisulupa = true WHERE lisatiedot = '71';

-- Mark some qualifications modified
UPDATE oikeustulkki SET muokattu = now(), muokkaaja = 'test' WHERE lisatiedot = '31';
UPDATE oikeustulkki SET muokattu = now(), muokkaaja = 'test' WHERE lisatiedot = '51';

-- Mark qualifications 52, 62, 63 and 81 deleted
UPDATE oikeustulkki SET muokattu = now(), muokkaaja = 'test', poistettu = true, poistohetki = now(), poistaja = 'test' WHERE lisatiedot = '52';
UPDATE oikeustulkki SET muokattu = now(), muokkaaja = 'test', poistettu = true, poistohetki = now(), poistaja = 'test' WHERE lisatiedot = '62';
UPDATE oikeustulkki SET muokattu = now(), muokkaaja = 'test', poistettu = true, poistohetki = now(), poistaja = 'test' WHERE lisatiedot = '63';
UPDATE oikeustulkki SET muokattu = now(), muokkaaja = 'test', poistettu = true, poistohetki = now(), poistaja = 'test' WHERE lisatiedot = '81';

-- Set some custom details for deleted qualification 81
UPDATE oikeustulkki SET julklaisulupa_email = true, julkaisulupa = true, muu_yhteystieto = 'muu81' WHERE lisatiedot = '81';

-- Insert some language pairs
INSERT INTO kielipari(oikeustulkki, kielesta, kieleen, voimassaolo_alkaa, voimassaolo_paattyy)
SELECT id, 'FI', 'SV', now(), now() + interval '200 days'
FROM oikeustulkki;

INSERT INTO kielipari(oikeustulkki, kielesta, kieleen, voimassaolo_alkaa, voimassaolo_paattyy)
SELECT id, 'DE', 'FI', now() - interval '300 days', now() - interval '100 days'
FROM oikeustulkki;

INSERT INTO kielipari(oikeustulkki, kielesta, kieleen, voimassaolo_alkaa, voimassaolo_paattyy)
VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '11'), 'SV', 'DE', now(), now() + interval '5 years');

INSERT INTO kielipari(oikeustulkki, kielesta, kieleen, voimassaolo_alkaa, voimassaolo_paattyy)
VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '21'), 'FI', 'GR', now(), now() + interval '3 years');

INSERT INTO kielipari(oikeustulkki, kielesta, kieleen, voimassaolo_alkaa, voimassaolo_paattyy)
VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '51'), 'FI', 'KR', now(), now() + interval '10 years');

INSERT INTO kielipari(oikeustulkki, kielesta, kieleen, voimassaolo_alkaa, voimassaolo_paattyy)
VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '52'), 'FI', 'KR', now() - interval '50 years', now() - interval '40 years');

-- Insert some regions
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '11'), 'KOKO_SUOMI', null);
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '21'), 'KOKO_SUOMI', null);
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '31'), 'MAAKUNTA', '01');
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '41'), 'MAAKUNTA', '02');
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '41'), 'MAAKUNTA', '04');
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '41'), 'MAAKUNTA', '05');
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '51'), 'MAAKUNTA', '04');
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '51'), 'MAAKUNTA', '05');
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '52'), 'MAAKUNTA', '05');
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '61'), 'KOKO_SUOMI', null);
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '62'), 'KOKO_SUOMI', null);
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '63'), 'KOKO_SUOMI', null);
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '71'), 'KOKO_SUOMI', null);
INSERT INTO sijainti(oikeustulkki, tyyppi, koodi) VALUES((SELECT(id) FROM oikeustulkki WHERE lisatiedot = '81'), 'MAAKUNTA', '06');
