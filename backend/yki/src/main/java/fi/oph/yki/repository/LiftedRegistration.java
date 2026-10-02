package fi.oph.yki.repository;

import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import lombok.Builder;

@Builder
public record LiftedRegistration(
  long id,
  RegistrationKind kind,
  RegistrationState state,
  long examSessionId,
  Long originalExamSessionId,
  PartialExamType partialExamType,
  boolean freeRegistration
) {}
