package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkExamSessionContactDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionLocationDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.RegistrationUtil;
import java.util.List;

import fi.oph.yki.view.ExamSessionXlsxData;
import fi.oph.yki.view.ExamSessionXlsxDataRowUtil;
import fi.oph.yki.view.ExamSessionXlsxView;
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
    final List<ClerkExamSessionContactDTO> contactDTOS = examSession
      .getContact()
      .stream()
      .map(RegistrationUtil::createClerkExamSessionContactDTO)
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
      .contact(contactDTOS)
      .build();
  }

  @Transactional(readOnly = true)
  public AbstractXlsxView getExamSessionExcel(final long examSessionId) {
    final var examSession = examSessionRepository.getReferenceById(examSessionId);
    final var excelData = ExamSessionXlsxDataRowUtil.createExcelData(examSession);
    final var excel = new ExamSessionXlsxView(excelData);

    return excel;
  }
}
