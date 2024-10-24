package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventCreateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventUpdateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPersonDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.audit.dto.ClerkExamEventAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.view.ExamEventXlsxData;
import fi.oph.vkt.view.ExamEventXlsxDataRowUtil;
import fi.oph.vkt.view.ExamEventXlsxView;
import jakarta.annotation.Resource;
import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.stream.IntStream;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@WithMockUser
@DataJpaTest
public class ClerkExamEventServiceTest {

  @Resource
  private ExamEventRepository examEventRepository;

  @MockBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  @Resource
  private EnrollmentRepository enrollmentRepository;

  private ClerkExamEventService clerkExamEventService;

  @BeforeEach
  public void setup() {
    clerkExamEventService = new ClerkExamEventService(examEventRepository, enrollmentRepository, auditService);
  }

  @Test
  public void testListExamEvents() {
    final LocalDateTime now = LocalDateTime.now();

    final ExamEvent pastEvent = Factory.examEvent();
    pastEvent.setDate(now.toLocalDate().minusWeeks(3));
    pastEvent.setRegistrationCloses(now.minusWeeks(4));

    final ExamEvent eventToday = Factory.examEvent(ExamLanguage.FI);
    eventToday.setDate(now.toLocalDate());

    final ExamEvent eventWithRegistrationClosed = Factory.examEvent();
    eventWithRegistrationClosed.setDate(now.toLocalDate().plusDays(3));
    eventWithRegistrationClosed.setRegistrationCloses(now.minusDays(1));

    final ExamEvent hiddenEvent = Factory.examEvent();
    hiddenEvent.setHidden(true);
    hiddenEvent.setDate(now.toLocalDate().plusWeeks(1));

    final ExamEvent upcomingEventSv = Factory.examEvent(ExamLanguage.SV);
    final ExamEvent upcomingEventFi = Factory.examEvent(ExamLanguage.FI);

    final ExamEvent futureEvent = Factory.examEvent(ExamLanguage.FI);
    futureEvent.setDate(now.toLocalDate().plusWeeks(3));
    futureEvent.setRegistrationCloses(now.plusWeeks(2));
    futureEvent.setMaxParticipants(3);

    entityManager.persist(pastEvent);
    entityManager.persist(eventToday);
    entityManager.persist(eventWithRegistrationClosed);
    entityManager.persist(hiddenEvent);
    entityManager.persist(upcomingEventSv);
    entityManager.persist(upcomingEventFi);
    entityManager.persist(futureEvent);

    createEnrollment(futureEvent, EnrollmentStatus.COMPLETED);
    createEnrollment(futureEvent, EnrollmentStatus.QUEUED);
    createEnrollment(futureEvent, EnrollmentStatus.AWAITING_PAYMENT);
    createEnrollment(futureEvent, EnrollmentStatus.CANCELED);

    final List<ClerkExamEventListDTO> examEventListDTOs = clerkExamEventService.list();
    assertEquals(7, examEventListDTOs.size());

    final List<ExamEvent> expectedExamEventsOrdered = List.of(
      pastEvent,
      eventToday,
      eventWithRegistrationClosed,
      hiddenEvent,
      upcomingEventFi,
      upcomingEventSv,
      futureEvent
    );
    assertCorrectOrdering(expectedExamEventsOrdered, examEventListDTOs);

    IntStream
      .range(0, expectedExamEventsOrdered.size())
      .forEach(i -> {
        final ExamEvent expected = expectedExamEventsOrdered.get(i);
        final ClerkExamEventListDTO dto = examEventListDTOs.get(i);

        assertExamEventListDTODetails(expected, dto);
        assertEquals(expected == futureEvent ? 2 : 0, dto.participants());
        assertEquals(expected == futureEvent, dto.isUnusedSeats());
        assertEquals(expected == hiddenEvent, dto.isHidden());
      });

    verify(auditService).logOperation(VktOperation.LIST_EXAM_EVENTS);
    verifyNoMoreInteractions(auditService);
  }

  private void createEnrollment(final ExamEvent examEvent, final EnrollmentStatus status) {
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setStatus(status);
    entityManager.persist(person);
    entityManager.persist(enrollment);
  }

  private void assertCorrectOrdering(
    final List<ExamEvent> expectedExamEventsOrdered,
    final List<ClerkExamEventListDTO> examEventsListDTOs
  ) {
    final List<Long> expectedOrdering = expectedExamEventsOrdered.stream().map(ExamEvent::getId).toList();
    final List<Long> actualOrdering = examEventsListDTOs.stream().map(ClerkExamEventListDTO::id).toList();

    assertEquals(expectedOrdering, actualOrdering);
  }

