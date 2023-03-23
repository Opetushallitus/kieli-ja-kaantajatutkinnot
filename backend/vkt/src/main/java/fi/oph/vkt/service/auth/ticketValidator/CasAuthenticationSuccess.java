package fi.oph.vkt.service.auth.ticketValidator;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class CasAuthenticationSuccess {

  public String user;
  public CasAttributes attributes;
}
