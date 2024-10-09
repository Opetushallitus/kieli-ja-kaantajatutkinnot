package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicExaminerDTO;
import fi.oph.vkt.api.dto.PublicMunicipalityDTO;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerMunicipality;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.repository.ExaminerRepository;
import fi.oph.vkt.service.onr.OnrService;
import fi.oph.vkt.service.onr.PersonalData;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicExaminerService {

  private final ExaminerRepository examinerRepository;
  private final OnrService onrService;

  private static PublicMunicipalityDTO toPublicMunicipalityDTO(ExaminerMunicipality municipality) {
    return PublicMunicipalityDTO.builder().fi(municipality.getNameFi()).sv(municipality.getNameSv()).build();
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
      .examDates(List.of())
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

  @Transactional
  public void updateStoredPersonalData() {
    final List<String> onrIds = examinerRepository.listExistingOnrIds();
    final Map<String, PersonalData> oidToPersonalData = onrService.getOnrPersonalData(onrIds);
    oidToPersonalData.forEach((k, v) -> {
      Examiner examiner = examinerRepository.getByOid(k);
      examiner.setLastName(v.getLastName());
      examiner.setFirstName(v.getFirstName());
      examiner.setNickname(v.getNickname());
      examinerRepository.saveAndFlush(examiner);
    });
  }
}
