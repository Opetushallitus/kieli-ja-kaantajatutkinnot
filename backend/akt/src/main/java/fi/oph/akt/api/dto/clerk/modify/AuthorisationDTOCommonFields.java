package fi.oph.akt.api.dto.clerk.modify;

import fi.oph.akt.model.AuthorisationBasis;
import java.time.LocalDate;

public interface AuthorisationDTOCommonFields {
  AuthorisationBasis basis();

  String from();

  String to();

  LocalDate termBeginDate();

  LocalDate termEndDate();

  Boolean permissionToPublish();

  String diaryNumber();

  LocalDate autDate();
}
