package fi.oph.yki.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface PaymentReportProjection {
  String getLastName();
  String getFirstName();
  String getEmail();
  LocalDateTime getPaidAt();
  LocalDate getExamDate();
  LocalDate getOriginalExamDate();
  String getLanguageCode();
  String getLevelCode();
  BigDecimal getAmount();
  String getReference();
  String getOrganizerOid();
  // Free registration fields
  String getFrSource();
  Boolean getFrIsForeign();
  Boolean getFrMatriculationExam();
  Boolean getFrEb();
  Boolean getFrDia();
  Boolean getFrHigherEducationConcluded();
  Boolean getFrHigherEducationEnrolled();
}
