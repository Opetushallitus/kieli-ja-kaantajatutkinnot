package fi.oph.vkt.api.clerk;

import fi.oph.vkt.api.dto.examiner.ExaminerDetailsDTO;
import fi.oph.vkt.service.ClerkExaminerService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/clerk/examiner", produces = MediaType.APPLICATION_JSON_VALUE)
public class ClerkExaminerController {

  private static final String TAG_CLERK_EXAMINER = "Examiner API for OPH clerk users";

  @Resource
  private ClerkExaminerService clerkExaminerService;

  @GetMapping
  @Operation(tags = TAG_CLERK_EXAMINER, summary = "List examiner details")
  public List<ExaminerDetailsDTO> listExaminers() {
    return clerkExaminerService.listExaminers();
  }
}
