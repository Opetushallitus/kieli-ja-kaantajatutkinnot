package fi.oph.yki.api;

import fi.oph.yki.api.dto.PublicRegistrationInitDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitResponseDTO;
import fi.oph.yki.service.PublicRegistrationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/registration", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicRegistrationController {

  private final PublicRegistrationService publicRegistrationService;

  @PostMapping(path = "/init", consumes = MediaType.APPLICATION_JSON_VALUE)
  public PublicRegistrationInitResponseDTO initRegistration(
    @RequestBody @Valid final PublicRegistrationInitDTO initDTO,
    final HttpServletRequest request
  ) {
    return publicRegistrationService.initRegistration(request, initDTO);
  }
}
