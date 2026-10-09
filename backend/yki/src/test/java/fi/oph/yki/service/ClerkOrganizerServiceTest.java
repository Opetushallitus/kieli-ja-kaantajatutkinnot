package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerCreateDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerLanguageDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerUpdateDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.LoggerImpl;
import fi.oph.yki.config.Constants;
import fi.oph.yki.model.ExamLanguage;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.repository.ExamLanguageRepository;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.OrganizerRepository;
import fi.vm.sade.auditlog.ApplicationType;
import fi.vm.sade.auditlog.Audit;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class ClerkOrganizerServiceTest {

  @Resource
  private OrganizerRepository organizerRepository;

  @Resource
  private ExamLanguageRepository examLanguageRepository;

  @Resource
  private ExamSessionRepository examSessionRepository;

  @Resource
  private TestEntityManager entityManager;

  private ClerkOrganizerService clerkOrganizerService;

  @BeforeEach
  public void setup() {
    final AuditService auditService = new AuditService(
      new Audit(new LoggerImpl(), Constants.SERVICENAME, ApplicationType.VIRKAILIJA)
    );
    clerkOrganizerService =
      new ClerkOrganizerService(organizerRepository, examLanguageRepository, examSessionRepository, auditService);
  }

  @Test
  public void testUpdateOrganizerUpdatesScalarFields() {
    final Organizer organizer = Factory.organizer();
    entityManager.persist(organizer);
    entityManager.flush();
    entityManager.clear();

    final ClerkOrganizerUpdateDTO dto = ClerkOrganizerUpdateDTO
      .builder()
      .id(organizer.getId())
      .oid(organizer.getOid())
      .agreementStartDate(LocalDate.of(2026, 3, 1))
      .agreementEndDate(LocalDate.of(2028, 6, 30))
      .contactName("Uusi Nimi")
      .contactEmail("uusi@example.com")
      .contactPhoneNumber("050 123 4567")
      .extra("lisätiedot")
      .build();

    final ClerkOrganizerDTO result = clerkOrganizerService.updateOrganizer(organizer.getOid(), dto);

    assertEquals(LocalDate.of(2026, 3, 1), result.agreementStartDate());
    assertEquals(LocalDate.of(2028, 6, 30), result.agreementEndDate());
    assertEquals("Uusi Nimi", result.contactName());
    assertEquals("uusi@example.com", result.contactEmail());
    assertEquals("050 123 4567", result.contactPhoneNumber());
    assertEquals("lisätiedot", result.extra());
    assertNull(result.languages());
  }

  @Test
  public void testUpdateOrganizerReplacesLanguages() {
    final Organizer organizer = Factory.organizer();
    entityManager.persist(organizer);

    final ExamLanguage existingLang = new ExamLanguage();
    existingLang.setOrganizer(organizer);
    existingLang.setLanguageCode("fin");
    existingLang.setLevelCode("PERUS");
    entityManager.persist(existingLang);

    entityManager.flush();
    entityManager.clear();

    final ClerkOrganizerUpdateDTO dto = ClerkOrganizerUpdateDTO
      .builder()
      .id(organizer.getId())
      .oid(organizer.getOid())
      .agreementStartDate(organizer.getAgreementStartDate())
      .agreementEndDate(organizer.getAgreementEndDate())
      .languages(
        List.of(
          ClerkOrganizerLanguageDTO.builder().languageCode("swe").levelCode("KESKI").build(),
          ClerkOrganizerLanguageDTO.builder().languageCode("eng").levelCode("YLIN").build()
        )
      )
      .build();

    final ClerkOrganizerDTO result = clerkOrganizerService.updateOrganizer(organizer.getOid(), dto);

    assertNotNull(result.languages());
    assertEquals(2, result.languages().size());
    assertEquals(0, examLanguageRepository.findAll().stream().filter(l -> "fin".equals(l.getLanguageCode())).count());
    assertEquals(1, examLanguageRepository.findAll().stream().filter(l -> "swe".equals(l.getLanguageCode())).count());
    assertEquals(1, examLanguageRepository.findAll().stream().filter(l -> "eng".equals(l.getLanguageCode())).count());
  }

  @Test
  public void testCreateOrganizerWithoutLanguages() {
    final ClerkOrganizerCreateDTO dto = ClerkOrganizerCreateDTO
      .builder()
      .oid("1.2.246.562.10.00000000099")
      .agreementStartDate(LocalDate.of(2026, 1, 1))
      .agreementEndDate(LocalDate.of(2027, 12, 31))
      .contactName("Testi Järjestäjä")
      .contactEmail("jarjestaja@example.com")
      .contactPhoneNumber("0401234567")
      .extra("lisätiedot")
      .build();

    final ClerkOrganizerDTO result = clerkOrganizerService.createOrganizer(dto);

    assertEquals("1.2.246.562.10.00000000099", result.oid());
    assertEquals(LocalDate.of(2026, 1, 1), result.agreementStartDate());
    assertEquals(LocalDate.of(2027, 12, 31), result.agreementEndDate());
    assertEquals("Testi Järjestäjä", result.contactName());
    assertEquals("jarjestaja@example.com", result.contactEmail());
    assertEquals("0401234567", result.contactPhoneNumber());
    assertEquals("lisätiedot", result.extra());
    assertNull(result.languages());
  }

  @Test
  public void testCreateOrganizerWithLanguages() {
    final ClerkOrganizerCreateDTO dto = ClerkOrganizerCreateDTO
      .builder()
      .oid("1.2.246.562.10.00000000098")
      .agreementStartDate(LocalDate.of(2026, 1, 1))
      .agreementEndDate(LocalDate.of(2027, 12, 31))
      .contactName("Testi Järjestäjä")
      .contactEmail("jarjestaja@example.com")
      .contactPhoneNumber("0401234567")
      .languages(
        List.of(
          ClerkOrganizerLanguageDTO.builder().languageCode("fin").levelCode("PERUS").build(),
          ClerkOrganizerLanguageDTO.builder().languageCode("swe").levelCode("KESKI").build()
        )
      )
      .build();

    final ClerkOrganizerDTO result = clerkOrganizerService.createOrganizer(dto);

    assertNotNull(result.languages());
    assertEquals(2, result.languages().size());
  }

  @Test
  public void testCreateOrganizerPersistsToDatabase() {
    final ClerkOrganizerCreateDTO dto = ClerkOrganizerCreateDTO
      .builder()
      .oid("1.2.246.562.10.00000000097")
      .agreementStartDate(LocalDate.of(2026, 1, 1))
      .agreementEndDate(LocalDate.of(2027, 12, 31))
      .contactName("Testi")
      .contactEmail("testi@example.com")
      .contactPhoneNumber("040111222")
      .build();

    clerkOrganizerService.createOrganizer(dto);
    entityManager.flush();
    entityManager.clear();

    final var saved = organizerRepository.findByOidAndDeletedAtIsNull("1.2.246.562.10.00000000097");
    assertNotNull(saved.orElse(null));
    assertEquals("Testi", saved.get().getContactName());
    assertEquals("testi@example.com", saved.get().getContactEmail());
    assertEquals("040111222", saved.get().getContactPhoneNumber());
  }

  @Test
  public void testCreateOrganizerWithNullOptionalFields() {
    final ClerkOrganizerCreateDTO dto = ClerkOrganizerCreateDTO
      .builder()
      .oid("1.2.246.562.10.00000000095")
      .agreementStartDate(LocalDate.of(2026, 1, 1))
      .agreementEndDate(LocalDate.of(2027, 12, 31))
      .build();

    final ClerkOrganizerDTO result = clerkOrganizerService.createOrganizer(dto);

    assertNotNull(result);
    assertNull(result.contactName());
    assertNull(result.contactEmail());
    assertNull(result.contactPhoneNumber());
    assertNull(result.extra());
    assertNull(result.languages());
  }

  @Test
  public void testUpdateOrganizerThrowsForUnknownOid() {
    assertThrows(
      Exception.class,
      () ->
        clerkOrganizerService.updateOrganizer(
          "1.2.3.4.5.99999",
          ClerkOrganizerUpdateDTO
            .builder()
            .agreementStartDate(LocalDate.of(2026, 1, 1))
            .agreementEndDate(LocalDate.of(2027, 1, 1))
            .build()
        )
    );
  }
}
