package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateLanguageDTO;
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
}
