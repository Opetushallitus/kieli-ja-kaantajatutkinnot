package fi.oph.yki.api.oauth2;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkApprovalUpdateDTO;
import fi.oph.yki.api.dto.oauth2.EvaluationStatesDTO;
import fi.oph.yki.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(
  value = "/v2/api/oauth2/registration",
  consumes = APPLICATION_JSON_VALUE,
  produces = APPLICATION_JSON_VALUE
)
public class OAuth2RegistrationController {

  private static final String TAG_REGISTRATION = "OAuth2-authenticated registration API for use by integrations";

  @Resource
  private RegistrationService registrationService;

  @GetMapping(path = "/health")
  @Operation(tags = TAG_REGISTRATION, summary = "Test connection")
  @ResponseStatus(HttpStatus.OK)
  public String health() {
    return "OK";
  }

  @GetMapping(path = "/admin")
  @Operation(tags = TAG_REGISTRATION, summary = "Test connection and admin credentials")
  @ResponseStatus(HttpStatus.OK)
  public String admin() {
    return "OK";
  }

  @PostMapping(path = "/evaluation")
  @Operation(tags = TAG_REGISTRATION, summary = "Upsert states of evaluation for registrations")
  public String upsertEvaluationStates(@RequestBody @Valid final EvaluationStatesDTO dto) {
    registrationService.upsertRegistrationEvaluationStates(dto);
    return "OK";
  }
}
