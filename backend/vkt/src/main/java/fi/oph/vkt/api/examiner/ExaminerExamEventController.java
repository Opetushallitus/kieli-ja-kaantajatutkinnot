package fi.oph.vkt.api.examiner;

import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventUpsertDTO;
import fi.oph.vkt.service.ExaminerExamEventService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

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

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_EXAMINER_EXAM_EVENT, summary = "Create exam event")
  public ExaminerExamEventDTO createExamEvent(
    @PathVariable String oid,
    @RequestBody ExaminerExamEventUpsertDTO examinerExamEventDTO
  ) {
    return examinerExamEventService.createExamEvent(oid, examinerExamEventDTO);
  }

  @GetMapping(path = "/{examEventId:\\d+}")
  @Operation(tags = TAG_EXAMINER_EXAM_EVENT, summary = "Get exam event and enrollments")
  public ExaminerExamEventDTO getExamEvent(@PathVariable String oid, @PathVariable final long examEventId) {
    return examinerExamEventService.getExamEvent(oid, examEventId);
  }
}
