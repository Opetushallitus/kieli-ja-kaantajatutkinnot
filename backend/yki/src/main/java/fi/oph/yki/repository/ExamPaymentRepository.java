package fi.oph.yki.repository;

import fi.oph.yki.model.ExamPayment;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamPaymentRepository extends BaseRepository<ExamPayment> {
  @Query(
    nativeQuery = true,
    value = """
      SELECT
        p.last_name AS lastName,
        p.first_name AS firstName,
        p.email AS email,
        (epn.paid_at AT TIME ZONE 'UTC') AS paidAt,
        ed.exam_date AS examDate,
        oed.exam_date AS originalExamDate,
        es.language_code AS languageCode,
        es.level_code AS levelCode,
        epn.amount AS amount,
        epn.reference AS reference,
        o.oid AS organizerOid,
        NULL AS frSource,
        NULL AS frIsForeign,
        NULL AS frMatriculationExam,
        NULL AS frEb,
        NULL AS frDia,
        NULL AS frHigherEducationConcluded,
        NULL AS frHigherEducationEnrolled
      FROM exam_payment_new epn
      INNER JOIN registration r ON epn.registration_id = r.id
      INNER JOIN person p ON r.person_oid = p.oid
      INNER JOIN exam_session es ON r.exam_session_id = es.id
      INNER JOIN exam_date ed ON es.exam_date_id = ed.id
      INNER JOIN organizer o ON es.organizer_id = o.id
      LEFT JOIN exam_session oes ON r.original_exam_session_id = oes.id
      LEFT JOIN exam_date oed ON oes.exam_date_id = oed.id
      WHERE epn.paid_at >= (:fromInclusive AT TIME ZONE 'Europe/Helsinki')
        AND epn.paid_at < (:toExclusive AT TIME ZONE 'Europe/Helsinki')
      """
  )
  List<PaymentReportProjection> findCompletedPaymentsForTimeRange(LocalDate fromInclusive, LocalDate toExclusive);

  @Query(
    nativeQuery = true,
    value = """
      SELECT
        p.last_name AS lastName,
        p.first_name AS firstName,
        p.email AS email,
        (fr.created_at AT TIME ZONE 'UTC') AS paidAt,
        ed.exam_date AS examDate,
        oed.exam_date AS originalExamDate,
        es.language_code AS languageCode,
        es.level_code AS levelCode,
        0 AS amount,
        NULL AS reference,
        o.oid AS organizerOid,
        fr.source AS frSource,
        fr.is_foreign AS frIsForeign,
        fr.matriculation_exam AS frMatriculationExam,
        fr.eb AS frEb,
        fr.dia AS frDia,
        fr.higher_education_concluded AS frHigherEducationConcluded,
        fr.higher_education_enrolled AS frHigherEducationEnrolled
      FROM registration r
      INNER JOIN free_registration fr ON r.id = fr.registration_id
      INNER JOIN person p ON r.person_oid = p.oid
      INNER JOIN exam_session es ON r.exam_session_id = es.id
      INNER JOIN exam_date ed ON es.exam_date_id = ed.id
      INNER JOIN organizer o ON es.organizer_id = o.id
      LEFT JOIN exam_session oes ON r.original_exam_session_id = oes.id
      LEFT JOIN exam_date oed ON oes.exam_date_id = oed.id
      WHERE r.state = 'COMPLETED'
        AND fr.created_at >= (:fromInclusive AT TIME ZONE 'Europe/Helsinki')
        AND fr.created_at < (:toExclusive AT TIME ZONE 'Europe/Helsinki')
      """
  )
  List<PaymentReportProjection> findFreeRegistrationsForTimeRange(LocalDate fromInclusive, LocalDate toExclusive);
}
