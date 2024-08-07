package fi.oph.vkt.model.type;

// These are used in `excelEnrollmentComparator` method under `ClerkExamEventService` so their ordering matters
public enum EnrollmentStatus {
  COMPLETED,
  AWAITING_PAYMENT,
  AWAITING_APPROVAL,
  QUEUED,
  CANCELED,
  EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT,
  CANCELED_UNFINISHED_ENROLLMENT,
}
