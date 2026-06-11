package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.ClerkExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionUpdateDTO;
import fi.oph.yki.config.ClerkEnabledCondition;
import fi.oph.yki.service.ClerkExamSessionService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@RestController
@RequestMapping(value = "/v2/api/clerk/examSession", produces = APPLICATION_JSON_VALUE)
@Conditional(ClerkEnabledCondition.class)
public class ClerkExamSessionController {

  private static final String TAG_EXAM_SESSION = "Clerk exam session API";

  @Resource
  private ClerkExamSessionService clerkExamSessionService;

  @GetMapping
  @Operation(tags = TAG_EXAM_SESSION, summary = "Get exam sessions by language and level")
  public List<ClerkExamSessionDTO> getExamSessions(
    @RequestParam final String language,
    @RequestParam final String level
  ) {
    return clerkExamSessionService.getExamSessionsByLanguageAndLevel(language, level);
  }

  @GetMapping(path = "/{examSessionId:\\d+}")
  @Operation(tags = TAG_EXAM_SESSION, summary = "Get exam event and enrollments")
  public ClerkExamSessionDTO getExamSession(@PathVariable final long examSessionId) {
    return clerkExamSessionService.getExamSession(examSessionId);
  }

  @GetMapping(value = "/{examSessionId:\\d+}/excel")
  @Operation(tags = TAG_EXAM_SESSION, summary = "Download excel of registrations to exam event")
  public AbstractXlsxView getExamSessionExcel(@PathVariable final long examSessionId) {
    return clerkExamSessionService.getExamSessionExcel(examSessionId);
  }

  @PutMapping(path = "/{examSessionId:\\d+}", consumes = APPLICATION_JSON_VALUE)
  @Operation(tags = TAG_EXAM_SESSION, summary = "Update exam session details")
  public ClerkExamSessionDTO updateExamSession(
    @PathVariable final long examSessionId,
    @RequestBody @Valid final ClerkExamSessionUpdateDTO dto
  ) {
    return clerkExamSessionService.updateExamSession(examSessionId, dto);
  }
}
