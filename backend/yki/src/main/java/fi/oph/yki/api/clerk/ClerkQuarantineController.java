package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchDTO;
import fi.oph.yki.api.dto.clerk.QuarantineReviewRequest;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.service.ClerkQuarantineService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.util.List;
import org.springframework.context.annotation.Conditional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/clerk/quarantine", produces = APPLICATION_JSON_VALUE)
@Conditional(ClerkEnabledCondition.class)
public class ClerkQuarantineController {

  private static final String TAG_QUARANTINE = "Clerk quarantine API";

  @Resource
  private ClerkQuarantineService clerkQuarantineService;

  @GetMapping(path = "/matches")
  @Operation(tags = TAG_QUARANTINE, summary = "Get unreviewed quarantine matches")
  public List<ClerkQuarantineMatchDTO> getQuarantineMatches() {
    return clerkQuarantineService.getQuarantineMatches();
  }

  @PutMapping(path = "/{id:\\d+}/registration/{regId:\\d+}/set", consumes = APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_QUARANTINE, summary = "Set quarantine review decision for a registration")
  public void setQuarantineReview(
    @PathVariable final long id,
    @PathVariable final long regId,
    @RequestBody final QuarantineReviewRequest request
  ) {
    final boolean matchConfirmed = request.quarantined();

    clerkQuarantineService.setQuarantineReview(id, regId, matchConfirmed);
  }
}
