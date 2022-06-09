package fi.oph.akt.service;

import fi.oph.akt.api.dto.clerk.MeetingDateDTO;
import fi.oph.akt.api.dto.clerk.modify.MeetingDateCreateDTO;
import fi.oph.akt.api.dto.clerk.modify.MeetingDateUpdateDTO;
import fi.oph.akt.audit.AktOperation;
import fi.oph.akt.audit.AuditService;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.repository.MeetingDateRepository;
import fi.oph.akt.util.exception.APIException;
import fi.oph.akt.util.exception.APIExceptionType;
import java.util.List;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MeetingDateService {

  @Resource
  private final MeetingDateRepository meetingDateRepository;

  @Resource
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
    } catch (DataIntegrityViolationException ex) {
      throw new APIException(APIExceptionType.MEETING_DATE_CREATE_DUPLICATE_DATE);
    }

    final MeetingDateDTO result = toDTO(meetingDate);
    auditService.logById(AktOperation.CREATE_MEETING_DATE, meetingDate.getId());
    return result;
  }

  @Transactional
  public MeetingDateDTO updateMeetingDate(final MeetingDateUpdateDTO dto) {
    final MeetingDate meetingDate = meetingDateRepository.getReferenceById(dto.id());
    meetingDate.assertVersion(dto.version());

    if (!meetingDate.getAuthorisations().isEmpty()) {
      throw new APIException(APIExceptionType.MEETING_DATE_UPDATE_HAS_AUTHORISATIONS);
    }
    meetingDate.setDate(dto.date());

    try {
      meetingDateRepository.flush();
    } catch (DataIntegrityViolationException ex) {
      throw new APIException(APIExceptionType.MEETING_DATE_UPDATE_DUPLICATE_DATE);
    }

    final MeetingDateDTO result = toDTO(meetingDate);
    auditService.logById(AktOperation.UPDATE_MEETING_DATE, meetingDate.getId());
    return result;
  }

  @Transactional
  public void deleteMeetingDate(final long meetingDateId) {
    final MeetingDate meetingDate = meetingDateRepository.getReferenceById(meetingDateId);

    if (!meetingDate.getAuthorisations().isEmpty()) {
      throw new APIException(APIExceptionType.MEETING_DATE_DELETE_HAS_AUTHORISATIONS);
    }
    meetingDateRepository.deleteAllByIdInBatch(List.of(meetingDateId));

    auditService.logById(AktOperation.DELETE_MEETING_DATE, meetingDateId);
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
