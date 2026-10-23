package fi.oph.yki.audit.dto;

import lombok.Builder;

@Builder
public record IntegrationAssistanceCheckAuditDTO(
  String personUuid,
  IntegrationAssistanceCheckResult result,
  String errorDetail
) {}
