package fi.oph.vkt.service.auth.ticketValidator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
@JsonIgnoreProperties(ignoreUnknown = true)
public class CasAttributes {

  private String firstName;
  private String familyName;
  private String sn;
  private String personOid;
  private String personIdentifier;
  private String nationalIdentificationNumber;
  private String code;
}
