package fi.oph.yki.view;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExamSessionXlsxSheet(@NonNull String name, @NonNull List<ExamSessionXlsxDataRow> rows) {}
