package fi.oph.vkt.view;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerExamEventXlsxData(
  @NonNull String date,
  @NonNull String language,
  @NonNull List<ExaminerExamEventXlsxDataRow> rows
) {}
