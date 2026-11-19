package fi.oph.yki.api;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.PublicExamSessionsResponseDTO;
import fi.oph.yki.service.PublicExamSessionService;
import jakarta.annotation.Resource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/public/exam-session", produces = APPLICATION_JSON_VALUE)
@ConditionalOnProperty(name = "app.v2.enabled", havingValue = "true")
public class PublicExamSessionController {

  @Resource
  private PublicExamSessionService publicExamSessionService;

  @GetMapping
  public PublicExamSessionsResponseDTO getExamSessions() {
    return PublicExamSessionsResponseDTO
      .builder()
      .examSessions(publicExamSessionService.getUpcomingExamSessions())
      .build();
  }
}
