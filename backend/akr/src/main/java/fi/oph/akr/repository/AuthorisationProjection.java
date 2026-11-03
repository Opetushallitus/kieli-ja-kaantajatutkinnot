package fi.oph.akr.repository;

import fi.oph.akr.model.AuthorisationBasis;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
  LocalDate examinationDate,
  LocalDateTime modifiedAt
) {}
