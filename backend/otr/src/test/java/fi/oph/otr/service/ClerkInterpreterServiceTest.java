package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.otr.Factory;
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
import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.model.PersonalData;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.repository.RegionRepository;
import fi.oph.otr.util.exception.APIException;
import fi.oph.otr.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
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

  @MockBean
  private OnrService onrService;

  @Resource
  private TestEntityManager entityManager;

  private ClerkInterpreterService clerkInterpreterService;

  @BeforeEach
  public void setup() {
    final RegionService regionService = new RegionService();
    regionService.init();

    final LanguageService languageService = new LanguageService();
    languageService.init();

    when(onrService.getCachedPersonalDatas())
      .thenReturn(
        Map.of(
          "1",
          createPersonalData("1", "Esimerkki", "Erkki Pekka", "Erkki", "241202-xyz", "erkki@esimerkki.invalid", true),
          "2",
          createPersonalData("2", "Aaltonen", "Anna Maija", "Anna", "111009-abc", "anna@aaltonen.invalid", false)
        )
      );

    clerkInterpreterService =
      new ClerkInterpreterService(
        interpreterRepository,
        qualificationRepository,
        regionRepository,
        regionService,
        languageService,
        onrService
      );
  }

  @Test
  public void testAllAreListed() {
    final long id1 = createInterpreter("1");
    final long id2 = createInterpreter("2");
    final long id3 = createInterpreter("3");

    when(onrService.getCachedPersonalDatas())
      .thenReturn(
        Map.of(
          "1",
          createPersonalData("1", "Suku1", "Etu11 Etu12", "Etu1", "id1", "etu@suku1", true),
          "2",
          createPersonalData("2", "Suku2", "Etu21 Etu22", "Etu2", "id2", "etu@suku2", true),
          "3",
          createPersonalData("3", "Suku3", "Etu31 Etu32", "Etu3", "id3", "etu@suku3", true)
        )
      );

    final List<ClerkInterpreterDTO> interpreters = clerkInterpreterService.list();
    assertEquals(Set.of(id1, id2, id3), interpreters.stream().map(ClerkInterpreterDTO::id).collect(Collectors.toSet()));
    interpreters.forEach(dto -> assertFalse(dto.deleted()));
  }

  private PersonalData createPersonalData(
    final String onrId,
    final String lastName,
    final String firstName,
    final String nickName,
    final String identityNumber,
    final String email,
    final Boolean isIndividualised
  ) {
    return createPersonalData(
      onrId,
      lastName,
      firstName,
      nickName,
      identityNumber,
      email,
      null,
      null,
      null,
      null,
      null,
      isIndividualised
    );
  }

  private PersonalData createPersonalData(
    final String onrId,
    final String lastName,
    final String firstName,
    final String nickName,
    final String identityNumber,
    final String email,
    final String phoneNumber,
    final String street,
    final String postalCode,
    final String town,
    final String country,
    final Boolean isIndividualised
  ) {
    return PersonalData
      .builder()
      .onrId(onrId)
      .individualised(isIndividualised)
      .lastName(lastName)
      .firstName(firstName)
      .nickName(nickName)
      .identityNumber(identityNumber)
      .email(email)
      .phoneNumber(phoneNumber)
      .street(street)
      .postalCode(postalCode)
      .town(town)
      .country(country)
      .build();
  }

  private long createInterpreter(final String onrId) {
    return createInterpreterWithRegions(onrId, Collections.emptyList());
  }

  private long createInterpreterWithRegions(final String onrId, final List<String> regionCodes) {
    final Interpreter interpreter = Factory.interpreter();
    interpreter.setOnrId(onrId);
    entityManager.persist(interpreter);

    final Qualification qualification = Factory.qualification(interpreter);
    entityManager.persist(qualification);

    regionCodes.forEach(code -> {
      final Region region = Factory.region(interpreter, code);
      entityManager.persist(region);
    });

    return interpreter.getId();
  }

  @Test
  public void testCreateInterpreter() throws Exception {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate yesterday = LocalDate.now().minusDays(1);

    final ClerkInterpreterCreateDTO createDTO = ClerkInterpreterCreateDTO
      .builder()
      .identityNumber("241202-xyz")
      .lastName("Esimerkki")
      .firstName("Erkki Pekka")
      .nickName("Erkki")
      .email("erkki@esimerkki.invalid")
      .permissionToPublishEmail(false)
      .phoneNumber("+358401234567")
      .permissionToPublishPhone(true)
      .otherContactInfo("other")
      .permissionToPublishOtherContactInfo(false)
      .street("Tulkintie 44")
      .postalCode("00100")
      .town("Helsinki")
      .country("Suomi")
      .extraInformation("extra")
      .regions(List.of("01", "02"))
      .qualifications(
        List.of(
          ClerkQualificationCreateDTO
            .builder()
            .fromLang("FI")
            .toLang("SE")
            .beginDate(today)
            .endDate(tomorrow)
            .examinationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM)
            .permissionToPublish(true)
            .diaryNumber("123")
            .build(),
          ClerkQualificationCreateDTO
            .builder()
            .fromLang("FI")
            .toLang("DE")
            .beginDate(yesterday)
            .endDate(today)
            .examinationType(QualificationExaminationType.OTHER)
            .permissionToPublish(false)
            .diaryNumber("234")
            .build()
        )
      )
      .build();

    when(onrService.insertPersonalData(any())).thenReturn("onrId");
    when(onrService.getCachedPersonalDatas())
      .thenReturn(
        Map.of(
          "onrId",
          createPersonalData(
            "onrId",
            createDTO.lastName(),
            createDTO.firstName(),
            createDTO.nickName(),
            createDTO.identityNumber(),
            createDTO.email(),
            createDTO.phoneNumber(),
            createDTO.street(),
            createDTO.postalCode(),
            createDTO.town(),
            createDTO.country(),
            false
          )
        )
      );

    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.createInterpreter(createDTO);

    assertNotNull(interpreterDTO.id());
    assertEquals(0, interpreterDTO.version());
    assertFalse(interpreterDTO.deleted());
    assertFalse(interpreterDTO.isIndividualised());
    assertEquals(createDTO.identityNumber(), interpreterDTO.identityNumber());
    assertEquals(createDTO.lastName(), interpreterDTO.lastName());
    assertEquals(createDTO.firstName(), interpreterDTO.firstName());
    assertEquals(createDTO.nickName(), interpreterDTO.nickName());
    assertEquals(createDTO.email(), interpreterDTO.email());
    assertFalse(interpreterDTO.permissionToPublishEmail());
    assertEquals(createDTO.phoneNumber(), interpreterDTO.phoneNumber());
    assertTrue(interpreterDTO.permissionToPublishPhone());
    assertEquals(createDTO.otherContactInfo(), interpreterDTO.otherContactInfo());
    assertFalse(interpreterDTO.permissionToPublishOtherContactInfo());
    assertEquals(createDTO.street(), interpreterDTO.street());
    assertEquals(createDTO.postalCode(), interpreterDTO.postalCode());
    assertEquals(createDTO.town(), interpreterDTO.town());
    assertEquals(createDTO.country(), interpreterDTO.country());
    assertEquals(createDTO.extraInformation(), interpreterDTO.extraInformation());
    assertEquals(Set.of("01", "02"), Set.copyOf(interpreterDTO.regions()));
    assertEquals(2, interpreterDTO.qualifications().size());

    final ClerkQualificationDTO qualification1 = interpreterDTO.qualifications().get(0);
    assertEquals(0, qualification1.version());
    assertFalse(qualification1.deleted());
    assertEquals("FI", qualification1.fromLang());
    assertEquals("SE", qualification1.toLang());
    assertEquals(today, qualification1.beginDate());
    assertEquals(tomorrow, qualification1.endDate());
    assertEquals(QualificationExaminationType.LEGAL_INTERPRETER_EXAM, qualification1.examinationType());
    assertTrue(qualification1.permissionToPublish());
    assertEquals("123", qualification1.diaryNumber());

    final ClerkQualificationDTO qualification2 = interpreterDTO.qualifications().get(1);
    assertEquals("FI", qualification2.fromLang());
    assertEquals("DE", qualification2.toLang());
    assertEquals(yesterday, qualification2.beginDate());
    assertEquals(today, qualification2.endDate());
    assertEquals(QualificationExaminationType.OTHER, qualification2.examinationType());
    assertFalse(qualification2.permissionToPublish());
    assertEquals("234", qualification2.diaryNumber());
  }

  @Test
  public void testCreateInterpreterWithExistingStudent() throws Exception {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);

    final ClerkInterpreterCreateDTO createDTO = ClerkInterpreterCreateDTO
      .builder()
      .onrId("onrId")
      .isIndividualised(true)
      .identityNumber("241202-xyz")
      .lastName("Esimerkki")
      .firstName("Erkki Pekka")
      .nickName("Erkki")
      .email("erkki@esimerkki.invalid")
      .permissionToPublishEmail(false)
      .permissionToPublishPhone(true)
      .permissionToPublishOtherContactInfo(false)
      .regions(List.of("01"))
      .qualifications(
        List.of(
          ClerkQualificationCreateDTO
            .builder()
            .fromLang("FI")
            .toLang("SE")
            .beginDate(today)
            .endDate(tomorrow)
            .examinationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM)
            .permissionToPublish(true)
            .diaryNumber("123")
            .build()
        )
      )
      .build();

    when(onrService.getCachedPersonalDatas())
      .thenReturn(
        Map.of(
          "onrId",
          createPersonalData(
            "onrId",
            createDTO.lastName(),
            createDTO.firstName(),
            createDTO.nickName(),
            createDTO.identityNumber(),
            createDTO.email(),
            createDTO.phoneNumber(),
            createDTO.street(),
            createDTO.postalCode(),
            createDTO.town(),
            createDTO.country(),
            createDTO.isIndividualised()
          )
        )
      );

    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.createInterpreter(createDTO);

    assertTrue(interpreterDTO.isIndividualised());
    assertEquals(createDTO.identityNumber(), interpreterDTO.identityNumber());

    verify(onrService).updatePersonalData(any());
    verify(onrService, times(0)).insertPersonalData(any());
  }

  @Test
  public void testCreateInterpreterFailsForUnknownRegion() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);

    final ClerkInterpreterCreateDTO createDTO = ClerkInterpreterCreateDTO
      .builder()
      .isIndividualised(true)
      .identityNumber("241202-xyz")
      .lastName("Esimerkki")
      .firstName("Erkki Pekka")
      .nickName("Erkki")
      .email("erkki@esimerkki.invalid")
      .permissionToPublishEmail(false)
      .permissionToPublishPhone(true)
      .permissionToPublishOtherContactInfo(false)
      .regions(List.of("01", "This region does not exist"))
      .qualifications(
        List.of(
          ClerkQualificationCreateDTO
            .builder()
            .fromLang("FI")
            .toLang("SE")
            .beginDate(today)
            .endDate(tomorrow)
            .examinationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM)
            .permissionToPublish(true)
            .diaryNumber("123")
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
  public void testCreateInterpreterFailsForOnrIdAndIndividualisedMismatch() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);

    final ClerkInterpreterCreateDTO createDTO = ClerkInterpreterCreateDTO
      .builder()
      .onrId("onrId")
      .identityNumber("241202-xyz")
      .lastName("Esimerkki")
      .firstName("Erkki Pekka")
      .nickName("Erkki")
      .email("erkki@esimerkki.invalid")
      .permissionToPublishEmail(false)
      .permissionToPublishPhone(true)
      .permissionToPublishOtherContactInfo(false)
      .regions(List.of("01"))
      .qualifications(
        List.of(
          ClerkQualificationCreateDTO
            .builder()
            .fromLang("FI")
            .toLang("SE")
            .beginDate(today)
            .endDate(tomorrow)
            .examinationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM)
            .permissionToPublish(true)
            .diaryNumber("123")
            .build()
        )
      )
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkInterpreterService.createInterpreter(createDTO)
    );
    assertEquals(APIExceptionType.INTERPRETER_CREATE_ONR_ID_AND_INDIVIDUALISED_MISMATCH, ex.getExceptionType());
  }

  @Test
  public void testGetInterpreter() {
    final long id = createInterpreterWithRegions("1", List.of("01", "02"));
    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.getInterpreter(id);

    assertEquals(id, interpreterDTO.id());
    assertEquals("241202-xyz", interpreterDTO.identityNumber());
    assertEquals("Esimerkki", interpreterDTO.lastName());
    assertEquals("Erkki Pekka", interpreterDTO.firstName());
    assertEquals("Erkki", interpreterDTO.nickName());
    assertEquals("erkki@esimerkki.invalid", interpreterDTO.email());
    assertTrue(interpreterDTO.isIndividualised());
    assertEquals(1, interpreterDTO.qualifications().size());
    assertEquals(Set.of("01", "02"), Set.copyOf(interpreterDTO.regions()));
  }

  @Test
  public void testUpdateInterpreter() throws Exception {
    final long id = createInterpreter("onrId");
    final Interpreter interpreter = interpreterRepository.getReferenceById(id);
    final int initialVersion = interpreter.getVersion();

    final ClerkInterpreterUpdateDTO updateDTO = ClerkInterpreterUpdateDTO
      .builder()
      .id(interpreter.getId())
      .version(initialVersion)
      .isIndividualised(false)
      .identityNumber("121212-123")
      .lastName("Merkkinen")
      .firstName("Eemeli Aapo")
      .nickName("Eemeli")
      .email("eemeli.merkkinen.invalid")
      .permissionToPublishEmail(false)
      .permissionToPublishPhone(false)
      .otherContactInfo("interpreter@test.invalid")
      .permissionToPublishOtherContactInfo(true)
      .extraInformation("extra")
      .regions(List.of("01"))
      .build();

    when(onrService.getCachedPersonalDatas())
      .thenReturn(
        Map.of(
          "onrId",
          createPersonalData(
            "onrId",
            updateDTO.lastName(),
            updateDTO.firstName(),
            updateDTO.nickName(),
            updateDTO.identityNumber(),
            updateDTO.email(),
            updateDTO.phoneNumber(),
            updateDTO.street(),
            updateDTO.postalCode(),
            updateDTO.town(),
            updateDTO.country(),
            updateDTO.isIndividualised()
          )
        )
      );

    final ClerkInterpreterDTO updated = clerkInterpreterService.updateInterpreter(updateDTO);

    assertEquals(interpreter.getId(), updated.id());
    assertEquals(initialVersion + 1, updated.version());
    assertFalse(updated.deleted());
    assertFalse(updated.isIndividualised());
    assertFalse(updated.permissionToPublishEmail());
    assertFalse(updated.permissionToPublishPhone());
    assertEquals(updateDTO.otherContactInfo(), updated.otherContactInfo());
    assertTrue(updated.permissionToPublishOtherContactInfo());
    assertEquals(updateDTO.extraInformation(), updated.extraInformation());
    assertEquals(List.of("01"), updated.regions());

    verify(onrService).updatePersonalData(any());
  }

  @Test
  public void testUpdateInterpreterWithDuplicateRegions() throws Exception {
    final long id = createInterpreter("onrId");
    final Interpreter interpreter = interpreterRepository.getReferenceById(id);
    final int initialVersion = interpreter.getVersion();

    final ClerkInterpreterUpdateDTO updateDTO = ClerkInterpreterUpdateDTO
      .builder()
      .id(interpreter.getId())
      .version(initialVersion)
      .isIndividualised(false)
      .identityNumber("121212-123")
      .lastName("Merkkinen")
      .firstName("Eemeli Aapo")
      .nickName("Eemeli")
      .email("eemeli.merkkinen.invalid")
      .permissionToPublishEmail(false)
      .permissionToPublishPhone(false)
      .otherContactInfo("interpreter@test.invalid")
      .permissionToPublishOtherContactInfo(true)
      .extraInformation("extra")
      .regions(List.of("01", "01", "02"))
      .build();

    when(onrService.getCachedPersonalDatas())
      .thenReturn(
        Map.of(
          "onrId",
          createPersonalData(
            "onrId",
            updateDTO.lastName(),
            updateDTO.firstName(),
            updateDTO.nickName(),
            updateDTO.identityNumber(),
            updateDTO.email(),
            updateDTO.phoneNumber(),
            updateDTO.street(),
            updateDTO.postalCode(),
            updateDTO.town(),
            updateDTO.country(),
            updateDTO.isIndividualised()
          )
        )
      );

    final ClerkInterpreterDTO updated = clerkInterpreterService.updateInterpreter(updateDTO);

    assertEquals(List.of("01", "02"), updated.regions());

    verify(onrService).updatePersonalData(any());
  }

  @Test
  public void testUpdateInterpreterFailsForUnknownRegion() {
    final long id = createInterpreter("1");
    final ClerkInterpreterDTO original = clerkInterpreterService.getInterpreter(id);

    final ClerkInterpreterUpdateDTO updateDto = ClerkInterpreterUpdateDTO
      .builder()
      .id(original.id())
      .version(original.version())
      .isIndividualised(false)
      .identityNumber(original.identityNumber())
      .lastName(original.lastName())
      .firstName(original.firstName())
      .nickName(original.nickName())
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
    final long id = createInterpreter("1");
    createInterpreter("2");

    final ClerkInterpreterDTO dto = clerkInterpreterService.deleteInterpreter(id);

    interpreterRepository
      .findAll()
      .forEach(interpreter -> {
        final boolean isDeleted = Objects.equals(id, interpreter.getId());

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
    interpreter.setOnrId("1");
    entityManager.persist(interpreter);

    final Qualification qualification = Factory.qualification(interpreter);
    entityManager.persist(qualification);

    final ClerkQualificationCreateDTO createDTO = ClerkQualificationCreateDTO
      .builder()
      .fromLang("FI")
      .toLang("CS")
      .beginDate(today)
      .endDate(tomorrow)
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(false)
      .diaryNumber("1000")
      .build();

    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.createQualification(
      interpreter.getId(),
      createDTO
    );
    assertEquals(2, interpreterDTO.qualifications().size());

    final ClerkQualificationDTO qualificationDTO = interpreterDTO
      .qualifications()
      .stream()
      .filter(dto -> dto.diaryNumber() != null && dto.diaryNumber().equals("1000"))
      .toList()
      .get(0);

    assertNotNull(qualificationDTO);
    assertEquals(0, qualificationDTO.version());
    assertFalse(qualificationDTO.deleted());
    assertEquals("FI", qualificationDTO.fromLang());
    assertEquals("CS", qualificationDTO.toLang());
    assertEquals(today, qualificationDTO.beginDate());
    assertEquals(tomorrow, qualificationDTO.endDate());
    assertEquals(QualificationExaminationType.OTHER, qualificationDTO.examinationType());
    assertFalse(qualificationDTO.permissionToPublish());
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
      .fromLang("FI")
      .toLang("XX")
      .beginDate(today)
      .endDate(tomorrow)
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(false)
      .diaryNumber("1001")
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkInterpreterService.createQualification(interpreter.getId(), createDTO)
    );
    assertEquals(APIExceptionType.QUALIFICATION_LANGUAGE_UNKNOWN, ex.getExceptionType());
  }

  @Test
  public void testCreateQualificationFailsForInvalidTerm() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);

    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter);

    entityManager.persist(interpreter);
    entityManager.persist(qualification);

    final ClerkQualificationCreateDTO createDTO = ClerkQualificationCreateDTO
      .builder()
      .fromLang("FI")
      .toLang("EN")
      .beginDate(tomorrow)
      .endDate(today)
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(false)
      .diaryNumber("1001")
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkInterpreterService.createQualification(interpreter.getId(), createDTO)
    );
    assertEquals(APIExceptionType.QUALIFICATION_INVALID_TERM, ex.getExceptionType());
  }

  @Test
  public void testUpdateQualification() {
    final LocalDate begin = LocalDate.now().minusMonths(1);
    final LocalDate end = LocalDate.now().plusMonths(1);

    final Interpreter interpreter = Factory.interpreter();
    interpreter.setOnrId("1");
    entityManager.persist(interpreter);

    final Qualification qualification = Factory.qualification(interpreter);
    entityManager.persist(qualification);

    final ClerkQualificationUpdateDTO updateDTO = ClerkQualificationUpdateDTO
      .builder()
      .id(qualification.getId())
      .version(qualification.getVersion())
      .fromLang("FI")
      .toLang("NO")
      .beginDate(begin)
      .endDate(end)
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(true)
      .diaryNumber("2000")
      .build();

    final ClerkInterpreterDTO interpreterDTO = clerkInterpreterService.updateQualification(updateDTO);

    assertEquals(1, interpreterDTO.qualifications().size());
    final ClerkQualificationDTO qualificationDTO = interpreterDTO.qualifications().get(0);

    assertEquals(updateDTO.version() + 1, qualificationDTO.version());
    assertFalse(qualificationDTO.deleted());
    assertEquals("FI", qualificationDTO.fromLang());
    assertEquals("NO", qualificationDTO.toLang());
    assertEquals(begin, qualificationDTO.beginDate());
    assertEquals(end, qualificationDTO.endDate());
    assertEquals(QualificationExaminationType.OTHER, qualificationDTO.examinationType());
    assertTrue(qualificationDTO.permissionToPublish());
    assertEquals("2000", qualificationDTO.diaryNumber());
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
      .fromLang("FI")
      .toLang("XX")
      .beginDate(begin)
      .endDate(end)
      .examinationType(QualificationExaminationType.OTHER)
      .permissionToPublish(true)
      .diaryNumber("2000")
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkInterpreterService.updateQualification(updateDTO)
    );
    assertEquals(APIExceptionType.QUALIFICATION_LANGUAGE_UNKNOWN, ex.getExceptionType());
  }

  @Test
  public void testDeleteQualification() {
    final Interpreter interpreter = Factory.interpreter();
    interpreter.setOnrId("1");

    final Qualification qualification1 = Factory.qualification(interpreter);
    final Qualification qualification2 = Factory.qualification(interpreter);

    entityManager.persist(interpreter);
    entityManager.persist(qualification1);
    entityManager.persist(qualification2);

    final ClerkInterpreterDTO dto = clerkInterpreterService.deleteQualification(qualification1.getId());

    dto.qualifications().forEach(q -> assertEquals(Objects.equals(qualification1.getId(), q.id()), q.deleted()));
  }

  @Test
  public void testDeleteLastQualificationFails() {
    final Interpreter interpreter = Factory.interpreter();
    interpreter.setOnrId("1");

    final Qualification qualification1 = Factory.qualification(interpreter);
    final Qualification qualification2 = Factory.qualification(interpreter);
    qualification2.setDeletedAt(LocalDateTime.now());

    entityManager.persist(interpreter);
    entityManager.persist(qualification1);
    entityManager.persist(qualification2);

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkInterpreterService.deleteQualification(qualification1.getId())
    );
    assertEquals(APIExceptionType.QUALIFICATION_DELETE_LAST_QUALIFICATION, ex.getExceptionType());
  }
}
