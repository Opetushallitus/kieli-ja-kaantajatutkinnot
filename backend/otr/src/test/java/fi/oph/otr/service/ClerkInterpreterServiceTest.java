package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.otr.Factory;
import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTO;
import fi.oph.otr.api.dto.clerk.ClerkLanguagePairDTO;
import fi.oph.otr.api.dto.clerk.ClerkLegalInterpreterDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterUpdateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterUpdateDTO;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.LanguagePair;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.model.QualificationExaminationType;
import fi.oph.otr.model.Region;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.LanguagePairRepository;
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
  private LanguagePairRepository languagePairRepository;

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
        languagePairRepository,
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
    final LanguagePair languagePair = Factory.languagePair(qualification, from, to, begin, end);

    qualification.setPermissionToPublish(publish);

    entityManager.persist(interpreter);
    entityManager.persist(qualification);
    entityManager.persist(languagePair);

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
      .areas(List.of("01", "02"))
      .legalInterpreters(
        List.of(
          ClerkLegalInterpreterCreateDTO
            .builder()
            .examinationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM)
            .permissionToPublish(true)
            .languages(
              List.of(
                ClerkLanguagePairDTO.builder().from("FI").to("SE").beginDate(today).endDate(tomorrow).build(),
                ClerkLanguagePairDTO.builder().from("SE").to("DE").beginDate(yesterday).endDate(today).build()
              )
            )
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
    assertEquals(Set.of("01", "02"), Set.copyOf(interpreterDTO.areas()));
    assertEquals(1, interpreterDTO.legalInterpreters().size());

    final ClerkLegalInterpreterDTO qualificationDTO = interpreterDTO.legalInterpreters().get(0);
    assertEquals(0, qualificationDTO.version());
    assertFalse(qualificationDTO.deleted());
    assertEquals(QualificationExaminationType.LEGAL_INTERPRETER_EXAM, qualificationDTO.examinationType());
    assertTrue(qualificationDTO.permissionToPublish());
    assertEquals(2, qualificationDTO.languages().size());

    assertEquals(Set.of("FI", "SE"), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::from));
    assertEquals(Set.of("SE", "DE"), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::to));
    assertEquals(Set.of(today, yesterday), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::beginDate));
    assertEquals(Set.of(today, tomorrow), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::endDate));
  }

  private <T> Set<T> collectFromLanguages(
    final ClerkLegalInterpreterDTO dto,
    final Function<ClerkLanguagePairDTO, T> getter
  ) {
    return dto.languages().stream().map(getter).collect(Collectors.toSet());
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
      .areas(List.of("01", "This region does not exist"))
      .legalInterpreters(
        List.of(
          ClerkLegalInterpreterCreateDTO
            .builder()
            .examinationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM)
            .permissionToPublish(true)
            .languages(
              List.of(
                ClerkLanguagePairDTO.builder().from("FI").to("SE").beginDate(today).endDate(tomorrow).build(),
                ClerkLanguagePairDTO.builder().from("SE").to("DE").beginDate(yesterday).endDate(today).build()
              )
            )
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
    assertEquals(Set.of("01", "02"), Set.copyOf(interpreterDTO.areas()));
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
      .areas(List.of("01"))
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
    assertEquals(List.of("01"), updated.areas());
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
      .areas(List.of("This region code does not exist"))
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
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final Interpreter interpreter1 = Factory.interpreter();
    final Qualification qualification1 = Factory.qualification(interpreter1);
    final LanguagePair languagePair1 = Factory.languagePair(qualification1, "GR", "SE", yesterday, today);

    final Interpreter interpreter2 = Factory.interpreter();
    final Qualification qualification2 = Factory.qualification(interpreter2);
    final LanguagePair languagePair2 = Factory.languagePair(qualification2, "SE", "GR", yesterday, tomorrow);

    entityManager.persist(interpreter1);
    entityManager.persist(interpreter2);
    entityManager.persist(qualification1);
    entityManager.persist(qualification2);
    entityManager.persist(languagePair1);
    entityManager.persist(languagePair2);

    final long interpreterId = interpreter2.getId();

    final ClerkLegalInterpreterCreateDTO createDTO = ClerkLegalInterpreterCreateDTO
      .builder()
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(false)
      .languages(
        List.of(
          ClerkLanguagePairDTO.builder().from("FI").to("SE").beginDate(today).endDate(tomorrow).build(),
          ClerkLanguagePairDTO.builder().from("SE").to("DE").beginDate(yesterday).endDate(today).build()
        )
      )
      .build();

    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.createQualification(interpreterId, createDTO);
    assertEquals(2, interpreterDTO.legalInterpreters().size());

    final ClerkLegalInterpreterDTO qualificationDTO = interpreterDTO
      .legalInterpreters()
      .stream()
      .filter(dto -> dto.examinationType() == QualificationExaminationType.OTHER && !dto.permissionToPublish())
      .toList()
      .get(0);

    assertNotNull(qualificationDTO);
    assertEquals(0, qualificationDTO.version());
    assertFalse(qualificationDTO.deleted());
    assertEquals(2, qualificationDTO.languages().size());

    assertEquals(Set.of("FI", "SE"), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::from));
    assertEquals(Set.of("SE", "DE"), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::to));
    assertEquals(Set.of(today, yesterday), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::beginDate));
    assertEquals(Set.of(today, tomorrow), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::endDate));
  }

  @Test
  public void testCreateQualificationFailsForUnknownLanguage() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final Interpreter interpreter1 = Factory.interpreter();
    final Qualification qualification1 = Factory.qualification(interpreter1);
    final LanguagePair languagePair1 = Factory.languagePair(qualification1, "GR", "SE", yesterday, today);

    final Interpreter interpreter2 = Factory.interpreter();
    final Qualification qualification2 = Factory.qualification(interpreter2);
    final LanguagePair languagePair2 = Factory.languagePair(qualification2, "SE", "GR", yesterday, tomorrow);

    entityManager.persist(interpreter1);
    entityManager.persist(interpreter2);
    entityManager.persist(qualification1);
    entityManager.persist(qualification2);
    entityManager.persist(languagePair1);
    entityManager.persist(languagePair2);

    final long interpreterId = interpreter2.getId();

    final ClerkLegalInterpreterCreateDTO dto = ClerkLegalInterpreterCreateDTO
      .builder()
      .examinationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM)
      .permissionToPublish(true)
      .languages(
        List.of(
          ClerkLanguagePairDTO.builder().from("FI").to("SE").beginDate(today).endDate(tomorrow).build(),
          ClerkLanguagePairDTO
            .builder()
            .from("SE")
            .to("This language code does not exist")
            .beginDate(yesterday)
            .endDate(today)
            .build()
        )
      )
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkInterpreterService.createQualification(interpreterId, dto)
    );
    assertEquals(APIExceptionType.QUALIFICATION_LANGUAGE_UNKNOWN, ex.getExceptionType());
  }

  @Test
  public void testUpdateQualification() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter);
    final LanguagePair languagePair = Factory.languagePair(qualification, "FI", "EN", today, today);

    entityManager.persist(interpreter);
    entityManager.persist(qualification);
    entityManager.persist(languagePair);

    final ClerkLegalInterpreterUpdateDTO updateDTO = ClerkLegalInterpreterUpdateDTO
      .builder()
      .id(qualification.getId())
      .version(qualification.getVersion())
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(true)
      .languages(
        List.of(
          ClerkLanguagePairDTO.builder().from("FI").to("SE").beginDate(today).endDate(tomorrow).build(),
          ClerkLanguagePairDTO.builder().from("SE").to("DE").beginDate(yesterday).endDate(today).build()
        )
      )
      .build();

    final ClerkInterpreterDTO dto = clerkInterpreterService.updateQualification(updateDTO);

    assertEquals(1, dto.legalInterpreters().size());
    final ClerkLegalInterpreterDTO qualificationDTO = dto.legalInterpreters().get(0);

    assertEquals(updateDTO.version() + 1, qualificationDTO.version());
    assertFalse(qualificationDTO.deleted());
    assertEquals(QualificationExaminationType.OTHER, qualificationDTO.examinationType());
    assertTrue(qualificationDTO.permissionToPublish());
    assertEquals(2, qualificationDTO.languages().size());

    assertEquals(Set.of("FI", "SE"), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::from));
    assertEquals(Set.of("SE", "DE"), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::to));
    assertEquals(Set.of(today, yesterday), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::beginDate));
    assertEquals(Set.of(today, tomorrow), collectFromLanguages(qualificationDTO, ClerkLanguagePairDTO::endDate));
  }

  @Test
  public void testUpdateQualificationFailsForUnknownLanguage() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter);
    final LanguagePair languagePair = Factory.languagePair(qualification, "FI", "EN", today, today);

    entityManager.persist(interpreter);
    entityManager.persist(qualification);
    entityManager.persist(languagePair);

    final ClerkLegalInterpreterUpdateDTO updateDTO = ClerkLegalInterpreterUpdateDTO
      .builder()
      .id(qualification.getId())
      .version(qualification.getVersion())
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(true)
      .languages(
        List.of(
          ClerkLanguagePairDTO.builder().from("FI").to("SE").beginDate(today).endDate(tomorrow).build(),
          ClerkLanguagePairDTO
            .builder()
            .from("SE")
            .to("This language code does not exist")
            .beginDate(yesterday)
            .endDate(today)
            .build()
        )
      )
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

    dto.legalInterpreters().forEach(q -> assertEquals(Objects.equals(idToDelete, q.id()), q.deleted()));

    clerkInterpreterService
      .list()
      .stream()
      .flatMap(i -> i.legalInterpreters().stream())
      .forEach(q -> assertEquals(Objects.equals(idToDelete, q.id()), q.deleted()));
  }
}
