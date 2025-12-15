package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.ALL_VALUE;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.*;
import fi.oph.yki.service.ClerkCustomerService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/v2/api/clerk/customer", consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE)
@Profile("dev")
public class ClerkCustomerDetailsController {

  @Resource
  private ClerkCustomerService service;

  private static final String TAG_CUSTOMER = "Clerk customer API";

  @PostMapping(path = "/search", consumes = ALL_VALUE)
  @Operation(tags = TAG_CUSTOMER, summary = "Search customers")
  public List<ClerkCustomerDetailsDTO> searchCustomers() throws Exception {
    return service.searchClerkCustomers();
  }

  @GetMapping(path = "/{oid}", consumes = ALL_VALUE)
  @Operation(tags = TAG_CUSTOMER, summary = "Get customer details")
  public ClerkCustomerDetailsDTO getCustomerDetails(@PathVariable String oid) throws Exception {
    return service.getClerkCustomerDetails(oid);
  }
}
