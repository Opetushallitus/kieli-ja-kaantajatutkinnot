package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateLanguageDTO;
import fi.oph.yki.api.dto.clerk.CreateClerkExamDateDTO;
import fi.oph.yki.api.dto.clerk.CreateClerkExamDateLanguageDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamDateLanguage;
import fi.oph.yki.repository.ExamDateRepository;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ClerkExamDateService {

  private final ExamDateRepository examDateRepository;

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
      .type(ed.getType())
      .languages(ed.getLanguages().stream().map(ClerkExamDateService::toLanguageDTO).toList())
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

  private static ExamDateLanguage toLanguageEntity(final ExamDate examDate, final CreateClerkExamDateLanguageDTO langDTO) {
    final ExamDateLanguage lang = new ExamDateLanguage();
    lang.setExamDate(examDate);
    lang.setLanguageCode(langDTO.languageCode());
    lang.setLevelCode(langDTO.levelCode());

    return lang;
  }

  private static ExamDate toEntity(final CreateClerkExamDateDTO dto) {
    final ExamDate examDate = new ExamDate();
    examDate.setExamDate(dto.examDate());
    examDate.setRegistrationStartDate(dto.registrationStartDate());
    examDate.setRegistrationEndDate(dto.registrationEndDate());
    examDate.setType(dto.type());
    examDate.setLanguages(dto.languages().stream().map(langDTO -> toLanguageEntity(examDate, langDTO)).toList());

    return examDate;
  }

  @Transactional
  public ClerkExamDateDTO createExamDate(final CreateClerkExamDateDTO dto) {
    return toDTO(examDateRepository.save(toEntity(dto)));
  }
}
