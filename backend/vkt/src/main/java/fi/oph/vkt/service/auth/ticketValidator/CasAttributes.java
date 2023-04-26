package fi.oph.vkt.service.auth.ticketValidator;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class CasAttributes {

  private String firstName;
  private String clientName;
  private String displayName;
<<<<<<< HEAD
  private String familyName;
=======
>>>>>>> dev
  private Boolean vtjVerified;
  private String givenName;
  private String notOnOrAfter;
  private String cn;
  private String sn;
  private String notBefore;
  private String nationalIdentificationNumber;
  private String personOid;
<<<<<<< HEAD
  private String personIdentifier;
  private String dateOfBirth;
=======
>>>>>>> dev
}
