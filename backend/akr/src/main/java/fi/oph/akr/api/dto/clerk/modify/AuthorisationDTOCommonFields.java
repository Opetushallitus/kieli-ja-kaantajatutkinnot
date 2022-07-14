package fi.oph.akr.api.dto.clerk.modify;

import fi.oph.akr.model.AuthorisationBasis;
import java.time.LocalDate;

public interface AuthorisationDTOCommonFields {
  AuthorisationBasis basis();

  String from();

  String to();

  LocalDate termBeginDate();

  LocalDate termEndDate();

  Boolean permissionToPublish();

  String diaryNumber();

  LocalDate examinationDate();
}
