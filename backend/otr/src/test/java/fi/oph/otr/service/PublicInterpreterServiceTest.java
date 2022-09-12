package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import fi.oph.otr.Factory;
import fi.oph.otr.api.dto.InterpreterDTO;
import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.MeetingDate;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.model.Region;
import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.model.PersonalData;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.repository.RegionRepository;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Supplier;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class PublicInterpreterServiceTest {

  @Resource
  private InterpreterRepository interpreterRepository;

  @Resource
  private QualificationRepository qualificationRepository;

  @Resource
  private RegionRepository regionRepository;

  @MockBean
  private OnrService onrService;

  @Resource
  private TestEntityManager entityManager;

  private PublicInterpreterService publicInterpreterService;

  @BeforeEach
  public void setup() {
    publicInterpreterService =
      new PublicInterpreterService(interpreterRepository, qualificationRepository, regionRepository, onrService);

    when(onrService.getCachedPersonalDatas())
      .thenReturn(
        Map.of(
          "1",
          PersonalData
            .builder()
            .lastName("Hannonen")
            .firstName("Iiro Aapeli")
            .nickName("Iiro")
            .identityNumber("1")
            .email("iiro.hannonen@example.invalid")
            .phoneNumber("+3581234567")
            .build(),
          "2",
          PersonalData
            .builder()
            .lastName("Heinänen")
            .firstName("Ella Marja")
            .nickName("Ella")
            .identityNumber("2")
            .email("ella.heinanen@example.invalid")
            .phoneNumber("+3582345678")
            .build(),
          "3",
          PersonalData
            .builder()
            .lastName("Heinänen")
            .firstName("Tapani Urho")
            .nickName("Urho")
            .identityNumber("3")
            .email("urho.heinanen@example.invalid")
            .phoneNumber("+3583456789")
            .build()
        )
      );
  }

  @Test
  public void testOnlyPublishingPermittedAreReturned() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate nextWeek = tomorrow.plusDays(7);
    final LocalDate previousWeek = today.minusDays(7);
    final LocalDate yesterday = today.minusDays(1);

    final Interpreter interpreter1 = createInterpreter("1");
    final Interpreter interpreter2 = createInterpreter("2");
    final Interpreter interpreter3 = createInterpreter("3");
    final Interpreter interpreter4 = createInterpreter("4");
    final Interpreter interpreter5 = createInterpreterDeleted();
    final Interpreter interpreter6 = createInterpreter("6");

    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    interpreter1.setPermissionToPublishEmail(false);
    interpreter1.setPermissionToPublishOtherContactInfo(true);
    interpreter1.setOtherContactInformation("oikeustulkki.company@invalid");
    interpreter2.setPermissionToPublishPhone(false);

    createRegion(interpreter2, "01");
    createRegion(interpreter2, "02");
    createRegion(interpreter3, "03");

    final Qualification qualification11 = createQualification(
      interpreter1,
      meetingDate,
      "FI",
      "EN",
      today,
      tomorrow,
      true
    );
    final Qualification qualification12 = createQualification(
      interpreter1,
      meetingDate,
      "FI",
      "NO",
      yesterday,
      today,
      true
    );
    final Qualification qualification21 = createQualification(
      interpreter2,
      meetingDate,
      "FI",
      "SE",
      yesterday,
      nextWeek,
      true
    );

    // Hidden, duplicate of qualification 21
    createQualification(interpreter2, meetingDate, "FI", "SE", yesterday, nextWeek, true);
    // Hidden, no publish permission
    createQualification(interpreter3, meetingDate, "FI", "RU", yesterday, nextWeek, false);
    // Hidden, in past
    createQualification(interpreter4, meetingDate, "FI", "IT", previousWeek, yesterday, true);
    // Hidden, in future
    createQualification(interpreter4, meetingDate, "FI", "DN", tomorrow, nextWeek, true);
    // Hidden, interpreter marked deleted
    createQualification(interpreter5, meetingDate, "FI", "DE", yesterday, nextWeek, true);
    // Hidden, deleted
    createQualificationDeleted(interpreter6, meetingDate, "FI", "FR", yesterday, nextWeek, true);

    final List<InterpreterDTO> interpreters = publicInterpreterService
      .list()
      .stream()
      .sorted(Comparator.comparing(InterpreterDTO::lastName))
      .toList();
    assertEquals(2, interpreters.size());

    final InterpreterDTO publishedInterpreter1 = interpreters.get(0);
    assertEquals(interpreter1.getId(), publishedInterpreter1.id());
    assertEquals("Iiro", publishedInterpreter1.firstName());
    assertEquals("Hannonen", publishedInterpreter1.lastName());
    assertNull(publishedInterpreter1.email());
    assertEquals("+3581234567", publishedInterpreter1.phoneNumber());
    assertEquals(interpreter1.getOtherContactInformation(), publishedInterpreter1.otherContactInfo());
    assertEquals(Set.of(), Set.copyOf(publishedInterpreter1.regions()));

    assertEquals(2, publishedInterpreter1.languages().size());
    assertLanguagePairDTO(qualification11, publishedInterpreter1.languages().get(0));
    assertLanguagePairDTO(qualification12, publishedInterpreter1.languages().get(1));

    final InterpreterDTO publishedInterpreter2 = interpreters.get(1);
    assertEquals(interpreter2.getId(), publishedInterpreter2.id());
    assertEquals("Ella", publishedInterpreter2.firstName());
    assertEquals("Heinänen", publishedInterpreter2.lastName());
    assertEquals("ella.heinanen@example.invalid", publishedInterpreter2.email());
    assertNull(publishedInterpreter2.phoneNumber());
    assertNull(publishedInterpreter2.otherContactInfo());
    assertEquals(Set.of("01", "02"), Set.copyOf(publishedInterpreter2.regions()));

    assertEquals(1, publishedInterpreter2.languages().size());
    assertLanguagePairDTO(qualification21, publishedInterpreter2.languages().get(0));
  }

  @Test
  public void listReturnsInterpretersInRandomOrder() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);

    final Interpreter interpreter1 = createInterpreter("1");
    final Interpreter interpreter2 = createInterpreter("2");
    final Interpreter interpreter3 = createInterpreter("3");

    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    createQualification(interpreter1, meetingDate, "FI", "EN", today, tomorrow, true);
    createQualification(interpreter2, meetingDate, "FI", "EN", today, tomorrow, true);
    createQualification(interpreter3, meetingDate, "FI", "EN", today, tomorrow, true);

    final Supplier<List<Long>> fetchInterpretersAndCollectIds = () ->
      publicInterpreterService.list().stream().map(InterpreterDTO::id).toList();

    final Supplier<Boolean> runTest = () -> {
      final List<Long> ids1 = fetchInterpretersAndCollectIds.get();
      final List<Long> ids2 = fetchInterpretersAndCollectIds.get();
      final boolean hasSameIds = Objects.equals(Set.copyOf(ids1), Set.copyOf(ids2));
      final boolean idsInSameOrder = Objects.equals(ids1, ids2);
      return hasSameIds && !idsInSameOrder;
    };
    boolean testRunOk = false;
    for (int i = 0; i < 10; i++) {
      testRunOk = runTest.get();
      if (testRunOk) {
        break;
      }
    }
    assertTrue(testRunOk);
  }

  private void assertLanguagePairDTO(final Qualification qualification, final LanguagePairDTO languagePairDTO) {
    assertEquals(qualification.getFromLang(), languagePairDTO.from());
    assertEquals(qualification.getToLang(), languagePairDTO.to());
  }

  private Interpreter createInterpreter(final String onrId) {
    final Interpreter interpreter = Factory.interpreter();
    interpreter.setOnrId(onrId);
    entityManager.persist(interpreter);
    return interpreter;
  }

  private Interpreter createInterpreterDeleted() {
    final Interpreter interpreter = Factory.interpreter();
    interpreter.markDeleted();
    entityManager.persist(interpreter);
    return interpreter;
  }

  private Qualification createQualification(
    final Interpreter interpreter,
    final MeetingDate meetingDate,
    final String fromLang,
    final String toLang,
    final LocalDate beginDate,
    final LocalDate endDate,
    final boolean permissionToPublish
  ) {
    final Qualification qualification = Factory.qualification(interpreter, meetingDate);
    qualification.setFromLang(fromLang);
    qualification.setToLang(toLang);
    qualification.setBeginDate(beginDate);
    qualification.setEndDate(endDate);
    qualification.setPermissionToPublish(permissionToPublish);
    entityManager.persist(qualification);
    return qualification;
  }

  private Qualification createQualificationDeleted(
    final Interpreter interpreter,
    final MeetingDate meetingDate,
    final String fromLang,
    final String toLang,
    final LocalDate beginDate,
    final LocalDate endDate,
    final boolean permissionToPublish
  ) {
    final Qualification qualification = Factory.qualification(interpreter, meetingDate);
    qualification.setFromLang(fromLang);
    qualification.setToLang(toLang);
    qualification.setBeginDate(beginDate);
    qualification.setEndDate(endDate);
    qualification.setPermissionToPublish(permissionToPublish);
    qualification.markDeleted();
    entityManager.persist(qualification);
    return qualification;
  }

  private Region createRegion(final Interpreter interpreter, final String code) {
    final Region region = Factory.region(interpreter, code);
    entityManager.persist(region);
    return region;
  }
}
