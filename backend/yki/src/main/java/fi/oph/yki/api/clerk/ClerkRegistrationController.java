package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.ALL_VALUE;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkApprovalDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalDetailsDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalUpdateDTO;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.service.ClerkRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

  @GetMapping(path = "/approvals", consumes = ALL_VALUE)
  @Operation(tags = TAG_REGISTRATION, summary = "List approvals")
  public List<ClerkApprovalDTO> listApprovalAssesments() {
    return clerkRegistrationService.listApprovals();
  }

  @GetMapping(path = "/approval/{freeRegistrationId:\\d+}", consumes = ALL_VALUE)
  @Operation(tags = TAG_REGISTRATION, summary = "Get approval details")
  public ClerkApprovalDetailsDTO listApprovalAssesments(@PathVariable final long freeRegistrationId) {
    return clerkRegistrationService.getApproval(freeRegistrationId);
  }

  @PutMapping(path = "/approval/{freeRegistrationId:\\d+}", consumes = ALL_VALUE)
  @Operation(tags = TAG_REGISTRATION, summary = "Update approval")
  public ClerkApprovalDetailsDTO updateFreeRegistrationApproval(
    @PathVariable final long freeRegistrationId,
    @RequestBody @Valid final ClerkApprovalUpdateDTO dto
  ) {
    return clerkRegistrationService.updateApproval(freeRegistrationId, dto);
  }

  @PutMapping(path = "/{registrationId:\\d+}/move/{targetExamSessionId:\\d+}", consumes = ALL_VALUE)
  @Operation(tags = TAG_REGISTRATION, summary = "Move registration to another exam session")
  public void moveRegistration(@PathVariable final long registrationId, @PathVariable final long targetExamSessionId) {
    clerkRegistrationService.moveRegistration(registrationId, targetExamSessionId);
  }

  @PutMapping(path = "/{registrationId:\\d+}/cancel", consumes = ALL_VALUE)
  @Operation(tags = TAG_REGISTRATION, summary = "Cancel registration")
  public void cancelRegistration(@PathVariable final long registrationId) {
    clerkRegistrationService.cancelRegistration(registrationId);
  }
}
