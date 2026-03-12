package fi.oph.yki.service;

import fi.oph.yki.api.dto.PublicInitRegistrationDTO;
import fi.oph.yki.model.ExamSessionTicket;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionTicketType;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.ExamSessionTicketRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PublicRegistrationService {

  private final ExamSessionRepository examSessionRepository;
  private final ExamSessionTicketRepository examSessionTicketRepository;
  private final RegistrationRepository registrationRepository;
  private final PersonRepository personRepository;

  @Transactional
  public Registration initRegistration(final PublicInitRegistrationDTO dto) {
    final var examSession = examSessionRepository
      .findById(dto.examSessionId())
      .orElseThrow(() -> new APIException(APIExceptionType.EXAM_SESSION_NOT_FOUND));

    final var registration = new Registration();
    final var now = LocalDateTime.now();
    registration.setExamSession(examSession);
    registration.setPartialExamType(dto.partialExamType());
    registration.setPerson(
      personRepository.findByOid(dto.personOid()).orElseThrow(() -> new APIException(APIExceptionType.NOT_FOUND))
    );
    registration.setParticipantId(dto.participantId());
    registration.setKind(dto.toQueue() ? RegistrationKind.QUEUE : RegistrationKind.ADMISSION);
    registration.setStrongAuth(dto.strongAuth());
    registration.setState(RegistrationState.STARTED);
    registration.setStartedAt(now);
    registration.setCreatedAt(now);
    final Registration saved = registrationRepository.saveAndFlush(registration);

    if (!dto.toQueue()) {
      final List<ExamSessionTicketType> requiredTypes = requiredTicketTypes(
        examSession.getType(),
        dto.partialExamType()
      );
      final List<ExamSessionTicket> lockedTickets = requiredTypes
        .stream()
        .map(type ->
          examSessionTicketRepository
            .lockOneTicketForUpdate(dto.examSessionId(), type.name())
            .orElseThrow(() -> new APIException(APIExceptionType.EXAM_SESSION_FULL))
        )
        .toList();
      lockedTickets.forEach(ticket -> ticket.setRegistration(saved));
      examSessionTicketRepository.saveAll(lockedTickets);
    }

    return saved;
  }

  private List<ExamSessionTicketType> requiredTicketTypes(
    final ExamSessionType sessionType,
    final ExamSessionTicketType partialExamType
  ) {
    return switch (sessionType) {
      case FULL -> List.of(ExamSessionTicketType.ALL_PARTS);
      case READ_SPEAK -> switch (partialExamType) {
        case ALL_PARTS -> List.of(ExamSessionTicketType.READ, ExamSessionTicketType.SPEAK);
        case READ -> List.of(ExamSessionTicketType.READ);
        case SPEAK -> List.of(ExamSessionTicketType.SPEAK);
        default -> throw new APIException(APIExceptionType.INVALID_PARTIAL_EXAM_TYPE);
      };
      case LISTEN_WRITE -> switch (partialExamType) {
        case ALL_PARTS -> List.of(ExamSessionTicketType.LISTEN, ExamSessionTicketType.WRITE);
        case LISTEN -> List.of(ExamSessionTicketType.LISTEN);
        case WRITE -> List.of(ExamSessionTicketType.WRITE);
        default -> throw new APIException(APIExceptionType.INVALID_PARTIAL_EXAM_TYPE);
      };
    };
  }
}
