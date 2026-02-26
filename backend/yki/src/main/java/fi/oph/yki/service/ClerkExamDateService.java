package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.repository.ExamDateRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ClerkExamDateService {

  private final ExamDateRepository examDateRepository;

  @Transactional(readOnly = true)
  public List<ClerkExamDateDTO> getFutureExamDates() {
    return examDateRepository
      .getByExamDateAfter(LocalDate.now())
      .stream()
      .map(ed ->
        ClerkExamDateDTO
          .builder()
          .id(ed.getId())
          .examDate(ed.getExamDate())
          .registrationStartDate(ed.getRegistrationStartDate())
          .registrationEndDate(ed.getRegistrationEndDate())
          .build()
      )
      .toList();
  }
}
