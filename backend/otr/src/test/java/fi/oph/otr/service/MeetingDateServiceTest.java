package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import fi.oph.otr.Factory;
import fi.oph.otr.api.dto.clerk.MeetingDateDTO;
import fi.oph.otr.api.dto.clerk.modify.MeetingDateCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.MeetingDateUpdateDTO;
import fi.oph.otr.audit.AuditService;
import fi.oph.otr.audit.OtrOperation;
import fi.oph.otr.audit.dto.MeetingDateAuditDTO;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.MeetingDate;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.repository.MeetingDateRepository;
import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class MeetingDateServiceTest {

  private MeetingDateService meetingDateService;

  @Resource
  private MeetingDateRepository meetingDateRepository;

  @MockBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  @BeforeEach
  public void setup() {
    meetingDateService = new MeetingDateService(meetingDateRepository, auditService);
  }

  @Test
  public void testMeetingDateList() {
    final MeetingDate meetingDate1 = Factory.meetingDate(LocalDate.of(2020, 1, 1));
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.of(2020, 9, 6));
    entityManager.persist(meetingDate1);
    entityManager.persist(meetingDate2);

    final List<MeetingDateDTO> meetingDateDTOS = meetingDateService.listMeetingDatesWithoutAudit();
    assertEquals(2, meetingDateDTOS.size());

    assertEquals(meetingDate2.getId(), meetingDateDTOS.get(0).id());
    assertEquals(meetingDate2.getDate(), meetingDateDTOS.get(0).date());
    assertEquals(meetingDate1.getId(), meetingDateDTOS.get(1).id());
    assertEquals(meetingDate1.getDate(), meetingDateDTOS.get(1).date());

    verifyNoInteractions(auditService);
  }

  @Test
  public void testMeetingDateCreate() {
    final MeetingDateCreateDTO dto = MeetingDateCreateDTO.builder().date(LocalDate.now()).build();

    final MeetingDateDTO response = meetingDateService.createMeetingDate(dto);
    final MeetingDateAuditDTO auditDTO = new MeetingDateAuditDTO(response);
    assertEquals(dto.date(), response.date());

    final List<MeetingDate> allMeetingDates = meetingDateRepository.findAll();
    assertEquals(1, allMeetingDates.size());
    assertEquals(response.id(), allMeetingDates.get(0).getId());
    assertEquals(response.date(), allMeetingDates.get(0).getDate());

    verify(auditService).logCreate(OtrOperation.CREATE_MEETING_DATE, response.id(), auditDTO);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testMeetingDateCreateThrowsAPIExceptionForDuplicateMeetingDate() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    final MeetingDateCreateDTO dto = MeetingDateCreateDTO.builder().date(meetingDate.getDate()).build();

    final APIException ex = assertThrows(APIException.class, () -> meetingDateService.createMeetingDate(dto));

    assertEquals(APIExceptionType.MEETING_DATE_CREATE_DUPLICATE_DATE, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testMeetingDateUpdate() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);
    final MeetingDateAuditDTO oldAuditDto = new MeetingDateAuditDTO(meetingDate);

    final MeetingDateUpdateDTO updateDTO = MeetingDateUpdateDTO
      .builder()
      .id(meetingDate.getId())
      .version(meetingDate.getVersion())
      .date(meetingDate.getDate().plusDays(1))
      .build();

    final MeetingDateDTO response = meetingDateService.updateMeetingDate(updateDTO);
    final MeetingDateAuditDTO newAuditDto = new MeetingDateAuditDTO(response);

    assertEquals(updateDTO.id(), response.id());
    assertEquals(updateDTO.version() + 1, response.version());
    assertEquals(updateDTO.date(), response.date());

    verify(auditService).logUpdate(OtrOperation.UPDATE_MEETING_DATE, response.id(), oldAuditDto, newAuditDto);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testMeetingDateUpdateThrowsAPIExceptionForMeetingDateWithQualifications() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(interpreter);
    entityManager.persist(qualification);

    final MeetingDateUpdateDTO updateDTO = MeetingDateUpdateDTO
      .builder()
      .id(meetingDate.getId())
      .version(meetingDate.getVersion())
      .date(meetingDate.getDate().plusDays(1))
      .build();

    final APIException ex = assertThrows(APIException.class, () -> meetingDateService.updateMeetingDate(updateDTO));

    assertEquals(APIExceptionType.MEETING_DATE_UPDATE_HAS_QUALIFICATIONS, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testMeetingDateUpdateThrowsAPIExceptionForDuplicateMeetingDate() {
    final MeetingDate meetingDate1 = Factory.meetingDate(LocalDate.now().minusDays(1));
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.now());

    entityManager.persist(meetingDate1);
    entityManager.persist(meetingDate2);

    final MeetingDateUpdateDTO updateDTO = MeetingDateUpdateDTO
      .builder()
      .id(meetingDate1.getId())
      .version(meetingDate1.getVersion())
      .date(meetingDate2.getDate())
      .build();

    final APIException ex = assertThrows(APIException.class, () -> meetingDateService.updateMeetingDate(updateDTO));

    assertEquals(APIExceptionType.MEETING_DATE_UPDATE_DUPLICATE_DATE, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testMeetingDateDelete() {
    final MeetingDate meetingDate1 = Factory.meetingDate(LocalDate.now());
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.now().plusDays(1));

    entityManager.persist(meetingDate1);
    entityManager.persist(meetingDate2);

    final long id = meetingDate1.getId();
    meetingDateService.deleteMeetingDate(id);

    assertEquals(
      Set.of(meetingDate2.getId()),
      meetingDateRepository.findAll().stream().map(MeetingDate::getId).collect(Collectors.toSet())
    );

    verify(auditService).logById(OtrOperation.DELETE_MEETING_DATE, id);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testMeetingDateDeleteThrowsAPIExceptionForMeetingDateWithQualifications() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(interpreter);
    entityManager.persist(qualification);

    final APIException ex = assertThrows(
      APIException.class,
      () -> meetingDateService.deleteMeetingDate(meetingDate.getId())
    );

    assertEquals(APIExceptionType.MEETING_DATE_DELETE_HAS_QUALIFICATIONS, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }
}
