package fi.oph.yki.service;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.yki.Factory;
import fi.oph.yki.api.dto.PublicEducationBasisDTO;
import fi.oph.yki.api.dto.PublicEducationDTO;
import fi.oph.yki.api.dto.PublicEducationUpdateDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.FreeRegistrationType;
import fi.oph.yki.repository.FreeRegistrationRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.dto.FreeRegistrationDTO;
import fi.oph.yki.service.koski.KoskiService;
import fi.oph.yki.service.koski.dto.KoulutusTyyppi;
import fi.oph.yki.util.RegistrationUtil;
import jakarta.annotation.Resource;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class RegistrationServiceTest {

  @Resource
  private PersonRepository personRepository;

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private FreeRegistrationRepository freeRegistrationRepository;

  @MockBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  private KoskiService koskiService;
  private RegistrationService registrationService;

  @BeforeEach
  public void setup() {
    koskiService = mock(KoskiService.class);
    registrationService =
      new RegistrationService(
        registrationRepository,
        freeRegistrationRepository,
        personRepository,
        auditService,
        koskiService
      );
  }

  @Test
  public void testCreateEducations() {
    final Person person = Factory.person();
    final Registration registration = Factory.registration(person);
    final List<PublicEducationDTO> educationDTOs = List.of(
      PublicEducationDTO.builder().educationType(KoulutusTyyppi.HigherEducation.toString()).isActive(true).build()
    );
    final PublicEducationUpdateDTO publicEducationUpdateDTO = PublicEducationUpdateDTO
      .builder()
      .basis(
        PublicEducationBasisDTO
          .builder()
          .source(FreeRegistrationSource.USER)
          .educationType(FreeRegistrationType.MatriculationExam)
          .build()
      )
      .build();
    when(koskiService.getEducations(registration.getPerson().getOid())).thenReturn(educationDTOs);

    entityManager.persist(person);
    entityManager.persist(registration);

    registrationService.updateFreeRegistration(registration, publicEducationUpdateDTO);

    entityManager.refresh(registration);
    verify(auditService)
      .logCreate(
        YkiOperation.CREATE_FREE_REGISTRATION,
        registration.getId(),
        RegistrationUtil.createFreeRegistrationDTO(registration.getFreeRegistration())
      );
  }

  @Test
  public void testUpdateEducations() {
    final Person person = Factory.person();
    final Registration registration = Factory.registration(person);
    final FreeRegistration freeRegistration = Factory.freeRegistration(registration);
    final List<PublicEducationDTO> educationDTOs = List.of(
      PublicEducationDTO.builder().educationType(KoulutusTyyppi.HigherEducation.toString()).isActive(true).build()
    );
    final PublicEducationUpdateDTO publicEducationUpdateDTO = PublicEducationUpdateDTO
      .builder()
      .basis(
        PublicEducationBasisDTO
          .builder()
          .source(FreeRegistrationSource.USER)
          .educationType(FreeRegistrationType.MatriculationExam)
          .build()
      )
      .build();
    when(koskiService.getEducations(registration.getPerson().getOid())).thenReturn(educationDTOs);

    registration.setFreeRegistration(freeRegistration);
    entityManager.persist(person);
    entityManager.persist(registration);
    entityManager.persist(freeRegistration);

    final FreeRegistrationDTO freeRegistrationBeforeDTO = RegistrationUtil.createFreeRegistrationDTO(freeRegistration);
    registrationService.updateFreeRegistration(registration, publicEducationUpdateDTO);

    entityManager.refresh(registration);
    verify(auditService)
      .logUpdate(
        YkiOperation.UPDATE_FREE_REGISTRATION,
        registration.getId(),
        freeRegistrationBeforeDTO,
        RegistrationUtil.createFreeRegistrationDTO(registration.getFreeRegistration())
      );
  }
}
