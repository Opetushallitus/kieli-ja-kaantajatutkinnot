package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
    clerkInterpreterService =
      new ClerkInterpreterService(
        interpreterRepository,
        legalInterpreterRepository,
        languagePairRepository,
        locationRepository
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
      .legalInterpreters(
        List.of(
          ClerkLegalInterpreterCreateDTO
            .builder()
            .examinationType(ClerkLegalInterpreterExaminationTypeDTO.LEGAL_INTERPRETER_EXAM)
            .permissionToPublishEmail(false)
            .permissionToPublishPhone(true)
            .permissionToPublishOtherContactInfo(false)
            .permissionToPublish(true)
            .otherContactInfo("other")
            .extraInformation("extra")
            .areas(List.of("a", "b"))
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
    assertEquals(1, interpreterDTO.legalInterpreters().size());

    final ClerkLegalInterpreterDTO legalInterpreterDTO = interpreterDTO.legalInterpreters().get(0);
    assertEquals(ClerkLegalInterpreterExaminationTypeDTO.LEGAL_INTERPRETER_EXAM, legalInterpreterDTO.examinationType());
    assertFalse(legalInterpreterDTO.permissionToPublishEmail());
    assertTrue(legalInterpreterDTO.permissionToPublishPhone());
    assertFalse(legalInterpreterDTO.permissionToPublishOtherContactInfo());
    assertTrue(legalInterpreterDTO.permissionToPublish());
    assertEquals("other", legalInterpreterDTO.otherContactInfo());
    assertEquals("extra", legalInterpreterDTO.extraInformation());
    assertEquals(Set.of("a", "b"), Set.copyOf(legalInterpreterDTO.areas()));

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
      .build();

    final ClerkInterpreterDTO updated = clerkInterpreterService.updateInterpreter(updateDto);
    assertEquals(original.id(), updated.id());
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

    interpreterRepository.findAll().forEach(i -> assertEquals(Objects.equals(idToDelete, i.getId()), i.isPoistettu()));
    assertTrue(dto.deleted());
  }

  @Test
  public void testCreateLegalInterpreter() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final Tulkki interpreter1 = Factory.interpreter();
    final Oikeustulkki legalInterpreter1 = Factory.legalInterpreter(interpreter1);
    final Kielipari languagePair1 = Factory.languagePair(legalInterpreter1, "GR", "SE", yesterday, today);
    final Sijainti location1 = Factory.location(legalInterpreter1, Sijainti.Tyyppi.KOKO_SUOMI, null);

    final Tulkki interpreter2 = Factory.interpreter();
    final Oikeustulkki legalInterpreter2 = Factory.legalInterpreter(interpreter2);
    final Kielipari languagePair2 = Factory.languagePair(legalInterpreter2, "SE", "GR", yesterday, tomorrow);
    final Sijainti location2 = Factory.location(legalInterpreter2, Sijainti.Tyyppi.KOKO_SUOMI, null);

    entityManager.persist(interpreter1);
    entityManager.persist(interpreter2);
    entityManager.persist(legalInterpreter1);
    entityManager.persist(legalInterpreter2);
    entityManager.persist(languagePair1);
    entityManager.persist(languagePair2);
    entityManager.persist(location1);
    entityManager.persist(location2);

    final long interpreterId = interpreter2.getId();

    final ClerkLegalInterpreterCreateDTO dto = ClerkLegalInterpreterCreateDTO
      .builder()
      .examinationType(ClerkLegalInterpreterExaminationTypeDTO.LEGAL_INTERPRETER_EXAM)
      .permissionToPublishEmail(false)
      .permissionToPublishPhone(true)
      .permissionToPublishOtherContactInfo(false)
      .permissionToPublish(true)
      .otherContactInfo("other")
      .extraInformation("extra")
      .areas(List.of("a", "b"))
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
  public void testUpdateLegalInterpreter() {
    final Tulkki interpreter = Factory.interpreter();
    final Oikeustulkki legalInterpreter = Factory.legalInterpreter(interpreter);
    final Kielipari langPair = Factory.languagePair(legalInterpreter, "FI", "EN", LocalDate.now(), LocalDate.now());
    final Sijainti location = Factory.location(legalInterpreter, Sijainti.Tyyppi.MAAKUNTA, "x");
    entityManager.persist(interpreter);
    entityManager.persist(legalInterpreter);
    entityManager.persist(langPair);
    entityManager.persist(location);

    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);
    final ClerkLegalInterpreterUpdateDTO updateDTO = ClerkLegalInterpreterUpdateDTO
      .builder()
      .id(legalInterpreter.getId())
      .version(legalInterpreter.getVersion())
      .examinationType(ClerkLegalInterpreterExaminationTypeDTO.OTHER)
      .permissionToPublishEmail(false)
      .permissionToPublishPhone(true)
      .permissionToPublishOtherContactInfo(false)
      .permissionToPublish(true)
      .otherContactInfo("other")
      .extraInformation("extra")
      .areas(List.of("a", "b"))
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

    assertEquals(ClerkLegalInterpreterExaminationTypeDTO.OTHER, legalInterpreterDTO.examinationType());
    assertFalse(legalInterpreterDTO.permissionToPublishEmail());
    assertTrue(legalInterpreterDTO.permissionToPublishPhone());
    assertFalse(legalInterpreterDTO.permissionToPublishOtherContactInfo());
    assertTrue(legalInterpreterDTO.permissionToPublish());
    assertEquals("other", legalInterpreterDTO.otherContactInfo());
    assertEquals("extra", legalInterpreterDTO.extraInformation());
    assertEquals(Set.of("a", "b"), Set.copyOf(legalInterpreterDTO.areas()));

    assertEquals(2, legalInterpreterDTO.languages().size());
    assertEquals(Set.of("FI", "SE"), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::from));
    assertEquals(Set.of("SE", "DE"), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::to));
    assertEquals(Set.of(today, yesterday), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::beginDate));
    assertEquals(Set.of(today, tomorrow), collectFromLanguages(legalInterpreterDTO, ClerkLanguagePairDTO::endDate));

    final List<Sijainti> locs = locationRepository.findAll();
    assertEquals(2, locs.size());

    final List<Kielipari> langs = languagePairRepository.findAll();
    assertEquals(2, langs.size());
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
