package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkCreateExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkUpdateExamDateDTO;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.service.ClerkExamDateService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.context.annotation.Conditional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

  @PostMapping
  @Operation(tags = TAG_EXAM_DATE, summary = "Create a new exam date")
  public ClerkExamDateDTO createExamDate(@RequestBody @Valid final ClerkCreateExamDateDTO dto) {
    return clerkExamDateService.createExamDate(dto);
  }

  @PutMapping(path = "/{id}")
  @Operation(tags = TAG_EXAM_DATE, summary = "Update an existing exam date")
  public ClerkExamDateDTO updateExamDate(
    @PathVariable final long id,
    @RequestBody @Valid final ClerkUpdateExamDateDTO dto
  ) {
    return clerkExamDateService.updateExamDate(id, dto);
  }
}
