package fi.oph.yki.repository;

import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;

public class RegistrationQueueLiftRepositoryImpl implements RegistrationQueueLiftRepository {

  /**
   * First key of the two-key advisory lock, so that the exam session id alone does not claim the
   * whole key space. Nothing else in this database takes advisory locks (neither this backend nor the
   * legacy one); any future user should pick a different namespace. ASCII "YKIQ".
   */
  public static final int QUEUE_LIFT_LOCK_NAMESPACE = 0x594B4951;

  // Both which registrations can be lifted and whether their pool has a place are decided here and
  // nowhere else. The CASE keys on (session type, partial exam type): any pair it does not name is
  // never lifted, which includes ALL_PARTS in a partial session (decision 12) and a single subtest
  // in a FULL session. The candidate row is still kind='QUEUE' while `taken` is counted, so it needs
  // no explicit exclusion. A NULL maximum makes the comparison NULL, which excludes the row: nothing
  // is lifted rather than anything failing.
  //
  // Beyond legacy's lift-registration-from-queue<!: the capacity check, eligibility derived from the
  // session type here instead of passed in as :types, the r.id tie-break on `created`, and `modified`.
  private static final String LIFT_NEXT_FROM_QUEUE =
    """
    WITH exam_session_limits AS (
        SELECT es.type,
               es.max_participants,
               COALESCE(es.max_participants_read_listen, es.max_participants) AS max_read_listen,
               COALESCE(es.max_participants_speak_write, es.max_participants) AS max_speak_write
        FROM exam_session es
        WHERE es.id = :examSessionId
    ),
    taken AS (
        SELECT COUNT(*)                                                                      AS total,
               COUNT(*) FILTER (WHERE r.partial_exam_type IN ('READ', 'LISTEN', 'ALL_PARTS')) AS read_listen,
               COUNT(*) FILTER (WHERE r.partial_exam_type IN ('SPEAK', 'WRITE', 'ALL_PARTS')) AS speak_write
        FROM registration r
        WHERE r.exam_session_id = :examSessionId
          AND r.kind = 'ADMISSION'
          AND r.state IN ('COMPLETED', 'SUBMITTED', 'STARTED')
    ),
    candidate AS (
        SELECT r.id, fr.free_registration_id
        FROM registration r
        CROSS JOIN exam_session_limits s
        CROSS JOIN taken t
        LEFT JOIN free_registration fr ON fr.registration_id = r.id
        WHERE r.exam_session_id = :examSessionId
          AND r.kind = 'QUEUE'
          AND r.state = 'SUBMITTED'
          AND CASE
                WHEN (s.type = 'FULL'         AND r.partial_exam_type = 'ALL_PARTS')
                  THEN t.total < s.max_participants
                WHEN (s.type = 'READ_SPEAK'   AND r.partial_exam_type = 'READ')
                  OR (s.type = 'LISTEN_WRITE' AND r.partial_exam_type = 'LISTEN')
                  THEN t.read_listen < s.max_read_listen
                WHEN (s.type = 'READ_SPEAK'   AND r.partial_exam_type = 'SPEAK')
                  OR (s.type = 'LISTEN_WRITE' AND r.partial_exam_type = 'WRITE')
                  THEN t.speak_write < s.max_speak_write
                ELSE false
              END
        ORDER BY r.created ASC, r.id ASC
        LIMIT 1
    )
    UPDATE registration r
    SET kind                 = 'ADMISSION',
        state                = CASE WHEN c.free_registration_id IS NOT NULL
                                    THEN 'COMPLETED'::registration_state
                                    ELSE 'SUBMITTED'::registration_state
                               END,
        lifted_from_queue_at = current_timestamp,
        expires_at           = CASE WHEN c.free_registration_id IS NULL
                                    THEN at_midnight((current_date + '1 day'::interval)::date)
                                    ELSE r.expires_at
                               END,
        modified             = current_timestamp
    FROM candidate c
    -- Re-stated so that if a clerk cancelled or moved the row after the CTE's snapshot, the
    -- re-check against the new row version finds nothing to update.
    WHERE r.id = c.id
      AND r.kind = 'QUEUE'
      AND r.state = 'SUBMITTED'
    RETURNING r.id,
              r.kind::text,
              r.state::text,
              r.exam_session_id,
              r.original_exam_session_id,
              r.partial_exam_type::text,
              c.free_registration_id IS NOT NULL
    """;

  @PersistenceContext
  private EntityManager entityManager;

  @Override
  public boolean tryLockExamSessionForQueueLift(final long examSessionId) {
    // The two-key form takes int4 keys. toIntExact fails loudly rather than letting two sessions
    // share a lock should ids ever outgrow an int.
    return (Boolean) entityManager
      .createNativeQuery("SELECT pg_try_advisory_xact_lock(:namespace, :examSessionId)")
      .setParameter("namespace", QUEUE_LIFT_LOCK_NAMESPACE)
      .setParameter("examSessionId", Math.toIntExact(examSessionId))
      .getSingleResult();
  }

  @Override
  public Optional<LiftedRegistration> liftNextFromQueue(final long examSessionId) {
    @SuppressWarnings("unchecked")
    final List<Object[]> rows = entityManager
      .createNativeQuery(LIFT_NEXT_FROM_QUEUE)
      .setParameter("examSessionId", examSessionId)
      .getResultList();

    final Optional<LiftedRegistration> lifted = rows
      .stream()
      .findFirst()
      .map(RegistrationQueueLiftRepositoryImpl::toLiftedRegistration);

    // The native UPDATE bypasses the persistence context, so a Registration already loaded in this
    // transaction would now be stale. Refreshing it means callers can load the entity as usual.
    lifted.ifPresent(registration -> entityManager.refresh(entityManager.find(Registration.class, registration.id())));

    return lifted;
  }

  private static LiftedRegistration toLiftedRegistration(final Object[] row) {
    return LiftedRegistration
      .builder()
      .id(((Number) row[0]).longValue())
      .kind(RegistrationKind.valueOf((String) row[1]))
      .state(RegistrationState.valueOf((String) row[2]))
      .examSessionId(((Number) row[3]).longValue())
      .originalExamSessionId(row[4] == null ? null : ((Number) row[4]).longValue())
      .partialExamType(PartialExamType.valueOf((String) row[5]))
      .freeRegistration((Boolean) row[6])
      .build();
  }
}
