package fi.oph.vkt.api.dto.examiner;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerContactRequestDTO(
  @NonNull Long id,
  @NonNull String lastName,
  @NonNull String firstName
) {}
