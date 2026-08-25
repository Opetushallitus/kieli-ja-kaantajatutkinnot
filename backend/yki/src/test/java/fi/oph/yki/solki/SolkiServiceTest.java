package fi.oph.yki.solki;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.koodisto.KoodistoService;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamLanguage;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.GenderCode;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.OrganizationService;
import fi.oph.yki.service.dto.OrganizationDetailsDTO;
import fi.oph.yki.solki.dto.ExamDateSyncRequestDTO;
import fi.oph.yki.solki.dto.ExamSessionSyncRequestDTO;
import fi.oph.yki.solki.dto.OrganizerSyncRequestDTO;
import fi.oph.yki.solki.dto.PersonSyncRequestDTO;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

class SolkiServiceTest {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  private MockWebServer mockWebServer;
  private WebClient webClient;
  private OrganizationService organizationService;
  private KoodistoService koodistoService;
  private RegistrationRepository registrationRepository;
  private OnrService onrService;
  private SolkiService solkiService;

  @BeforeEach
  void setup() throws IOException {
    mockWebServer = new MockWebServer();
    mockWebServer.start();
    webClient = WebClient.builder().baseUrl("http://localhost:" + mockWebServer.getPort()).build();
    organizationService = Mockito.mock(OrganizationService.class);
    koodistoService = Mockito.mock(KoodistoService.class);
    registrationRepository = Mockito.mock(RegistrationRepository.class);
    onrService = Mockito.mock(OnrService.class);
    solkiService =
      new SolkiService(webClient, organizationService, koodistoService, registrationRepository, onrService);
    ReflectionTestUtils.setField(solkiService, "examSessionSyncEnabled", true);
    ReflectionTestUtils.setField(solkiService, "personSyncEnabled", true);
  }

  @AfterEach
  void tearDown() throws IOException {
    mockWebServer.shutdown();
  }

  // ---- convertLevel ----

  @Test
  void convertsKnownLevels() {
    assertEquals("PT", SolkiService.convertLevel("PERUS"));
    assertEquals("KT", SolkiService.convertLevel("KESKI"));
    assertEquals("YT", SolkiService.convertLevel("YLIN"));
  }

  @Test
  void throwsOnUnknownLevel() {
    assertThrows(IllegalArgumentException.class, () -> SolkiService.convertLevel("UNKNOWN"));
  }

  // ---- applyMissingCodeFallback ----

  @Test
  void fallsBackToXxxForUnsupportedOrMissingCodes() {
    assertEquals("xxx", SolkiService.applyMissingCodeFallback(null));
    assertEquals("xxx", SolkiService.applyMissingCodeFallback(""));
    assertEquals("xxx", SolkiService.applyMissingCodeFallback("ZAR"));
    assertEquals("xxx", SolkiService.applyMissingCodeFallback("YYY"));
    assertEquals("xxx", SolkiService.applyMissingCodeFallback("XKK"));
  }

  @Test
  void passesThroughSupportedCodes() {
    assertEquals("FIN", SolkiService.applyMissingCodeFallback("FIN"));
  }

  // ---- convertGender ----

  @Test
  void derivesGenderFromOddSsnAsMale() {
    assertEquals(GenderCode.M, SolkiService.convertGender(null, "010199-123A"));
  }

  @Test
  void derivesGenderFromEvenSsnAsFemale() {
    assertEquals(GenderCode.N, SolkiService.convertGender(null, "010199-122A"));
  }

  @Test
  void fallsBackToFormGenderWhenNoSsn() {
    assertEquals(GenderCode.M, SolkiService.convertGender("1", null));
    assertEquals(GenderCode.N, SolkiService.convertGender("2", ""));
  }

  @Test
  void fallsBackToUnknownGenderWhenNoSsnOrRecognizedFormValue() {
    assertEquals(GenderCode.E, SolkiService.convertGender(null, null));
    assertEquals(GenderCode.E, SolkiService.convertGender("something-else", ""));
  }

  // ---- ssnOrBirthdate ----

