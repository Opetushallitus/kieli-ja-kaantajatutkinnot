package fi.oph.yki.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkQuarantinesDTO(
  long id,
  LocalDate startDate,
  LocalDate endDate,
  @NonNull @NotBlank String languageCode,
  @NonNull @NotBlank ClerkQuarantinePersonDTO quarantinedPerson
) {}
