package fi.oph.yki.api;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.PublicPersonContactUpdateDTO;
import fi.oph.yki.api.dto.PublicPersonDTO;
import fi.oph.yki.service.PublicPersonService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/public/person", produces = APPLICATION_JSON_VALUE)
@ConditionalOnProperty(name = "app.customer-portal.enabled", havingValue = "true")
public class PublicPersonController {

  @Resource
  private PublicPersonService publicPersonService;

  @GetMapping
  public PublicPersonDTO getPerson(final Authentication authentication) {
    return publicPersonService.getPerson(authentication.getName());
  }

  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  public Map<String, Boolean> updateContactDetails(
    final Authentication authentication,
    @RequestBody @Valid final PublicPersonContactUpdateDTO dto
  ) {
    final var oid = authentication.getName();
    publicPersonService.updateContactDetails(oid, dto);

    return Map.of("success", true);
  }
}
