package fi.oph.yki.api.dto.oauth2;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.NonNull;

public record RegistrationIdentificationDTO(
  @NonNull @NotNull String oppijanumero,
  @NonNull @NotNull LocalDate tutkintopaiva,
  @NonNull @NotNull String tutkintokieli,
  @NonNull @NotNull String tutkintotaso,
  @NonNull @NotNull List<String> osakokeet
) {}
