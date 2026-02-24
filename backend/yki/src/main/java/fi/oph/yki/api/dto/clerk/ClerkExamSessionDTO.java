package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.RegistrationKind;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
public record ClerkExamSessionDTO(
  Long id,
  String language,
  String level,
  ExamSessionType type,
  Boolean open,
  Boolean upcomingAdmission,
  Integer participants,
  Integer maxParticipants,
  Integer queue,
  String contactName,
  String contactEmail,
  String contactPhoneNumber,
  String officeOid,
  LocalDate publishedAt,
  LocalDate date,
  String organizerOid,
  LocalDate registrationStartDate,
  List<ClerkExamSessionLocationDTO> location,
  Integer examFee,
  LocalDate registrationEndDate,
  RegistrationKind availableRegistrationKind,
  List<ClerkRegistrationDTO> registrations
) {}
