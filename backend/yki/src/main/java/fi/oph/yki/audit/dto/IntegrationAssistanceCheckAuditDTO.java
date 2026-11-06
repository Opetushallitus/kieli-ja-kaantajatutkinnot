package fi.oph.yki.audit.dto;

import lombok.Builder;

@Builder
public record IntegrationAssistanceCheckAuditDTO(
  String personUuid,
  String correlationId,
  IntegrationAssistanceCheckResult result,
  String errorDetail
) {}
