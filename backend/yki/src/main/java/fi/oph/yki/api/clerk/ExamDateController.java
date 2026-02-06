package fi.oph.yki.api.clerk;

import fi.oph.yki.api.dto.ExamDateDTO;
import fi.oph.yki.config.ClerkEnabledCondition;
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
@RequestMapping(value = "/v2/api/clerk/examDate", produces = MediaType.APPLICATION_JSON_VALUE)
@Conditional(ClerkEnabledCondition.class)
public class ExamDateController {

  @Resource
  private ExamDateService examDateService;

  @GetMapping
  @Operation(summary = "Get all exam dates")
  public List<ExamDateDTO> getExamDates() {
    return examDateService.getExamDates();
  }
}
