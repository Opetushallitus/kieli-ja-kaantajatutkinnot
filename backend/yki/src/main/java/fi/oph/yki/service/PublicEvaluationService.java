package fi.oph.yki.service;

import fi.oph.yki.api.dto.PublicEvaluationPeriodDTO;
import fi.oph.yki.model.Evaluation;
import fi.oph.yki.repository.EvaluationRepository;
import fi.oph.yki.util.exception.NotFoundException;
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

  private static PublicEvaluationPeriodDTO toDTO(final Evaluation evaluation, final LocalDate today) {
    final var start = evaluation.getEvaluationStartDate();
    final var end = evaluation.getEvaluationEndDate();
    return PublicEvaluationPeriodDTO
      .builder()
      .id(evaluation.getId())
      .examDate(evaluation.getExamDateLanguage().getExamDate().getExamDate())
      .languageCode(evaluation.getExamDateLanguage().getLanguageCode())
      .levelCode(evaluation.getExamDateLanguage().getLevelCode())
      .evaluationStartDate(start)
      .evaluationEndDate(end)
      .open(!start.isAfter(today) && !end.isBefore(today))
      .build();
  }

  @Transactional(readOnly = true)
  public List<PublicEvaluationPeriodDTO> getUpcomingEvaluationPeriods() {
    final var today = LocalDate.now(ZoneId.of("Europe/Helsinki"));
    return evaluationRepository
      .findByDeletedAtIsNullAndEvaluationEndDateGreaterThanEqual(today)
      .stream()
      .map(e -> toDTO(e, today))
      .toList();
  }

  @Transactional(readOnly = true)
  public PublicEvaluationPeriodDTO getEvaluationPeriod(final long id) {
    final var today = LocalDate.now(ZoneId.of("Europe/Helsinki"));
    return evaluationRepository
      .findByIdAndDeletedAtIsNull(id)
      .map(e -> toDTO(e, today))
      .orElseThrow(() -> new NotFoundException(String.format("Evaluation not found with id: %d", id)));
  }
}
