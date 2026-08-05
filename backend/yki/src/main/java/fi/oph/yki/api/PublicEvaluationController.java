package fi.oph.yki.api;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.PublicEvaluationPeriodDTO;
import fi.oph.yki.api.dto.PublicEvaluationPeriodsResponseDTO;
import fi.oph.yki.service.PublicEvaluationService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/public/evaluation", produces = APPLICATION_JSON_VALUE)
public class PublicEvaluationController {

  @Resource
  private PublicEvaluationService publicEvaluationService;

  @GetMapping
  public PublicEvaluationPeriodsResponseDTO getEvaluationPeriods() {
    return PublicEvaluationPeriodsResponseDTO
      .builder()
      .evaluationPeriods(publicEvaluationService.getUpcomingEvaluationPeriods())
      .build();
  }

  @GetMapping(path = "/{id:\\d+}")
  public PublicEvaluationPeriodDTO getEvaluationPeriod(@PathVariable final long id) {
    return publicEvaluationService.getEvaluationPeriod(id);
  }
}
