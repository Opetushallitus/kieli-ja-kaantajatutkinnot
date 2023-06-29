package fi.oph.vkt.view;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExamEventXlsxDataRow(
  @NonNull String enrollmentTime,
  @NonNull String lastName,
  @NonNull String firstName,
  String previousEnrollment,
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
) {}
