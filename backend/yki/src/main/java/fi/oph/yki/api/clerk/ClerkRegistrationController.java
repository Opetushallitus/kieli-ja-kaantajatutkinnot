package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.ALL_VALUE;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkApprovalDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalUpdateDTO;
import fi.oph.yki.service.ClerkRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
  value = "/api/v1/clerk/registration",
  consumes = APPLICATION_JSON_VALUE,
  produces = APPLICATION_JSON_VALUE
)
public class ClerkRegistrationController {

  private static final String TAG_ENROLLMENT = "Registration API";

  @Resource
  private ClerkRegistrationService clerkRegistrationService;

  @GetMapping(path = "/approvals", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "List approvals")
  public List<ClerkApprovalDTO> listApprovalAssesments() {
    return clerkRegistrationService.listApprovals();
  }

  @PutMapping
  @Operation(tags = TAG_ENROLLMENT, summary = "Update approval")
  public ClerkApprovalDTO updateEnrollment(@RequestBody @Valid final ClerkApprovalUpdateDTO dto) {
    return clerkRegistrationService.updateApproval(dto);
  }
}
