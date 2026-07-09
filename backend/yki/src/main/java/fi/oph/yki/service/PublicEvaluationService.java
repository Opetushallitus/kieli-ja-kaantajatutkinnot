package fi.oph.yki.service;

import fi.oph.yki.api.dto.PublicEvaluationPeriodDTO;
import fi.oph.yki.model.Evaluation;
import fi.oph.yki.repository.EvaluationRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PublicEvaluationService {

  private final EvaluationRepository evaluationRepository;

  @Transactional(readOnly = true)
  public List<PublicEvaluationPeriodDTO> getUpcomingEvaluationPeriods() {
    final var today = LocalDate.now(ZoneId.of("Europe/Helsinki"));
    return evaluationRepository
      .findByDeletedAtIsNullAndEvaluationEndDateGreaterThanEqual(today)
      .stream()
      .map(e -> {
        final var start = e.getEvaluationStartDate();
        final var end = e.getEvaluationEndDate();
        return PublicEvaluationPeriodDTO
          .builder()
          .id(e.getId())
          .examDate(e.getExamDate().getExamDate())
          .languageCode(e.getExamDateLanguage().getLanguageCode())
          .levelCode(e.getExamDateLanguage().getLevelCode())
          .evaluationStartDate(start)
          .evaluationEndDate(end)
          .open(!start.isAfter(today) && !end.isBefore(today))
          .build();
      })
      .toList();
  }
}
