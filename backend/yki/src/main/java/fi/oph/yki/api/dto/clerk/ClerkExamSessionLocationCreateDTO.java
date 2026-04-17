package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record ClerkExamSessionLocationCreateDTO(
  @Size(max = 255) String lang,
  @Size(max = 255) String streetAddress,
  @Size(max = 255) String postalCode,
  @Size(max = 255) String city,
  @Size(max = 255) String name,
  @Size(max = 255) String otherLocationInfo,
  String extraInformation
) {
  public ClerkExamSessionLocationCreateDTO {
    lang = StringUtil.sanitize(lang);
    streetAddress = StringUtil.sanitize(streetAddress);
    postalCode = StringUtil.sanitize(postalCode);
    city = StringUtil.sanitize(city);
    name = StringUtil.sanitize(name);
    otherLocationInfo = StringUtil.sanitize(otherLocationInfo);
    extraInformation = StringUtil.sanitize(extraInformation);
  }
}
