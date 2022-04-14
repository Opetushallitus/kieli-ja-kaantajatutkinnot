package fi.oph.otr.api;

import fi.oph.otr.api.dto.InterpreterDTO;
import fi.oph.otr.service.PublicInterpreterService;
import java.util.List;
import java.util.Map;
import javax.annotation.Resource;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/interpreter", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class PublicController {

  @Resource
  private PublicInterpreterService publicInterpreterService;

  @GetMapping
  public List<InterpreterDTO> list() {
    return publicInterpreterService.listForPublicListing();
  }
}
