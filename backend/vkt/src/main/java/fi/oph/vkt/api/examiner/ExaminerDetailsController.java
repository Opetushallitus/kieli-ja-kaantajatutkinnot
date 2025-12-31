package fi.oph.vkt.api.examiner;

import fi.oph.vkt.api.dto.examiner.ExaminerDetailsDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsInitDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsUpsertDTO;
import fi.oph.vkt.service.ExaminerDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
  @Operation(tags = TAG_EXAMINER, summary = "Create or update examiner")
  public ExaminerDetailsDTO upsertExaminer(
    @PathVariable("oid") String oid,
    @RequestBody ExaminerDetailsUpsertDTO examinerDetailsUpsertDTO
  ) {
    return examinerDetailsService.upsertExaminer(oid, examinerDetailsUpsertDTO);
  }

  @GetMapping(path = "/init")
  @Operation(tags = TAG_EXAMINER, summary = "Get personal data needed for initializing examiner details")
  public ExaminerDetailsInitDTO getInitialExaminerDetails(@PathVariable("oid") String oid) {
    return examinerDetailsService.getInitialExaminerPersonalData(oid);
  }
}
