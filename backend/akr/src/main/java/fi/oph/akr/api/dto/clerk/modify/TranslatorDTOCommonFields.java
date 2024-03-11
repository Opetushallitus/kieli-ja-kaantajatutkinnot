package fi.oph.akr.api.dto.clerk.modify;

import fi.oph.akr.api.dto.clerk.ClerkTranslatorAddressDTO;
import fi.oph.akr.api.dto.translator.CommonTranslatorAddressDTO;
import fi.oph.akr.api.dto.translator.TranslatorAddressDTO;
import java.util.List;

public interface TranslatorDTOCommonFields {
  Boolean isIndividualised();

  Boolean hasIndividualisedAddress();

  String identityNumber();

  String firstName();

  String lastName();

  String nickName();

  String email();

  String phoneNumber();

  List<ClerkTranslatorAddressDTO> address();

  String extraInformation();

  Boolean isAssuranceGiven();
}
