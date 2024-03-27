package fi.oph.akr.service;

import fi.oph.akr.api.dto.clerk.MeetingDateDTO;
import fi.oph.akr.api.dto.clerk.modify.MeetingDateCreateDTO;
import fi.oph.akr.api.dto.clerk.modify.MeetingDateUpdateDTO;
import fi.oph.akr.audit.AkrOperation;
import fi.oph.akr.audit.AuditService;
import fi.oph.akr.audit.dto.MeetingDateAuditDTO;
import fi.oph.akr.model.MeetingDate;
import fi.oph.akr.repository.MeetingDateRepository;
import fi.oph.akr.util.exception.APIException;
import fi.oph.akr.util.exception.APIExceptionType;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MeetingDateService {

  private final MeetingDateRepository meetingDateRepository;
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public List<MeetingDateDTO> listMeetingDatesWithoutAudit() {
    return meetingDateRepository.findAllByOrderByDateDesc().stream().map(this::toDTO).toList();
  }

  @Transactional
  public MeetingDateDTO createMeetingDate(final MeetingDateCreateDTO dto) {
    final MeetingDate meetingDate = new MeetingDate();
    meetingDate.setDate(dto.date());

    try {
      meetingDateRepository.saveAndFlush(meetingDate);
    } catch (final DataIntegrityViolationException ex) {
      throw new APIException(APIExceptionType.MEETING_DATE_CREATE_DUPLICATE_DATE);
    }

    final MeetingDateDTO result = toDTO(meetingDate);
    auditService.logById(AkrOperation.CREATE_MEETING_DATE, meetingDate.getId());
    return result;
  }

  @Transactional
  public MeetingDateDTO updateMeetingDate(final MeetingDateUpdateDTO dto) {
    final MeetingDate meetingDate = meetingDateRepository.getReferenceById(dto.id());
    meetingDate.assertVersion(dto.version());
    final MeetingDateAuditDTO oldDate = new MeetingDateAuditDTO(meetingDate);

    if (!meetingDate.getAuthorisations().isEmpty()) {
      throw new APIException(APIExceptionType.MEETING_DATE_UPDATE_HAS_AUTHORISATIONS);
    }
    meetingDate.setDate(dto.date());

    try {
      meetingDateRepository.flush();
    } catch (final DataIntegrityViolationException ex) {
      throw new APIException(APIExceptionType.MEETING_DATE_UPDATE_DUPLICATE_DATE);
    }

    final MeetingDateAuditDTO newDate = new MeetingDateAuditDTO(meetingDate);
    final MeetingDateDTO result = toDTO(meetingDate);
    auditService.logUpdate(AkrOperation.UPDATE_MEETING_DATE, meetingDate.getId(), oldDate, newDate);
    return result;
  }

  @Transactional
  public void deleteMeetingDate(final long meetingDateId) {
    final MeetingDate meetingDate = meetingDateRepository.getReferenceById(meetingDateId);

    if (!meetingDate.getAuthorisations().isEmpty()) {
      throw new APIException(APIExceptionType.MEETING_DATE_DELETE_HAS_AUTHORISATIONS);
    }
    meetingDateRepository.deleteById(meetingDateId);

    auditService.logById(AkrOperation.DELETE_MEETING_DATE, meetingDateId);
  }

  private MeetingDateDTO toDTO(final MeetingDate meetingDate) {
    return MeetingDateDTO
      .builder()
      .id(meetingDate.getId())
      .version(meetingDate.getVersion())
      .date(meetingDate.getDate())
      .build();
  }
}
