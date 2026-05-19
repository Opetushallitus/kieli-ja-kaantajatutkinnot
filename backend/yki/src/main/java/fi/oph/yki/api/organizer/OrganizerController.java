package fi.oph.yki.api.organizer;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.yki.api.dto.clerk.ClerkCustomerDetailsDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerSearchRequestDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerSummaryDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerExamSessionDTO;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.kayttooikeus.PermissionsService;
import fi.oph.yki.kayttooikeus.dto.KayttooikeusResponseDTO;
import fi.oph.yki.kayttooikeus.dto.OrganisaatioDTO;
import fi.oph.yki.service.ClerkCustomerService;
import fi.oph.yki.service.ClerkExamDateService;
import fi.oph.yki.service.ClerkOrganizerService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Conditional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/v2/api/organizer/{oid}", produces = APPLICATION_JSON_VALUE)
@Conditional(ClerkEnabledCondition.class)
public class OrganizerController {

  @Resource
  private ClerkOrganizerService clerkOrganizerService;

  @Resource
  private ClerkExamDateService clerkExamDateService;

  @Resource
  private ClerkCustomerService service;

  @Resource
  private PermissionsService permissionsService;

  private static final String TAG_ORGANIZER = "Organizer exam session API";
  private static final int MAX_PAGE_SIZE = 100;

  @GetMapping
  @Operation(tags = TAG_ORGANIZER, summary = "List available organisations for given organizer")
  public Map<String, List<ClerkOrganizerDTO>> getOrganisations() {
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

  @GetMapping(path = "/examDates")
  @Operation(tags = TAG_ORGANIZER, summary = "Get future exam dates")
  public List<ClerkExamDateDTO> getFutureExamDates() {
    return clerkExamDateService.getFutureExamDates();
  }

  @PostMapping(path = "/customer/search", consumes = APPLICATION_JSON_VALUE)
  @Operation(
    tags = TAG_ORGANIZER,
    summary = "Search customers with pagination",
    description = "Returns paginated customer details. Default page size is 20, max is 100."
  )
  public Page<ClerkCustomerSummaryDTO> searchCustomers(
    @RequestParam(defaultValue = "0") final int page,
    @RequestParam(defaultValue = "20") final int size,
    @PathVariable("oid") final String oid,
    @RequestBody final ClerkCustomerSearchRequestDTO request
  ) throws IllegalArgumentException, InterruptedException, ExecutionException, JsonProcessingException {
    final int validatedSize = Math.min(size, MAX_PAGE_SIZE);

    if (request.personQuery() != null) {
      final var personQuery = request.personQuery().trim();
      if (!personQuery.isEmpty() && personQuery.length() <= 2) {
        throw new IllegalArgumentException("When given the person query, it must have atleast three characters");
      }
    }

    return service.searchOrganizerCustomers(PageRequest.of(page, validatedSize), request, oid);
  }

  @GetMapping(path = "/customer/{personOid}")
  @Operation(tags = TAG_ORGANIZER, summary = "Get customer details")
  public ClerkCustomerDetailsDTO getCustomerDetails(
    @PathVariable("oid") final String organizerOid,
    @PathVariable final String personOid
  ) throws Exception {
    return service.getOrganizerCustomerDetails(personOid, organizerOid);
  }
}