  @Test
  void usesSsnWhenPresent() {
    assertEquals("010199-123A", SolkiService.ssnOrBirthdate("010199-123A", "1999-01-01"));
  }

  @Test
  void derivesPseudoIdentifierFromBirthdateBefore2000() {
    assertEquals("150695-", SolkiService.ssnOrBirthdate(null, "1995-06-15"));
  }

  @Test
  void derivesPseudoIdentifierFromBirthdateFrom2000Onwards() {
    assertEquals("220101A", SolkiService.ssnOrBirthdate("", "2001-01-22"));
  }

  // ---- sessionTypeToSubtestFlags / mergeFlags ----

  @Test
  void fullSessionAllPartsSetsAllFlags() {
    final var flags = SolkiService.sessionTypeToSubtestFlags(ExamSessionType.FULL, PartialExamType.ALL_PARTS);
    assertEquals(new SolkiService.SubtestFlags(1, 1, 1, 1), flags);
  }

  @Test
  void readSpeakSessionOnlySetsReadAndSpeak() {
    final var speakFlags = SolkiService.sessionTypeToSubtestFlags(ExamSessionType.READ_SPEAK, PartialExamType.SPEAK);
    assertEquals(new SolkiService.SubtestFlags(1, 0, 0, 0), speakFlags);

    final var readFlags = SolkiService.sessionTypeToSubtestFlags(ExamSessionType.READ_SPEAK, PartialExamType.READ);
    assertEquals(new SolkiService.SubtestFlags(0, 0, 0, 1), readFlags);
  }

  @Test
  void listenWriteSessionOnlySetsListenAndWrite() {
    final var writeFlags = SolkiService.sessionTypeToSubtestFlags(ExamSessionType.LISTEN_WRITE, PartialExamType.WRITE);
    assertEquals(new SolkiService.SubtestFlags(0, 1, 0, 0), writeFlags);

    final var listenFlags = SolkiService.sessionTypeToSubtestFlags(
      ExamSessionType.LISTEN_WRITE,
      PartialExamType.LISTEN
    );
    assertEquals(new SolkiService.SubtestFlags(0, 0, 1, 0), listenFlags);
  }

  @Test
  void mergesFlagsAcrossSeparateReadListenAndSpeakWritePoolRegistrations() {
    // A single FULL exam session can be registered into via two separate pools - read+listen
    // and speak+write - producing two registration rows for the same person/exam_session_id.
    final var readListenPool = SolkiService.sessionTypeToSubtestFlags(ExamSessionType.READ_SPEAK, PartialExamType.READ);
    final var speakWritePool = SolkiService.sessionTypeToSubtestFlags(
      ExamSessionType.LISTEN_WRITE,
      PartialExamType.WRITE
    );

    assertEquals(
      new SolkiService.SubtestFlags(0, 1, 0, 1),
      SolkiService.mergeFlags(List.of(readListenPool, speakWritePool))
    );
  }

  // ---- request payload builders ----

  @Test
  void buildsOrganizerSyncRequestFromOrganizerAndOrganizationDetails() {
    final Organizer organizer = new Organizer();
    organizer.setOid("1.2.3.4.5");
    organizer.setContactName("Matti Meikäläinen");
    organizer.setContactEmail("matti@example.com");
    organizer.setContactPhoneNumber("0401234567");

    final ExamLanguage examLanguage = new ExamLanguage();
    examLanguage.setLanguageCode("fin");
    examLanguage.setLevelCode("PERUS");
    organizer.setLanguages(List.of(examLanguage));

    final OrganizationDetailsDTO orgDetails = new OrganizationDetailsDTO(
      "1.2.3.4.5",
      "Testiorganisaatio",
      "Testikatu 1",
      "00100",
      "Helsinki",
      "https://example.com"
    );

    final OrganizerSyncRequestDTO request = solkiService.buildOrganizerSyncRequest(organizer, orgDetails);

    assertEquals("1.2.3.4.5", request.oid());
    assertEquals("Testiorganisaatio", request.name());
    assertEquals("Testikatu 1", request.streetAddress());
    assertEquals("00100", request.postalCode());
    assertEquals("0401234567", request.phoneNumber());
    assertEquals("Helsinki", request.postOffice());
    assertEquals("Matti Meikäläinen", request.contactName());
    assertEquals("matti@example.com", request.email());
    assertEquals("https://example.com", request.website());
    assertEquals(1, request.examOfferings().size());
    assertEquals("fin", request.examOfferings().get(0).languageCode());
    assertEquals("PT", request.examOfferings().get(0).level());
  }

