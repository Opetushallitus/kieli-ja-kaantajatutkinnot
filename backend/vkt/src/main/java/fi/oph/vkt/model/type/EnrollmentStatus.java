package fi.oph.vkt.model.type;

// These are used in `excelEnrollmentComparator` method under `ClerkExamEventService` so their ordering matters
public enum EnrollmentStatus {
  PAID,
  EXPECTING_PAYMENT,
  QUEUED,
  CANCELED,
}
