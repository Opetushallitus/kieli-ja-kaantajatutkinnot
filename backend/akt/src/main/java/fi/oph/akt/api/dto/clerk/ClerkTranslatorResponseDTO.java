package fi.oph.akt.api.dto.clerk;

import fi.oph.akt.api.dto.LanguagePairsDictDTO;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

public record ClerkTranslatorResponseDTO(
  @NonNull List<ClerkTranslatorDTO> translators,
  @NonNull LanguagePairsDictDTO langs,
  @NonNull List<String> towns,
  @NonNull List<MeetingDateDTO> meetingDates,
  @NonNull List<ExaminationDateDTO> examinationDates
) {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ClerkTranslatorResponseDTO {}
}
