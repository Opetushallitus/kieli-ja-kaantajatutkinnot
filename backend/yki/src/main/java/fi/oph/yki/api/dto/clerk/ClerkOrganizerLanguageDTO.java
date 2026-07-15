package fi.oph.yki.api.dto.clerk;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import fi.oph.yki.util.StringUtil;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ClerkOrganizerLanguageDTO(String languageCode, String levelCode) {
  public ClerkOrganizerLanguageDTO {
    languageCode = StringUtil.sanitize(languageCode);
    levelCode = StringUtil.sanitize(levelCode);
  }
}
