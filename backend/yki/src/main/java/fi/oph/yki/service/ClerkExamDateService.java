package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkCreateExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateLanguageDTO;
import fi.oph.yki.api.dto.clerk.ClerkUpdateEvaluationDTO;
import fi.oph.yki.api.dto.clerk.ClerkUpdateExamDateDTO;
import fi.oph.yki.api.dto.clerk.CreateClerkExamDateLanguageDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.audit.dto.ClerkExamDateAuditDTO;
import fi.oph.yki.model.Evaluation;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamDateLanguage;
import fi.oph.yki.repository.EvaluationRepository;
import fi.oph.yki.repository.ExamDateRepository;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ClerkExamDateService {

  private final ExamDateRepository examDateRepository;
  private final EvaluationRepository evaluationRepository;
  private final ExamSessionRepository examSessionRepository;
  private final AuditService auditService;

  private static ClerkExamDateLanguageDTO toLanguageDTO(final ExamDateLanguage lang, final Evaluation evaluation) {
    return ClerkExamDateLanguageDTO
      .builder()
      .id(lang.getId())
      .languageCode(lang.getLanguageCode())
      .levelCode(lang.getLevelCode())
      .evaluationStartDate(evaluation != null ? evaluation.getEvaluationStartDate() : null)
      .evaluationEndDate(evaluation != null ? evaluation.getEvaluationEndDate() : null)
      .build();
  }

  private static ClerkExamDateDTO toDTO(final ExamDate ed, final Map<Long, Evaluation> evaluationsByLanguageId) {
    return ClerkExamDateDTO
      .builder()
      .id(ed.getId())
      .examDate(ed.getExamDate())
      .registrationStartDate(ed.getRegistrationStartDate())
      .registrationEndDate(ed.getRegistrationEndDate())
      .examType(ed.getExamType())
      .languages(
        ed.getLanguages().stream().map(lang -> toLanguageDTO(lang, evaluationsByLanguageId.get(lang.getId()))).toList()
      )
      .examSessionCount(ed.getSessions().size())
      .build();
  }

  private Map<Long, Evaluation> getEvaluationsByLanguageId() {
    return evaluationRepository
      .findByDeletedAtIsNull()
      .stream()
      .collect(Collectors.toMap(e -> e.getExamDateLanguage().getId(), e -> e));
  }

  @Transactional(readOnly = true)
  public List<ClerkExamDateDTO> getFutureExamDates() {
    final Map<Long, Evaluation> evalMap = getEvaluationsByLanguageId();

    return examDateRepository
      .getByExamDateAfterAndDeletedAtIsNull(LocalDate.now())
      .stream()
      .map(ed -> toDTO(ed, evalMap))
      .toList();
  }

  @Transactional(readOnly = true)
  public List<ClerkExamDateDTO> getAllExamDates() {
    final Map<Long, Evaluation> evalMap = getEvaluationsByLanguageId();

    return examDateRepository
      .findAllByDeletedAtIsNull()
      .stream()
      .sorted(Comparator.comparing(ExamDate::getExamDate))
      .map(ed -> toDTO(ed, evalMap))
      .toList();
  }

  private static ExamDateLanguage toLanguageEntity(
    final ExamDate examDate,
    final CreateClerkExamDateLanguageDTO langDTO
  ) {
    final ExamDateLanguage lang = new ExamDateLanguage();
    lang.setExamDate(examDate);
    lang.setLanguageCode(langDTO.languageCode().name());
    lang.setLevelCode(langDTO.levelCode().name());

    return lang;
  }

  private static ExamDate toEntity(final ClerkCreateExamDateDTO dto) {
    final ExamDate examDate = new ExamDate();
    examDate.setExamDate(dto.examDate());
    examDate.setRegistrationStartDate(dto.registrationStartDate());
    examDate.setRegistrationEndDate(dto.registrationEndDate());
    examDate.setExamType(dto.examType());
    examDate.setLanguages(
      new ArrayList<>(dto.languages().stream().map(langDTO -> toLanguageEntity(examDate, langDTO)).toList())
    );

    return examDate;
  }

  private static boolean languagesMatch(final ExamDate examDate, final ClerkUpdateExamDateDTO dto) {
    final var existing = examDate
      .getLanguages()
      .stream()
      .map(l -> l.getLanguageCode() + ":" + l.getLevelCode())
      .sorted()
      .toList();

    final var requested = dto
      .languages()
      .stream()
      .map(l -> l.languageCode().name() + ":" + l.levelCode().name())
      .sorted()
      .toList();

    return existing.equals(requested);
  }

  @Transactional
  public ClerkExamDateDTO createExamDate(final ClerkCreateExamDateDTO dto) {
    if (examDateRepository.existsByExamDateAndDeletedAtIsNull(dto.examDate())) {
      throw new APIException(APIExceptionType.EXAM_DATE_CREATE_DUPLICATE_DATE);
    }
    if (!dto.registrationEndDate().isAfter(dto.registrationStartDate())) {
      throw new APIException(APIExceptionType.EXAM_DATE_REGISTRATION_END_BEFORE_START);
    }
    if (!dto.examDate().isAfter(dto.registrationEndDate())) {
      throw new APIException(APIExceptionType.EXAM_DATE_EXAM_BEFORE_REGISTRATION_END);
    }

    final ClerkExamDateDTO result = toDTO(examDateRepository.save(toEntity(dto)), Map.of());
    final ClerkExamDateAuditDTO auditDto = new ClerkExamDateAuditDTO(result);
    auditService.logCreate(YkiOperation.CREATE_EXAM_DATE, result.id(), auditDto);

    return result;
  }

  @Transactional
  public ClerkExamDateDTO updateExamDate(final long id, final ClerkUpdateExamDateDTO dto) {
    if (!dto.registrationEndDate().isAfter(dto.registrationStartDate())) {
      throw new APIException(APIExceptionType.EXAM_DATE_REGISTRATION_END_BEFORE_START);
    }
    if (!dto.examDate().isAfter(dto.registrationEndDate())) {
      throw new APIException(APIExceptionType.EXAM_DATE_EXAM_BEFORE_REGISTRATION_END);
    }

    final ExamDate examDate = examDateRepository
      .findById(id)
      .orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND));
    final Map<Long, Evaluation> evalMap = getEvaluationsByLanguageId();
    final ClerkExamDateAuditDTO auditBefore = new ClerkExamDateAuditDTO(toDTO(examDate, evalMap));

    final boolean hasSessions = examSessionRepository.existsByExamDateId(id);

    if (hasSessions) {
      if (
        !dto.examDate().isEqual(examDate.getExamDate()) ||
        !dto.examType().equals(examDate.getExamType()) ||
        !languagesMatch(examDate, dto)
      ) {
        throw new APIException(APIExceptionType.EXAM_DATE_HAS_SESSIONS);
      }
    }

    examDate.setExamDate(dto.examDate());
    examDate.setRegistrationStartDate(dto.registrationStartDate());
    examDate.setRegistrationEndDate(dto.registrationEndDate());
    examDate.setExamType(dto.examType());

    if (!hasSessions) {
      examDate.getLanguages().clear();
      examDate
        .getLanguages()
        .addAll(dto.languages().stream().map(langDTO -> toLanguageEntity(examDate, langDTO)).toList());
    }

    examDateRepository.flush();

    final ClerkExamDateDTO result = toDTO(examDate, getEvaluationsByLanguageId());
    final ClerkExamDateAuditDTO auditAfter = new ClerkExamDateAuditDTO(result);
    auditService.logUpdate(YkiOperation.UPDATE_EXAM_DATE, result.id(), auditBefore, auditAfter);

    return result;
  }

  private static void validateEvaluationDateOrder(
    final LocalDate examDateValue,
    final LocalDate startDate,
    final LocalDate endDate
  ) {
    if (startDate.isBefore(examDateValue) || endDate.isBefore(startDate)) {
      throw new APIException(APIExceptionType.EVALUATION_INVALID_DATE_ORDER);
    }
  }

  @Transactional
  public ClerkExamDateDTO updateEvaluation(final long examDateId, final ClerkUpdateEvaluationDTO dto) {
    final ExamDate examDate = examDateRepository
      .findById(examDateId)
      .orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND));

    for (final ClerkUpdateEvaluationDTO.LanguageEvaluation lang : dto.evaluations()) {
      final boolean hasStart = lang.evaluationStartDate() != null;
      final boolean hasEnd = lang.evaluationEndDate() != null;
      if (hasStart != hasEnd) {
        throw new APIException(APIExceptionType.EVALUATION_INVALID_DATE_ORDER);
      }
      if (hasStart) {
        validateEvaluationDateOrder(examDate.getExamDate(), lang.evaluationStartDate(), lang.evaluationEndDate());
      }
    }

    final List<Evaluation> allEvaluations = evaluationRepository.findByExamDateId(examDateId);

    final Map<Long, Evaluation> existingByLanguageId = allEvaluations
      .stream()
      .filter(e -> e.getDeletedAt() == null)
      .collect(Collectors.toMap(e -> e.getExamDateLanguage().getId(), e -> e));

    final Map<Long, Evaluation> softDeletedByLanguageId = allEvaluations
      .stream()
      .filter(e -> e.getDeletedAt() != null)
      .collect(Collectors.toMap(e -> e.getExamDateLanguage().getId(), e -> e));

    final LocalDateTime now = LocalDateTime.now();
    final Map<Long, Evaluation> evalMap = new HashMap<>();

    for (final ClerkUpdateEvaluationDTO.LanguageEvaluation lang : dto.evaluations()) {
      final Evaluation existing = existingByLanguageId.get(lang.examDateLanguageId());

      if (lang.evaluationStartDate() != null) {
        if (existing != null) {
          existing.setEvaluationStartDate(lang.evaluationStartDate());
          existing.setEvaluationEndDate(lang.evaluationEndDate());
          evaluationRepository.save(existing);
          evalMap.put(lang.examDateLanguageId(), existing);
        } else {
          final Evaluation softDeleted = softDeletedByLanguageId.get(lang.examDateLanguageId());
          if (softDeleted != null) {
            softDeleted.setDeletedAt(null);
            softDeleted.setEvaluationStartDate(lang.evaluationStartDate());
            softDeleted.setEvaluationEndDate(lang.evaluationEndDate());
            evaluationRepository.save(softDeleted);
            evalMap.put(lang.examDateLanguageId(), softDeleted);
          } else {
            final Evaluation evaluation = new Evaluation();
            evaluation.setExamDate(examDate);
            evaluation.setExamDateLanguage(
              examDate
                .getLanguages()
                .stream()
                .filter(l -> l.getId() == lang.examDateLanguageId())
                .findFirst()
                .orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND))
            );
            evaluation.setEvaluationStartDate(lang.evaluationStartDate());
            evaluation.setEvaluationEndDate(lang.evaluationEndDate());
            evaluationRepository.save(evaluation);
            evalMap.put(lang.examDateLanguageId(), evaluation);
          }
        }
      } else if (existing != null) {
        existing.setDeletedAt(now);
        evaluationRepository.save(existing);
      }
    }

    final ClerkExamDateDTO result = toDTO(examDate, evalMap);

    auditService.logById(YkiOperation.UPDATE_EVALUATION, examDateId);

    return result;
  }

  @Transactional
  public void deleteExamDate(final long id) {
    final ExamDate examDate = examDateRepository
      .findById(id)
      .orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND));

    if (examSessionRepository.existsByExamDateId(id)) {
      throw new APIException(APIExceptionType.EXAM_DATE_HAS_SESSIONS);
    }

    if (evaluationRepository.existsByExamDateIdAndDeletedAtIsNull(id)) {
      throw new APIException(APIExceptionType.EXAM_DATE_HAS_EVALUATIONS);
    }

    examDate.setDeletedAt(LocalDateTime.now());
    examDateRepository.flush();
    auditService.logById(YkiOperation.DELETE_EXAM_DATE, id);
  }
}