  @Test
  void buildsExamSessionAndExamDateSyncRequests() {
    final ExamSession examSession = examSession();

    final ExamSessionSyncRequestDTO sessionRequest = solkiService.buildExamSessionSyncRequest(examSession);
    assertEquals("fin", sessionRequest.languageCode());
    assertEquals("PT", sessionRequest.level());
    assertEquals("2026-06-15", sessionRequest.examDate());
    assertEquals("1.2.3.4.5", sessionRequest.organizerOid());

    final ExamDateSyncRequestDTO dateRequest = solkiService.buildExamDateSyncRequest(examSession);
    assertEquals("fin", dateRequest.languageCode());
    assertEquals("2026-06-15", dateRequest.examDate());
  }

  @Test
  void examSessionSyncRequestPrefersOfficeOidOverOrganizerOid() {
    final ExamSession examSession = examSession();
    examSession.setOfficeOid("1.9.9.9.9");

    assertEquals("1.9.9.9.9", solkiService.buildExamSessionSyncRequest(examSession).organizerOid());
  }

  @Test
  void buildsPersonSyncRequestConvertingCodesThroughKoodisto() {
    Mockito.when(koodistoService.getConvertedCountryCode("246")).thenReturn("FIN");
    Mockito.when(koodistoService.getConvertedCountryCode("752")).thenReturn(null);

    final Person person = new Person();
    person.setOid("1.2.3.4.5");
    person.setFirstName("Matti");
    person.setLastName("Meikäläinen");
    person.setEmail("matti@example.com");
    person.setSteetAddress("Testikatu 1");
    person.setZip("00100");
    person.setPostOffice("Helsinki");
    person.setGender(GenderCode.M);
    person.setNationalityCode("246");
    person.setCountryCode("752");

    final PersonSyncRequestDTO request = solkiService.buildPersonSyncRequest(person);

    assertEquals("Meikäläinen", request.lastName());
    assertEquals("Matti", request.firstName());
    assertEquals("M", request.gender());
    assertEquals("FIN", request.nationalityCode());
    assertEquals("xxx", request.countryCode());
    assertEquals("Testikatu 1", request.streetAddress());
    assertEquals("00100", request.zip());
    assertEquals("Helsinki", request.postOffice());
    assertEquals("matti@example.com", request.email());
  }

  // ---- participants CSV ----

  @Test
  void buildsCsvRowForSingleCompletedRegistration() {
    Mockito.when(koodistoService.getConvertedCountryCode("246")).thenReturn("FIN");

    final ExamSession examSession = examSession();
    examSession.setType(ExamSessionType.FULL);
    final Person person = person("1.2.3.4.5", "Meikäläinen", "Matti", "246");
    final Registration registration = registration(
      person,
      examSession,
      PartialExamType.ALL_PARTS,
      Map.of(
        "birthdate",
        "1995-06-15",
        "gender",
        "1",
        "nationalities",
        List.of("246"),
        "exam_lang",
        "fi",
        "certificate_lang",
        "sv"
      ),
      false
    );

    final String csv = solkiService.buildParticipantsCsv(examSession.getType(), List.of(registration), Map.of());
    final String[] fields = csv.strip().split(";", -1);

    assertEquals("1.2.3.4.5", fields[0]);
    assertEquals("150695-", fields[1]);
    assertEquals("Meikäläinen", fields[2]);
    assertEquals("Matti", fields[3]);
    assertEquals("M", fields[4]);
    assertEquals("FIN", fields[5]);
    assertEquals("Testikatu 1", fields[6]);
    assertEquals("00100", fields[7]);
    assertEquals("Helsinki", fields[8]);
    assertEquals("FIN", fields[9]);
    assertEquals("matti@example.com", fields[10]);
    assertEquals("fi", fields[11]);
    assertEquals("sv", fields[12]);
    assertEquals("0", fields[13]);
    assertEquals("1", fields[14]);
    assertEquals("1", fields[15]);
    assertEquals("1", fields[16]);
    assertEquals("1", fields[17].strip());
  }

