package fi.oph.vkt.api;

import fi.oph.vkt.api.dto.integration.RegisterEnrollmentDTO;
import fi.oph.vkt.service.RegisterEnrollmentService;
import jakarta.annotation.Resource;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/registry", produces = MediaType.APPLICATION_JSON_VALUE)
public class RegistryController {

  @Resource
  private RegisterEnrollmentService registerEnrollmentService;

  @GetMapping(path = "/enrollments/excellent")
  public List<RegisterEnrollmentDTO> list() {
    return registerEnrollmentService.list();
  }
}
