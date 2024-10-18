package fi.oph.vkt.api.examiner;

import fi.oph.vkt.api.dto.examiner.ExaminerDetailsCreateDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsInitDTO;
import fi.oph.vkt.service.ExaminerDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1/tv/{oid}", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExaminerDetailsController {

  private static final String TAG_EXAMINER = "Examiner details API";

  @Resource
  private ExaminerDetailsService examinerDetailsService;

  @GetMapping
  @Operation(tags = TAG_EXAMINER, summary = "Get examiner details")
  public ExaminerDetailsDTO getExaminerDetails(@PathVariable("oid") String oid) {
    return examinerDetailsService.getExaminer(oid);
  }

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_EXAMINER, summary = "Create examiner")
  public ExaminerDetailsDTO createExaminer(
    @PathVariable("oid") String oid,
    @RequestBody ExaminerDetailsCreateDTO examinerDetailsCreateDTO
  ) {
    return examinerDetailsService.createExaminer(oid, examinerDetailsCreateDTO);
  }

  @GetMapping(path = "/init")
  @Operation(tags = TAG_EXAMINER, summary = "Get examiner personal data needed for initializing examiner details")
  public ExaminerDetailsInitDTO getInitialExaminerDetails(@PathVariable("oid") String oid) {
    return examinerDetailsService.getInitialExaminerPersonalData(oid);
  }
}
