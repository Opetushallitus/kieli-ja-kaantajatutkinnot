package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.ExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.service.ClerkExamDateService;
import fi.oph.yki.service.ExamDateService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.util.List;
import org.springframework.context.annotation.Conditional;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/clerk/examDate", produces = APPLICATION_JSON_VALUE)
@Conditional(ClerkEnabledCondition.class)
public class ClerkExamDateController {

  private static final String TAG_EXAM_DATE = "Clerk exam date API";

  @Resource
  private ClerkExamDateService clerkExamDateService;

  @GetMapping
  @Operation(tags = TAG_EXAM_DATE, summary = "Get future exam dates")
  public List<ClerkExamDateDTO> getFutureExamDates() {
    return clerkExamDateService.getFutureExamDates();
  }

  @GetMapping(path = "/all")
  @Operation(summary = "Get all exam dates")
  public List<ClerkExamDateDTO> getAllExamDates() {
    return clerkExamDateService.getAllExamDates();
  }
}
