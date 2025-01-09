package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.MunicipalityDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsUpsertDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.repository.*;
import fi.oph.vkt.service.onr.OnrService;
import fi.oph.vkt.util.UUIDSource;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class ExaminerDetailsServiceTest {

  @MockBean
  private MunicipalityService municipalityService;

  @Resource
  private EnrollmentAppointmentRepository enrollmentAppointmentRepository;

  @MockBean
  private OnrService onrService;

  @Resource
  private ExaminerRepository examinerRepository;

  @MockBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  private ExaminerDetailsService examinerDetailsService;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("app.base-url.api")).thenReturn("http://localhost");

    final UUIDSource uuidSource = mock(UUIDSource.class);
    when(uuidSource.getRandomNonce()).thenReturn("269a2da4-58bb-45eb-b125-522b77e9167c");

    examinerDetailsService =
      new ExaminerDetailsService(
        examinerRepository,
        enrollmentAppointmentRepository,
        municipalityService,
        onrService,
        auditService,
        environment
      );
  }

  @Test
  public void testGetExaminer() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);

    final ExaminerDetailsDTO dto = examinerDetailsService.getExaminer(examiner.getOid());

    assertEquals(examiner.getId(), dto.id());
    assertEquals(examiner.getVersion(), dto.version());
    assertEquals(examiner.getOid(), dto.oid());
    assertEquals(examiner.getEmail(), dto.email());
    assertEquals(examiner.getPhoneNumber(), dto.phoneNumber());
    assertEquals(examiner.getLastName(), dto.lastName());
    assertEquals(examiner.getFirstName(), dto.firstName());
    assertEquals(examiner.isExamLanguageFinnish(), dto.examLanguageFinnish());
    assertEquals(examiner.isExamLanguageSwedish(), dto.examLanguageSwedish());
    assertEquals(examiner.isPublic(), dto.isPublic());
  }

  @Test
  public void testUpsertExaminerOidMismatch() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);

    final ExaminerDetailsUpsertDTO dto = createExaminerDetailsUpsertDTO(examiner);
    final APIException ex = assertThrows(
      APIException.class,
      () -> examinerDetailsService.upsertExaminer("5.4.3.2.1", dto)
    );

    assertEquals(APIExceptionType.EXAMINER_ONR_NOT_FOUND, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  private ExaminerDetailsUpsertDTO createExaminerDetailsUpsertDTO(final Examiner examiner) {
    return ExaminerDetailsUpsertDTO
      .builder()
      .email(examiner.getEmail())
      .phoneNumber(examiner.getPhoneNumber())
      .examLanguageFinnish(examiner.isExamLanguageFinnish())
      .examLanguageSwedish(examiner.isExamLanguageSwedish())
      .municipalities(
        examiner.getMunicipalities().stream().map(ExaminerDetailsServiceTest::createMunicipalityDTO).toList()
      )
      .isPublic(examiner.isPublic())
      .build();
  }

  private static MunicipalityDTO createMunicipalityDTO(final Municipality municipality) {
    return MunicipalityDTO.builder().code(municipality.getCode()).build();
  }
}
