package fi.oph.vkt.api.dto.examiner;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerEnrollmentBirthdateOrSsnDTO(@NonNull @NotNull String birthdateOrSsn) {}
