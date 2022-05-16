package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.otr.Factory;
import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTO;
import fi.oph.otr.api.dto.clerk.ClerkQualificationDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterUpdateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkQualificationCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkQualificationUpdateDTO;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.model.QualificationExaminationType;
import fi.oph.otr.model.Region;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.repository.RegionRepository;
import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class ClerkInterpreterServiceTest {

  @Resource
  private InterpreterRepository interpreterRepository;

  @Resource
  private QualificationRepository qualificationRepository;

  @Resource
  private RegionRepository regionRepository;

  @Resource
  private TestEntityManager entityManager;

  private ClerkInterpreterService clerkInterpreterService;

  @BeforeEach
  public void setup() {
    final RegionService regionService = new RegionService();
    regionService.init();

    final LanguageService languageService = new LanguageService();
    languageService.init();

    clerkInterpreterService =
      new ClerkInterpreterService(
        interpreterRepository,
        qualificationRepository,
        regionRepository,
        regionService,
        languageService
      );
  }

  @Test
  public void testAllAreListed() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate nextWeek = tomorrow.plusDays(7);
    final LocalDate previousWeek = today.minusDays(7);
    final LocalDate yesterday = today.minusDays(1);

    final long id1 = createInterpreter(false, "FI", "SE", today, tomorrow);
    final long id2 = createInterpreter(true, "FI", "EN", today, tomorrow);
    final long id3 = createInterpreter(true, "NO", "FI", yesterday, today);
    final long id4 = createInterpreter(false, "FI", "GE", previousWeek, tomorrow);
    final long id5 = createInterpreter(true, "FI", "DA", tomorrow, nextWeek);
    final long id6 = createInterpreter(true, "FI", "IT", previousWeek, yesterday);

    final List<ClerkInterpreterDTO> interpreters = clerkInterpreterService.list();
    assertEquals(
      Set.of(id1, id2, id3, id4, id5, id6),
      interpreters.stream().map(ClerkInterpreterDTO::id).collect(Collectors.toSet())
    );
    interpreters.forEach(dto -> assertFalse(dto.deleted()));
  }

  private long createInterpreter(
    final boolean publish,
    final String from,
    final String to,
    final LocalDate begin,
    final LocalDate end
  ) {
    return createInterpreterWithRegions(publish, from, to, begin, end, Collections.emptyList());
  }

  private long createInterpreterWithRegions(
    final boolean publish,
    final String from,
    final String to,
    final LocalDate begin,
    final LocalDate end,
    final List<String> regionCodes
  ) {
    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter);

    qualification.setFromLang(from);
    qualification.setToLang(to);
    qualification.setBeginDate(begin);
    qualification.setEndDate(end);
    qualification.setPermissionToPublish(publish);

    entityManager.persist(interpreter);
    entityManager.persist(qualification);

    regionCodes.forEach(code -> {
      final Region region = Factory.region(interpreter, code);
      entityManager.persist(region);
    });

    return interpreter.getId();
  }

  @Test
  public void testCreateInterpreter() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final ClerkInterpreterCreateDTO createDTO = ClerkInterpreterCreateDTO
      .builder()
      .identityNumber("241202-xyz")
      .firstName("Erkki E Merkki")
      .nickName("Erkki")
      .lastName("Esimerkki")
      .email("erkki@esimerkki.invalid")
      .permissionToPublishEmail(false)
      .phoneNumber("+358401234567")
      .permissionToPublishPhone(true)
      .otherContactInfo("other")
      .permissionToPublishOtherContactInfo(false)
      .street("Tulkintie 44")
      .postalCode("00100")
      .town("Helsinki")
      .extraInformation("extra")
      .regions(List.of("01", "02"))
      .qualifications(
        List.of(
          ClerkQualificationCreateDTO
            .builder()
            .languagePair(LanguagePairDTO.builder().from("FI").to("SE").build())
            .beginDate(today)
            .endDate(tomorrow)
            .examinationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM)
            .permissionToPublish(true)
            .build(),
          ClerkQualificationCreateDTO
            .builder()
            .languagePair(LanguagePairDTO.builder().from("SE").to("DE").build())
            .beginDate(yesterday)
            .endDate(today)
            .examinationType(QualificationExaminationType.OTHER)
            .permissionToPublish(false)
            .build()
        )
      )
      .build();

    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.createInterpreter(createDTO);

    assertNotNull(interpreterDTO.id());
    assertEquals(0, interpreterDTO.version());
    assertFalse(interpreterDTO.deleted());
    assertFalse(interpreterDTO.permissionToPublishEmail());
    assertTrue(interpreterDTO.permissionToPublishPhone());
    assertEquals(createDTO.otherContactInfo(), interpreterDTO.otherContactInfo());
    assertFalse(interpreterDTO.permissionToPublishOtherContactInfo());
    assertEquals(createDTO.extraInformation(), interpreterDTO.extraInformation());
    assertEquals(Set.of("01", "02"), Set.copyOf(interpreterDTO.regions()));
    assertEquals(2, interpreterDTO.qualifications().size());

    final ClerkQualificationDTO qualification1 = interpreterDTO.qualifications().get(0);
    assertEquals(0, qualification1.version());
    assertFalse(qualification1.deleted());
    assertEquals(LanguagePairDTO.builder().from("FI").to("SE").build(), qualification1.languagePair());
    assertEquals(today, qualification1.beginDate());
    assertEquals(tomorrow, qualification1.endDate());
    assertEquals(QualificationExaminationType.LEGAL_INTERPRETER_EXAM, qualification1.examinationType());
    assertTrue(qualification1.permissionToPublish());

    final ClerkQualificationDTO qualification2 = interpreterDTO.qualifications().get(1);
    assertEquals(LanguagePairDTO.builder().from("SE").to("DE").build(), qualification2.languagePair());
    assertEquals(yesterday, qualification2.beginDate());
    assertEquals(today, qualification2.endDate());
    assertEquals(QualificationExaminationType.OTHER, qualification2.examinationType());
    assertFalse(qualification2.permissionToPublish());
  }

  @Test
  public void testCreateInterpreterFailsForUnknownRegion() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final ClerkInterpreterCreateDTO createDTO = ClerkInterpreterCreateDTO
      .builder()
      .identityNumber("241202-xyz")
      .firstName("Erkki E Merkki")
      .nickName("Erkki")
      .lastName("Esimerkki")
      .email("erkki@esimerkki.invalid")
      .permissionToPublishEmail(false)
      .phoneNumber("+358401234567")
      .permissionToPublishPhone(true)
      .otherContactInfo("other")
      .permissionToPublishOtherContactInfo(false)
      .street("Tulkintie 44")
      .postalCode("00100")
      .town("Helsinki")
      .extraInformation("extra")
      .regions(List.of("01", "This region does not exist"))
      .qualifications(
        List.of(
          ClerkQualificationCreateDTO
            .builder()
            .languagePair(LanguagePairDTO.builder().from("FI").to("SE").build())
            .beginDate(today)
            .endDate(tomorrow)
            .examinationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM)
            .permissionToPublish(true)
            .build()
        )
      )
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkInterpreterService.createInterpreter(createDTO)
    );
    assertEquals(APIExceptionType.INTERPRETER_REGION_UNKNOWN, ex.getExceptionType());
  }

  @Test
  public void testGetInterpreter() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final long id = createInterpreterWithRegions(false, "FI", "SE", today, tomorrow, List.of("01", "02"));

    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.getInterpreter(id);
    assertEquals(id, interpreterDTO.id());
    assertEquals(1, interpreterDTO.qualifications().size());
    assertEquals(Set.of("01", "02"), Set.copyOf(interpreterDTO.regions()));
  }

  @Test
  public void testUpdateInterpreter() {
    createInterpreter(false, "FI", "SE", LocalDate.now(), LocalDate.now().plusDays(1));
    final Long id = interpreterRepository.findAll().stream().map(Interpreter::getId).findFirst().orElseThrow();
    final ClerkInterpreterDTO original = clerkInterpreterService.getInterpreter(id);

    final ClerkInterpreterUpdateDTO updateDto = ClerkInterpreterUpdateDTO
      .builder()
      .id(original.id())
      .version(original.version())
      .identityNumber(original.identityNumber())
      .firstName(original.firstName())
      .nickName(original.nickName())
      .lastName(original.lastName())
      .email(original.email())
      .permissionToPublishEmail(false)
      .permissionToPublishPhone(false)
      .otherContactInfo("interpreter@test.invalid")
      .permissionToPublishOtherContactInfo(true)
      .extraInformation("extra")
      .regions(List.of("01"))
      .build();

    final ClerkInterpreterDTO updated = clerkInterpreterService.updateInterpreter(updateDto);

    assertEquals(original.id(), updated.id());
    assertEquals(original.version() + 1, updated.version());
    assertFalse(updated.deleted());
    assertFalse(updated.permissionToPublishEmail());
    assertFalse(updated.permissionToPublishPhone());
    assertEquals(updateDto.otherContactInfo(), updated.otherContactInfo());
    assertTrue(updated.permissionToPublishOtherContactInfo());
    assertEquals(updateDto.extraInformation(), updated.extraInformation());
    assertEquals(List.of("01"), updated.regions());
  }

  @Test
  public void testUpdateInterpreterFailsForUnknownRegion() {
    createInterpreter(false, "FI", "SE", LocalDate.now(), LocalDate.now().plusDays(1));
    final Long id = interpreterRepository.findAll().stream().map(Interpreter::getId).findFirst().orElseThrow();
    final ClerkInterpreterDTO original = clerkInterpreterService.getInterpreter(id);

    final ClerkInterpreterUpdateDTO updateDto = ClerkInterpreterUpdateDTO
      .builder()
      .id(original.id())
      .version(original.version())
      .identityNumber(original.identityNumber())
      .firstName(original.firstName())
      .nickName(original.nickName())
      .lastName(original.lastName())
      .email(original.email())
      .permissionToPublishEmail(false)
      .permissionToPublishPhone(false)
      .otherContactInfo("interpreter@test.invalid")
      .permissionToPublishOtherContactInfo(true)
      .extraInformation("extra")
      .regions(List.of("This region code does not exist"))
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkInterpreterService.updateInterpreter(updateDto)
    );
    assertEquals(APIExceptionType.INTERPRETER_REGION_UNKNOWN, ex.getExceptionType());
  }

  @Test
  public void testDeleteInterpreter() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    createInterpreter(false, "FI", "SE", today, tomorrow);
    createInterpreter(true, "FI", "EN", today, tomorrow);

    final List<Long> ids = interpreterRepository.findAll().stream().map(Interpreter::getId).toList();
    final Long idToDelete = ids.get(0);

    final ClerkInterpreterDTO dto = clerkInterpreterService.deleteInterpreter(idToDelete);

    interpreterRepository
      .findAll()
      .forEach(interpreter -> {
        final boolean isDeleted = Objects.equals(idToDelete, interpreter.getId());

        assertEquals(isDeleted, interpreter.isDeleted());
        interpreter.getQualifications().forEach(q -> assertEquals(isDeleted, q.isDeleted()));
      });
    assertTrue(dto.deleted());
  }

  @Test
  public void testCreateQualification() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);

    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter);

    entityManager.persist(interpreter);
    entityManager.persist(qualification);

    final ClerkQualificationCreateDTO createDTO = ClerkQualificationCreateDTO
      .builder()
      .languagePair(LanguagePairDTO.builder().from("FI").to("CS").build())
      .beginDate(today)
      .endDate(tomorrow)
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(false)
      .build();

    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.createQualification(
      interpreter.getId(),
      createDTO
    );
    assertEquals(2, interpreterDTO.qualifications().size());

    final ClerkQualificationDTO qualificationDTO = interpreterDTO
      .qualifications()
      .stream()
      .filter(dto -> dto.examinationType() == QualificationExaminationType.OTHER && !dto.permissionToPublish())
      .toList()
      .get(0);

    assertNotNull(qualificationDTO);
    assertEquals(0, qualificationDTO.version());
    assertFalse(qualificationDTO.deleted());
    assertEquals(LanguagePairDTO.builder().from("FI").to("CS").build(), qualificationDTO.languagePair());
    assertEquals(today, qualificationDTO.beginDate());
    assertEquals(tomorrow, qualificationDTO.endDate());
  }

  @Test
  public void testCreateQualificationFailsForUnknownLanguage() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);

    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter);

    entityManager.persist(interpreter);
    entityManager.persist(qualification);

    final ClerkQualificationCreateDTO createDTO = ClerkQualificationCreateDTO
      .builder()
      .languagePair(LanguagePairDTO.builder().from("FI").to("XX").build())
      .beginDate(today)
      .endDate(tomorrow)
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(false)
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkInterpreterService.createQualification(interpreter.getId(), createDTO)
    );
    assertEquals(APIExceptionType.QUALIFICATION_LANGUAGE_UNKNOWN, ex.getExceptionType());
  }

  @Test
  public void testUpdateQualification() {
    final LocalDate begin = LocalDate.now().minusMonths(1);
    final LocalDate end = LocalDate.now().plusMonths(1);

    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter);

    entityManager.persist(interpreter);
    entityManager.persist(qualification);

    final ClerkQualificationUpdateDTO updateDTO = ClerkQualificationUpdateDTO
      .builder()
      .id(qualification.getId())
      .version(qualification.getVersion())
      .languagePair(LanguagePairDTO.builder().from("SE").to("NO").build())
      .beginDate(begin)
      .endDate(end)
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(true)
      .build();

    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.updateQualification(updateDTO);

    assertEquals(1, interpreterDTO.qualifications().size());
    final ClerkQualificationDTO qualificationDTO = interpreterDTO.qualifications().get(0);

    assertEquals(updateDTO.version() + 1, qualificationDTO.version());
    assertFalse(qualificationDTO.deleted());
    assertEquals(LanguagePairDTO.builder().from("SE").to("NO").build(), qualificationDTO.languagePair());
    assertEquals(begin, qualificationDTO.beginDate());
    assertEquals(end, qualificationDTO.endDate());
    assertEquals(QualificationExaminationType.OTHER, qualificationDTO.examinationType());
    assertTrue(qualificationDTO.permissionToPublish());
  }

  @Test
  public void testUpdateQualificationFailsForUnknownLanguage() {
    final LocalDate begin = LocalDate.now().minusMonths(1);
    final LocalDate end = LocalDate.now().plusMonths(1);

    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter);

    entityManager.persist(interpreter);
    entityManager.persist(qualification);

    final ClerkQualificationUpdateDTO updateDTO = ClerkQualificationUpdateDTO
      .builder()
      .id(qualification.getId())
      .version(qualification.getVersion())
      .languagePair(LanguagePairDTO.builder().from("XX").to("FI").build())
      .beginDate(begin)
      .endDate(end)
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(true)
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkInterpreterService.updateQualification(updateDTO)
    );
    assertEquals(APIExceptionType.QUALIFICATION_LANGUAGE_UNKNOWN, ex.getExceptionType());
  }

  @Test
  public void testDeleteQualification() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    createInterpreter(false, "FI", "SE", today, tomorrow);
    createInterpreter(true, "FI", "EN", today, tomorrow);

    final List<Long> ids = qualificationRepository.findAll().stream().map(Qualification::getId).toList();
    final Long idToDelete = ids.get(0);

    final ClerkInterpreterDTO dto = clerkInterpreterService.deleteQualification(idToDelete);

    qualificationRepository.findAll().forEach(q -> assertEquals(Objects.equals(idToDelete, q.getId()), q.isDeleted()));

    dto.qualifications().forEach(q -> assertEquals(Objects.equals(idToDelete, q.id()), q.deleted()));

    clerkInterpreterService
      .list()
      .stream()
      .flatMap(i -> i.qualifications().stream())
      .forEach(q -> assertEquals(Objects.equals(idToDelete, q.id()), q.deleted()));
  }
}
