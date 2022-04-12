package fi.oph.akt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.akt.Factory;
import fi.oph.akt.api.dto.LanguagePairDTO;
import fi.oph.akt.api.dto.LanguagePairsDictDTO;
import fi.oph.akt.api.dto.translator.PublicTranslatorDTO;
import fi.oph.akt.api.dto.translator.PublicTranslatorResponseDTO;
import fi.oph.akt.model.Authorisation;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.model.Translator;
import fi.oph.akt.repository.AuthorisationRepository;
import fi.oph.akt.repository.TranslatorRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.IntStream;
import javax.annotation.Resource;
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
    publicTranslatorService = new PublicTranslatorService(authorisationRepository, translatorRepository);
  }

  @Test
  public void listTranslatorsShouldReturnTranslatorsByAuthorisationsWithActiveTermAndPublishPermission() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    createVariousTranslators(meetingDate);

    final PublicTranslatorResponseDTO responseDTO = publicTranslatorService.listTranslators();
    final List<PublicTranslatorDTO> translators = responseDTO.translators();

    assertEquals(3, translators.size());
    assertEquals(List.of("Etu0", "Etu1", "Etu2"), translators.stream().map(PublicTranslatorDTO::firstName).toList());
    assertEquals(List.of("Suku0", "Suku1", "Suku2"), translators.stream().map(PublicTranslatorDTO::lastName).toList());
    assertEquals(
      List.of("Kaupunki0", "Kaupunki1", "Kaupunki2"),
      translators.stream().map(PublicTranslatorDTO::town).toList()
    );
    assertEquals(List.of("Maa0", "Maa1", "Maa2"), translators.stream().map(PublicTranslatorDTO::country).toList());

    assertEquals(List.of("Kaupunki0", "Kaupunki1", "Kaupunki2"), responseDTO.towns());

    assertLanguagePairs(translators.get(0).languagePairs());
    assertLanguagePairs(translators.get(1).languagePairs());
    assertLanguagePairs(translators.get(2).languagePairs());
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
    final Authorisation authorisation = Factory.authorisation(translator, null);

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

    final List<String> towns = Arrays.asList(
      null,
      "Kaupunki1",
      null,
      "Kaupunki2",
      "Kaupunki1",
      null,
      "Kaupunki2",
      "Kaupunki1"
    );

    IntStream
      .range(0, towns.size())
      .forEach(i -> {
        final Translator translator = Factory.translator();
        final Authorisation authorisation = Factory.authorisation(translator, meetingDate);

        translator.setTown(towns.get(i));

        entityManager.persist(translator);
        entityManager.persist(authorisation);
      });

    final PublicTranslatorResponseDTO responseDTO = publicTranslatorService.listTranslators();

    assertEquals(List.of("Kaupunki1", "Kaupunki2"), responseDTO.towns());
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
    createTranslator(meetingDate, LocalDate.now().plusDays(1), null, true, true, i);
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
    translator.setCountry("Maa" + i);
    translator.setAssuranceGiven(isAssuranceGiven);

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
    final Authorisation authorisation = Factory.authorisation(translator, meetingDate);
    authorisation.setFromLang("FI");
    authorisation.setToLang(toLang);
    authorisation.setTermBeginDate(termBeginDate);
    authorisation.setTermEndDate(termEndDate);
    authorisation.setPermissionToPublish(permissionToPublish);

    entityManager.persist(authorisation);
  }
}
