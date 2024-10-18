package fi.oph.vkt.api.dto.examiner;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerUserDTO(@NonNull String oid) {}
