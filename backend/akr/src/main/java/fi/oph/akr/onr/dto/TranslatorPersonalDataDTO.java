package fi.oph.akr.onr.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class TranslatorPersonalDataDTO {

  long translatorId;
  String lastName;
  String firstName;
  String email;
}
