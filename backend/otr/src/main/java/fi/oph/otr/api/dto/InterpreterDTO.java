package fi.oph.otr.api.dto;

import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
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
