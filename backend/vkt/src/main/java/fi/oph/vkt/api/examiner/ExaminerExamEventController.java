package fi.oph.vkt.api.examiner;

import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventUpsertDTO;
import fi.oph.vkt.service.ExaminerExamEventService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@RestController
@RequestMapping(value = "/api/v1/tv/{oid}/examEvent", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExaminerExamEventController {

  @Resource
  private ExaminerExamEventService examinerExamEventService;

  private static final String TAG_EXAMINER_EXAM_EVENT = "Exam event API for examiners";

  @GetMapping
  @Operation(tags = TAG_EXAMINER_EXAM_EVENT, summary = "List all exam events")
  public List<ExaminerExamEventDTO> list(@PathVariable String oid) {
    return examinerExamEventService.list(oid);
  }

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_EXAMINER_EXAM_EVENT, summary = "Create exam event")
  public ExaminerExamEventDTO createExamEvent(
    @PathVariable String oid,
    @RequestBody ExaminerExamEventUpsertDTO examinerExamEventDTO
  ) {
    return examinerExamEventService.createExamEvent(oid, examinerExamEventDTO);
  }

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, path = "/{examEventId:\\d+}")
  @Operation(tags = TAG_EXAMINER_EXAM_EVENT, summary = "Update exam event")
  public ExaminerExamEventDTO updateExamEvent(
    @PathVariable String oid,
    @PathVariable Long examEventId,
    @RequestBody ExaminerExamEventUpsertDTO examinerExamEventDTO
  ) {
    return examinerExamEventService.updateExamEvent(oid, examEventId, examinerExamEventDTO);
  }

  @GetMapping(path = "/{examEventId:\\d+}")
  @Operation(tags = TAG_EXAMINER_EXAM_EVENT, summary = "Get exam event and enrollments")
  public ExaminerExamEventDTO getExamEvent(@PathVariable final String oid, @PathVariable final long examEventId) {
    return examinerExamEventService.getExamEvent(oid, examEventId);
  }

  @GetMapping(value = "/{examEventId:\\d+}/excel")
  @Operation(tags = TAG_EXAMINER_EXAM_EVENT, summary = "Download excel of enrollments to exam event")
  public AbstractXlsxView getExamEventExcel(@PathVariable final String oid, @PathVariable final long examEventId) {
    return examinerExamEventService.getExamEventExcel(oid, examEventId);
  }
}
