package fi.oph.vkt.util;

import fi.oph.vkt.api.dto.MunicipalityDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;

public class ExaminerUtil {

  public static MunicipalityDTO toMunicipalityDTO(final Municipality municipality) {
    return MunicipalityDTO.builder().code(municipality.getCode()).build();
  }

  public static ExaminerExamEventDTO examinerExamEventDTO(final ExaminerExamEvent examinerExamEvent) {
    return ExaminerExamEventDTO
      .builder()
      .id(examinerExamEvent.getId())
      .version(examinerExamEvent.getVersion())
      .date(examinerExamEvent.getDate())
      .language(examinerExamEvent.getLanguage())
      .isHidden(examinerExamEvent.isHidden())
      .municipality(toMunicipalityDTO(examinerExamEvent.getMunicipality()))
      .location(examinerExamEvent.getLocation())
      .registrationCloses(examinerExamEvent.getRegistrationCloses())
      .maxParticipants(examinerExamEvent.getMaxParticipants())
      .build();
  }

  public static ExaminerDetailsDTO toExaminerDetailsDTO(final Examiner examiner) {
    return ExaminerDetailsDTO
      .builder()
      .id(examiner.getId())
      .version(examiner.getVersion())
      .oid(examiner.getOid())
      .lastName(examiner.getLastName())
      .firstName(examiner.getFirstName())
      .email(examiner.getEmail())
      .phoneNumber(examiner.getPhoneNumber())
      .municipalities(examiner.getMunicipalities().stream().map(ExaminerUtil::toMunicipalityDTO).toList())
      .isPublic(examiner.isPublic())
      .examLanguageFinnish(examiner.isExamLanguageFinnish())
      .examLanguageSwedish(examiner.isExamLanguageSwedish())
      .examEvents(examiner.getExamEvents().stream().map(ExaminerUtil::examinerExamEventDTO).toList())
      .build();
  }
}
