package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkExamSessionCreateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionLocationDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionUpdateDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamDateRepository;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.OrganizerRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.RegistrationUtil;
import fi.oph.yki.view.ExamSessionXlsxDataRowUtil;
import fi.oph.yki.view.ExamSessionXlsxView;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@RequiredArgsConstructor
@Service
public class ClerkExamSessionService {

  private final ExamSessionRepository examSessionRepository;
  private final RegistrationRepository registrationRepository;
  private final ExamDateRepository examDateRepository;
  private final OrganizerRepository organizerRepository;
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public ClerkExamSessionDTO getExamSession(final String oid, final Long examSessionId) {
    final Organizer organizer = organizerRepository.findByOidAndDeletedAtIsNull(oid).orElseThrow();
    final ExamSession examSession = examSessionRepository.getReferenceById(examSessionId);

    if (examSession.getOrganizer().getId() != organizer.getId()) {
      throw new AccessDeniedException(
        String.format("Exam session (%s) not related to organizer (%s)", examSessionId, oid)
      );
    }

    return toDTO(examSession);
  }

  @Transactional(readOnly = true)
  public ClerkExamSessionDTO getExamSession(final Long examSessionId) {
    final ExamSession examSession = examSessionRepository.getReferenceById(examSessionId);

    return toDTO(examSession);
  }

  @Transactional(readOnly = true)
  public List<ClerkExamSessionDTO> getExamSessionsByLanguageAndLevel(final String language, final String level) {
    return examSessionRepository.getByLanguageAndLevel(language, level).stream().map(this::toDTO).toList();
  }

  private ClerkExamSessionDTO toDTO(final ExamSession examSession) {
    final List<ClerkRegistrationDTO> registrationDTOs = registrationRepository
      .getByExamSessionAndStateIn(
        examSession,
        List.of(
          RegistrationState.COMPLETED,
          RegistrationState.SUBMITTED,
          RegistrationState.CANCELLED,
          RegistrationState.PAID_AND_CANCELLED
        )
      )
      .stream()
      .map(RegistrationUtil::createClerkRegistrationDTO)
      .toList();
    final List<ClerkExamSessionLocationDTO> locationDTOS = examSession
      .getLocations()
      .stream()
      .map(RegistrationUtil::createClerkExamSessionLocationDTO)
      .toList();
    final ExamDate examDate = examSession.getExamDate();

    return ClerkExamSessionDTO
      .builder()
      .id(examSession.getId())
      .level(examSession.getLevel())
      .language(examSession.getLanguage())
      .type(examSession.getType())
      .location(locationDTOS)
      .registrations(registrationDTOs)
      .date(examDate.getExamDate())
      .registrationStartDate(examDate.getRegistrationStartDate())
      .registrationEndDate(examDate.getRegistrationEndDate())
      .maxParticipantsTotal(examSession.getMaxParticipants())
      .maxParticipantsReadListen(examSession.getMaxParticipantsReadListen())
      .maxParticipantsSpeakWrite(examSession.getMaxParticipantsSpeakWrite())
      .startTime(examSession.getStartTime())
      .startTimeReadListen(examSession.getStartTimeReadListen())
      .startTimeSpeakWrite(examSession.getStartTimeSpeakWrite())
      .contactName(examSession.getContactName())
      .contactEmail(examSession.getContactEmail())
      .contactPhoneNumber(examSession.getContactPhoneNumber())
      .build();
  }

  @Transactional(readOnly = true)
  public AbstractXlsxView getExamSessionExcel(final long examSessionId) {
    final var examSession = examSessionRepository.getReferenceById(examSessionId);
    final var excelData = ExamSessionXlsxDataRowUtil.createExcelData(examSession);
    final var excel = new ExamSessionXlsxView(excelData);

    return excel;
  }

  @Transactional
  public ClerkExamSessionDTO updateExamSession(
    final String oid,
    final long examSessionId,
    final ClerkExamSessionUpdateDTO dto
  ) {
    final Organizer organizer = organizerRepository.findByOidAndDeletedAtIsNull(oid).orElseThrow();
    final ExamSession examSession = examSessionRepository.getReferenceById(examSessionId);

    if (examSession.getOrganizer().getId() != organizer.getId()) {
      throw new AccessDeniedException(
        String.format("Exam session (%s) not related to organizer (%s)", examSessionId, oid)
      );
    }

    return updateExamSession(examSessionId, dto);
  }

