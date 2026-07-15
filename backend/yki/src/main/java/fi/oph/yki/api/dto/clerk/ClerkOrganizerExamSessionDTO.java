package fi.oph.yki.api.dto.clerk;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import fi.oph.yki.model.type.RegistrationKind;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ClerkOrganizerExamSessionDTO(
  long id,
  String levelCode,
  String languageCode,
  Boolean open,
  Boolean upcomingAdmission,
  Integer participants,
  Integer maxParticipants,
  Integer queue,
  List<ClerkOrganizerExamSessionContactDTO> contact,
  String officeOid,
  String publishedAt,
  LocalDate sessionDate,
  String organizerOid,
  LocalDate registrationStartDate,
  LocalDate registrationEndDate,
  List<ClerkOrganizerExamSessionLocationDTO> location,
  Integer examFee,
  RegistrationKind availableRegistrationKind
) {}
