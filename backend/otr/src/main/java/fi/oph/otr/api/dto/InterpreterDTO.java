package fi.oph.otr.api.dto;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record InterpreterDTO(
  @NonNull String firstName,
  @NonNull String lastName,
  String email,
  String phoneNumber,
  String otherContactInfo,
  @NonNull List<String> regions,
  @NonNull List<LanguagePairDTO> languages
) {}
