package fi.oph.otr.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record InterpreterDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  String email,
  String phoneNumber,
  String otherContactInfo,
  @NonNull @NotNull List<String> regions,
  @NonNull @NotEmpty List<LanguagePairDTO> languages
) {}
