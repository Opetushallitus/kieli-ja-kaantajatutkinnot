package fi.oph.yki.view;

import lombok.Builder;
import lombok.NonNull;

import java.util.List;

@Builder
public record ExamSessionXlsxData(
  @NonNull String date,
  @NonNull String language,
  @NonNull List<ExamSessionXlsxDataRow> rows
) {}
