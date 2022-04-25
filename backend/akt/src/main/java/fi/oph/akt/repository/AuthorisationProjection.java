package fi.oph.akt.repository;

import fi.oph.akt.model.AuthorisationBasis;
import java.time.LocalDate;

public record AuthorisationProjection(
  long id,
  int version,
  long translatorId,
  AuthorisationBasis authorisationBasis,
  String diaryNumber,
  String fromLang,
  String toLang,
  boolean permissionToPublish,
  LocalDate termBeginDate,
  LocalDate termEndDate,
  LocalDate examinationDate
) {}
