package fi.oph.vkt.api.dto;

import fi.oph.vkt.model.type.EnrollmentGradeType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record EnrollmentGradeDTO(@NonNull @NotNull EnrollmentGradeType grade, @Size(max = 1024) String comment) {}
