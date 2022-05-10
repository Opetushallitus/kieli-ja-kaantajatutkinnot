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
import fi.oph.otr.api.dto.clerk.ClerkLegalInterpreterExaminationTypeDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterUpdateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterUpdateDTO;
import fi.oph.otr.model.Kielipari;
import fi.oph.otr.model.Oikeustulkki;
import fi.oph.otr.model.Sijainti;
import fi.oph.otr.model.Tulkki;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.LanguagePairRepository;
import fi.oph.otr.repository.LegalInterpreterRepository;
import fi.oph.otr.repository.LocationRepository;
import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import java.time.LocalDate;
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
  private LegalInterpreterRepository legalInterpreterRepository;

  @Resource
  private LanguagePairRepository languagePairRepository;

  @Resource
  private LocationRepository locationRepository;

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
        legalInterpreterRepository,
        languagePairRepository,
        locationRepository,
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

    final List<ClerkInterpreterDTO> interpreters = clerkInterpreterService.listInterpreters();
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
    final Tulkki interpreter = Factory.interpreter();

    final Oikeustulkki legalInterpreter = Factory.legalInterpreter(interpreter);
    legalInterpreter.setJulkaisulupa(publish);

    final Kielipari languagePair = Factory.languagePair(legalInterpreter, from, to, begin, end);
    final Sijainti location = Factory.location(legalInterpreter, Sijainti.Tyyppi.KOKO_SUOMI, null);

    entityManager.persist(interpreter);
    entityManager.persist(legalInterpreter);
    entityManager.persist(languagePair);
    entityManager.persist(location);
    return interpreter.getId();
  }

  @Test
  public void testCreate() {
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
            .examinationType(ClerkLegalInterpreterExaminationTypeDTO.LEGAL_INTERPRETER_EXAM)
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

    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.create(createDTO);

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

    final ClerkLegalInterpreterDTO legalInterpreterDTO = interpreterDTO.legalInterpreters().get(0);
    assertEquals(0, legalInterpreterDTO.version());
    assertFalse(legalInterpreterDTO.deleted());
    assertEquals(ClerkLegalInterpreterExaminationTypeDTO.LEGAL_INTERPRETER_EXAM, legalInterpreterDTO.examinationType());
    assertTrue(legalInterpreterDTO.permissionToPublish());
    assertEquals(2, legalInterpreterDTO.languages().size());

    assertEquals(Set.of("FI", "SE"), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::from));
    assertEquals(Set.of("SE", "DE"), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::to));
    assertEquals(Set.of(today, yesterday), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::beginDate));
    assertEquals(Set.of(today, tomorrow), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::endDate));
  }

  private <T> Set<T> collectFromLanguages(
    final ClerkLegalInterpreterDTO dto,
    final Function<ClerkLanguagePairDTO, T> getter
  ) {
    return dto.languages().stream().map(getter).collect(Collectors.toSet());
  }

  @Test
  public void testCreateFailsForUnknownRegion() {
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
            .examinationType(ClerkLegalInterpreterExaminationTypeDTO.LEGAL_INTERPRETER_EXAM)
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

    final APIException ex = assertThrows(APIException.class, () -> clerkInterpreterService.create(createDTO));
    assertEquals(APIExceptionType.INTERPRETER_REGION_UNKNOWN, ex.getExceptionType());
  }

  @Test
  public void testGetInterpreter() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    createInterpreter(false, "FI", "SE", today, tomorrow);
    createInterpreter(true, "FI", "EN", today, tomorrow);

    final List<Long> ids = interpreterRepository.findAll().stream().map(Tulkki::getId).toList();
    assertEquals(2, ids.size());
    ids.forEach(id -> assertEquals(id, clerkInterpreterService.getInterpreter(id).id()));
  }

  @Test
  public void testUpdateInterpreter() {
    createInterpreter(false, "FI", "SE", LocalDate.now(), LocalDate.now().plusDays(1));
    final Long id = interpreterRepository.findAll().stream().map(Tulkki::getId).findFirst().orElseThrow();
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
    // assertEquals(original.version() + 1, updated.version());
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
    final Long id = interpreterRepository.findAll().stream().map(Tulkki::getId).findFirst().orElseThrow();
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

    final List<Long> ids = interpreterRepository.findAll().stream().map(Tulkki::getId).toList();
    final Long idToDelete = ids.get(0);

    final ClerkInterpreterDTO dto = clerkInterpreterService.deleteInterpreter(idToDelete);

    interpreterRepository
      .findAll()
      .forEach(i -> {
        final boolean isDeleted = Objects.equals(idToDelete, i.getId());

        assertEquals(isDeleted, i.isPoistettu());
        i.getOikeustulkit().forEach(li -> assertEquals(isDeleted, li.isPoistettu()));
      });
    assertTrue(dto.deleted());
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
      .areas(List.of("01", "This region code does not exist"))
      .legalInterpreters(
        List.of(
          ClerkLegalInterpreterCreateDTO
            .builder()
            .examinationType(ClerkLegalInterpreterExaminationTypeDTO.LEGAL_INTERPRETER_EXAM)
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

    assertEquals(0, interpreterRepository.count());

    final APIException ex = assertThrows(APIException.class, () -> clerkInterpreterService.create(createDTO));
    assertEquals(APIExceptionType.INTERPRETER_REGION_UNKNOWN, ex.getExceptionType());

    assertEquals(0, interpreterRepository.count());
  }

  @Test
  public void testCreateLegalInterpreter() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final Tulkki interpreter1 = Factory.interpreter();
    final Oikeustulkki legalInterpreter1 = Factory.legalInterpreter(interpreter1);
    final Kielipari languagePair1 = Factory.languagePair(legalInterpreter1, "GR", "SE", yesterday, today);

    final Tulkki interpreter2 = Factory.interpreter();
    final Oikeustulkki legalInterpreter2 = Factory.legalInterpreter(interpreter2);
    final Kielipari languagePair2 = Factory.languagePair(legalInterpreter2, "SE", "GR", yesterday, tomorrow);

    entityManager.persist(interpreter1);
    entityManager.persist(interpreter2);
    entityManager.persist(legalInterpreter1);
    entityManager.persist(legalInterpreter2);
    entityManager.persist(languagePair1);
    entityManager.persist(languagePair2);

    final long interpreterId = interpreter2.getId();

    final ClerkLegalInterpreterCreateDTO dto = ClerkLegalInterpreterCreateDTO
      .builder()
      .examinationType(ClerkLegalInterpreterExaminationTypeDTO.LEGAL_INTERPRETER_EXAM)
      .permissionToPublish(true)
      .languages(
        List.of(
          ClerkLanguagePairDTO.builder().from("FI").to("SE").beginDate(today).endDate(tomorrow).build(),
          ClerkLanguagePairDTO.builder().from("SE").to("DE").beginDate(yesterday).endDate(today).build()
        )
      )
      .build();

    assertEquals(2, legalInterpreterRepository.count());

    final ClerkInterpreterDTO result = clerkInterpreterService.createLegalInterpreter(interpreterId, dto);

    assertEquals(3, legalInterpreterRepository.count());
    assertEquals(2, result.legalInterpreters().size());
  }

  @Test
  public void testCreateLegalInterpreterFailsForUnknownLanguage() {
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
            .examinationType(ClerkLegalInterpreterExaminationTypeDTO.LEGAL_INTERPRETER_EXAM)
            .permissionToPublish(true)
            .languages(
              List.of(
                ClerkLanguagePairDTO
                  .builder()
                  .from("This language code does not exist")
                  .to("SE")
                  .beginDate(today)
                  .endDate(tomorrow)
                  .build(),
                ClerkLanguagePairDTO.builder().from("SE").to("DE").beginDate(yesterday).endDate(today).build()
              )
            )
            .build()
        )
      )
      .build();

    assertEquals(0, interpreterRepository.count());

    final APIException ex = assertThrows(APIException.class, () -> clerkInterpreterService.create(createDTO));
    assertEquals(APIExceptionType.LEGAL_INTERPRETER_LANGUAGE_UNKNOWN, ex.getExceptionType());

    assertEquals(0, interpreterRepository.count());
  }

  @Test
  public void testUpdateLegalInterpreter() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final Tulkki interpreter = Factory.interpreter();
    final Oikeustulkki legalInterpreter = Factory.legalInterpreter(interpreter);
    final Kielipari langPair = Factory.languagePair(legalInterpreter, "FI", "EN", today, today);

    entityManager.persist(interpreter);
    entityManager.persist(legalInterpreter);
    entityManager.persist(langPair);

    final ClerkLegalInterpreterUpdateDTO updateDTO = ClerkLegalInterpreterUpdateDTO
      .builder()
      .id(legalInterpreter.getId())
      .version(legalInterpreter.getVersion())
      .examinationType(ClerkLegalInterpreterExaminationTypeDTO.OTHER)
      .permissionToPublish(true)
      .languages(
        List.of(
          ClerkLanguagePairDTO.builder().from("FI").to("SE").beginDate(today).endDate(tomorrow).build(),
          ClerkLanguagePairDTO.builder().from("SE").to("DE").beginDate(yesterday).endDate(today).build()
        )
      )
      .build();

    final ClerkInterpreterDTO dto = clerkInterpreterService.updateLegalInterpreter(updateDTO);

    assertEquals(1, dto.legalInterpreters().size());
    final ClerkLegalInterpreterDTO legalInterpreterDTO = dto.legalInterpreters().get(0);

    assertEquals(updateDTO.version() + 1, legalInterpreterDTO.version());
    assertEquals(ClerkLegalInterpreterExaminationTypeDTO.OTHER, legalInterpreterDTO.examinationType());
    assertTrue(legalInterpreterDTO.permissionToPublish());
    assertEquals(2, legalInterpreterDTO.languages().size());

    assertEquals(Set.of("FI", "SE"), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::from));
    assertEquals(Set.of("SE", "DE"), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::to));
    assertEquals(Set.of(today, yesterday), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::beginDate));
    assertEquals(Set.of(today, tomorrow), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::endDate));

    final List<Kielipari> langs = languagePairRepository.findAll();
    assertEquals(2, langs.size());
  }

  @Test
  public void testUpdateLegalInterpreterFailsForUnknownLanguage() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final Tulkki interpreter = Factory.interpreter();
    final Oikeustulkki legalInterpreter = Factory.legalInterpreter(interpreter);
    final Kielipari langPair = Factory.languagePair(legalInterpreter, "FI", "EN", today, today);

    entityManager.persist(interpreter);
    entityManager.persist(legalInterpreter);
    entityManager.persist(langPair);

    final ClerkLegalInterpreterUpdateDTO updateDTO = ClerkLegalInterpreterUpdateDTO
      .builder()
      .id(legalInterpreter.getId())
      .version(legalInterpreter.getVersion())
      .examinationType(ClerkLegalInterpreterExaminationTypeDTO.OTHER)
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
      () -> clerkInterpreterService.updateLegalInterpreter(updateDTO)
    );
    assertEquals(APIExceptionType.LEGAL_INTERPRETER_LANGUAGE_UNKNOWN, ex.getExceptionType());
  }

  @Test
  public void testDeleteLegalInterpreter() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    createInterpreter(false, "FI", "SE", today, tomorrow);
    createInterpreter(true, "FI", "EN", today, tomorrow);

    final List<Long> ids = legalInterpreterRepository.findAll().stream().map(Oikeustulkki::getId).toList();
    final Long idToDelete = ids.get(0);

    final ClerkInterpreterDTO dto = clerkInterpreterService.deleteLegalInterpreter(idToDelete);

    legalInterpreterRepository
      .findAll()
      .forEach(i -> assertEquals(Objects.equals(idToDelete, i.getId()), i.isPoistettu()));

    dto.legalInterpreters().forEach(i -> assertEquals(Objects.equals(idToDelete, i.id()), i.deleted()));

    clerkInterpreterService
      .listInterpreters()
      .stream()
      .flatMap(i -> i.legalInterpreters().stream())
      .forEach(i -> assertEquals(Objects.equals(idToDelete, i.id()), i.deleted()));
  }
}
