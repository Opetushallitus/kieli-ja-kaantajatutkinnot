package fi.oph.yki.api.oauth2;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
  value = "/v2/api/oauth2/registration",
  consumes = APPLICATION_JSON_VALUE,
  produces = APPLICATION_JSON_VALUE
)
public class OAuth2RegistrationController {

  private static final String TAG_REGISTRATION = "OAuth2-authenticated registration API for use by integrations";

  @GetMapping(path = "/health")
  @Operation(tags = TAG_REGISTRATION, summary = "Test connection")
  @ResponseStatus(HttpStatus.OK)
  public String health() {
    return "OK";
  }
}
