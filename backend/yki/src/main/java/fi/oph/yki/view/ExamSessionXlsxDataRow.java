package fi.oph.yki.view;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExamSessionXlsxDataRow(
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
  Integer isFree,
  @NonNull Integer matriculationExam,
  @NonNull Integer dia,
  @NonNull Integer eb,
  @NonNull Integer higherEducationConcluded,
  @NonNull Integer higherEducationEnrolled,
  @NonNull Integer otherEducation,
  @NonNull String email,
  @NonNull String phoneNumber,
  @NonNull String birthdate,
  @NonNull String ssn,
  @NonNull Integer digitalCertificateConsent,
  String street,
  String postalCode,
  String town,
  String country
) {}
