package fi.oph.yki.api.dto.clerk;

import jakarta.annotation.Nullable;
import lombok.Builder;

@Builder
public record ClerkCustomerSummaryDTO(ClerkCustomerPersonDTO person, Long registrationsCount) {}
