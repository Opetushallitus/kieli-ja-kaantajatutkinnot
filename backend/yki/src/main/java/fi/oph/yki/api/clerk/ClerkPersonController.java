package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkPersonContactUpdateDTO;
import fi.oph.yki.service.PersonService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/clerk/person", consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE)
public class ClerkPersonController {

  private static final String TAG_PERSON = "Clerk person API";

  @Resource
  private PersonService personService;

  @PostMapping(path = "/{oid}/contactDetails")
  @Operation(tags = TAG_PERSON, summary = "Update person contact details")
  public void updateContactDetails(
    @PathVariable final String oid,
    @RequestBody @Valid final ClerkPersonContactUpdateDTO dto
  ) {
    personService.updateContactDetails(oid, dto);
  }
}
