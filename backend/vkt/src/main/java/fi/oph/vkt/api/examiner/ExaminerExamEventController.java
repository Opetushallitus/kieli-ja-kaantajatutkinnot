package fi.oph.vkt.api.examiner;

import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.service.ExaminerExamEventService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;

import jakarta.annotation.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/tv/{oid}/examEvent", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExaminerExamEventController {

  @Resource
  private ExaminerExamEventService examinerExamEventService;

  private static final String TAG_EXAMINER_EXAM_EVENT = "Exam event API for examiners";

  @GetMapping
  @Operation(tags = TAG_EXAMINER_EXAM_EVENT, summary = "List all exam events")
  public List<ClerkExamEventListDTO> list(@PathVariable String oid) {
    return List.of();
  }

  @GetMapping(path = "/{examEventId:\\d+}")
  @Operation(tags = TAG_EXAMINER_EXAM_EVENT, summary = "Get exam event and enrollments")
  public ExaminerExamEventDTO getExamEvent(@PathVariable final long examEventId) {
    return examinerExamEventService.getExamEvent(examEventId);
  }
}
