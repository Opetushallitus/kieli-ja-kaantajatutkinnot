package fi.oph.otr.service;

import fi.oph.otr.api.dto.clerk.MeetingDateDTO;
import fi.oph.otr.api.dto.clerk.modify.MeetingDateCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.MeetingDateUpdateDTO;
import fi.oph.otr.audit.AuditService;
import fi.oph.otr.audit.OtrOperation;
import fi.oph.otr.model.MeetingDate;
import fi.oph.otr.repository.MeetingDateRepository;
import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.util.List;
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
    auditService.logById(OtrOperation.CREATE_MEETING_DATE, meetingDate.getId());
    return result;
  }

  @Transactional
  public MeetingDateDTO updateMeetingDate(final MeetingDateUpdateDTO dto) {
    final MeetingDate meetingDate = meetingDateRepository.getReferenceById(dto.id());
    meetingDate.assertVersion(dto.version());

    if (!meetingDate.getQualifications().isEmpty()) {
      throw new APIException(APIExceptionType.MEETING_DATE_UPDATE_HAS_QUALIFICATIONS);
    }
    meetingDate.setDate(dto.date());

    try {
      meetingDateRepository.flush();
    } catch (DataIntegrityViolationException ex) {
      throw new APIException(APIExceptionType.MEETING_DATE_UPDATE_DUPLICATE_DATE);
    }

    final MeetingDateDTO result = toDTO(meetingDate);
    auditService.logById(OtrOperation.UPDATE_MEETING_DATE, meetingDate.getId());
    return result;
  }

  @Transactional
  public void deleteMeetingDate(final long meetingDateId) {
    final MeetingDate meetingDate = meetingDateRepository.getReferenceById(meetingDateId);

    // TODO: qualifications marked deleted block deletion of meeting date with those linked
    if (!meetingDate.getQualifications().isEmpty()) {
      throw new APIException(APIExceptionType.MEETING_DATE_DELETE_HAS_QUALIFICATIONS);
    }
    meetingDateRepository.deleteById(meetingDateId);

    auditService.logById(OtrOperation.DELETE_MEETING_DATE, meetingDateId);
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
