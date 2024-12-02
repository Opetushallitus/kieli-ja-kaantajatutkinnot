package fi.oph.vkt.view;

import fi.oph.vkt.model.type.FreeEnrollmentSource;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerExamEventXlsxDataRow(
  @NonNull String enrollmentTime,
  @NonNull String lastName,
  @NonNull String firstName,
  @NonNull Integer previousEnrollment,
  @NonNull String status,
  @NonNull Integer textualSkill,
  @NonNull Integer oralSkill,
  @NonNull Integer understandingSkill,
  @NonNull Integer writing,
  @NonNull Integer readingComprehension,
  @NonNull Integer speaking,
  @NonNull Integer speechComprehension,
  @NonNull String email,
  @NonNull String phoneNumber,
  @NonNull Integer digitalCertificateConsent,
  String street,
  String postalCode,
  String town,
  String country
)
  implements ExamEventCommonXlsxDataRow {}
