package fi.oph.yki.view;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExamSessionXlsxData(
  @NonNull String date,
  @NonNull String language,
  @NonNull List<ExamSessionXlsxDataRow> rows
) {}
