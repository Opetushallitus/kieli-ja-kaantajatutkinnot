package fi.oph.vkt.api;

import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.service.PublicExamEventService;
import java.util.List;
import javax.annotation.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/examEvent", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicController {

  @Resource
  private PublicExamEventService publicExamEventService;

  @GetMapping
  public List<PublicExamEventDTO> list() {
    return publicExamEventService.listExamEvents(ExamLevel.EXCELLENT);
  }
}
