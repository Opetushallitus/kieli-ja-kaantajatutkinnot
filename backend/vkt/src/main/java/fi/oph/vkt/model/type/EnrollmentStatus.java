package fi.oph.vkt.model.type;

// These are used in `excelEnrollmentComparator` method under `ClerkExamEventService` so their ordering matters
public enum EnrollmentStatus {
  PAID,
  EXPECTING_PAYMENT,
  EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT,
  QUEUED,
  CANCELED,
  CANCELED_UNFINISHED_ENROLLMENT,
}
