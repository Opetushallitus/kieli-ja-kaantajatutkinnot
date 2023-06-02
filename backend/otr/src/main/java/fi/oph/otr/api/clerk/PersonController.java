package fi.oph.otr.api.clerk;

import fi.oph.otr.api.dto.clerk.PersonDTO;
import fi.oph.otr.service.PersonService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import java.util.Optional;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping(value = "/api/v1/clerk/person", produces = MediaType.APPLICATION_JSON_VALUE)
public class PersonController {

  private static final String TAG_PERSON = "Person API";

  @Resource
  private PersonService personService;

  @Operation(tags = TAG_PERSON, summary = "Return person data from ONR with given identity number")
  @GetMapping
  public Optional<PersonDTO> findPerson(@RequestParam(value = "identityNumber") @NotBlank final String identityNumber)
    throws Exception {
    return personService.findPersonByIdentityNumber(identityNumber);
  }
}
