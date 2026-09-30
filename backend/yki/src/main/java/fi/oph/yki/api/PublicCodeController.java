package fi.oph.yki.api;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import com.fasterxml.jackson.databind.JsonNode;
import fi.oph.yki.service.KoodistoService;
import fi.oph.yki.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import java.util.Set;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/public/code", produces = APPLICATION_JSON_VALUE)
@ConditionalOnProperty(name = "app.customer-portal.enabled", havingValue = "true")
public class PublicCodeController {

  private static final Set<String> COLLECTIONS = Set.of("kieli", "maatjavaltiot2");

  @Resource
  private KoodistoService koodistoService;

  @GetMapping(path = "/{collection}")
  public JsonNode getCodes(@PathVariable final String collection) {
    if (!COLLECTIONS.contains(collection)) {
      throw new NotFoundException(String.format("Unknown koodisto collection: %s", collection));
    }
    return koodistoService.getCodes(collection);
  }
}
