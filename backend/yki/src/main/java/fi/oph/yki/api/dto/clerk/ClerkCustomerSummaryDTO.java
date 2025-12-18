package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkCustomerSummaryDTO(ClerkCustomerPersonDTO person, int registrationsCount) {}
