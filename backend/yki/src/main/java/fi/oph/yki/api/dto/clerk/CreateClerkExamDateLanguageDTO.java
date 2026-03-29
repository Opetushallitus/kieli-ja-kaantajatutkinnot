package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.LanguageCode;
import fi.oph.yki.model.type.LevelCode;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record CreateClerkExamDateLanguageDTO(
  @NotNull @NonNull LanguageCode languageCode,
  @NotNull @NonNull LevelCode levelCode
) {}