  @Transactional
  public ClerkExamSessionDTO updateExamSession(final long examSessionId, final ClerkExamSessionUpdateDTO dto) {
    final ExamSession examSession = examSessionRepository.getReferenceById(examSessionId);

    if (dto.language() != null) {
      examSession.setLanguage(dto.language());
    }
    if (dto.level() != null) {
      examSession.setLevel(dto.level());
    }

    if (examSession.getType().equals(ExamSessionType.FULL)) {
      examSession.setStartTime(dto.startTime());
      examSession.setMaxParticipants(dto.maxParticipantsTotal());
    } else {
      examSession.setMaxParticipants(dto.maxParticipantsReadListen() + dto.maxParticipantsSpeakWrite());
      examSession.setMaxParticipantsSpeakWrite(dto.maxParticipantsSpeakWrite());
      examSession.setMaxParticipantsReadListen(dto.maxParticipantsReadListen());
      examSession.setStartTimeReadListen(dto.startTimeReadListen());
      examSession.setStartTimeSpeakWrite(dto.startTimeSpeakWrite());
    }

    if (dto.location() != null && !dto.location().isEmpty()) {
      examSession
        .getLocations()
        .forEach(loc -> {
          final var locDto = dto.location().stream().filter(l -> l.lang().equals(loc.getLang())).findFirst();

          if (locDto.isPresent()) {
            loc.setLang(locDto.get().lang());
            loc.setStreetAddress(locDto.get().streetAddress());
            loc.setZip(locDto.get().postalCode());
            loc.setPostOffice(locDto.get().city());
            loc.setOtherLocationInfo(locDto.get().otherLocationInfo());
            loc.setExtraInformation(locDto.get().extraInformation());
          }
        });
    }

    examSession.setContactName(dto.contactName());
    examSession.setContactEmail(dto.contactEmail());
    examSession.setContactPhoneNumber(dto.contactPhoneNumber());

    return getExamSession(examSessionId);
  }

  @Transactional
  public ClerkExamSessionDTO createExamSession(final ClerkExamSessionCreateDTO dto) {
    final ExamDate examDate = examDateRepository.getReferenceById(dto.examDateId());
    final Organizer organizer = organizerRepository
      .findByOidAndDeletedAtIsNull(dto.organizerOid())
      .orElseThrow(() -> new IllegalArgumentException("Organizer not found for oid: " + dto.organizerOid()));

    final ExamSession examSession = new ExamSession();
    examSession.setExamDate(examDate);
    examSession.setOrganizer(organizer);
    examSession.setOfficeOid(dto.officeOid());
    examSession.setLanguage(dto.language());
    examSession.setLevel(dto.level());
    examSession.setType(dto.type());
    if (dto.type().equals(ExamSessionType.FULL)) {
      examSession.setStartTime(dto.startTime());
      examSession.setMaxParticipants(dto.maxParticipantsTotal());
    } else {
      examSession.setMaxParticipants(dto.maxParticipantsSpeakWrite() + dto.maxParticipantsReadListen());
      examSession.setMaxParticipantsSpeakWrite(dto.maxParticipantsSpeakWrite());
      examSession.setMaxParticipantsReadListen(dto.maxParticipantsReadListen());
      examSession.setStartTimeReadListen(dto.startTimeReadListen());
      examSession.setStartTimeSpeakWrite(dto.startTimeSpeakWrite());
    }
    examSession.setContactName(dto.contactName());
    examSession.setContactEmail(dto.contactEmail());
    examSession.setContactPhoneNumber(dto.contactPhoneNumber());

    // TODO remove me, deply commit
    if (dto.location() != null) {
      for (final var locDto : dto.location()) {
        final ExamSessionLocation location = new ExamSessionLocation();
        location.setExamSession(examSession);
        location.setLang(locDto.lang() != null ? locDto.lang() : "fi");
        location.setStreetAddress(locDto.streetAddress());
        location.setZip(locDto.postalCode());
        location.setPostOffice(locDto.city());
        location.setName(locDto.name());
        location.setOtherLocationInfo(locDto.otherLocationInfo());
        location.setExtraInformation(locDto.extraInformation());
        examSession.getLocations().add(location);
      }
    }

    final ExamSession saved = examSessionRepository.save(examSession);
    auditService.logById(YkiOperation.CREATE_EXAM_SESSION, saved.getId());

    return toDTO(saved);
  }
}
