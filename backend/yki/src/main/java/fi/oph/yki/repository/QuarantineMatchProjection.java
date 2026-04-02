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

  String getForm();

  String getState();

  String getPersonOid();

  LocalDate getExamDate();

  String getLanguageCode();
}
