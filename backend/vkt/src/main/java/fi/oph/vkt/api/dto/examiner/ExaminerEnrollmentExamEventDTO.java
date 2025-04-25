package fi.oph.vkt.api.dto.examiner;

import jakarta.validation.constraints.NotNull;
import lombok.NonNull;

public record ExaminerEnrollmentExamEventDTO(@NonNull @NotNull Long id) {}
