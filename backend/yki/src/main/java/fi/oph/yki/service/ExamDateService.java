package fi.oph.yki.service;

import fi.oph.yki.api.dto.ExamDateDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.repository.ExamDateRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExamDateService {

  private final ExamDateRepository examDateRepository;

  @Transactional(readOnly = true)
  public List<ExamDateDTO> getExamDates() {
    return examDateRepository
      .findAll()
      .stream()
      .sorted(Comparator.comparing(ExamDate::getExamDate))
      .map(ed -> ExamDateDTO.builder().id(ed.getId()).examDate(ed.getExamDate()).build())
      .toList();
  }
}
