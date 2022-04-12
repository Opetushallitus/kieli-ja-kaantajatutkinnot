package fi.oph.akt.api.translator;

import fi.oph.akt.api.dto.translator.ContactRequestDTO;
import fi.oph.akt.api.dto.translator.PublicTranslatorResponseDTO;
import fi.oph.akt.service.ContactRequestService;
import fi.oph.akt.service.PublicTranslatorService;
import javax.annotation.Resource;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/translator", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class TranslatorController {

  @Resource
  private ContactRequestService contactRequestService;

  @Resource
  private PublicTranslatorService publicTranslatorService;

  @GetMapping(path = "")
  public PublicTranslatorResponseDTO listTranslators() {
    return publicTranslatorService.listTranslators();
  }

  @PostMapping("/contact-request")
  @ResponseStatus(HttpStatus.CREATED)
  public void sendContactRequest(@Valid @RequestBody ContactRequestDTO contactRequestDTO) {
    contactRequestService.createContactRequest(contactRequestDTO);
  }
}
