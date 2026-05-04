package fi.oph.yki.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface QuarantineReviewProjection {
  Long getId();
  Boolean getQuarantined();
  Long getQuarantineId();
  Long getRegistrationId();
  LocalDateTime getUpdated();
  LocalDate getExamDate();
  String getLanguageCode();
  String getLevelCode();
  String getBirthdate();
  String getSsn();
  String getFirstName();
  String getLastName();
  String getEmail();
  String getPhoneNumber();
  String getFormBirthdate();
  String getFormFirstName();
  String getFormLastName();
  String getFormEmail();
  String getFormPhoneNumber();
  String getState();
}
