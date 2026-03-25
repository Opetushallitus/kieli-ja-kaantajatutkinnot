package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkCreateExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateLanguageDTO;
import fi.oph.yki.api.dto.clerk.ClerkUpdateExamDateDTO;
import fi.oph.yki.api.dto.clerk.CreateClerkExamDateLanguageDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.audit.dto.ClerkExamDateAuditDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamDateLanguage;
import fi.oph.yki.repository.ExamDateRepository;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ClerkExamDateService {

  private final ExamDateRepository examDateRepository;
  private final ExamSessionRepository examSessionRepository;
  private final AuditService auditService;

  private static ClerkExamDateLanguageDTO toLanguageDTO(final ExamDateLanguage lang) {
    return ClerkExamDateLanguageDTO
      .builder()
      .id(lang.getId())
      .languageCode(lang.getLanguageCode())
      .levelCode(lang.getLevelCode())
      .build();
  }

  private static ClerkExamDateDTO toDTO(final ExamDate ed) {
    return ClerkExamDateDTO
      .builder()
      .id(ed.getId())
      .examDate(ed.getExamDate())
      .registrationStartDate(ed.getRegistrationStartDate())
      .registrationEndDate(ed.getRegistrationEndDate())
      .examType(ed.getExamType())
      .languages(ed.getLanguages().stream().map(ClerkExamDateService::toLanguageDTO).toList())
      .examSessionCount(ed.getSessions().size())
      .build();
  }

  @Transactional(readOnly = true)
  public List<ClerkExamDateDTO> getFutureExamDates() {
    return examDateRepository.getByExamDateAfter(LocalDate.now()).stream().map(ClerkExamDateService::toDTO).toList();
  }

  @Transactional(readOnly = true)
  public List<ClerkExamDateDTO> getAllExamDates() {
    return examDateRepository
      .findAll()
      .stream()
      .sorted(Comparator.comparing(ExamDate::getExamDate))
      .map(ClerkExamDateService::toDTO)
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
    if (examDateRepository.existsByExamDate(dto.examDate())) {
      throw new APIException(APIExceptionType.EXAM_DATE_CREATE_DUPLICATE_DATE);
    }
    if (!dto.registrationEndDate().isAfter(dto.registrationStartDate())) {
      throw new APIException(APIExceptionType.EXAM_DATE_REGISTRATION_END_BEFORE_START);
    }
    if (!dto.examDate().isAfter(dto.registrationEndDate())) {
      throw new APIException(APIExceptionType.EXAM_DATE_EXAM_BEFORE_REGISTRATION_END);
    }

    final ClerkExamDateDTO result = toDTO(examDateRepository.save(toEntity(dto)));
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
    final ClerkExamDateAuditDTO auditBefore = new ClerkExamDateAuditDTO(toDTO(examDate));

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

    final ClerkExamDateDTO result = toDTO(examDate);
    final ClerkExamDateAuditDTO auditAfter = new ClerkExamDateAuditDTO(result);
    auditService.logUpdate(YkiOperation.UPDATE_EXAM_DATE, result.id(), auditBefore, auditAfter);

    return result;
  }
}
