package fi.oph.vkt.api.dto.examiner;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerDetailsInitDTO(@NonNull String oid, @NonNull String lastName, @NonNull String firstName) {}
