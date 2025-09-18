package fi.oph.yki.model.type;

import fi.oph.yki.api.dto.PublicEducationDTO;
import fi.oph.yki.service.koski.dto.KoulutusTyyppi;

public enum FreeRegistrationType {
  MatriculationExam,
  HigherEducationEnrolled,
  HigherEducationConcluded,
  DIA,
  EB,
  Other,
  None;

  public static FreeRegistrationType fromEducationDTO(PublicEducationDTO dto) {
    final String educationType = dto.educationType();
    if (educationType.equals(KoulutusTyyppi.HigherEducation.toString())) {
      if (dto.isActive()) {
        return HigherEducationEnrolled;
      } else {
        return HigherEducationConcluded;
      }
    } else if (educationType.equals(KoulutusTyyppi.MatriculationExam.toString())) {
      return MatriculationExam;
    } else if (educationType.equals(KoulutusTyyppi.DIA.toString())) {
      return DIA;
    } else if (educationType.equals(KoulutusTyyppi.EB.toString())) {
      return EB;
    } else return Other;
  }
}
