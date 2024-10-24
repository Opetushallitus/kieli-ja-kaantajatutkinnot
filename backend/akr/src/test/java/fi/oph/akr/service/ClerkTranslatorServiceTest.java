package fi.oph.akr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import fi.oph.akr.Factory;
import fi.oph.akr.api.dto.clerk.AuthorisationDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorAddressDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorAuthorisationsDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorResponseDTO;
import fi.oph.akr.api.dto.clerk.ExaminationDateDTO;
import fi.oph.akr.api.dto.clerk.MeetingDateDTO;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationCreateDTO;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationDTOCommonFields;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationUpdateDTO;
import fi.oph.akr.api.dto.clerk.modify.TranslatorCreateDTO;
import fi.oph.akr.api.dto.clerk.modify.TranslatorDTOCommonFields;
import fi.oph.akr.api.dto.clerk.modify.TranslatorUpdateDTO;
import fi.oph.akr.api.dto.translator.TranslatorAddressDTO;
import fi.oph.akr.audit.AkrOperation;
import fi.oph.akr.audit.AuditService;
import fi.oph.akr.audit.dto.AuthorisationAuditDTO;
import fi.oph.akr.audit.dto.ClerkTranslatorAuditDTO;
import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.AuthorisationBasis;
import fi.oph.akr.model.AuthorisationTermReminder;
import fi.oph.akr.model.Email;
import fi.oph.akr.model.EmailType;
import fi.oph.akr.model.ExaminationDate;
import fi.oph.akr.model.MeetingDate;
import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.OnrService;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;
import fi.oph.akr.onr.model.PersonalData;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.repository.AuthorisationTermReminderRepository;
import fi.oph.akr.repository.ExaminationDateRepository;
import fi.oph.akr.repository.MeetingDateRepository;
import fi.oph.akr.repository.TranslatorRepository;
import fi.oph.akr.util.exception.APIException;
import fi.oph.akr.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
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

  @MockBean
  private OnrService onrService;

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
        //countryService,
        auditService,
        onrService
      );
  }

  @Test
  public void listShouldReturnAllTranslators() {
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    final Map<String, PersonalData> personalDatasTest = new HashMap<String, PersonalData>();
    IntStream
      .range(0, 3)
      .forEach(i -> {
        final Translator translator = Factory.translator();
        final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

        entityManager.persist(translator);
        entityManager.persist(authorisation);

        final PersonalData personalData = defaultPersonalData(translator.getOnrId());
        personalDatasTest.put(translator.getOnrId(), personalData);
      });
    when(onrService.getCachedPersonalDatas()).thenReturn(personalDatasTest);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final List<ClerkTranslatorDTO> translators = responseDTO.translators();

    assertEquals(3, translators.size());

    verify(auditService).logOperation(AkrOperation.LIST_TRANSLATORS);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void listShouldReturnAllMeetingDates() {
    final MeetingDate meetingDate1 = Factory.meetingDate(LocalDate.of(2020, 1, 1));
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.of(2020, 10, 6));
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate1);

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

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

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

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
  public void listShouldReturnDistinctFromAndToLangs() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

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

    final List<String> identityNumbers = Arrays.asList("112233", "123", "999888777666");
    final List<String> firstNames = List.of("Etu0", "Etu1", "Etu2");
    final List<String> nickNames = List.of("Etu0", "Etu1", "Etu2");
    final List<String> lastNames = List.of("Suku0", "Suku1", "Suku2");
    final List<String> emails = Arrays.asList("email0", "email1", null);
    final List<String> phoneNumbers = Arrays.asList("phone0", null, "phone2");
    final List<String> streets = Arrays.asList(null, "katu1", "katu2");
    final List<String> postalCodes = Arrays.asList("Postinumero0", "Postinumero1", null);
    final List<String> towns = Arrays.asList(null, "Kaupunki1", "Kaupunki2");
    final List<String> countries = Arrays.asList("Suomi", null, "Maa2");
    final List<String> extraInformations = Arrays.asList(null, "Nimi muutettu", "???");
    final List<Boolean> assurances = Arrays.asList(true, false, true);

    final Map<String, PersonalData> personalDatas = new HashMap<String, PersonalData>();
    IntStream
      .range(0, 3)
      .forEach(i -> {
        final Translator translator = Factory.translator();
        translator.setExtraInformation(extraInformations.get(i));
        translator.setAssuranceGiven(assurances.get(i));

        personalDatas.put(
          translator.getOnrId(),
          PersonalData
            .builder()
            .identityNumber(identityNumbers.get(i))
            .firstName(firstNames.get(i))
            .nickName(nickNames.get(i))
            .lastName(lastNames.get(i))
            .email(emails.get(i))
            .phoneNumber(phoneNumbers.get(i))
            .address(Factory.createAddressList(streets.get(i), postalCodes.get(i), towns.get(i), countries.get(i)))
            .individualised(false)
            .hasIndividualisedAddress(false)
            .build()
        );

        final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

        entityManager.persist(translator);
        entityManager.persist(authorisation);
      });
    when(onrService.getCachedPersonalDatas()).thenReturn(personalDatas);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final List<ClerkTranslatorDTO> translators = responseDTO.translators();

    assertEquals(3, translators.size());

    assertTranslatorTextField(firstNames, translators, ClerkTranslatorDTO::firstName);
    assertTranslatorTextField(nickNames, translators, ClerkTranslatorDTO::nickName);
    assertTranslatorTextField(lastNames, translators, ClerkTranslatorDTO::lastName);
    assertTranslatorTextField(identityNumbers, translators, ClerkTranslatorDTO::identityNumber);
    assertTranslatorTextField(emails, translators, ClerkTranslatorDTO::email);
    assertTranslatorTextField(phoneNumbers, translators, ClerkTranslatorDTO::phoneNumber);
    assertTranslatorAddressField(streets, translators, ClerkTranslatorAddressDTO::street);
    assertTranslatorAddressField(postalCodes, translators, ClerkTranslatorAddressDTO::postalCode);
    assertTranslatorAddressField(towns, translators, ClerkTranslatorAddressDTO::town);
    assertTranslatorAddressField(countries, translators, ClerkTranslatorAddressDTO::country);
    assertTranslatorTextField(extraInformations, translators, ClerkTranslatorDTO::extraInformation);

    assertEquals(assurances, translators.stream().map(ClerkTranslatorDTO::isAssuranceGiven).toList());
  }

  private List<ClerkTranslatorAddressDTO> createClerkAddress(
    final String street,
    final String postalCode,
    final String town,
    final String country
  ) {
    return List.of(
      ClerkTranslatorAddressDTO
        .builder()
        .street(street)
        .postalCode(postalCode)
        .town(town)
        .country(country)
        .source(ContactDetailsGroupSource.AKR)
        .type(ContactDetailsGroupType.AKR_OSOITE)
        .selected(true)
        .build()
    );
  }

  private void assertTranslatorAddressField(
    final List<String> expected,
    final List<ClerkTranslatorDTO> translators,
    final Function<ClerkTranslatorAddressDTO, String> getter
  ) {
    assertEquals(
      expected,
      translators
        .stream()
        .map(translator -> translator.address().stream().map(getter).toList())
        .flatMap(List::stream)
        .toList()
    );
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

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(examinationDate);
    entityManager.persist(authorisation);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final AuthorisationDTO authorisationDTO = responseDTO.translators().get(0).authorisations().effective().get(0);

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

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final AuthorisationDTO authorisationDTO = responseDTO.translators().get(0).authorisations().effective().get(0);

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

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final AuthorisationDTO authorisationDTO = responseDTO.translators().get(0).authorisations().effective().get(0);

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

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final AuthorisationDTO authorisationDTO = responseDTO.translators().get(0).authorisations().formerVir().get(0);

    assertEquals(authorisation.getBasis(), authorisationDTO.basis());
    assertNull(authorisationDTO.termBeginDate());
    assertNull(authorisationDTO.termEndDate());
    assertEquals(authorisation.getDiaryNumber(), authorisationDTO.diaryNumber());
    assertNull(authorisationDTO.examinationDate());
  }

  @Test
  public void listShouldSplitAuthorisationsAccordingly() {
    final MeetingDate meetingDate1 = Factory.meetingDate(LocalDate.now().minusYears(2));
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.now().minusMonths(10));
    final MeetingDate meetingDate3 = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final ExaminationDate examinationDate = Factory.examinationDate();

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

    final Authorisation expiredAuth = Factory.autAuthorisation(translator, meetingDate1, examinationDate);
    expiredAuth.setFromLang(RU);
    expiredAuth.setToLang(FI);
    expiredAuth.setPermissionToPublish(true);

    final Authorisation expiringAuth = Factory.kktAuthorisation(translator, meetingDate2);
    expiringAuth.setFromLang(FI);
    expiringAuth.setToLang(EN);
    expiringAuth.setPermissionToPublish(false);

    final Authorisation effectiveAuth = Factory.kktAuthorisation(translator, meetingDate3);
    effectiveAuth.setFromLang(FI);
    effectiveAuth.setToLang(SV);

    entityManager.persist(meetingDate1);
    entityManager.persist(meetingDate2);
    entityManager.persist(meetingDate3);
    entityManager.persist(translator);
    entityManager.persist(examinationDate);
    entityManager.persist(expiredAuth);
    entityManager.persist(expiringAuth);
    entityManager.persist(effectiveAuth);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final ClerkTranslatorAuthorisationsDTO authorisationsDTO = responseDTO.translators().get(0).authorisations();

    assertEquals(2, authorisationsDTO.effective().size());
    assertEquals(1, authorisationsDTO.expiring().size());
    assertEquals(1, authorisationsDTO.expired().size());
    assertEquals(1, authorisationsDTO.expiredDeduplicated().size());
    assertEquals(0, authorisationsDTO.formerVir().size());

    final Map<Boolean, List<AuthorisationDTO>> effectiveByToLang = authorisationsDTO
      .effective()
      .stream()
      .collect(Collectors.partitioningBy(a -> a.languagePair().to().equals(SV)));

    final AuthorisationDTO effectiveFiSv = effectiveByToLang.get(true).get(0);
    final AuthorisationDTO effectiveFiEn = effectiveByToLang.get(false).get(0);
    assertNotNull(effectiveFiSv);
    assertNotNull(effectiveFiEn);

    final AuthorisationDTO expired = authorisationsDTO.expired().get(0);
    assertEquals(expiredAuth.getTermBeginDate(), expired.termBeginDate());
    assertEquals(expiredAuth.getTermEndDate(), expired.termEndDate());
    assertEquals(expiredAuth.getFromLang(), expired.languagePair().from());
    assertEquals(expiredAuth.getToLang(), expired.languagePair().to());
    assertEquals(expiredAuth.isPermissionToPublish(), expired.permissionToPublish());

    assertEquals(expired, authorisationsDTO.expiredDeduplicated().get(0));
  }

  @Test
  public void listShouldReturnDeduplicatedExpiredAuthorisations() {
    final MeetingDate meetingDate1 = Factory.meetingDate(LocalDate.now().minusYears(10));
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.now().minusYears(5));
    final Translator translator = Factory.translator();
    final Authorisation authorisation1 = Factory.kktAuthorisation(translator, meetingDate1);
    final Authorisation authorisation2 = Factory.kktAuthorisation(translator, meetingDate2);

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

    entityManager.persist(meetingDate1);
    entityManager.persist(meetingDate2);
    entityManager.persist(translator);
    entityManager.persist(authorisation1);
    entityManager.persist(authorisation2);

    final ClerkTranslatorResponseDTO responseDTO = clerkTranslatorService.listTranslators();
    final ClerkTranslatorAuthorisationsDTO authorisationsDTO = responseDTO.translators().get(0).authorisations();

    assertEquals(2, authorisationsDTO.expired().size());
    assertEquals(1, authorisationsDTO.expiredDeduplicated().size());

    final AuthorisationDTO deduplicated = authorisationsDTO.expiredDeduplicated().get(0);

    assertEquals(authorisation2.getId(), deduplicated.id());
    assertEquals(authorisation2.getTermBeginDate(), deduplicated.termBeginDate());
  }

  @Test
  public void testTranslatorCreate() {
    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.now().minusDays(10));
    entityManager.persist(meetingDate);

    final AuthorisationCreateDTO expectedAuth = defaultAuthorisationCreateDTOBuilder(meetingDate.getDate()).build();
    final TranslatorCreateDTO createDTO = defaultTranslatorCreateDTOBuilder(expectedAuth, null).build();

    final PersonalData personalData = defaultPersonalData(createDTO);
    final String onrId = personalData.getOnrId();
    when(onrService.insertPersonalData(any(PersonalData.class))).thenReturn(onrId);
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(onrId, personalData));

    final ClerkTranslatorDTO response = clerkTranslatorService.createTranslator(createDTO);
    final ClerkTranslatorAuditDTO auditDTO = new ClerkTranslatorAuditDTO(response);

    assertResponseMatchesGet(response);

    assertTranslatorCommonFields(createDTO, response);

    assertEquals(1, response.authorisations().effective().size());
    final AuthorisationDTO authDto = response.authorisations().effective().get(0);
    final AuthorisationAuditDTO authorisationAuditDTO = new AuthorisationAuditDTO(authDto);
    assertAuthorisationCommonFields(expectedAuth, authDto);

    verify(auditService)
      .logAuthorisation(
        AkrOperation.CREATE_AUTHORISATION,
        response.id(),
        authorisationAuditDTO.id(),
        authorisationAuditDTO
      );
    verify(auditService).logCreate(AkrOperation.CREATE_TRANSLATOR, response.id(), auditDTO);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testTranslatorCreateOkWithCountryCode() {
    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.now().minusDays(10));
    entityManager.persist(meetingDate);

    final AuthorisationCreateDTO expectedAuth = defaultAuthorisationCreateDTOBuilder(meetingDate.getDate()).build();
    final TranslatorCreateDTO createDTO = defaultTranslatorCreateDTOBuilder(expectedAuth, "DEU").build();

    final PersonalData personalData = defaultPersonalData(createDTO);
    final String onrId = personalData.getOnrId();
    when(onrService.insertPersonalData(any(PersonalData.class))).thenReturn(onrId);
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(onrId, personalData));

    final ClerkTranslatorDTO response = clerkTranslatorService.createTranslator(createDTO);
    final ClerkTranslatorAuditDTO auditDTO = new ClerkTranslatorAuditDTO(response);

    assertResponseMatchesGet(response);

    assertTranslatorCommonFields(createDTO, response);

    assertEquals(1, response.authorisations().effective().size());
    final AuthorisationDTO authDto = response.authorisations().effective().get(0);
    final AuthorisationAuditDTO authorisationAuditDTO = new AuthorisationAuditDTO(authDto);
    assertAuthorisationCommonFields(expectedAuth, authDto);

    verify(auditService)
      .logAuthorisation(
        AkrOperation.CREATE_AUTHORISATION,
        response.id(),
        authorisationAuditDTO.id(),
        authorisationAuditDTO
      );
    verify(auditService).logCreate(AkrOperation.CREATE_TRANSLATOR, response.id(), auditDTO);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testTranslatorCreateFailsOnInconsistantOnrData() {
    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.now().minusDays(10));
    entityManager.persist(meetingDate);

    final AuthorisationCreateDTO expectedAuth = defaultAuthorisationCreateDTOBuilder(meetingDate.getDate()).build();
    final TranslatorCreateDTO createDTO = defaultTranslatorCreateDTOBuilder(expectedAuth, null)
      .onrId(UUID.randomUUID().toString())
      .isIndividualised(null)
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkTranslatorService.createTranslator(createDTO));

    assertEquals(APIExceptionType.TRANSLATOR_ONR_ID_AND_INDIVIDUALISED_MISMATCH, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testTranslatorGet() {
    final LocalDate today = LocalDate.now();
    final MeetingDate meetingDate = Factory.meetingDate(today.minusDays(1));
    final MeetingDate meetingDate2 = Factory.meetingDate(today);
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);
    final Authorisation authorisation2 = Factory.kktAuthorisation(translator, meetingDate2);

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

    authorisation.setTermEndDate(LocalDate.now().plusDays(10));

    entityManager.persist(meetingDate);
    entityManager.persist(meetingDate2);
    entityManager.persist(translator);
    entityManager.persist(authorisation);
    entityManager.persist(authorisation2);

    final ClerkTranslatorDTO clerkTranslatorDTO = clerkTranslatorService.getTranslator(translator.getId());
    assertNotNull(clerkTranslatorDTO);
    assertEquals(translator.getId(), clerkTranslatorDTO.id());

    final ClerkTranslatorAuthorisationsDTO authorisationsDTO = clerkTranslatorDTO.authorisations();
    assertEquals(2, authorisationsDTO.effective().size());
    assertEquals(1, authorisationsDTO.expiring().size());
    assertEquals(0, authorisationsDTO.expired().size());
    assertEquals(0, authorisationsDTO.expiredDeduplicated().size());
    assertEquals(0, authorisationsDTO.formerVir().size());

    verify(auditService).logById(AkrOperation.GET_TRANSLATOR, translator.getId());
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

    final TranslatorUpdateDTO updateDTO = defaultTranslatorUpdateDTOBuilder(translator, null).build();

    final PersonalData personalData = defaultPersonalData(updateDTO, translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));
    final ClerkTranslatorAuditDTO oldDTO = new ClerkTranslatorAuditDTO(translator, personalData);

    final ClerkTranslatorDTO response = clerkTranslatorService.updateTranslator(updateDTO);
    final ClerkTranslatorAuditDTO newDTO = new ClerkTranslatorAuditDTO(response);

    assertResponseMatchesGet(response);

    assertEquals(updateDTO.id(), response.id());
    assertEquals(updateDTO.version() + 1, response.version());
    assertTranslatorCommonFields(updateDTO, response);

    verify(auditService).logUpdate(AkrOperation.UPDATE_TRANSLATOR, response.id(), oldDTO, newDTO);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testTranslatorUpdateOkWithCountryCode() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final TranslatorUpdateDTO updateDTO = defaultTranslatorUpdateDTOBuilder(translator, "DEU").build();

    final PersonalData personalData = defaultPersonalData(updateDTO, translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));
    final ClerkTranslatorAuditDTO oldDTO = new ClerkTranslatorAuditDTO(translator, personalData);

    final ClerkTranslatorDTO response = clerkTranslatorService.updateTranslator(updateDTO);
    final ClerkTranslatorAuditDTO newDTO = new ClerkTranslatorAuditDTO(response);

    assertResponseMatchesGet(response);

    assertEquals(updateDTO.id(), response.id());
    assertEquals(updateDTO.version() + 1, response.version());
    assertTranslatorCommonFields(updateDTO, response);

    verify(auditService).logUpdate(AkrOperation.UPDATE_TRANSLATOR, response.id(), oldDTO, newDTO);
    verifyNoMoreInteractions(auditService);
  }

  private void assertTranslatorCommonFields(final TranslatorDTOCommonFields expected, final ClerkTranslatorDTO dto) {
    assertEquals(expected.identityNumber(), dto.identityNumber());
    assertEquals(expected.firstName(), dto.firstName());
    assertEquals(expected.nickName(), dto.nickName());
    assertEquals(expected.lastName(), dto.lastName());
    assertEquals(expected.email(), dto.email());
    assertEquals(expected.phoneNumber(), dto.phoneNumber());
    assertEquals(expected.address().get(0).street(), dto.address().get(0).street());
    assertEquals(expected.address().get(0).town(), dto.address().get(0).town());
    assertEquals(expected.address().get(0).postalCode(), dto.address().get(0).postalCode());
    assertEquals(expected.address().get(0).country(), dto.address().get(0).country());
    assertEquals(expected.extraInformation(), dto.extraInformation());
    assertEquals(expected.isAssuranceGiven(), dto.isAssuranceGiven());
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

    verify(auditService).logById(AkrOperation.DELETE_TRANSLATOR, translatorId);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testAuthorisationCreate() {
    final MeetingDate meetingDate = Factory.meetingDate(LocalDate.now().minusYears(1));
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);
    final ExaminationDate examinationDate = Factory.examinationDate();

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);
    entityManager.persist(examinationDate);

    final AuthorisationCreateDTO createDTO = defaultAuthorisationCreateDTOBuilder(meetingDate.getDate())
      .basis(AuthorisationBasis.AUT)
      .examinationDate(examinationDate.getDate())
      .build();

    final ClerkTranslatorDTO response = clerkTranslatorService.createAuthorisation(translator.getId(), createDTO);

    assertResponseMatchesGet(response);

    assertEquals(2, response.authorisations().effective().size());
    final AuthorisationDTO authorisationDTO = response
      .authorisations()
      .effective()
      .stream()
      .filter(a -> a.id() != authorisation.getId())
      .findAny()
      .orElseThrow();

    assertAuthorisationCommonFields(createDTO, authorisationDTO);
    final AuthorisationAuditDTO auditDTO = new AuthorisationAuditDTO(authorisationDTO);

    verify(auditService)
      .logAuthorisation(AkrOperation.CREATE_AUTHORISATION, translator.getId(), authorisationDTO.id(), auditDTO);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testAuthorisationUpdate() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final MeetingDate meetingDate2 = Factory.meetingDate(LocalDate.now().minusDays(1));
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

    entityManager.persist(meetingDate);
    entityManager.persist(meetingDate2);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final AuthorisationAuditDTO oldDTO = new AuthorisationAuditDTO(authorisation);

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

    final AuthorisationDTO authorisationDTO = response.authorisations().effective().get(0);
    final AuthorisationAuditDTO newDTO = new AuthorisationAuditDTO(authorisationDTO);
    assertEquals(updateDTO.id(), authorisationDTO.id());
    assertEquals(updateDTO.version() + 1, authorisationDTO.version());
    assertAuthorisationCommonFields(updateDTO, authorisationDTO);

    verify(auditService)
      .logAuthorisation(AkrOperation.UPDATE_AUTHORISATION, translator, authorisationDTO.id(), oldDTO, newDTO);
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
  public void testAuthorisationDelete() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);
    final Authorisation authorisation2 = Factory.kktAuthorisation(translator, meetingDate);
    final Email email = Factory.email(EmailType.AUTHORISATION_EXPIRY);
    final AuthorisationTermReminder authorisationTermReminder = Factory.authorisationTermReminder(authorisation, email);

    final PersonalData personalData = defaultPersonalData(translator.getOnrId());
    when(onrService.getCachedPersonalDatas()).thenReturn(Map.of(translator.getOnrId(), personalData));

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
      response.authorisations().effective().stream().map(AuthorisationDTO::id).collect(Collectors.toSet())
    );

    verify(auditService).logAuthorisation(AkrOperation.DELETE_AUTHORISATION, translator, authorisationId);
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

    final AuthorisationCreateDTO createDTO = defaultAuthorisationCreateDTOBuilder(meetingDate.getDate())
      .termBeginDate(meetingDate.getDate().plusDays(1))
      .termEndDate(meetingDate.getDate().plusYears(1))
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

    final AuthorisationCreateDTO createDTO = defaultAuthorisationCreateDTOBuilder(meetingDate.getDate())
      .basis(AuthorisationBasis.AUT)
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

    final AuthorisationCreateDTO createDTO = defaultAuthorisationCreateDTOBuilder(meetingDate.getDate())
      .basis(AuthorisationBasis.AUT)
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkTranslatorService.createAuthorisation(translator.getId(), createDTO)
    );
    assertEquals(APIExceptionType.AUTHORISATION_BASIS_AND_EXAMINATION_DATE_MISMATCH, ex.getExceptionType());

    verifyNoInteractions(auditService);
  }

  @Test
  public void testAuthorisationCreateFailsForBasisAndTermEndDateMismatch() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final Authorisation authorisation = Factory.kktAuthorisation(translator, meetingDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(authorisation);

    final AuthorisationCreateDTO createDTO = defaultAuthorisationCreateDTOBuilder(meetingDate.getDate())
      .basis(AuthorisationBasis.VIR)
      .termEndDate(LocalDate.now().plusYears(5))
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkTranslatorService.createAuthorisation(translator.getId(), createDTO)
    );
    assertEquals(APIExceptionType.AUTHORISATION_BASIS_AND_TERM_END_DATE_MISMATCH, ex.getExceptionType());

    verifyNoInteractions(auditService);
  }

  private void assertResponseMatchesGet(final ClerkTranslatorDTO response) {
    final ClerkTranslatorDTO expected = clerkTranslatorService.getTranslatorWithoutAudit(response.id());

    assertNotNull(response);
    assertNotNull(expected);
    assertEquals(expected, response);
  }

  private AuthorisationCreateDTO.AuthorisationCreateDTOBuilder defaultAuthorisationCreateDTOBuilder(
    final LocalDate meetingDate
  ) {
    return AuthorisationCreateDTO
      .builder()
      .basis(AuthorisationBasis.KKT)
      .from(FI)
      .to(SV)
      .permissionToPublish(true)
      .termBeginDate(meetingDate)
      .termEndDate(LocalDate.now().plusDays(1))
      .diaryNumber("012345");
  }

  private PersonalData defaultPersonalData(final String onrId) {
    return PersonalData
      .builder()
      .onrId(onrId)
      .lastName("Suku")
      .firstName("Etu")
      .nickName("Etu")
      .address(Factory.createAddressList("st", "pstl", "tw", "FI"))
      .identityNumber("112233")
      .individualised(true)
      .hasIndividualisedAddress(false)
      .build();
  }

  private PersonalData defaultPersonalData(final TranslatorDTOCommonFields translatorDTO) {
    return defaultPersonalData(translatorDTO, UUID.randomUUID().toString());
  }

  private List<TranslatorAddressDTO> convertTranslatorAddressDTO(
    final List<ClerkTranslatorAddressDTO> clerkTranslatorAddressDTO
  ) {
    return clerkTranslatorAddressDTO
      .stream()
      .map(addr ->
        TranslatorAddressDTO
          .builder()
          .street(addr.street())
          .town(addr.town())
          .country(addr.country())
          .postalCode(addr.postalCode())
          .source(addr.source())
          .type(addr.type())
          .build()
      )
      .toList();
  }

  private PersonalData defaultPersonalData(final TranslatorDTOCommonFields translatorDTO, final String onrId) {
    return PersonalData
      .builder()
      .onrId(onrId)
      .individualised(true)
      .hasIndividualisedAddress(true)
      .identityNumber(translatorDTO.identityNumber())
      .firstName(translatorDTO.firstName())
      .nickName(translatorDTO.nickName())
      .lastName(translatorDTO.lastName())
      .email(translatorDTO.email())
      .phoneNumber(translatorDTO.phoneNumber())
      .address(convertTranslatorAddressDTO(translatorDTO.address()))
      .build();
  }

  private TranslatorCreateDTO.TranslatorCreateDTOBuilder defaultTranslatorCreateDTOBuilder(
    final AuthorisationCreateDTO authorisation,
    final String country
  ) {
    return TranslatorCreateDTO
      .builder()
      .identityNumber("aard")
      .firstName("Anne")
      .nickName("Anne")
      .lastName("Aardvark")
      .email("anne@aardvark.invalid")
      .phoneNumber("555")
      .address(createClerkAddress("st", "pstl", "tw", country))
      .extraInformation("extra")
      .isAssuranceGiven(true)
      .authorisations(List.of(authorisation));
  }

  private TranslatorUpdateDTO.TranslatorUpdateDTOBuilder defaultTranslatorUpdateDTOBuilder(
    final Translator translator,
    final String country
  ) {
    return TranslatorUpdateDTO
      .builder()
      .id(translator.getId())
      .version(translator.getVersion())
      .isIndividualised(true)
      .hasIndividualisedAddress(true)
      .identityNumber("aard")
      .firstName("Anne")
      .nickName("Anne")
      .lastName("Aardvark")
      .email("anne@aardvark.invalid")
      .phoneNumber("555")
      .address(createClerkAddress("st", "pstl", "tw", country))
      .extraInformation("extra")
      .isAssuranceGiven(false);
  }
}
