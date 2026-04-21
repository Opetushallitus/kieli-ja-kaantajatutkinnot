package fi.oph.yki.repository;

import java.time.Instant;
import java.time.LocalDate;

public interface QuarantineMatchProjection {
  Long getQuarantineId();

  String getQuarantineLang();

  String getBirthdate();

  Instant getCreated();

  String getSsn();

  String getFirstName();

  String getLastName();

  String getEmail();

  String getPhoneNumber();

  Long getRegistrationId();

  String getFormFirstName();

  String getFormLastName();

  String getFormBirthdate();

  String getFormSsn();

  String getFormEmail();

  String getFormPhoneNumber();

  String getState();

  String getPersonOid();

  LocalDate getExamDate();

  String getLanguageCode();

  String getLevelCode();
}
