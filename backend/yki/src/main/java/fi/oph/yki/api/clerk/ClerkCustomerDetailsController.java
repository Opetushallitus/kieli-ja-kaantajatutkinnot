package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.ALL_VALUE;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkCustomerDetailsDTO;
import io.swagger.v3.oas.annotations.Operation;
import lombok.Builder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping(
        // value = "/yki/v2/api/clerk/customer",
        value = "/v2/api/clerk/customer",
        consumes = APPLICATION_JSON_VALUE,
        produces = APPLICATION_JSON_VALUE
)
public class ClerkCustomerDetailsController {
    private static final String TAG_CUSTOMER = "Clerk customer API";

    @GetMapping(path = "/{customerId:\\d+}", consumes = ALL_VALUE)
    @Operation(tags = TAG_CUSTOMER, summary = "Get customer details")
    public List<ClerkCustomerDetailsDTO> getCustomerDetails(@PathVariable int customerId) {
        List<ClerkCustomerDetailsDTO> resp = List.of(
                new ClerkCustomerDetailsDTO("" + customerId)
        );
        System.out.println("resp: " + resp);
        return resp;
    }
}