  @Test
  void usesSsnFromOnrLookupOverBirthdateInCsvRow() {
    final ExamSession examSession = examSession();
    examSession.setType(ExamSessionType.FULL);
    final Person person = person("1.2.3.4.5", "Meikäläinen", "Matti", null);
    final Registration registration = registration(
      person,
      examSession,
      PartialExamType.ALL_PARTS,
      Map.of("birthdate", "1995-06-15"),
      false
    );

    final String csv = solkiService.buildParticipantsCsv(
      examSession.getType(),
      List.of(registration),
      Map.of("1.2.3.4.5", "150695-123A")
    );

    assertEquals("150695-123A", csv.strip().split(";", -1)[1]);
  }

  @Test
  void mergesTwoRegistrationsForSamePersonInSameExamSessionIntoOneCsvRow() {
    final ExamSession examSession = examSession();
    examSession.setType(ExamSessionType.READ_SPEAK);
    final Person person = person("1.2.3.4.5", "Meikäläinen", "Matti", null);
    final Registration readOnly = registration(
      person,
      examSession,
      PartialExamType.READ,
      Map.of("birthdate", "1995-06-15"),
      false
    );
    // Same person, same exam_session_id, separate registration row for the speak pool.
    final Registration speakOnly = registration(
      person,
      examSession,
      PartialExamType.SPEAK,
      Map.of("birthdate", "1995-06-15"),
      true
    );

    final String csv = solkiService.buildParticipantsCsv(examSession.getType(), List.of(readOnly, speakOnly), Map.of());
    final String[] fields = csv.strip().split(";", -1);

    assertEquals(1, csv.strip().lines().count());
    assertEquals("1", fields[13], "transferred flag should be OR'd across the person's rows");
    assertEquals("1", fields[14], "speak");
    assertEquals("0", fields[15], "write");
    assertEquals("1", fields[16], "read");
    assertEquals("0", fields[17].strip(), "listen");
  }

  @Test
  void syncExamSessionParticipantsFetchesBuildsAndPostsCsv() throws Exception {
    final ExamSession examSession = examSession();
    examSession.setType(ExamSessionType.FULL);
    final Person person = person("1.2.3.4.5", "Meikäläinen", "Matti", null);
    final Registration registration = registration(
      person,
      examSession,
      PartialExamType.ALL_PARTS,
      Map.of("birthdate", "1995-06-15"),
      false
    );

    Mockito
      .when(registrationRepository.getByExamSessionAndState(examSession, RegistrationState.COMPLETED))
      .thenReturn(List.of(registration));

    final PersonalDataDTO personalData = new PersonalDataDTO();
    personalData.setOidHenkilo("1.2.3.4.5");
    personalData.setIdentityNumber("150695-123A");
    Mockito.when(onrService.listPersonDetails(List.of("1.2.3.4.5"))).thenReturn(List.of(personalData));

    mockWebServer.enqueue(new MockResponse().setResponseCode(200));

    solkiService.syncExamSessionParticipants(examSession);

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("POST", request.getMethod());
    assertEquals("/osallistujat?kieli=fin&taso=PT&pvm=2026-06-15&jarjestaja=1.2.3.4.5", request.getPath());
    assertEquals("150695-123A", request.getBody().readUtf8().strip().split(";", -1)[1]);
  }

