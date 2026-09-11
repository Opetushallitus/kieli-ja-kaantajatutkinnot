package fi.oph.yki.api;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import com.fasterxml.jackson.databind.JsonNode;
import fi.oph.yki.service.KoodistoService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/public/code", produces = APPLICATION_JSON_VALUE)
public class PublicCodeController {

  @Resource
  private KoodistoService koodistoService;

  @GetMapping(path = "/{collection}")
  public JsonNode getCodes(@PathVariable final String collection) {
    return koodistoService.getCodes(collection);
  }
}