  private void assertExamEventListDTODetails(final ExamEvent expected, final ClerkExamEventListDTO examEventListDTO) {
    assertEquals(expected.getId(), examEventListDTO.id());
    assertEquals(expected.getLanguage(), examEventListDTO.language());
    assertEquals(expected.getLevel(), examEventListDTO.level());
    assertEquals(expected.getDate(), examEventListDTO.date());
    assertEquals(
      expected.getRegistrationCloses().truncatedTo(ChronoUnit.MINUTES),
      examEventListDTO.registrationCloses().truncatedTo(ChronoUnit.MINUTES)
    );
    assertEquals(
      expected.getRegistrationOpens().truncatedTo(ChronoUnit.MINUTES),
      examEventListDTO.registrationOpens().truncatedTo(ChronoUnit.MINUTES)
    );
    assertEquals(expected.getMaxParticipants(), examEventListDTO.maxParticipants());
  }

  @Test
  public void testGetExamEvent() {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setMaxParticipants(1);

    final Person person1 = Factory.person();
    final Person person2 = Factory.person();
    person2.setLastName("Aardvark");
    person2.setFirstName("Anna Hannah");

    final Enrollment enrollment1 = Factory.enrollment(examEvent, person1);
    enrollment1.setStreet("Katu 1");
    enrollment1.setPostalCode("00000");
    enrollment1.setTown("Kunta");
    enrollment1.setCountry("Maa");

    final Enrollment enrollment2 = createEnrollmentWithNonDefaultAttributes(enrollment1, examEvent, person2);
    enrollment2.setEmail("anna@aardvark");
    enrollment2.setPhoneNumber("+1999000");

    final ExamEvent otherExamEvent = Factory.examEvent(ExamLanguage.SV);
    final Enrollment otherEnrollment = Factory.enrollment(otherExamEvent, person1);

    entityManager.persist(examEvent);
    entityManager.persist(person1);
    entityManager.persist(person2);
    entityManager.persist(enrollment1);
    entityManager.persist(enrollment2);
    entityManager.persist(otherExamEvent);
    entityManager.persist(otherEnrollment);

    final ClerkExamEventDTO examEventDTO = clerkExamEventService.getExamEvent(examEvent.getId());
    assertEquals(examEvent.getId(), examEventDTO.id());
    assertEquals(examEvent.getVersion(), examEventDTO.version());
    assertEquals(examEvent.getLanguage(), examEventDTO.language());
    assertEquals(examEvent.getLevel(), examEventDTO.level());
    assertEquals(examEvent.getDate(), examEventDTO.date());
    assertEquals(examEvent.getRegistrationCloses(), examEventDTO.registrationCloses());
    assertEquals(examEvent.isHidden(), examEventDTO.isHidden());
    assertEquals(examEvent.getMaxParticipants(), examEventDTO.maxParticipants());

    assertEquals(2, examEventDTO.enrollments().size());
    assertEnrollmentDTO(enrollment1, examEventDTO.enrollments());
    assertEnrollmentDTO(enrollment2, examEventDTO.enrollments());

    verify(auditService).logById(VktOperation.GET_EXAM_EVENT, examEvent.getId());
    verifyNoMoreInteractions(auditService);
  }

  private Enrollment createEnrollmentWithNonDefaultAttributes(
    final Enrollment defaultEnrollment,
    final ExamEvent examEvent,
    final Person person
  ) {
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    enrollment.setOralSkill(!defaultEnrollment.isOralSkill());
    enrollment.setTextualSkill(!defaultEnrollment.isTextualSkill());
    enrollment.setUnderstandingSkill(!defaultEnrollment.isUnderstandingSkill());
    enrollment.setSpeakingPartialExam(!defaultEnrollment.isSpeakingPartialExam());
    enrollment.setSpeechComprehensionPartialExam(!defaultEnrollment.isSpeechComprehensionPartialExam());
    enrollment.setWritingPartialExam(!defaultEnrollment.isWritingPartialExam());
    enrollment.setReadingComprehensionPartialExam(!defaultEnrollment.isReadingComprehensionPartialExam());
    enrollment.setStatus(EnrollmentStatus.QUEUED);
    enrollment.setPreviousEnrollment(null);
    enrollment.setDigitalCertificateConsent(!defaultEnrollment.isDigitalCertificateConsent());

    return enrollment;
  }

