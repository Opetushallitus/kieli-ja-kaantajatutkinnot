package fi.oph.yki.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record ClerkPersonContactUpdateDTO(
  @NotBlank @Size(max = 255) String email,
  @NotBlank @Size(max = 255) String phoneNumber,
  @NotBlank @Size(max = 255) String streetAddress,
  @NotBlank @Size(max = 255) String postOffice,
  @NotBlank @Size(max = 255) String zip
) {}
