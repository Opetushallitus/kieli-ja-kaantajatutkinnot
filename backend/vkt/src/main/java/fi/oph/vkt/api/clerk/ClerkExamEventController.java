package fi.oph.vkt.api.clerk;

import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.service.ClerkExamEventService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import javax.annotation.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/clerk/examEvent", produces = MediaType.APPLICATION_JSON_VALUE)
public class ClerkExamEventController {

  private static final String TAG_EXAM_EVENT = "Exam event API";

  @Resource
  private ClerkExamEventService clerkExamEventService;

  @GetMapping
  @Operation(tags = TAG_EXAM_EVENT, summary = "List all exam events")
  public List<ClerkExamEventListDTO> list() {
    return clerkExamEventService.list();
  }
}
