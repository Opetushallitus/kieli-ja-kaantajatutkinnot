package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkOrganizerCreateDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerUpdateDTO;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.service.ClerkOrganizerService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Conditional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/v2/api/clerk/organizer", produces = APPLICATION_JSON_VALUE)
@Conditional(ClerkEnabledCondition.class)
public class ClerkOrganizerController {

  private final ClerkOrganizerService clerkOrganizerService;

  private static final String TAG_ORGANIZER = "Clerk organizer API";

  @GetMapping
  @Operation(tags = TAG_ORGANIZER, summary = "List all organizers")
  public Map<String, List<ClerkOrganizerDTO>> getOrganizers() {
    return Map.of("organizers", clerkOrganizerService.getOrganizers());
  }

  @PostMapping(path = "/add", consumes = APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_ORGANIZER, summary = "Create a new organizer")
  public ClerkOrganizerDTO createOrganizer(@RequestBody @Valid final ClerkOrganizerCreateDTO dto) {
    return clerkOrganizerService.createOrganizer(dto);
  }

  @PutMapping(path = "/{oid}", consumes = APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_ORGANIZER, summary = "Update an existing organizer")
  public ClerkOrganizerDTO updateOrganizer(
    @PathVariable final String oid,
    @RequestBody @Valid final ClerkOrganizerUpdateDTO dto
  ) {
    return clerkOrganizerService.updateOrganizer(oid, dto);
  }
}
