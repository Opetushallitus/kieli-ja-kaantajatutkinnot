package fi.oph.yki.api.public_;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.PublicInitRegistrationDTO;
import fi.oph.yki.api.dto.PublicInitRegistrationResponseDTO;
import fi.oph.yki.service.PublicRegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/public/registration", produces = "application/json")
public class PublicRegistrationController {

  private final PublicRegistrationService publicRegistrationService;

  public PublicRegistrationController(final PublicRegistrationService publicRegistrationService) {
    this.publicRegistrationService = publicRegistrationService;
  }

  @PostMapping(path = "/init", consumes = APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.OK)
  public PublicInitRegistrationResponseDTO initRegistration(
    @RequestBody @Valid final PublicInitRegistrationDTO initRegistration
  ) {
    final var registration = publicRegistrationService.initRegistration(initRegistration);
    return new PublicInitRegistrationResponseDTO(registration.getId());
  }
}
