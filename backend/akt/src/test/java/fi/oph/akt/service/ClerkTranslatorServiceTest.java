package fi.oph.akt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import fi.oph.akt.Factory;
import fi.oph.akt.api.dto.clerk.AuthorisationDTO;
import fi.oph.akt.api.dto.clerk.ClerkTranslatorDTO;
import fi.oph.akt.api.dto.clerk.ClerkTranslatorResponseDTO;
import fi.oph.akt.api.dto.clerk.ExaminationDateDTO;
import fi.oph.akt.api.dto.clerk.MeetingDateDTO;
import fi.oph.akt.api.dto.clerk.modify.AuthorisationCreateDTO;
import fi.oph.akt.api.dto.clerk.modify.AuthorisationDTOCommonFields;
import fi.oph.akt.api.dto.clerk.modify.AuthorisationPublishPermissionDTO;
import fi.oph.akt.api.dto.clerk.modify.AuthorisationUpdateDTO;
import fi.oph.akt.api.dto.clerk.modify.TranslatorCreateDTO;
import fi.oph.akt.api.dto.clerk.modify.TranslatorDTOCommonFields;
import fi.oph.akt.api.dto.clerk.modify.TranslatorUpdateDTO;
import fi.oph.akt.audit.AktOperation;
import fi.oph.akt.audit.AuditService;
import fi.oph.akt.model.Authorisation;
import fi.oph.akt.model.AuthorisationBasis;
import fi.oph.akt.model.AuthorisationTermReminder;
import fi.oph.akt.model.Email;
import fi.oph.akt.model.EmailType;
import fi.oph.akt.model.ExaminationDate;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.model.Translator;
import fi.oph.akt.repository.AuthorisationRepository;
import fi.oph.akt.repository.AuthorisationTermReminderRepository;
import fi.oph.akt.repository.ExaminationDateRepository;
import fi.oph.akt.repository.MeetingDateRepository;
import fi.oph.akt.repository.TranslatorRepository;
import fi.oph.akt.util.exception.APIException;
import fi.oph.akt.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class ClerkTranslatorServiceTest {

  private static final String FI = "FI";

  private static final String DE = "DE";

  private static final String EN = "EN";

  private static final String SV = "SV";

  private static final String RU = "RU";

  private ClerkTranslatorService clerkTranslatorService;

  @Resource
  private AuthorisationRepository authorisationRepository;

  @Resource
  private AuthorisationTermReminderRepository authorisationTermReminderRepository;

  @Resource
  private ExaminationDateRepository examinationDateRepository;

  @Resource
  private MeetingDateRepository meetingDateRepository;

  @Resource
  private TranslatorRepository translatorRepository;

  @MockBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  @BeforeEach
  public void setup() {
    final ExaminationDateService examinationDateService = new ExaminationDateService(
      examinationDateRepository,
      auditService
    );
    final MeetingDateService meetingDateService = new MeetingDateService(meetingDateRepository, auditService);

    clerkTranslatorService =
      new ClerkTranslatorService(
        authorisationRepository,
        authorisationTermReminderRepository,
        examinationDateRepository,
        examinationDateService,
        meetingDateRepository,
        meetingDateService,
        translatorRepository,
        auditService
      );
  }

  @Test
  public void listShouldReturnAllTranslatorsWithProperFields() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    IntStream
      .range(0, 3)
      .forEach(i -> {
        final Translator translator = Factory.translator();
        final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

        entityManager.persist(translator);
        entityManager.persist(authorisation);
      });

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final List<ClerkTranslatorDTO> translators = responseDTO.translators();

    assertEquals(3, translators.size());

    translators.forEach(clerkTranslatorDTO -> {
      assertEquals(1, clerkTranslatorDTO.authorisations().size());
    });

    verify(auditService).logOperation(AktOperation.LIST_TRANSLATORS);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void listShouldReturnAllMeetingDates() {
    final MeetingDate meetingDate1 = Factory.meetingDate(LocalDate.of(2020, 1, 1));
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.of(2020, 10, 6));
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate1);

    entityManager.persist(meetingDate1);
    entityManager.persist(meetingDate2);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final List<MeetingDateDTO> meetingDateDTOS = responseDTO.meetingDates();

    assertEquals(2, meetingDateDTOS.size());

    assertEquals(meetingDate2.getId(), meetingDateDTOS.get(0).id());
    assertEquals(meetingDate2.getDate(), meetingDateDTOS.get(0).date());
    assertEquals(meetingDate1.getId(), meetingDateDTOS.get(1).id());
    assertEquals(meetingDate1.getDate(), meetingDateDTOS.get(1).date());
  }

  @Test
  public void listShouldReturnAllExaminationDates() {
    final ExaminationDate examinationDate1 = Factory.examinationDate(LocalDate.of(2020, 1, 1));
    final ExaminationDate examinationDate2 = Factory.examinationDate(LocalDate.of(2020, 10, 6));
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.autAuthorisation(translator, meetingDate, examinationDate1);

    entityManager.persist(examinationDate1);
    entityManager.persist(examinationDate2);
    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final List<ExaminationDateDTO> examinationDateDTOS = responseDTO.examinationDates();

    assertEquals(2, examinationDateDTOS.size());

    assertEquals(examinationDate2.getId(), examinationDateDTOS.get(0).id());
    assertEquals(examinationDate2.getDate(), examinationDateDTOS.get(0).date());
    assertEquals(examinationDate1.getId(), examinationDateDTOS.get(1).id());
    assertEquals(examinationDate1.getDate(), examinationDateDTOS.get(1).date());
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
        translator.setTown(towns.get(i));

        final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

        entityManager.persist(translator);
        entityManager.persist(authorisation);
      });

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();

    assertEquals(List.of("Kaupunki1", "Kaupunki2"), responseDTO.towns());
  }

  @Test
  public void listShouldReturnDistinctFromAndToLangs() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();

    final Authorisation authorisation1 = Factory.kktAuthorisation(translator, meetingDate);
    authorisation1.setFromLang(SV);
    authorisation1.setToLang(DE);

    final Authorisation authorisation2 = Factory.kktAuthorisation(translator, meetingDate);
    authorisation2.setFromLang(FI);
    authorisation2.setToLang(DE);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation1);
    entityManager.persist(authorisation2);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final List<String> fromLangs = responseDTO.langs().from();
    final List<String> toLangs = responseDTO.langs().to();

    assertEquals(2, fromLangs.size());
    assertEquals(FI, fromLangs.get(0));
    assertEquals(SV, fromLangs.get(1));

    assertEquals(1, toLangs.size());
    assertEquals(DE, toLangs.get(0));
  }

  @Test
  public void listShouldReturnProperPersonalDataForTranslators() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    final List<String> identityNumbers = Arrays.asList(null, "123", "999888777666");
    final List<String> firstNames = List.of("Etu0", "Etu1", "Etu2");
    final List<String> lastNames = List.of("Suku0", "Suku1", "Suku2");
    final List<String> emails = Arrays.asList("email0", "email1", null);
    final List<String> phoneNumbers = Arrays.asList("phone0", null, "phone2");
    final List<String> streets = Arrays.asList(null, "katu1", "katu2");
    final List<String> postalCodes = Arrays.asList("Postinumero0", "Postinumero1", null);
    final List<String> towns = Arrays.asList(null, "Kaupunki1", "Kaupunki2");
    final List<String> countries = Arrays.asList("Suomi", null, "Maa2");
    final List<String> extraInformations = Arrays.asList(null, "Nimi muutettu", "???");
    final List<Boolean> assurances = Arrays.asList(true, false, true);

    IntStream
      .range(0, 3)
      .forEach(i -> {
        final Translator translator = Factory.translator();
        translator.setIdentityNumber(identityNumbers.get(i));
        translator.setFirstName(firstNames.get(i));
        translator.setLastName(lastNames.get(i));
        translator.setEmail(emails.get(i));
        translator.setPhone(phoneNumbers.get(i));
        translator.setStreet(streets.get(i));
        translator.setPostalCode(postalCodes.get(i));
        translator.setTown(towns.get(i));
        translator.setCountry(countries.get(i));
        translator.setExtraInformation(extraInformations.get(i));
        translator.setAssuranceGiven(assurances.get(i));

        final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

        entityManager.persist(translator);
        entityManager.persist(authorisation);
      });

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final List<ClerkTranslatorDTO> translators = responseDTO.translators();

    assertEquals(3, translators.size());

    assertTranslatorTextField(firstNames, translators, ClerkTranslatorDTO::firstName);
    assertTranslatorTextField(lastNames, translators, ClerkTranslatorDTO::lastName);
    assertTranslatorTextField(identityNumbers, translators, ClerkTranslatorDTO::identityNumber);
    assertTranslatorTextField(emails, translators, ClerkTranslatorDTO::email);
    assertTranslatorTextField(phoneNumbers, translators, ClerkTranslatorDTO::phoneNumber);
    assertTranslatorTextField(streets, translators, ClerkTranslatorDTO::street);
    assertTranslatorTextField(postalCodes, translators, ClerkTranslatorDTO::postalCode);
    assertTranslatorTextField(towns, translators, ClerkTranslatorDTO::town);
    assertTranslatorTextField(countries, translators, ClerkTranslatorDTO::country);
    assertTranslatorTextField(extraInformations, translators, ClerkTranslatorDTO::extraInformation);

    assertEquals(assurances, translators.stream().map(ClerkTranslatorDTO::isAssuranceGiven).toList());
  }

  private void assertTranslatorTextField(
    final List<String> expected,
    final List<ClerkTranslatorDTO> translators,
    final Function<ClerkTranslatorDTO, String> getter
  ) {
    assertEquals(expected, translators.stream().map(getter).toList());
  }

  @Test
  public void listShouldReturnProperDataForTranslatorWithAUTBasis() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final ExaminationDate examinationDate = Factory.examinationDate();
    final Authorisation authorisation = Factory.autAuthorisation(translator, meetingDate, examinationDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(examinationDate);
    entityManager.persist(authorisation);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final AuthorisationDTO authorisationDTO = responseDTO.translators().get(0).authorisations().get(0);

    assertEquals(authorisation.getBasis(), authorisationDTO.basis());
    assertEquals(authorisation.getTermBeginDate(), authorisationDTO.termBeginDate());
    assertEquals(authorisation.getTermEndDate(), authorisationDTO.termEndDate());
    assertEquals(authorisation.getDiaryNumber(), authorisationDTO.diaryNumber());
    assertEquals(authorisation.getExaminationDate().getDate(), authorisationDTO.examinationDate());
  }

  @Test
  public void listShouldReturnProperDataForTranslatorWithKKTBasis() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final AuthorisationDTO authorisationDTO = responseDTO.translators().get(0).authorisations().get(0);

    assertEquals(authorisation.getBasis(), authorisationDTO.basis());
    assertEquals(authorisation.getTermBeginDate(), authorisationDTO.termBeginDate());
    assertEquals(authorisation.getTermEndDate(), authorisationDTO.termEndDate());
    assertEquals(authorisation.getDiaryNumber(), authorisationDTO.diaryNumber());
    assertNull(authorisationDTO.examinationDate());
  }

  @Test
  public void listShouldReturnProperDataForTranslatorWithVIRBasis() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.virAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final AuthorisationDTO authorisationDTO = responseDTO.translators().get(0).authorisations().get(0);

    assertEquals(authorisation.getBasis(), authorisationDTO.basis());
    assertEquals(authorisation.getTermBeginDate(), authorisationDTO.termBeginDate());
    assertNull(authorisationDTO.termEndDate());
    assertEquals(authorisation.getDiaryNumber(), authorisationDTO.diaryNumber());
    assertNull(authorisationDTO.examinationDate());
  }

  @Test
  public void listShouldReturnProperDataForTranslatorWithFormerVIRBasis() {
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.formerVirAuthorisation(translator);

    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final AuthorisationDTO authorisationDTO = responseDTO.translators().get(0).authorisations().get(0);

    assertEquals(authorisation.getBasis(), authorisationDTO.basis());
    assertNull(authorisationDTO.termBeginDate());
    assertNull(authorisationDTO.termEndDate());
    assertEquals(authorisation.getDiaryNumber(), authorisationDTO.diaryNumber());
    assertNull(authorisationDTO.examinationDate());
  }

  @Test
  public void listShouldReturnProperDataForTranslatorWithMultipleAuthorisations() {
    final MeetingDate meetingDate1 = Factory.meetingDate(LocalDate.of(2015, 1, 1));
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.of(2018, 6, 1));
    final Translator translator = Factory.translator();
    final ExaminationDate examinationDate = Factory.examinationDate();

    final Authorisation autAuth = Factory.autAuthorisation(translator, meetingDate1, examinationDate);
    autAuth.setFromLang(RU);
    autAuth.setToLang(FI);
    autAuth.setPermissionToPublish(true);

    final Authorisation kktAuth = Factory.kktAuthorisation(translator, meetingDate2);
    kktAuth.setFromLang(FI);
    kktAuth.setToLang(EN);
    kktAuth.setPermissionToPublish(false);

    entityManager.persist(meetingDate1);
    entityManager.persist(meetingDate2);
    entityManager.persist(translator);
    entityManager.persist(examinationDate);
    entityManager.persist(autAuth);
    entityManager.persist(kktAuth);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final List<AuthorisationDTO> authorisationDTOS = responseDTO.translators().get(0).authorisations();

    assertEquals(2, authorisationDTOS.size());

    final AuthorisationDTO autAuthorisationDTO = authorisationDTOS
      .stream()
      .filter(dto -> dto.basis().equals(AuthorisationBasis.AUT))
      .toList()
      .get(0);

    final AuthorisationDTO kktAuthorisationDTO = authorisationDTOS
      .stream()
      .filter(dto -> dto.basis().equals(AuthorisationBasis.KKT))
      .toList()
      .get(0);

    assertEquals(autAuth.getTermBeginDate(), autAuthorisationDTO.termBeginDate());
    assertEquals(autAuth.getTermEndDate(), autAuthorisationDTO.termEndDate());
    assertEquals(autAuth.getFromLang(), autAuthorisationDTO.languagePair().from());
    assertEquals(autAuth.getToLang(), autAuthorisationDTO.languagePair().to());
    assertEquals(autAuth.isPermissionToPublish(), autAuthorisationDTO.permissionToPublish());

    assertEquals(kktAuth.getTermBeginDate(), kktAuthorisationDTO.termBeginDate());
    assertEquals(kktAuth.getTermEndDate(), kktAuthorisationDTO.termEndDate());
    assertEquals(kktAuth.getFromLang(), kktAuthorisationDTO.languagePair().from());
    assertEquals(kktAuth.getToLang(), kktAuthorisationDTO.languagePair().to());
    assertEquals(kktAuth.isPermissionToPublish(), kktAuthorisationDTO.permissionToPublish());
  }

  @Test
  public void listShouldReturnTranslatorsAuthorisationsOrderedByTermBeginDate() {
    final MeetingDate meetingDate1 = Factory.meetingDate(LocalDate.now().minusYears(1));
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.now());
    final Translator translator = Factory.translator();
    final Authorisation authorisation1 = Factory.kktAuthorisation(translator, meetingDate1);
    final Authorisation authorisation2 = Factory.virAuthorisation(translator, meetingDate2);
    final Authorisation authorisation3 = Factory.formerVirAuthorisation(translator);

    entityManager.persist(meetingDate1);
    entityManager.persist(meetingDate2);
    entityManager.persist(translator);
    entityManager.persist(authorisation1);
    entityManager.persist(authorisation2);
    entityManager.persist(authorisation3);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final List<AuthorisationDTO> authorisationDTOS = responseDTO.translators().get(0).authorisations();

    assertEquals(authorisation2.getId(), authorisationDTOS.get(0).id());
    assertEquals(authorisation1.getId(), authorisationDTOS.get(1).id());
    assertEquals(authorisation3.getId(), authorisationDTOS.get(2).id());
  }

  @Test
  public void testTranslatorCreate() {
    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.now().minusDays(10));
    entityManager.persist(meetingDate);

    final AuthorisationCreateDTO expectedAuth = AuthorisationCreateDTO
      .builder()
      .basis(AuthorisationBasis.KKT)
      .from(FI)
      .to(SV)
      .permissionToPublish(true)
      .termBeginDate(meetingDate.getDate())
      .termEndDate(LocalDate.now().plusDays(1))
      .diaryNumber("012345")
      .build();
    final TranslatorCreateDTO createDTO = TranslatorCreateDTO
      .builder()
      .identityNumber("aard")
      .firstName("Anne")
      .lastName("Aardvark")
      .email("anne@aardvark.invalid")
      .phoneNumber("555")
      .street("st")
      .town("tw")
      .postalCode("pstl")
      .country("ct")
      .extraInformation("extra")
      .isAssuranceGiven(true)
      .authorisations(List.of(expectedAuth))
      .build();

    final ClerkTranslatorDTO response = clerkTranslatorService.createTranslator(createDTO);

    assertResponseMatchesGet(response);

    assertTranslatorCommonFields(createDTO, response);

    assertEquals(1, response.authorisations().size());
    final AuthorisationDTO authDto = response.authorisations().get(0);
    assertAuthorisationCommonFields(expectedAuth, authDto);

    verify(auditService).logById(AktOperation.CREATE_TRANSLATOR, response.id());
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testTranslatorCreateFailsOnDuplicateIdentityNumber() {
    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.now().minusDays(10));
    entityManager.persist(meetingDate);

    final String identityNumber = "xxx";

    final Translator existingTranslator = Factory.translator();
    existingTranslator.setIdentityNumber(identityNumber);
    entityManager.persist(existingTranslator);

    final AuthorisationCreateDTO expectedAuth = AuthorisationCreateDTO
      .builder()
      .basis(AuthorisationBasis.KKT)
      .from(FI)
      .to(SV)
      .permissionToPublish(true)
      .termBeginDate(meetingDate.getDate())
      .termEndDate(LocalDate.now().plusDays(1))
      .diaryNumber("012345")
      .build();
    final TranslatorCreateDTO createDTO = TranslatorCreateDTO
      .builder()
      .identityNumber(identityNumber)
      .firstName("Anne")
      .lastName("Aardvark")
      .email("anne@aardvark.invalid")
      .phoneNumber("555")
      .street("st")
      .town("tw")
      .postalCode("pstl")
      .country("ct")
      .extraInformation("extra")
      .isAssuranceGiven(true)
      .authorisations(List.of(expectedAuth))
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkTranslatorService.createTranslator(createDTO));

    assertEquals(APIExceptionType.TRANSLATOR_CREATE_DUPLICATE_IDENTITY_NUMBER, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testTranslatorCreateFailsOnDuplicateEmail() {
    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.now().minusDays(10));
    entityManager.persist(meetingDate);

    final String email = "xxx@xxx.xxx";

    final Translator existingTranslator = Factory.translator();
    existingTranslator.setEmail(email);
    entityManager.persist(existingTranslator);

    final AuthorisationCreateDTO expectedAuth = AuthorisationCreateDTO
      .builder()
      .basis(AuthorisationBasis.KKT)
      .from(FI)
      .to(SV)
      .permissionToPublish(true)
      .termBeginDate(meetingDate.getDate())
      .termEndDate(LocalDate.now().plusDays(1))
      .diaryNumber("012345")
      .build();
    final TranslatorCreateDTO createDTO = TranslatorCreateDTO
      .builder()
      .identityNumber("aard")
      .firstName("Anne")
      .lastName("Aardvark")
      .email(email)
      .phoneNumber("555")
      .street("st")
      .town("tw")
      .postalCode("pstl")
      .country("ct")
      .extraInformation("extra")
      .isAssuranceGiven(true)
      .authorisations(List.of(expectedAuth))
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkTranslatorService.createTranslator(createDTO));

    assertEquals(APIExceptionType.TRANSLATOR_CREATE_DUPLICATE_EMAIL, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testTranslatorGet() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final ClerkTranslatorDTO clerkTranslatorDTO = clerkTranslatorService.getTranslator(translator.getId());

    assertNotNull(clerkTranslatorDTO);
    assertEquals(translator.getId(), clerkTranslatorDTO.id());

    verify(auditService).logById(AktOperation.GET_TRANSLATOR, translator.getId());
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testTranslatorUpdate() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final TranslatorUpdateDTO updateDTO = TranslatorUpdateDTO
      .builder()
      .id(translator.getId())
      .version(translator.getVersion())
      .identityNumber("aard")
      .firstName("Anne")
      .lastName("Aardvark")
      .email("anne@aardvark.invalid")
      .phoneNumber("555")
      .street("st")
      .town("tw")
      .postalCode("pstl")
      .country("ct")
      .extraInformation("extra")
      .isAssuranceGiven(false)
      .build();

    final ClerkTranslatorDTO response = clerkTranslatorService.updateTranslator(updateDTO);

    assertResponseMatchesGet(response);

    assertEquals(updateDTO.id(), response.id());
    assertEquals(updateDTO.version() + 1, response.version());
    assertTranslatorCommonFields(updateDTO, response);

    verify(auditService).logById(AktOperation.UPDATE_TRANSLATOR, response.id());
    verifyNoMoreInteractions(auditService);
  }

  private void assertTranslatorCommonFields(final TranslatorDTOCommonFields expected, final ClerkTranslatorDTO dto) {
    assertEquals(expected.identityNumber(), dto.identityNumber());
    assertEquals(expected.firstName(), dto.firstName());
    assertEquals(expected.lastName(), dto.lastName());
    assertEquals(expected.email(), dto.email());
    assertEquals(expected.phoneNumber(), dto.phoneNumber());
    assertEquals(expected.street(), dto.street());
    assertEquals(expected.town(), dto.town());
    assertEquals(expected.postalCode(), dto.postalCode());
    assertEquals(expected.country(), dto.country());
    assertEquals(expected.extraInformation(), dto.extraInformation());
    assertEquals(expected.isAssuranceGiven(), dto.isAssuranceGiven());
  }

  @Test
  public void testTranslatorUpdateFailsOnDuplicateIdentityNumber() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    final String identityNumber = "xxx";

    final Translator otherTranslator = Factory.translator();
    otherTranslator.setIdentityNumber(identityNumber);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);
    entityManager.persist(otherTranslator);

    final TranslatorUpdateDTO updateDTO = TranslatorUpdateDTO
      .builder()
      .id(translator.getId())
      .version(translator.getVersion())
      .identityNumber(identityNumber)
      .firstName("Anne")
      .lastName("Aardvark")
      .email("anne@aardvark.invalid")
      .phoneNumber("555")
      .street("st")
      .town("tw")
      .postalCode("pstl")
      .country("ct")
      .extraInformation("extra")
      .isAssuranceGiven(false)
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkTranslatorService.updateTranslator(updateDTO));

    assertEquals(APIExceptionType.TRANSLATOR_UPDATE_DUPLICATE_IDENTITY_NUMBER, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testTranslatorUpdateFailsOnDuplicateEmail() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    final String email = "xxx@xxx.xxx";

    final Translator otherTranslator = Factory.translator();
    otherTranslator.setEmail(email);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);
    entityManager.persist(otherTranslator);

    final TranslatorUpdateDTO updateDTO = TranslatorUpdateDTO
      .builder()
      .id(translator.getId())
      .version(translator.getVersion())
      .identityNumber("aard")
      .firstName("Anne")
      .lastName("Aardvark")
      .email(email)
      .phoneNumber("555")
      .street("st")
      .town("tw")
      .postalCode("pstl")
      .country("ct")
      .extraInformation("extra")
      .isAssuranceGiven(false)
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkTranslatorService.updateTranslator(updateDTO));

    assertEquals(APIExceptionType.TRANSLATOR_UPDATE_DUPLICATE_EMAIL, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testTranslatorDelete() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);
    final Email email = Factory.email(EmailType.AUTHORISATION_EXPIRY);
    final AuthorisationTermReminder authorisationTermReminder = Factory.authorisationTermReminder(authorisation, email);

    final Translator translator2 = Factory.translator();
    final Authorisation authorisation2 = Factory.kktAuthorisation(translator2, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);
    entityManager.persist(email);
    entityManager.persist(authorisationTermReminder);
    entityManager.persist(translator2);
    entityManager.persist(authorisation2);

    final long translatorId = translator.getId();
    clerkTranslatorService.deleteTranslator(translatorId);

    assertEquals(
      Set.of(translator2.getId()),
      translatorRepository.findAll().stream().map(Translator::getId).collect(Collectors.toSet())
    );

    verify(auditService).logById(AktOperation.DELETE_TRANSLATOR, translatorId);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testAuthorisationCreate() {
    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.now().minusYears(1));
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);
    final ExaminationDate examinationDate = Factory.examinationDate();

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);
    entityManager.persist(examinationDate);

    final AuthorisationCreateDTO createDTO = AuthorisationCreateDTO
      .builder()
      .basis(AuthorisationBasis.AUT)
      .from(FI)
      .to(SV)
      .permissionToPublish(true)
      .termBeginDate(meetingDate.getDate())
      .termEndDate(LocalDate.now().plusDays(1))
      .diaryNumber("012345")
      .examinationDate(examinationDate.getDate())
      .build();

    final ClerkTranslatorDTO response = clerkTranslatorService.createAuthorisation(translator.getId(), createDTO);

    assertResponseMatchesGet(response);

    assertEquals(2, response.authorisations().size());
    final AuthorisationDTO authorisationDTO = response
      .authorisations()
      .stream()
      .filter(a -> a.id() != authorisation.getId())
      .findAny()
      .orElseThrow();

    assertAuthorisationCommonFields(createDTO, authorisationDTO);

    verify(auditService).logAuthorisation(AktOperation.CREATE_AUTHORISATION, translator, authorisationDTO.id());
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testAuthorisationUpdate() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.now().minusDays(1));
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(meetingDate2);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final AuthorisationUpdateDTO updateDTO = AuthorisationUpdateDTO
      .builder()
      .id(authorisation.getId())
      .version(authorisation.getVersion())
      .basis(authorisation.getBasis())
      .from(FI)
      .to(SV)
      .permissionToPublish(!authorisation.isPermissionToPublish())
      .termBeginDate(meetingDate2.getDate())
      .termEndDate(authorisation.getTermEndDate().plusDays(1))
      .diaryNumber("012345")
      .build();

    final ClerkTranslatorDTO response = clerkTranslatorService.updateAuthorisation(updateDTO);

    assertResponseMatchesGet(response);

    final AuthorisationDTO authorisationDTO = response.authorisations().get(0);
    assertEquals(updateDTO.id(), authorisationDTO.id());
    assertEquals(updateDTO.version() + 1, authorisationDTO.version());
    assertAuthorisationCommonFields(updateDTO, authorisationDTO);

    verify(auditService).logAuthorisation(AktOperation.UPDATE_AUTHORISATION, translator, authorisationDTO.id());
    verifyNoMoreInteractions(auditService);
  }

  private void assertAuthorisationCommonFields(
    final AuthorisationDTOCommonFields expected,
    final AuthorisationDTO authorisationDTO
  ) {
    assertEquals(expected.from(), authorisationDTO.languagePair().from());
    assertEquals(expected.to(), authorisationDTO.languagePair().to());
    assertEquals(expected.basis(), authorisationDTO.basis());
    assertEquals(expected.termBeginDate(), authorisationDTO.termBeginDate());
    assertEquals(expected.termEndDate(), authorisationDTO.termEndDate());
    assertEquals(expected.permissionToPublish(), authorisationDTO.permissionToPublish());
    assertEquals(expected.diaryNumber(), authorisationDTO.diaryNumber());
    assertEquals(expected.examinationDate(), authorisationDTO.examinationDate());
  }

  @Test
  public void testAuthorisationUpdatePublishPermission() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    authorisation.setPermissionToPublish(true);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final AuthorisationPublishPermissionDTO publishPermissionDTO = AuthorisationPublishPermissionDTO
      .builder()
      .id(authorisation.getId())
      .version(authorisation.getVersion())
      .permissionToPublish(false)
      .build();

    final ClerkTranslatorDTO response = clerkTranslatorService.updateAuthorisationPublishPermission(
      publishPermissionDTO
    );

    assertResponseMatchesGet(response);

    final AuthorisationDTO authorisationDTO = response.authorisations().get(0);
    assertEquals(publishPermissionDTO.id(), authorisationDTO.id());
    assertEquals(publishPermissionDTO.version() + 1, authorisationDTO.version());
    assertEquals(false, authorisationDTO.permissionToPublish());

    verify(auditService)
      .logAuthorisation(AktOperation.UPDATE_AUTHORISATION_PUBLISH_PERMISSION, translator, authorisationDTO.id());
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testAuthorisationDelete() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);
    final Authorisation authorisation2 = Factory.kktAuthorisation(translator, meetingDate);
    final Email email = Factory.email(EmailType.AUTHORISATION_EXPIRY);
    final AuthorisationTermReminder authorisationTermReminder = Factory.authorisationTermReminder(authorisation, email);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);
    entityManager.persist(authorisation2);
    entityManager.persist(email);
    entityManager.persist(authorisationTermReminder);

    final long authorisationId = authorisation.getId();
    final ClerkTranslatorDTO response = clerkTranslatorService.deleteAuthorisation(authorisationId);

    assertResponseMatchesGet(response);

    assertEquals(
      Set.of(authorisation2.getId()),
      response.authorisations().stream().map(AuthorisationDTO::id).collect(Collectors.toSet())
    );

    verify(auditService).logAuthorisation(AktOperation.DELETE_AUTHORISATION, translator, authorisationId);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testAuthorisationDeleteFailsForLastAuthorisation() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkTranslatorService.deleteAuthorisation(authorisation.getId())
    );

    assertEquals(APIExceptionType.AUTHORISATION_DELETE_LAST_AUTHORISATION, ex.getExceptionType());
    assertEquals(1, authorisationRepository.count());

    verifyNoInteractions(auditService);
  }

  @Test
  public void testAuthorisationCreateFailsOnMissingMeetingDate() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final AuthorisationCreateDTO createDTO = AuthorisationCreateDTO
      .builder()
      .basis(AuthorisationBasis.KKT)
      .from(FI)
      .to(SV)
      .permissionToPublish(true)
      .termBeginDate(meetingDate.getDate().plusDays(1))
      .termEndDate(meetingDate.getDate().plusYears(1))
      .diaryNumber("012345")
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkTranslatorService.createAuthorisation(translator.getId(), createDTO)
    );
    assertEquals(APIExceptionType.AUTHORISATION_MISSING_MEETING_DATE, ex.getExceptionType());

    verifyNoInteractions(auditService);
  }

  @Test
  public void testAuthorisationCreateFailsOnMissingExaminationDate() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final AuthorisationCreateDTO createDTO = AuthorisationCreateDTO
      .builder()
      .basis(AuthorisationBasis.AUT)
      .from(FI)
      .to(SV)
      .permissionToPublish(true)
      .termBeginDate(meetingDate.getDate())
      .termEndDate(meetingDate.getDate().plusYears(1))
      .diaryNumber("012345")
      .examinationDate(LocalDate.now())
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkTranslatorService.createAuthorisation(translator.getId(), createDTO)
    );
    assertEquals(APIExceptionType.AUTHORISATION_MISSING_EXAMINATION_DATE, ex.getExceptionType());

    verifyNoInteractions(auditService);
  }

  @Test
  public void testAuthorisationCreateFailsForBasisAndExaminationDateMismatch() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final AuthorisationCreateDTO createDTO = AuthorisationCreateDTO
      .builder()
      .basis(AuthorisationBasis.AUT)
      .from(FI)
      .to(SV)
      .permissionToPublish(true)
      .termBeginDate(meetingDate.getDate())
      .termEndDate(LocalDate.now().plusDays(1))
      .diaryNumber("012345")
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkTranslatorService.createAuthorisation(translator.getId(), createDTO)
    );
    assertEquals(APIExceptionType.AUTHORISATION_BASIS_AND_EXAMINATION_DATE_MISMATCH, ex.getExceptionType());

    verifyNoInteractions(auditService);
  }

  private void assertResponseMatchesGet(final ClerkTranslatorDTO response) {
    final ClerkTranslatorDTO expected = clerkTranslatorService.getTranslatorWithoutAudit(response.id());

    assertNotNull(response);
    assertNotNull(expected);
    assertEquals(expected, response);
  }
}
