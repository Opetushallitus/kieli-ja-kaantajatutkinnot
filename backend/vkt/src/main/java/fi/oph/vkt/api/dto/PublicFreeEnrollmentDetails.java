package fi.oph.vkt.api.dto;

import lombok.NonNull;

public record PublicFreeEnrollmentDetails(
  @NonNull int freeTextualSkillExamsLeft,
  @NonNull int freeOralSkillExamsLeft
) {}
