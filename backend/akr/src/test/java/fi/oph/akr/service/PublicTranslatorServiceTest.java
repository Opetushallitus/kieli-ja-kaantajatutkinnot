package fi.oph.akr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import fi.oph.akr.Factory;
import fi.oph.akr.api.dto.LanguagePairDTO;
import fi.oph.akr.api.dto.LanguagePairsDictDTO;
import fi.oph.akr.api.dto.PublicTownDTO;
import fi.oph.akr.api.dto.translator.PublicTranslatorDTO;
import fi.oph.akr.api.dto.translator.PublicTranslatorResponseDTO;
import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.AuthorisationBasis;
import fi.oph.akr.model.MeetingDate;
import fi.oph.akr.model.Translator;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.repository.TranslatorRepository;
import fi.oph.akr.service.koodisto.PostalCodeService;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.IntStream;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class PublicTranslatorServiceTest {

  private PublicTranslatorService publicTranslatorService;

  @Resource
  private AuthorisationRepository authorisationRepository;

  @Resource
  private TranslatorRepository translatorRepository;

  @Resource
  private TestEntityManager entityManager;

  @BeforeEach
  public void setup() {
    final PostalCodeService postalCodeService = new PostalCodeService();
    postalCodeService.init();

    publicTranslatorService =
      new PublicTranslatorService(authorisationRepository, translatorRepository, postalCodeService);
  }

  @Test
  public void listTranslatorsShouldReturnTranslatorsByAuthorisationsWithActiveTermAndPublishPermission() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    createVariousTranslators(meetingDate);

    final PublicTranslatorResponseDTO responseDTO = publicTranslatorService.listTranslators();
    final List<PublicTranslatorDTO> translatorsUnsorted = responseDTO.translators();
    // Translators should be in random order, sorting makes assertions easier to write
    final List<PublicTranslatorDTO> translators = translatorsUnsorted
      .stream()
      .sorted(Comparator.comparing(PublicTranslatorDTO::lastName))
      .toList();

    assertEquals(3, translators.size());
    assertEquals(List.of("Etu0", "Etu1", "Etu2"), translators.stream().map(PublicTranslatorDTO::firstName).toList());
    assertEquals(List.of("Suku0", "Suku1", "Suku2"), translators.stream().map(PublicTranslatorDTO::lastName).toList());
    assertEquals(
      List.of("Kaupunki0", "Kaupunki1", "Kaupunki2"),
      translators.stream().map(PublicTranslatorDTO::town).toList()
    );
    assertEquals(Arrays.asList(null, "Maa1", "Maa2"), translators.stream().map(PublicTranslatorDTO::country).toList());

    assertEquals(
      List.of(
        createPublicTownDTO("Kaupunki0"),
        createPublicTownDTO("Kaupunki1", "Maa1"),
        createPublicTownDTO("Kaupunki2", "Maa2")
      ),
      responseDTO.towns()
    );

    assertLanguagePairs(translators.get(0).languagePairs());
    assertLanguagePairs(translators.get(1).languagePairs());
    assertLanguagePairs(translators.get(2).languagePairs());
  }

  @Test
  public void listTranslatorsReturnInRandomOrder() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    createVariousTranslators(meetingDate);

    // Since translators are in random order, and we created only small number of translators, sometimes translators
    // are returned in same order and will cause false positive. We'll check that order is random and if it's not,
    // we'll try again x times.

    final Supplier<List<Long>> fetchTranslatorsAndCollectIds = () -> {
      final List<PublicTranslatorDTO> translators = publicTranslatorService.listTranslators().translators();
      assertThoseHavingEmailAreFirstInTheList(translators);
      return translators.stream().map(PublicTranslatorDTO::id).toList();
    };

    final Supplier<Boolean> runTest = () -> {
      final List<Long> ids1 = fetchTranslatorsAndCollectIds.get();
      final List<Long> ids2 = fetchTranslatorsAndCollectIds.get();
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

  private void assertThoseHavingEmailAreFirstInTheList(final List<PublicTranslatorDTO> translators) {
    Boolean previousHadEmail = null;
    for (PublicTranslatorDTO t : translators) {
      final boolean hasEmail = translatorRepository.getReferenceById(t.id()).hasEmail();
      if (previousHadEmail != null && (!previousHadEmail && hasEmail)) {
        fail("Those with email should be first in the list, then those without email.");
      }
      previousHadEmail = hasEmail;
    }
  }

  @Test
  public void listTranslatorsShouldReturnDistinctLanguagePairsForTranslators() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();

    entityManager.persist(meetingDate);
    entityManager.persist(translator);

    createAuthorisation(translator, meetingDate, LocalDate.now().minusDays(3), LocalDate.now().plusDays(1), true, "EN");
    createAuthorisation(translator, meetingDate, LocalDate.now().minusDays(1), LocalDate.now().plusDays(3), true, "EN");

    final PublicTranslatorResponseDTO responseDTO = publicTranslatorService.listTranslators();

    assertLanguagePairs(responseDTO.translators().get(0).languagePairs());
  }

  private void assertLanguagePairs(final List<LanguagePairDTO> languagePairs) {
    assertEquals(1, languagePairs.size());
    assertEquals("FI", languagePairs.get(0).from());
    assertEquals("EN", languagePairs.get(0).to());
  }

  @Test
  public void listShouldNotReturnTranslatorsWithOnlyFormerVIRAuthorisations() {
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.formerVirAuthorisation(translator);

    authorisation.setPermissionToPublish(true);

    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final PublicTranslatorResponseDTO responseDTO = publicTranslatorService.listTranslators();

    assertTrue(responseDTO.translators().isEmpty());
  }

  @Test
  public void listShouldReturnDistinctTowns() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    final List<Pair<String, String>> townsAndCountries = Arrays.asList(
      Pair.of(null, null),
      Pair.of("Kaupunki1", null),
      Pair.of("", "FIN"),
      Pair.of("Kaupunki2", null),
      Pair.of("Kaupunki1", "FIN"),
      Pair.of(null, null),
      Pair.of("Tampere", null),
      Pair.of("Helsingfors", null),
      Pair.of("Tammerfors", null),
      Pair.of("Kaupunki2", null),
      Pair.of("Kaupunki1", "SWE"),
      Pair.of("Kaupunki3", "SWE"),
      Pair.of("Kaupunki2", "NOR"),
      Pair.of("Kaupunki1", null)
    );

    IntStream
      .range(0, townsAndCountries.size())
      .forEach(i -> {
        final Translator translator = Factory.translator();
        // Translators should be in random order, sorting makes assertions easier to write. Set last name which is
        // easy to sort.
        translator.setLastName(translator.getLastName() + StringUtils.leftPad(String.valueOf(i), 2, '0'));
        final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

        translator.setTown(townsAndCountries.get(i).getLeft());
        translator.setCountry(townsAndCountries.get(i).getRight());

        entityManager.persist(translator);
        entityManager.persist(authorisation);
      });

    final PublicTranslatorResponseDTO responseDTO = publicTranslatorService.listTranslators();

    final List<PublicTranslatorDTO> translatorsUnsorted = responseDTO.translators();
    final List<PublicTranslatorDTO> translators = translatorsUnsorted
      .stream()
      .sorted(Comparator.comparing(PublicTranslatorDTO::lastName))
      .toList();
    assertEquals(
      Arrays.asList(
        "",
        "Kaupunki1",
        "",
        "Kaupunki2",
        "Kaupunki1",
        "",
        "Tampere",
        "Helsinki",
        "Tampere",
        "Kaupunki2",
        "Kaupunki1",
        "Kaupunki3",
        "Kaupunki2",
        "Kaupunki1"
      ),
      translators.stream().map(PublicTranslatorDTO::town).toList()
    );
    assertEquals(
      List.of(
        createPublicTownDTO("Helsinki", "Helsingfors", null),
        createPublicTownDTO("Kaupunki1"),
        createPublicTownDTO("Kaupunki2"),
        createPublicTownDTO("Tampere", "Tammerfors", null),
        createPublicTownDTO("Kaupunki1", "SWE"),
        createPublicTownDTO("Kaupunki2", "NOR"),
        createPublicTownDTO("Kaupunki3", "SWE")
      ),
      responseDTO.towns()
    );
  }

  @Test
  public void listTranslatorsShouldReturnDistinctFromAndToLanguages() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    createVariousTranslators(meetingDate);

    final PublicTranslatorResponseDTO responseDTO = publicTranslatorService.listTranslators();
    final LanguagePairsDictDTO languagePairsDictDTO = responseDTO.langs();

    assertEquals(List.of("FI"), languagePairsDictDTO.from());
    assertEquals(List.of("EN", "SV"), languagePairsDictDTO.to());
  }

  private void createVariousTranslators(final MeetingDate meetingDate) {
    int i = 0;
    // Term active
    createTranslator(meetingDate, LocalDate.now(), LocalDate.now().plusDays(1), true, true, i++);

    // Term active
    createTranslator(meetingDate, LocalDate.now().minusDays(1), LocalDate.now(), true, true, i++);

    // Term active (no end date)
    createTranslator(meetingDate, LocalDate.now(), null, true, true, i++);

    // Term active but no permission given
    createTranslator(meetingDate, LocalDate.now().minusDays(10), LocalDate.now().plusDays(10), false, true, i++);

    // Term active, but not assured
    createTranslator(meetingDate, LocalDate.now().minusDays(10), LocalDate.now().plusDays(10), true, false, i++);

    // Term ended
    createTranslator(meetingDate, LocalDate.now().minusDays(10), LocalDate.now().minusDays(1), true, true, i++);

    // Term in future
    createTranslator(meetingDate, LocalDate.now().plusDays(1), LocalDate.now().plusDays(10), true, true, i++);

    // Term in future (no end date)
    createTranslator(meetingDate, LocalDate.now().plusDays(1), null, true, true, i++);

    // No term, VIR 2008
    createTranslator(meetingDate, null, null, true, true, i);
  }

  private void createTranslator(
    final MeetingDate meetingDate,
    final LocalDate termBeginDate,
    final LocalDate termEndDate,
    final boolean permissionToPublish,
    final boolean isAssuranceGiven,
    final int i
  ) {
    final Translator translator = Factory.translator();
    translator.setFirstName("Etu" + i);
    translator.setLastName("Suku" + i);
    translator.setTown("Kaupunki" + i);
    translator.setCountry(i == 0 ? "FIN" : "Maa" + i);
    translator.setAssuranceGiven(isAssuranceGiven);
    translator.setEmail(i % 2 == 0 ? null : "foo" + i + "@foo.invalid");

    entityManager.persist(translator);
    createAuthorisation(translator, meetingDate, termBeginDate, termEndDate, permissionToPublish, "EN");
    // this authorisation is always expired
    createAuthorisation(
      translator,
      meetingDate,
      LocalDate.now().minusDays(100),
      LocalDate.now().minusDays(1),
      permissionToPublish,
      "SV"
    );
  }

  private void createAuthorisation(
    final Translator translator,
    final MeetingDate meetingDate,
    final LocalDate termBeginDate,
    final LocalDate termEndDate,
    final boolean permissionToPublish,
    final String toLang
  ) {
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);
    if (termEndDate == null) {
      authorisation.setBasis(AuthorisationBasis.VIR);
    }

    authorisation.setFromLang("FI");
    authorisation.setToLang(toLang);
    authorisation.setTermBeginDate(termBeginDate);
    authorisation.setTermEndDate(termEndDate);
    authorisation.setPermissionToPublish(permissionToPublish);

    entityManager.persist(authorisation);
  }

  private PublicTownDTO createPublicTownDTO(final String name) {
    return createPublicTownDTO(name, name, null);
  }

  private PublicTownDTO createPublicTownDTO(final String name, final String country) {
    return createPublicTownDTO(name, name, country);
  }

  private PublicTownDTO createPublicTownDTO(final String name, final String nameSv, final String country) {
    return PublicTownDTO.builder().name(name).nameSv(nameSv).country(country).build();
  }
}
