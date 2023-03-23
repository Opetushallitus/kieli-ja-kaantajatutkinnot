package fi.oph.vkt.service.auth.ticketValidator;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class CasResponse {

  public CasAuthenticationSuccess authenticationSuccess;
}
