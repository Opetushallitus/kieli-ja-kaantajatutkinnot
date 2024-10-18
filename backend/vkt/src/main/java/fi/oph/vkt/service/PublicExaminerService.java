package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicExaminerDTO;
import fi.oph.vkt.api.dto.PublicExaminerExamDateDTO;
import fi.oph.vkt.api.dto.PublicMunicipalityDTO;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerMunicipality;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.repository.ExaminerRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicExaminerService {

  private final ExaminerRepository examinerRepository;

  private static PublicMunicipalityDTO toPublicMunicipalityDTO(ExaminerMunicipality municipality) {
    return PublicMunicipalityDTO.builder().fi(municipality.getNameFi()).sv(municipality.getNameSv()).build();
  }

  private static PublicExaminerExamDateDTO toPublicExaminerExamDateDTO(ExamEvent examEvent) {
    return PublicExaminerExamDateDTO
      .builder()
      .examDate(examEvent.getDate())
      .isFull(examEvent.getMaxParticipants() <= examEvent.getEnrollments().size())
      .build();
  }

  private static PublicExaminerDTO toPublicExaminerDTO(Examiner examiner) {
    List<ExamLanguage> languages = new ArrayList<>();
    if (examiner.isExamLanguageFinnish()) {
      languages.add(ExamLanguage.FI);
    }
    if (examiner.isExamLanguageSwedish()) {
      languages.add(ExamLanguage.SV);
    }
    return PublicExaminerDTO
      .builder()
      .id(examiner.getId())
      .lastName(examiner.getLastName())
      .firstName(examiner.getFirstName())
      .languages(languages)
      .municipalities(
        examiner
          .getMunicipalities()
          .stream()
          .map(PublicExaminerService::toPublicMunicipalityDTO)
          .collect(Collectors.toList())
      )
      .examDates(
        examiner
          .getExamEvents()
          .stream()
          .map(PublicExaminerService::toPublicExaminerExamDateDTO)
          .collect(Collectors.toList())
      )
      .build();
  }

  @Transactional(readOnly = true)
  public List<PublicExaminerDTO> listExaminers() {
    return examinerRepository
      .getAllByDeletedAtIsNull()
      .stream()
      .map(PublicExaminerService::toPublicExaminerDTO)
      .collect(Collectors.toList());
  }
}