  private void assertEnrollmentDTO(final Enrollment expected, final List<ClerkEnrollmentDTO> enrollmentDTOs) {
    final ClerkEnrollmentDTO enrollmentDTO = enrollmentDTOs
      .stream()
      .filter(dto -> dto.id().equals(expected.getId()))
      .findAny()
      .orElseThrow(() ->
        new RuntimeException("DTO not found for expected Enrollment. Something is wrong with the test.")
      );

    assertEquals(expected.getVersion(), enrollmentDTO.version());
    assertEquals(expected.getCreatedAt(), enrollmentDTO.enrollmentTime());
    assertEquals(expected.isOralSkill(), enrollmentDTO.oralSkill());
    assertEquals(expected.isTextualSkill(), enrollmentDTO.textualSkill());
    assertEquals(expected.isUnderstandingSkill(), enrollmentDTO.understandingSkill());
    assertEquals(expected.isSpeakingPartialExam(), enrollmentDTO.speakingPartialExam());
    assertEquals(expected.isSpeechComprehensionPartialExam(), enrollmentDTO.speechComprehensionPartialExam());
    assertEquals(expected.isWritingPartialExam(), enrollmentDTO.writingPartialExam());
    assertEquals(expected.isReadingComprehensionPartialExam(), enrollmentDTO.readingComprehensionPartialExam());
    assertEquals(expected.getStatus(), enrollmentDTO.status());
    assertEquals(expected.getPreviousEnrollment(), enrollmentDTO.previousEnrollment());
    assertEquals(expected.isDigitalCertificateConsent(), enrollmentDTO.digitalCertificateConsent());
    assertEquals(expected.getEmail(), enrollmentDTO.email());
    assertEquals(expected.getPhoneNumber(), enrollmentDTO.phoneNumber());
    assertEquals(expected.getStreet(), enrollmentDTO.street());
    assertEquals(expected.getPostalCode(), enrollmentDTO.postalCode());
    assertEquals(expected.getTown(), enrollmentDTO.town());
    assertEquals(expected.getCountry(), enrollmentDTO.country());

    assertPersonDTO(expected.getPerson(), enrollmentDTO.person());
    assertEquals(0, enrollmentDTO.payments().size());
  }

  private void assertPersonDTO(final Person expected, final ClerkPersonDTO personDTO) {
    assertEquals(expected.getId(), personDTO.id());
    assertEquals(expected.getVersion(), personDTO.version());
    assertEquals(expected.getLastName(), personDTO.lastName());
    assertEquals(expected.getFirstName(), personDTO.firstName());
  }

