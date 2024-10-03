package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicExaminerDTO;
import fi.oph.vkt.api.dto.PublicMunicipalityDTO;
import fi.oph.vkt.model.type.ExamLanguage;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PublicExaminerService {

  public List<PublicExaminerDTO> listExaminers() {
    final PublicMunicipalityDTO helsinki = PublicMunicipalityDTO.builder().fi("Helsinki").sv("Helsingfors").build();
    final PublicMunicipalityDTO espoo = PublicMunicipalityDTO.builder().fi("Espoo").sv("Esbo").build();
    final PublicMunicipalityDTO vantaa = PublicMunicipalityDTO.builder().fi("Vantaa").sv("Vanda").build();
    final PublicMunicipalityDTO kauniainen = PublicMunicipalityDTO.builder().fi("Kauniainen").sv("Grankulla").build();
    final List<PublicExaminerDTO> examiners = new ArrayList<>();
    examiners.add(
      PublicExaminerDTO
        .builder()
        .id(1L)
        .lastName("Laine")
        .firstName("Eemeli")
        .languages(List.of(ExamLanguage.FI))
        .municipalities(List.of(helsinki, espoo, vantaa, kauniainen))
        .examDates(List.of())
        .build()
    );

    return examiners;
  }
}
