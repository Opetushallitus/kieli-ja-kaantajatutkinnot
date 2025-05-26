package fi.oph.vkt.view;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record PaymentReportXslxData(
  @NonNull String merchantReference,
  @NonNull String paytrailReference,
  @NonNull String lastName,
  @NonNull String firstName,
  @NonNull String date,
  @NonNull String language,
  @NonNull String level,
  @NonNull String examiner,
  @NonNull Integer textualSkill,
  @NonNull Integer oralSkill,
  @NonNull Integer understandingSkill,
  @NonNull Double amount,
  @NonNull String paymentCreatedAt
) {}
