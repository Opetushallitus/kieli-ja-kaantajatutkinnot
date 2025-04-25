package fi.oph.vkt.api.dto.examiner;

import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerContactRequestDTO(
  @NonNull Long id,
  @NonNull String lastName,
  @NonNull String firstName,
  @NonNull String email,
  @NonNull LocalDate contactDate
) {}
