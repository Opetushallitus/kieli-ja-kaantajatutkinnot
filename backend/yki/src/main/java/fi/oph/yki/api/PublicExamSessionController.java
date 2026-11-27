package fi.oph.yki.api;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.PublicExamSessionsResponseDTO;
import fi.oph.yki.service.PublicExamSessionService;
import jakarta.annotation.Resource;
import java.util.concurrent.TimeUnit;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v2/public/exam-session", produces = APPLICATION_JSON_VALUE)
@ConditionalOnProperty(name = "app.v2.enabled", havingValue = "true")
public class PublicExamSessionController {

  // nginx caches this response by the Cache-Control header; without it Spring Security's default no-store applies.
  // Exam sessions fill in seconds when registration opens, so the cache time is kept short.
  private static final CacheControl CACHE_CONTROL = CacheControl.maxAge(2, TimeUnit.SECONDS).cachePublic();

  @Resource
  private PublicExamSessionService publicExamSessionService;

  @GetMapping
  public ResponseEntity<PublicExamSessionsResponseDTO> getExamSessions() {
    return ResponseEntity
      .ok()
      .cacheControl(CACHE_CONTROL)
      .body(
        PublicExamSessionsResponseDTO.builder().examSessions(publicExamSessionService.getUpcomingExamSessions()).build()
      );
  }
}
