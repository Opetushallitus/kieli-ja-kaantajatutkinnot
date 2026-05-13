package fi.oph.yki.api.organizer;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkOrganizerDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerExamSessionDTO;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.kayttooikeus.PermissionsService;
import fi.oph.yki.kayttooikeus.dto.KayttooikeusResponseDTO;
import fi.oph.yki.kayttooikeus.dto.OrganisaatioDTO;
import fi.oph.yki.service.ClerkOrganizerService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/v2/api/organizer/{oid}", produces = APPLICATION_JSON_VALUE)
@Conditional(ClerkEnabledCondition.class)
public class OrganizerController {

  @Resource
  private ClerkOrganizerService clerkOrganizerService;

  @Resource
  private PermissionsService permissionsService;

  private static final String TAG_ORGANIZER = "Organizer exam session API";

  @GetMapping
  @Operation(tags = TAG_ORGANIZER, summary = "List exam sessions for an organizer")
  public Map<String, List<ClerkOrganizerDTO>> getOrganizers() {
    final Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    final KayttooikeusResponseDTO kayttooikeusResponseDTO = permissionsService.getPermissionForUser(auth.getName());
    final List<String> oids = kayttooikeusResponseDTO
      .organisaatiot()
      .stream()
      .map(OrganisaatioDTO::organisaatioOid)
      .toList();

    return Map.of("organizers", clerkOrganizerService.getOrganizers(oids));
  }

  @GetMapping(path = "/examSession")
  @Operation(tags = TAG_ORGANIZER, summary = "List exam sessions for an organizer")
  public Map<String, List<ClerkOrganizerExamSessionDTO>> getExamSessions(@PathVariable("oid") final String oid) {
    return Map.of("exam_sessions", clerkOrganizerService.getExamSessionsByOrganizerOid(oid));
  }
}
