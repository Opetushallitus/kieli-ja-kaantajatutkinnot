package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionLocationDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionUpdateDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.RegistrationUtil;
import fi.oph.yki.view.ExamSessionXlsxDataRowUtil;
import fi.oph.yki.view.ExamSessionXlsxView;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@RequiredArgsConstructor
@Service
public class ClerkExamSessionService {

  private final ExamSessionRepository examSessionRepository;
  private final RegistrationRepository registrationRepository;

  @Transactional(readOnly = true)
  public ClerkExamSessionDTO getExamSession(final Long examSessionId) {
    final ExamSession examSession = examSessionRepository.getReferenceById(examSessionId);
    final List<ClerkRegistrationDTO> registrationDTOs = registrationRepository
      .getByExamSession(examSession)
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
      .location(locationDTOS)
      .registrations(registrationDTOs)
      .date(examDate.getExamDate())
      .registrationStartDate(examDate.getRegistrationStartDate())
      .registrationEndDate(examDate.getRegistrationEndDate())
      .maxParticipants(examSession.getMaxParticipants())
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
  public ClerkExamSessionDTO updateExamSession(final long examSessionId, final ClerkExamSessionUpdateDTO dto) {
    final ExamSession examSession = examSessionRepository.getReferenceById(examSessionId);

    examSession.setLanguage(dto.language());
    examSession.setLevel(dto.level());
    examSession.setMaxParticipants(dto.maxParticipants());

    final var locations = examSession.getLocations();
    if (!locations.isEmpty()) {
      final var location = locations.get(0);
      location.setStreetAddress(dto.streetAddress());
      location.setZip(dto.zip());
      location.setPostOffice(dto.postOffice());
    }

    examSession.setContactName(dto.contactName());
    examSession.setContactEmail(dto.contactEmail());
    examSession.setContactPhoneNumber(dto.contactPhoneNumber());

    return getExamSession(examSessionId);
  }
}
