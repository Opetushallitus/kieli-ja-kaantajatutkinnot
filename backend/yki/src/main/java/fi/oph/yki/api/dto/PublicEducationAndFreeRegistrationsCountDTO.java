package fi.oph.yki.api.dto;

import java.util.List;
import lombok.Builder;

@Builder
public record PublicEducationAndFreeRegistrationsCountDTO(
  List<PublicEducationDTO> educations,
  int usedFreeRegistrations
) {}
