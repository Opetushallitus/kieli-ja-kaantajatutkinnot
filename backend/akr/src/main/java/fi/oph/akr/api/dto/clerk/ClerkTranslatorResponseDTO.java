package fi.oph.akr.api.dto.clerk;

import fi.oph.akr.api.dto.LanguagePairsDictDTO;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkTranslatorResponseDTO(
  @NonNull List<ClerkTranslatorDTO> translators,
  @NonNull LanguagePairsDictDTO langs,
  @NonNull List<String> towns,
  @NonNull List<MeetingDateDTO> meetingDates,
  @NonNull List<ExaminationDateDTO> examinationDates
) {}
