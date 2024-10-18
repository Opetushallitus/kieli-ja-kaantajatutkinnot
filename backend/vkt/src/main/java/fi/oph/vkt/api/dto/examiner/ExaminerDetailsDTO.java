package fi.oph.vkt.api.dto.examiner;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerDetailsDTO(
  @NonNull Long id,
  @NonNull Integer version,
  @NonNull String oid,
  @NonNull String email,
  @NonNull String lastName,
  @NonNull String firstName,
  @NonNull Boolean examLanguageFinnish,
  @NonNull Boolean examLanguageSwedish
) {}
