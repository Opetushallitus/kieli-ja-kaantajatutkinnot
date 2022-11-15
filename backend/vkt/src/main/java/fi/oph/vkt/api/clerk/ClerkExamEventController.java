package fi.oph.vkt.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.vkt.api.dto.clerk.ClerkExamEventCreateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventUpdateDTO;
import fi.oph.vkt.service.ClerkExamEventService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import javax.annotation.Resource;
import javax.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

  @GetMapping(path = "/{examEventId:\\d+}")
  @Operation(tags = TAG_EXAM_EVENT, summary = "Get exam event and enrollments")
  public ClerkExamEventDTO getExamEvent(@PathVariable final long examEventId) {
    return clerkExamEventService.getExamEvent(examEventId);
  }

  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_EXAM_EVENT, summary = "Create exam event")
  public ClerkExamEventDTO createExamEvent(@RequestBody @Valid final ClerkExamEventCreateDTO dto) {
    return clerkExamEventService.createExamEvent(dto);
  }

  @PutMapping(consumes = APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_EXAM_EVENT, summary = "Update exam event")
  public ClerkExamEventDTO updateExamEvent(@RequestBody @Valid final ClerkExamEventUpdateDTO dto) {
    return clerkExamEventService.updateExamEvent(dto);
  }
}
