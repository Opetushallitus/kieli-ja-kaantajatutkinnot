package fi.oph.yki.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PublicRegistrationToConfirmDTO(
  Long id,
  Integer examFee,
  LocalDateTime expiresAt,
  String languageCode,
  String levelCode,
  LocalDate registrationStartDate,
  LocalDate registrationEndDate,
  LocalDate sessionDate,
  List<PublicExamSessionLocationDTO> location
) {}
