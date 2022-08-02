-- Sql script for deleting learners created in 0_onr_create_learners.sql if needed
-- Running this script requires deletion of OTR contact details data first as done in 1_onr_init_contact_details.sql

-- Code commented out so that it's not run by accident

-- DELETE FROM yksilointivirhe WHERE henkilo_id IN (
--    SELECT id
--    FROM henkilo
--    WHERE oidhenkilo IN (
--        SELECT '1.2.246.562.24.312345000' || lpad(i::text, 2, '0')
--        FROM generate_series(1, 53) AS i
--    )
--);

--DELETE FROM henkilo
--WHERE oidhenkilo IN (
--    SELECT '1.2.246.562.24.312345000' || lpad(i::text, 2, '0')
--    FROM generate_series(1, 53) AS i
--);
