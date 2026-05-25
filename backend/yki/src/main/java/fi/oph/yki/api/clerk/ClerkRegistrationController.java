package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.ALL_VALUE;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.service.ClerkRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Conditional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
  value = "/v2/api/clerk/registration",
  consumes = APPLICATION_JSON_VALUE,
  produces = APPLICATION_JSON_VALUE
)
@Conditional(ClerkEnabledCondition.class)
public class ClerkRegistrationController {

  private static final String TAG_REGISTRATION = "Clerk registration API";

  @Resource
  private ClerkRegistrationService clerkRegistrationService;

  @PutMapping(path = "/{registrationId:\\d+}/move/{targetExamSessionId:\\d+}", consumes = ALL_VALUE)
  @Operation(tags = TAG_REGISTRATION, summary = "Move registration to another exam session")
  public void moveRegistration(@PathVariable final long registrationId, @PathVariable final long targetExamSessionId) {
    clerkRegistrationService.moveRegistration(registrationId, targetExamSessionId);
  }

  @DeleteMapping(path = "/{registrationId:\\d+}/cancel", consumes = ALL_VALUE)
  @Operation(tags = TAG_REGISTRATION, summary = "Cancel registration")
  public void cancelRegistration(@PathVariable final long registrationId) {
    clerkRegistrationService.cancelRegistration(registrationId);
  }
}
