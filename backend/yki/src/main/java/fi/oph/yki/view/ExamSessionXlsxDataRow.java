package fi.oph.yki.view;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExamSessionXlsxDataRow(@NonNull String lastName, @NonNull String firstName) {}
