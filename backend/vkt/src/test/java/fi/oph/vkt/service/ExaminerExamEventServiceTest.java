package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.MunicipalityDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventUpsertDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.ExaminerExamEventRepository;
import fi.oph.vkt.repository.ExaminerRepository;
import fi.oph.vkt.service.onr.OnrService;
import fi.oph.vkt.service.onr.PersonalData;
import fi.oph.vkt.util.UUIDSource;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.view.ExamEventXlsxDataRowUtil;
import fi.oph.vkt.view.ExaminerExamEventXlsxData;
import fi.oph.vkt.view.ExaminerExamEventXlsxView;
import jakarta.annotation.Resource;
import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class ExaminerExamEventServiceTest {

  @Resource
  private ExaminerExamEventRepository examinerExamEventRepository;

  @Resource
  private ExaminerRepository examinerRepository;

  @MockBean
  private AuditService auditService;

  @MockBean
  private OnrService onrService;

  @Resource
  private TestEntityManager entityManager;

  private ExaminerExamEventService examinerExamEventService;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("app.base-url.api")).thenReturn("http://localhost");

    final UUIDSource uuidSource = mock(UUIDSource.class);
    when(uuidSource.getRandomNonce()).thenReturn("269a2da4-58bb-45eb-b125-522b77e9167c");

    examinerExamEventService =
      new ExaminerExamEventService(
        examinerExamEventRepository,
        environment,
        onrService,
        auditService,
        examinerRepository
      );
  }

  @Test
  public void testGetExamEvent() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);

    final ExaminerExamEventDTO dto = examinerExamEventService.getExamEvent(examiner.getOid(), examEvent.getId());

    assertEquals(examEvent.getId(), dto.id());
    assertEquals(examEvent.getVersion(), dto.version());
    assertEquals(examEvent.getLanguage(), dto.language());
    assertEquals(examEvent.getDate(), dto.date());
    assertEquals(examEvent.getLocation(), dto.location());
    assertEquals(examEvent.getExamTime(), dto.examTime());
    assertEquals(examEvent.getOtherInformation(), dto.otherInformation());
    assertEquals(examEvent.getRegistrationCloses(), dto.registrationCloses());
    assertEquals(examEvent.getMaxParticipants(), dto.maxParticipants());
  }

  @Test
  public void testGetExamEventOidMismatch() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);

    final APIException ex = assertThrows(
      APIException.class,
      () -> examinerExamEventService.getExamEvent("5.4.3.2.1", examEvent.getId())
    );

    assertEquals(APIExceptionType.EXAMINER_EXAM_EVENT_EXAMINER_MISMATCH, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testUpdate() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);

    examiner.setMunicipalities(List.of(municipality));

    entityManager.persist(municipality);
    entityManager.persist(examiner);
    entityManager.persist(examEvent);

    final ExaminerExamEventUpsertDTO dto = createUpdateDTOAddingOne(examEvent);
    final ExaminerExamEventDTO responseDTO = examinerExamEventService.updateExamEvent(
      examiner.getOid(),
      examEvent.getId(),
      dto
    );

    assertEquals(examEvent.getLocation(), "MordorX");
    assertEquals(responseDTO.id(), dto.id());
    assertEquals(responseDTO.language(), dto.language());
    assertEquals(responseDTO.date(), dto.date());
    assertEquals(responseDTO.location(), dto.location());
    assertEquals(responseDTO.examTime(), dto.examTime());
    assertEquals(responseDTO.otherInformation(), dto.otherInformation());
    assertEquals(responseDTO.registrationCloses(), dto.registrationCloses());
    assertEquals(responseDTO.maxParticipants(), dto.maxParticipants());
  }

  private ExaminerExamEventUpsertDTO createUpdateDTOAddingOne(final ExaminerExamEvent examEvent) {
    return ExaminerExamEventUpsertDTO
      .builder()
      .id(examEvent.getId())
      .date(examEvent.getDate())
      .examTime(examEvent.getExamTime() + "X")
      .isHidden(examEvent.isHidden())
      .location(examEvent.getLocation() + "X")
      .maxParticipants(examEvent.getMaxParticipants() + 1L)
      .registrationCloses(examEvent.getRegistrationCloses())
      .otherInformation(examEvent.getOtherInformation() + "X")
      .language(examEvent.getLanguage())
      .municipality(createMunicipalityDTO(examEvent.getMunicipality()))
      .build();
  }

  private MunicipalityDTO createMunicipalityDTO(final Municipality municipality) {
    return MunicipalityDTO.builder().code(municipality.getCode()).build();
  }

  @Test
  void testExcelRender() throws Exception {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final PersonalData personalData = Factory.personalData(person);
    final Map<String, PersonalData> personalDatas = Map.of(person.getOid(), personalData);
    final ExaminerExamEventXlsxData data = ExamEventXlsxDataRowUtil.createExcelData(
      examEvent,
      examEvent.getEnrollments(),
      personalDatas
    );
    final ExaminerExamEventXlsxView excelView = new ExaminerExamEventXlsxView(data);

    final MockHttpServletResponse response = new MockHttpServletResponse();
    final MockHttpServletRequest request = new MockHttpServletRequest();

    excelView.render(new HashMap<>(), request, response);

    try (final Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(response.getContentAsByteArray()))) {
      assertEquals(1, workbook.getNumberOfSheets());

      final Sheet sheet = workbook.getSheetAt(0);
      assertEquals(2, sheet.getPhysicalNumberOfRows());
      assertEquals(22, sheet.getRow(1).getPhysicalNumberOfCells());
      assertEquals("Tester", sheet.getRow(1).getCell(3).getStringCellValue());

      // Nordea demo SSN
      assertEquals("21.2.1981", sheet.getRow(1).getCell(5).getStringCellValue());
    }
  }
}
