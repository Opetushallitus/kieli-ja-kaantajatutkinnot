package fi.oph.otr.api;

import fi.oph.otr.api.dto.InterpreterDTO;
import fi.oph.otr.service.PublicInterpreterService;
import jakarta.annotation.Resource;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/interpreter", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicController {

  @Resource
  private PublicInterpreterService publicInterpreterService;

  @GetMapping
  public List<InterpreterDTO> list() {
    return publicInterpreterService.list();
  }
}
