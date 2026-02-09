package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.ALL_VALUE;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.yki.api.dto.clerk.ClerkCustomerDetailsDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerSearchRequestDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerSummaryDTO;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.service.ClerkCustomerService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.util.Objects;
import java.util.concurrent.ExecutionException;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/clerk/customer", produces = APPLICATION_JSON_VALUE)
@Conditional(ClerkEnabledCondition.class)
public class ClerkCustomerController {

  @Resource
  private ClerkCustomerService service;

  private static final String TAG_CUSTOMER = "Clerk customer API";
  private static final int MAX_PAGE_SIZE = 100;

  @PostMapping(path = "/search", consumes = APPLICATION_JSON_VALUE)
  @Operation(
    tags = TAG_CUSTOMER,
    summary = "Search customers with pagination",
    description = "Returns paginated customer details. Default page size is 20, max is 100."
  )
  public Page<ClerkCustomerSummaryDTO> searchCustomers(
    @RequestParam(defaultValue = "0") final int page,
    @RequestParam(defaultValue = "20") final int size,
    @RequestParam(defaultValue = "lastName") final String sortColumn,
    @RequestParam(defaultValue = "ASC") final String sortDirection,
    @RequestBody final ClerkCustomerSearchRequestDTO request
  ) throws IllegalArgumentException, ExecutionException, InterruptedException, JsonProcessingException {
    final int validatedSize = Math.min(size, MAX_PAGE_SIZE);

    if (request.personQuery() != null) {
      final var personQuery = request.personQuery().trim();
      if (!personQuery.isEmpty() && personQuery.length() <= 2) {
        throw new IllegalArgumentException("When given the person query, it must have atleast three characters");
      }
    }

    if (!Objects.equals(sortColumn, "lastName") && !Objects.equals(sortColumn, "registrationCount")) {
      throw new IllegalArgumentException(String.format("Invalid sort column %s", sortColumn));
    }

    if (!Objects.equals(sortDirection, "ASC") && !Objects.equals(sortDirection, "DESC")) {
      throw new IllegalArgumentException(String.format("Invalid sort direction %s", sortDirection));
    }

    return service.searchClerkCustomers(PageRequest.of(page, validatedSize), request, sortColumn, sortDirection);
  }

  @GetMapping(path = "/{oid}", consumes = ALL_VALUE)
  @Operation(tags = TAG_CUSTOMER, summary = "Get customer details")
  public ClerkCustomerDetailsDTO getCustomerDetails(@PathVariable final String oid) throws Exception {
    return service.getClerkCustomerDetails(oid);
  }
}
