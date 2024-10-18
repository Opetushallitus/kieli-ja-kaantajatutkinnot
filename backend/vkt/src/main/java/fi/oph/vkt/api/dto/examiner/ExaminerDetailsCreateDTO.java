package fi.oph.vkt.api.dto.examiner;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerDetailsCreateDTO(
  @NonNull String email,
  @NonNull Boolean examLanguageFinnish,
  @NonNull Boolean examLanguageSwedish
) {}
