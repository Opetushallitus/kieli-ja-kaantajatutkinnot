package fi.oph.vkt.service.auth.ticketValidator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
@JsonIgnoreProperties(ignoreUnknown = true)
public class CasAuthenticationFailure {

  public String message;
  public CasAttributes attributes;
}
