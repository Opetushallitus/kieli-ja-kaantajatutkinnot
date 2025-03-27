package fi.oph.vkt.api.dto.examiner;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerOnrBirthdateDTO(@NonNull @NotBlank String birthdate, @NonNull @NotBlank String oid) {}