  @Test
  void syncExamSessionParticipantsStillBuildsCsvButDoesNotPostWhenPersonSyncDisabled() {
    ReflectionTestUtils.setField(solkiService, "personSyncEnabled", false);
    final ExamSession examSession = examSession();
    Mockito
      .when(registrationRepository.getByExamSessionAndState(examSession, RegistrationState.COMPLETED))
      .thenReturn(List.of());

    solkiService.syncExamSessionParticipants(examSession);

    assertEquals(0, mockWebServer.getRequestCount());
    Mockito.verify(registrationRepository).getByExamSessionAndState(examSession, RegistrationState.COMPLETED);
  }

  private Person person(final String oid, final String lastName, final String firstName, final String countryCode) {
    final Person person = new Person();
    person.setOid(oid);
    person.setLastName(lastName);
    person.setFirstName(firstName);
    person.setEmail("matti@example.com");
    person.setSteetAddress("Testikatu 1");
    person.setZip("00100");
    person.setPostOffice("Helsinki");
    person.setCountryCode(countryCode);
    return person;
  }

  private Registration registration(
    final Person person,
    final ExamSession examSession,
    final PartialExamType partialExamType,
    final Map<String, Object> form,
    final boolean isTransfered
  ) {
    final Registration registration = new Registration();
    registration.setPerson(person);
    registration.setExamSession(examSession);
    registration.setPartialExamType(partialExamType);
    registration.setState(RegistrationState.COMPLETED);
    registration.setForm((ObjectNode) OBJECT_MAPPER.valueToTree(form));
    registration.setIsTransfered(isTransfered);
    return registration;
  }

  // ---- HTTP behavior ----

  @Test
  void syncOrganizerPostsBuiltPayloadToJarjestajaEndpoint() throws InterruptedException {
    Mockito
      .when(organizationService.getOrganizationDetails("1.2.3.4.5"))
      .thenReturn(new OrganizationDetailsDTO("1.2.3.4.5", "Testiorganisaatio", "Testikatu 1", "00100", "Helsinki", ""));
    mockWebServer.enqueue(new MockResponse().setResponseCode(200));

    final Organizer organizer = new Organizer();
    organizer.setOid("1.2.3.4.5");
    organizer.setLanguages(List.of());

    solkiService.syncOrganizer(organizer, null);

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("POST", request.getMethod());
    assertEquals("/jarjestaja", request.getPath());
  }

  @Test
  void syncOrganizerIsNoOpWhenExamSessionSyncDisabled() {
    ReflectionTestUtils.setField(solkiService, "examSessionSyncEnabled", false);

    final Organizer organizer = new Organizer();
    organizer.setOid("1.2.3.4.5");

    solkiService.syncOrganizer(organizer, null);

    assertEquals(0, mockWebServer.getRequestCount());
    Mockito.verifyNoInteractions(organizationService);
  }

  @Test
  void deleteOrganizerTreats404AsSuccess() {
    mockWebServer.enqueue(new MockResponse().setResponseCode(404));

    solkiService.deleteOrganizer("1.2.3.4.5");

    assertEquals(1, mockWebServer.getRequestCount());
  }

  @Test
  void syncPersonPutsToOsallistujaEndpointWithOid() throws InterruptedException {
    mockWebServer.enqueue(new MockResponse().setResponseCode(200));

    final Person person = new Person();
    person.setOid("1.2.3.4.5");

    solkiService.syncPerson(person);

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("PUT", request.getMethod());
    assertEquals("/osallistuja/1.2.3.4.5", request.getPath());
  }

  private ExamSession examSession() {
    final ExamDate examDate = new ExamDate();
    examDate.setExamDate(LocalDate.of(2026, 6, 15));

    final Organizer organizer = new Organizer();
    organizer.setOid("1.2.3.4.5");

    final ExamSession examSession = new ExamSession();
    examSession.setExamDate(examDate);
    examSession.setOrganizer(organizer);
    examSession.setLanguage("fin");
    examSession.setLevel("PERUS");

    return examSession;
  }
}
