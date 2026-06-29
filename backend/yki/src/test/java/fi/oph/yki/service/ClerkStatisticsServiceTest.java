package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.when;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.clerk.ClerkStatisticsRequestDTO;
import fi.oph.yki.api.dto.clerk.ClerkStatisticsRowDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class ClerkStatisticsServiceTest {

  private static final String ORGANIZER_OID = "1.2.246.562.10.00000000001";
  private static final String ORGANIZER_NAME = "Testiorganisaatio";

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private TestEntityManager testEntityManager;

  @MockitoBean
  private OrganizationService organizationService;

  private ClerkStatisticsService clerkStatisticsService;

  @BeforeEach
  public void setup() {
    clerkStatisticsService = new ClerkStatisticsService(registrationRepository, organizationService);
    when(organizationService.getOrganizationNames(anyCollection())).thenReturn(Map.of(ORGANIZER_OID, ORGANIZER_NAME));
  }

  @Test
  public void testHappyPath() {
    final Organizer organizer = Factory.organizer();
    testEntityManager.persist(organizer);

    final ExamDate examDate = Factory.examDate();
    testEntityManager.persist(examDate);

    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setOrganizer(organizer);
    testEntityManager.persist(examSession);

    final ExamSessionLocation location = Factory.examSessionLocation(examSession);
    testEntityManager.persist(location);

    final Person person = Factory.person();
    testEntityManager.persist(person);

    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(RegistrationState.COMPLETED);
    testEntityManager.persist(registration);

    testEntityManager.flush();
    testEntityManager.clear();

    final ClerkStatisticsRequestDTO request = ClerkStatisticsRequestDTO
      .builder()
      .from(LocalDate.of(2026, 6, 1))
      .to(LocalDate.of(2026, 6, 30))
      .build();

    final List<ClerkStatisticsRowDTO> result = clerkStatisticsService.getStatistics(request);

    assertEquals(1, result.size());
    final ClerkStatisticsRowDTO row = result.get(0);
    assertEquals(ORGANIZER_NAME, row.organizer());
    assertEquals(LocalDate.of(2026, 6, 15), row.examDate());
    assertEquals("suomi", row.examLanguage());
    assertEquals("Perustaso", row.examLevel());
    assertEquals("COMPLETED", row.registrationState());
    assertEquals("Helsinki", row.municipality());
  }

  @Test
  public void testDateRangeExcludesOutsideRegistration() {
    final Organizer organizer = Factory.organizer();
    testEntityManager.persist(organizer);

    final ExamDate examDate = Factory.examDate(); // 2026-06-15
    testEntityManager.persist(examDate);

    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setOrganizer(organizer);
    testEntityManager.persist(examSession);

    final Person person = Factory.person();
    testEntityManager.persist(person);

    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    testEntityManager.persist(registration);

    testEntityManager.flush();
    testEntityManager.clear();

    final ClerkStatisticsRequestDTO request = ClerkStatisticsRequestDTO
      .builder()
      .from(LocalDate.of(2026, 7, 1))
      .to(LocalDate.of(2026, 7, 31))
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkStatisticsService.getStatistics(request));
    assertEquals(APIExceptionType.STATISTICS_EMPTY_RESULT, ex.getExceptionType());
  }

  @Test
  public void testMunicipalityIlike() {
    final Organizer organizer = Factory.organizer();
    testEntityManager.persist(organizer);

    final ExamDate examDate = Factory.examDate();
    testEntityManager.persist(examDate);

    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setOrganizer(organizer);
    testEntityManager.persist(examSession);

    final ExamSessionLocation location = Factory.examSessionLocation(examSession);
    testEntityManager.persist(location);

    final Person person = Factory.person();
    testEntityManager.persist(person);

    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(RegistrationState.COMPLETED);
    testEntityManager.persist(registration);

    testEntityManager.flush();
    testEntityManager.clear();

    final LocalDate from = LocalDate.of(2026, 6, 1);
    final LocalDate to = LocalDate.of(2026, 6, 30);

    assertEquals(
      1,
      clerkStatisticsService
        .getStatistics(ClerkStatisticsRequestDTO.builder().from(from).to(to).municipality("Hel").build())
        .size()
    );

    assertEquals(
      1,
      clerkStatisticsService
        .getStatistics(ClerkStatisticsRequestDTO.builder().from(from).to(to).municipality("hElSiNkI").build())
        .size()
    );

    final APIException ex = assertThrows(
      APIException.class,
      () ->
        clerkStatisticsService.getStatistics(
          ClerkStatisticsRequestDTO.builder().from(from).to(to).municipality("Tampere").build()
        )
    );
    assertEquals(APIExceptionType.STATISTICS_EMPTY_RESULT, ex.getExceptionType());

    assertEquals(
      1,
      clerkStatisticsService.getStatistics(ClerkStatisticsRequestDTO.builder().from(from).to(to).build()).size()
    );
  }

  @Test
  public void testOrganizerPostFilter() {
    final String OID_A = "1.2.246.562.10.00000000001";
    final String OID_B = "1.2.246.562.10.00000000002";

    final Organizer organizerA = Factory.organizer();
    testEntityManager.persist(organizerA);

    final Organizer organizerB = Factory.organizer();
    organizerB.setOid(OID_B);
    testEntityManager.persist(organizerB);

    final ExamDate examDate = Factory.examDate();
    testEntityManager.persist(examDate);

    final ExamSession sessionA = Factory.examSession(examDate);
    sessionA.setOrganizer(organizerA);
    testEntityManager.persist(sessionA);

    final ExamSession sessionB = Factory.examSession(examDate);
    sessionB.setOrganizer(organizerB);
    testEntityManager.persist(sessionB);

    final Person person1 = Factory.person();
    testEntityManager.persist(person1);

    final Person person2 = Factory.person();
    person2.setOid("1.2.3.4.6");
    testEntityManager.persist(person2);

    final Registration reg1 = Factory.registration(person1);
    reg1.setExamSession(sessionA);
    testEntityManager.persist(reg1);

    final Registration reg2 = Factory.registration(person2);
    reg2.setExamSession(sessionB);
    testEntityManager.persist(reg2);

    testEntityManager.flush();
    testEntityManager.clear();

    when(organizationService.getOrganizationNames(anyCollection()))
      .thenReturn(Map.of(OID_A, "Järjestäjä A", OID_B, "Järjestäjä B"));

    final LocalDate from = LocalDate.of(2026, 6, 1);
    final LocalDate to = LocalDate.of(2026, 6, 30);

    assertEquals(
      2,
      clerkStatisticsService.getStatistics(ClerkStatisticsRequestDTO.builder().from(from).to(to).build()).size()
    );

    final List<ClerkStatisticsRowDTO> byA = clerkStatisticsService.getStatistics(
      ClerkStatisticsRequestDTO.builder().from(from).to(to).organizers(List.of(OID_A)).build()
    );
    assertEquals(1, byA.size());
    assertEquals("Järjestäjä A", byA.get(0).organizer());

    final List<ClerkStatisticsRowDTO> byB = clerkStatisticsService.getStatistics(
      ClerkStatisticsRequestDTO.builder().from(from).to(to).organizers(List.of(OID_B)).build()
    );
    assertEquals(1, byB.size());
    assertEquals("Järjestäjä B", byB.get(0).organizer());

    assertEquals(
      2,
      clerkStatisticsService
        .getStatistics(ClerkStatisticsRequestDTO.builder().from(from).to(to).organizers(List.of(OID_A, OID_B)).build())
        .size()
    );
  }

  @Test
  public void testNullAndEmptyFilterListsReturnAll() {
    final Organizer organizer = Factory.organizer();
    testEntityManager.persist(organizer);

    final ExamDate examDate = Factory.examDate();
    testEntityManager.persist(examDate);

    final ExamSession sessionFin = Factory.examSession(examDate);
    sessionFin.setOrganizer(organizer);
    testEntityManager.persist(sessionFin);

    final ExamSession sessionSwe = Factory.examSession(examDate);
    sessionSwe.setLanguage("swe");
    sessionSwe.setLevel("KESKI");
    sessionSwe.setOrganizer(organizer);
    testEntityManager.persist(sessionSwe);

    final Person person1 = Factory.person();
    testEntityManager.persist(person1);

    final Person person2 = Factory.person();
    person2.setOid("1.2.3.4.6");
    testEntityManager.persist(person2);

    final Registration reg1 = Factory.registration(person1);
    reg1.setExamSession(sessionFin);
    testEntityManager.persist(reg1);

    final Registration reg2 = Factory.registration(person2);
    reg2.setExamSession(sessionSwe);
    testEntityManager.persist(reg2);

    testEntityManager.flush();
    testEntityManager.clear();

    final LocalDate from = LocalDate.of(2026, 6, 1);
    final LocalDate to = LocalDate.of(2026, 6, 30);

    final List<ClerkStatisticsRowDTO> withNulls = clerkStatisticsService.getStatistics(
      ClerkStatisticsRequestDTO.builder().from(from).to(to).build()
    );
    assertEquals(2, withNulls.size());

    final List<ClerkStatisticsRowDTO> withEmpty = clerkStatisticsService.getStatistics(
      ClerkStatisticsRequestDTO
        .builder()
        .from(from)
        .to(to)
        .languages(List.of())
        .levels(List.of())
        .states(List.of())
        .build()
    );
    assertEquals(2, withEmpty.size());
  }
}
