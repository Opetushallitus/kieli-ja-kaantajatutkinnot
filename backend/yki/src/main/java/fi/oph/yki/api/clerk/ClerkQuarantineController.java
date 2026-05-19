package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchDTO;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineReviewDTO;
import fi.oph.yki.api.dto.clerk.ClerkQuarantinesDTO;
import fi.oph.yki.api.dto.clerk.CreateQuarantineRequest;
import fi.oph.yki.api.dto.clerk.QuarantineReviewRequest;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.service.ClerkQuarantineService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.context.annotation.Conditional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/clerk/quarantine", produces = APPLICATION_JSON_VALUE)
@Conditional(ClerkEnabledCondition.class)
public class ClerkQuarantineController {

  private static final String TAG_QUARANTINE = "Clerk quarantine API";

  @Resource
  private ClerkQuarantineService clerkQuarantineService;

  @GetMapping(path = "/")
  @Operation(tags = TAG_QUARANTINE, summary = "Get active quarantines")
  public List<ClerkQuarantinesDTO> getActiveQuarantine() {
    return clerkQuarantineService.getActiveQuarantine();
  }

  @GetMapping(path = "/matches")
  @Operation(tags = TAG_QUARANTINE, summary = "Get unreviewed quarantine matches")
  public List<ClerkQuarantineMatchDTO> getQuarantineMatches() {
    return clerkQuarantineService.getQuarantineMatches();
  }

  @GetMapping(path = "/reviews")
  @Operation(tags = TAG_QUARANTINE, summary = "Get completed quarantine reviews")
  public List<ClerkQuarantineReviewDTO> getReviews() {
    return clerkQuarantineService.getReviews();
  }

  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_QUARANTINE, summary = "Create a new quarantine entry")
  @ResponseStatus(HttpStatus.CREATED)
  public void createQuarantine(@Valid @RequestBody final CreateQuarantineRequest request) {
    clerkQuarantineService.createQuarantine(request);
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
