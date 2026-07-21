package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.LanguageCode;
import fi.oph.yki.model.type.LevelCode;
import fi.oph.yki.util.StringUtil;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
public record ClerkStatisticsRequestDTO(
  LocalDate from,
  LocalDate to,
  @Nullable List<LanguageCode> languages,
  @Nullable List<LevelCode> levels,
  @Nullable List<String> organizers,
  @Nullable @Size(max = 255) String municipality
) {
  public ClerkStatisticsRequestDTO {
    municipality = StringUtil.sanitize(municipality);
  }
}