  @Test
  public void testCreateExamEvent() {
    final ClerkExamEventCreateDTO createDTO = ClerkExamEventCreateDTO
      .builder()
      .language(ExamLanguage.FI)
      .level(ExamLevel.EXCELLENT)
      .date(LocalDate.now().plusMonths(1))
      .registrationCloses(LocalDateTime.now().plusWeeks(1))
      .registrationOpens(LocalDateTime.now().plusDays(3))
      .isHidden(true)
      .maxParticipants(2L)
      .build();

    final ClerkExamEventDTO examEventDTO = clerkExamEventService.createExamEvent(createDTO);

    final List<ExamEvent> allExamEvents = examEventRepository.findAll();
    assertEquals(1, allExamEvents.size());

    final ExamEvent examEvent = allExamEvents.get(0);
    final ClerkExamEventAuditDTO auditDTO = ExamEventUtil.createExamEventAuditDTO(examEvent);

    assertEquals(examEvent.getId(), examEventDTO.id());
    assertEquals(examEvent.getVersion(), examEventDTO.version());
    assertEquals(createDTO.language(), examEvent.getLanguage());
    assertEquals(createDTO.level(), examEvent.getLevel());
    assertEquals(createDTO.date(), examEvent.getDate());
    assertEquals(createDTO.registrationCloses(), examEvent.getRegistrationCloses());
    assertEquals(createDTO.isHidden(), examEvent.isHidden());
    assertEquals(createDTO.maxParticipants(), examEvent.getMaxParticipants());

    assertEquals(0, examEventDTO.enrollments().size());

    verify(auditService).logCreate(VktOperation.CREATE_EXAM_EVENT, examEvent.getId(), auditDTO);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testCreateExamEventFailsOnDuplicate() {
    final ClerkExamEventCreateDTO.ClerkExamEventCreateDTOBuilder duplicateDTOBuilder = ClerkExamEventCreateDTO
      .builder()
      .language(ExamLanguage.FI)
      .level(ExamLevel.EXCELLENT)
      .date(LocalDate.now().plusMonths(1));

    clerkExamEventService.createExamEvent(
      duplicateDTOBuilder
        .registrationCloses(LocalDateTime.now().plusWeeks(1))
        .registrationOpens(LocalDateTime.now().plusDays(3))
        .isHidden(true)
        .maxParticipants(2L)
        .build()
    );
    reset(auditService);

    final APIException ex = assertThrows(
      APIException.class,
      () ->
        clerkExamEventService.createExamEvent(
          duplicateDTOBuilder.registrationCloses(LocalDateTime.now()).isHidden(false).maxParticipants(3L).build()
        )
    );
    assertEquals(APIExceptionType.EXAM_EVENT_DUPLICATE, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testUpdateExamEvent() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    // fetch dto for enrollment comparison and reset auditService
    final ClerkExamEventDTO originalResponse = clerkExamEventService.getExamEvent(examEvent.getId());
    final ClerkExamEventAuditDTO oldExamEventDto = ExamEventUtil.createExamEventAuditDTO(examEvent);
    reset(auditService);

    final ClerkExamEventUpdateDTO updateDTO = createUpdateDTOAddingOne(examEvent).build();
    final ClerkExamEventDTO response = clerkExamEventService.updateExamEvent(updateDTO);

    assertEquals(updateDTO.id(), response.id());
    assertEquals(updateDTO.version() + 1, response.version());
    assertEquals(updateDTO.language(), response.language());
    assertEquals(updateDTO.level(), response.level());
    assertEquals(updateDTO.date(), response.date());
    assertEquals(updateDTO.registrationCloses(), response.registrationCloses());
    assertEquals(updateDTO.isHidden(), response.isHidden());
    assertEquals(updateDTO.maxParticipants(), response.maxParticipants());

    assertEquals(originalResponse.enrollments(), response.enrollments());

    final ClerkExamEventAuditDTO newExamEventDto = ExamEventUtil.createExamEventAuditDTO(examEvent);
    verify(auditService).logUpdate(VktOperation.UPDATE_EXAM_EVENT, examEvent.getId(), oldExamEventDto, newExamEventDto);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testUpdateExamEventFailsOnDuplicate() {
    final ExamEvent examEvent = Factory.examEvent();
    final ExamEvent examEvent2 = Factory.examEvent();
    examEvent2.setDate(examEvent2.getDate().plusDays(1));
    examEvent2.setLanguage(ExamLanguage.SV);
    entityManager.persist(examEvent);
    entityManager.persist(examEvent2);

    // Trying to update examEvent to be duplicate with examEvent2
    final ClerkExamEventUpdateDTO updateDTO = createUpdateDTOAddingOne(examEvent).build();
    final APIException ex = assertThrows(APIException.class, () -> clerkExamEventService.updateExamEvent(updateDTO));

    assertEquals(APIExceptionType.EXAM_EVENT_DUPLICATE, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  private static ClerkExamEventUpdateDTO.ClerkExamEventUpdateDTOBuilder createUpdateDTOAddingOne(
    final ExamEvent examEvent
  ) {
    return ClerkExamEventUpdateDTO
      .builder()
      .id(examEvent.getId())
      .version(examEvent.getVersion())
      .language(examEvent.getLanguage() == ExamLanguage.FI ? ExamLanguage.SV : ExamLanguage.FI)
      .level(examEvent.getLevel())
      .date(examEvent.getDate().plusDays(1))
      .registrationCloses(examEvent.getRegistrationCloses().plusDays(1))
      .registrationOpens(examEvent.getRegistrationOpens().plusDays(1))
      .isHidden(!examEvent.isHidden())
      .maxParticipants(examEvent.getMaxParticipants() + 1);
  }

  @Test
  public void testGetExamEventExcel() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final AbstractXlsxView excel = clerkExamEventService.getExamEventExcel(examEvent.getId());
    assertNotNull(excel);

    verify(auditService).logById(VktOperation.GET_EXAM_EVENT_EXCEL, examEvent.getId());
  }

  @Test
  void testExcelRender() throws Exception {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ExamEventXlsxData data = ExamEventXlsxDataRowUtil.createExcelData(examEvent, examEvent.getEnrollments());
    final ExamEventXlsxView excelView = new ExamEventXlsxView(data);

    final MockHttpServletResponse response = new MockHttpServletResponse();
    final MockHttpServletRequest request = new MockHttpServletRequest();

    excelView.render(new HashMap<>(), request, response);

    try (final Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(response.getContentAsByteArray()))) {
      assertEquals(1, workbook.getNumberOfSheets());

      final Sheet sheet = workbook.getSheetAt(0);
      assertEquals(2, sheet.getPhysicalNumberOfRows());
      assertEquals(29, sheet.getRow(1).getPhysicalNumberOfCells());
      assertEquals("Tester", sheet.getRow(1).getCell(3).getStringCellValue());
    }
  }
}
