package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.yki.api.dto.clerk.ClerkQuarantineMatchesResponseDTO;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.service.ClerkQuarantineService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Conditional;
import org.springframework.web.bind.annotation.GetMapping;
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
  public ClerkQuarantineMatchesResponseDTO getQuarantineMatches() throws JsonProcessingException {
    return clerkQuarantineService.getQuarantineMatches();
  }
}
