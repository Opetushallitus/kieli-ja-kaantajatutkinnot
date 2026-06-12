package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkOrganizerCreateDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerExamSessionContactDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerExamSessionLocationDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerLanguageDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamLanguage;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.OrganizerRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ClerkOrganizerService {

  private final OrganizerRepository organizerRepository;
  private final ExamSessionRepository examSessionRepository;

  @Transactional(readOnly = true)
  public List<ClerkOrganizerDTO> getOrganizers() {
    return organizerRepository.findAllByDeletedAtIsNull().stream().map(this::toDTO).toList();
  }

  @Transactional(readOnly = true)
  public List<ClerkOrganizerDTO> getOrganizers(final List<String> oids) {
    return organizerRepository.findAllByOidInAndDeletedAtIsNull(oids).stream().map(this::toDTO).toList();
  }

  @Transactional
  public ClerkOrganizerDTO createOrganizer(final ClerkOrganizerCreateDTO dto) {
    final Organizer organizer = new Organizer();
    organizer.setOid(dto.oid());
    organizer.setAgreementStartDate(dto.agreementStartDate());
    organizer.setAgreementEndDate(dto.agreementEndDate());
    organizer.setContactName(dto.contactName());
    organizer.setContactEmail(dto.contactEmail());
    organizer.setContactPhoneNumber(dto.contactPhoneNumber());
    organizer.setExtra(dto.extra());

    final Organizer saved = organizerRepository.save(organizer);

    if (dto.languages() != null) {
      for (final var langDto : dto.languages()) {
        final ExamLanguage lang = new ExamLanguage();
        lang.setOrganizer(saved);
        lang.setLanguageCode(langDto.languageCode());
        lang.setLevelCode(langDto.levelCode());
        saved.getLanguages().add(lang);
      }
      organizerRepository.save(saved);
    }

    return toDTO(saved);
  }

  @Transactional(readOnly = true)
  public List<ClerkOrganizerExamSessionDTO> getExamSessionsByOrganizerOid(final String oid, final LocalDate from) {
    final Organizer organizer = organizerRepository.findByOidAndDeletedAtIsNull(oid).orElseThrow();
    final List<ExamSession> examSessions = from != null
      ? examSessionRepository.findByOrganizerAndExamDateFrom(organizer, from)
      : examSessionRepository.findByOrganizer(organizer);

    return examSessionRepository
      .findByExamSessionsWithLocation(examSessions)
      .stream()
      .map(this::toExamSessionDTO)
      .toList();
  }

  public List<ClerkOrganizerExamSessionDTO> getExamSessionsByOrganizerOid(final String oid) {
    return examSessionRepository.findByOrganizerOid_Oid(oid).stream().map(this::toExamSessionDTO).toList();
  }

  private ClerkOrganizerExamSessionDTO toExamSessionDTO(final ExamSession examSession) {
    final ExamDate examDate = examSession.getExamDate();
    final Organizer organizer = examSession.getOrganizer();

    final List<ClerkOrganizerExamSessionLocationDTO> locations = examSession
      .getLocations()
      .stream()
      .map(loc ->
        ClerkOrganizerExamSessionLocationDTO
          .builder()
          .lang(loc.getLang())
          .extraInformation(loc.getExtraInformation())
          .name(loc.getName())
          .otherLocationInfo(loc.getOtherLocationInfo())
          .streetAddress(loc.getStreetAddress())
          .postOffice(loc.getPostOffice())
          .zip(loc.getZip())
          .build()
      )
      .toList();

    final ClerkOrganizerExamSessionContactDTO contact = ClerkOrganizerExamSessionContactDTO
      .builder()
      .name(examSession.getContactName())
      .email(examSession.getContactEmail())
      .phoneNumber(examSession.getContactPhoneNumber())
      .build();

    final long participants = examSession
      .getRegistrations()
      .stream()
      .filter(r -> r.getState() == RegistrationState.COMPLETED || r.getState() == RegistrationState.SUBMITTED)
      .filter(r -> r.getKind() == RegistrationKind.ADMISSION)
      .count();

    final long queue = examSession
      .getRegistrations()
      .stream()
      .filter(r -> r.getState() == RegistrationState.COMPLETED || r.getState() == RegistrationState.SUBMITTED)
      .filter(r -> r.getKind() == RegistrationKind.QUEUE)
      .count();

    final boolean isFull = participants >= examSession.getMaxParticipants();
    final RegistrationKind availableKind = isFull ? RegistrationKind.QUEUE : RegistrationKind.ADMISSION;

    return ClerkOrganizerExamSessionDTO
      .builder()
      .id(examSession.getId())
      .levelCode(examSession.getLevel())
      .languageCode(examSession.getLanguage())
      .open(examSession.getPublishedAt() != null)
      .upcomingAdmission(examSession.getPublishedAt() != null)
      .participants((int) participants)
      .maxParticipants(examSession.getMaxParticipants())
      .queue((int) queue)
      .contact(List.of(contact))
      .officeOid(examSession.getOfficeOid())
      .publishedAt(examSession.getPublishedAt() != null ? examSession.getPublishedAt().toString() : null)
      .sessionDate(examDate.getExamDate())
      .organizerOid(organizer != null ? organizer.getOid() : null)
      .registrationStartDate(examDate.getRegistrationStartDate())
      .registrationEndDate(examDate.getRegistrationEndDate())
      .location(locations)
      .examFee(null)
      .availableRegistrationKind(availableKind)
      .build();
  }

  private ClerkOrganizerDTO toDTO(final Organizer organizer) {
    final List<ClerkOrganizerLanguageDTO> languages = organizer.getLanguages().isEmpty()
      ? null
      : organizer
        .getLanguages()
        .stream()
        .map(lang ->
          ClerkOrganizerLanguageDTO
            .builder()
            .languageCode(lang.getLanguageCode())
            .levelCode(lang.getLevelCode())
            .build()
        )
        .toList();

    return ClerkOrganizerDTO
      .builder()
      .id(organizer.getId())
      .oid(organizer.getOid())
      .agreementStartDate(organizer.getAgreementStartDate())
      .agreementEndDate(organizer.getAgreementEndDate())
      .contactName(organizer.getContactName())
      .contactEmail(organizer.getContactEmail())
      .contactPhoneNumber(organizer.getContactPhoneNumber())
      .languages(languages)
      .extra(organizer.getExtra())
      .build();
  }
}
