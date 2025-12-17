package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.ALL_VALUE;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.*;
import fi.oph.yki.service.ClerkCustomerService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/v2/api/clerk/customer", produces = APPLICATION_JSON_VALUE)
@Profile("dev")
public class ClerkCustomerDetailsController {

  @Resource
  private ClerkCustomerService service;

  private static final String TAG_CUSTOMER = "Clerk customer API";
  private static final int DEFAULT_PAGE_SIZE = 20;
  private static final int MAX_PAGE_SIZE = 100;

  @PostMapping(path = "/search", consumes = ALL_VALUE)
  @Operation(
    tags = TAG_CUSTOMER,
    summary = "Search customers with pagination",
    description = "Returns paginated customer details. Default page size is 20, max is 100."
  )
  public Page<ClerkCustomerDetailsDTO> searchCustomers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
  ) throws Exception {
    // Validate and cap page size
    final int validatedSize = Math.min(size, MAX_PAGE_SIZE);

    // Create Pageable (no sorting for now)
    final Pageable pageable = PageRequest.of(page, validatedSize);

    var resp = service.searchClerkCustomers(pageable);
    return resp;
  }

  @GetMapping(path = "/{oid}", consumes = ALL_VALUE)
  @Operation(tags = TAG_CUSTOMER, summary = "Get customer details")
  public ClerkCustomerDetailsDTO getCustomerDetails(@PathVariable String oid) throws Exception {
    return service.getClerkCustomerDetails(oid);
  }
}
