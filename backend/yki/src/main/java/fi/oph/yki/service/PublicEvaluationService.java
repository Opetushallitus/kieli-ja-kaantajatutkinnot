package fi.oph.yki.service;

import fi.oph.yki.api.dto.PublicEvaluationOrderDTO;
import fi.oph.yki.api.dto.PublicEvaluationPeriodDTO;
import fi.oph.yki.model.Evaluation;
import fi.oph.yki.model.EvaluationOrder;
import fi.oph.yki.repository.EvaluationOrderRepository;
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

  private final EvaluationOrderRepository evaluationOrderRepository;

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

  private static PublicEvaluationOrderDTO toDTO(final EvaluationOrder evaluationOrder) {
    final var examDateLanguage = evaluationOrder.getEvaluation().getExamDateLanguage();
    return PublicEvaluationOrderDTO
      .builder()
      .id(evaluationOrder.getId())
      .languageCode(examDateLanguage.getLanguageCode())
      .levelCode(examDateLanguage.getLevelCode())
      .examDate(examDateLanguage.getExamDate().getExamDate())
      .build();
  }

  @Transactional(readOnly = true)
  public PublicEvaluationOrderDTO getEvaluationOrder(final long id) {
    return evaluationOrderRepository
      .findByIdAndDeletedAtIsNull(id)
      .map(PublicEvaluationService::toDTO)
      .orElseThrow(() -> new NotFoundException(String.format("Evaluation order not found with id: %d", id)));
  }
}
