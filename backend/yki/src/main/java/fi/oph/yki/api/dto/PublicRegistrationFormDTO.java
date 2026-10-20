package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicRegistrationFormDTO(
  @NonNull @NotBlank @Size(max = 255) @JsonProperty("first_name") String firstName,
  @NonNull @NotBlank @Size(max = 255) @JsonProperty("last_name") String lastName,
  @NonNull @NotNull @Size(max = 20) List<String> nationalities,
  @NonNull @NotBlank @Size(max = 10) @JsonProperty("certificate_lang") String certificateLang,
  @NonNull @NotBlank @Size(max = 10) @JsonProperty("exam_lang") String examLang,
  @Size(max = 20) String ssn,
  @Size(max = 20) String birthdate,
  @NonNull @NotBlank @Size(max = 255) @JsonProperty("post_office") String postOffice,
  @NonNull @NotBlank @Size(max = 20) String zip,
  @NonNull @NotBlank @Size(max = 255) @JsonProperty("street_address") String streetAddress,
  @NonNull @NotBlank @Size(max = 50) @JsonProperty("phone_number") String phoneNumber,
  @NonNull @NotBlank @Size(max = 255) String email,
  @Size(max = 3) @JsonProperty("country_code") String countryCode,
  @Size(max = 10) String gender,
  @Size(max = 255) @JsonProperty("nationality_desc") String nationalityDesc,
  @Size(max = 50) @JsonProperty("native_language") String nativeLanguage,
  @Size(max = 255) @JsonProperty("preferred_name") String preferredName,
  @JsonProperty("free_registration_id") Long freeRegistrationId
) {
  public PublicRegistrationFormDTO {
    firstName = StringUtil.sanitize(firstName);
    lastName = StringUtil.sanitize(lastName);
    certificateLang = StringUtil.sanitize(certificateLang);
    examLang = StringUtil.sanitize(examLang);
    ssn = StringUtil.sanitize(ssn);
    birthdate = StringUtil.sanitize(birthdate);
    postOffice = StringUtil.sanitize(postOffice);
    zip = StringUtil.sanitize(zip);
    streetAddress = StringUtil.sanitize(streetAddress);
    phoneNumber = StringUtil.sanitize(phoneNumber);
    email = StringUtil.sanitize(email);
    countryCode = StringUtil.sanitize(countryCode);
    gender = StringUtil.sanitize(gender);
    nationalityDesc = StringUtil.sanitize(nationalityDesc);
    nativeLanguage = StringUtil.sanitize(nativeLanguage);
    preferredName = StringUtil.sanitize(preferredName);
  }
}
