package fi.oph.akr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import fi.oph.akr.Factory;
import fi.oph.akr.api.dto.clerk.ExaminationDateDTO;
import fi.oph.akr.api.dto.clerk.modify.ExaminationDateCreateDTO;
import fi.oph.akr.audit.AkrOperation;
import fi.oph.akr.audit.AuditService;
import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.ExaminationDate;
import fi.oph.akr.model.MeetingDate;
import fi.oph.akr.model.Translator;
import fi.oph.akr.repository.ExaminationDateRepository;
import fi.oph.akr.util.exception.APIException;
import fi.oph.akr.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.util.List;
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
public class ExaminationDateServiceTest {

  private ExaminationDateService examinationDateService;

  @Resource
  private ExaminationDateRepository examinationDateRepository;

  @MockBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  @BeforeEach
  public void setup() {
    examinationDateService = new ExaminationDateService(examinationDateRepository, auditService);
  }

  @Test
  public void testExaminationDateList() {
    final ExaminationDate examinationDate1 = Factory.examinationDate(LocalDate.of(2020, 1, 1));
    final ExaminationDate examinationDate2 = Factory.examinationDate(LocalDate.of(2020, 9, 6));
    entityManager.persist(examinationDate1);
    entityManager.persist(examinationDate2);

    final List<ExaminationDateDTO> examinationDateDTOS = examinationDateService.listExaminationDatesWithoutAudit();
    assertEquals(2, examinationDateDTOS.size());

    assertEquals(examinationDate2.getId(), examinationDateDTOS.get(0).id());
    assertEquals(examinationDate2.getDate(), examinationDateDTOS.get(0).date());
    assertEquals(examinationDate1.getId(), examinationDateDTOS.get(1).id());
    assertEquals(examinationDate1.getDate(), examinationDateDTOS.get(1).date());

    verifyNoInteractions(auditService);
  }

  @Test
  public void testExaminationDateCreate() {
    final ExaminationDateCreateDTO dto = ExaminationDateCreateDTO.builder().date(LocalDate.now()).build();

    final ExaminationDateDTO response = examinationDateService.createExaminationDate(dto);
    assertEquals(dto.date(), response.date());

    final List<ExaminationDate> examinationDates = examinationDateRepository.findAll();
    assertEquals(1, examinationDates.size());
    assertEquals(response.id(), examinationDates.get(0).getId());
    assertEquals(response.date(), examinationDates.get(0).getDate());

    verify(auditService).logById(AkrOperation.CREATE_EXAMINATION_DATE, response.id());
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testExaminationDateCreateFailsForDuplicateExaminationDate() {
    final ExaminationDate examinationDate = Factory.examinationDate();
    entityManager.persist(examinationDate);

    final ExaminationDateCreateDTO dto = ExaminationDateCreateDTO.builder().date(examinationDate.getDate()).build();

    final APIException ex = assertThrows(APIException.class, () -> examinationDateService.createExaminationDate(dto));

    assertEquals(APIExceptionType.EXAMINATION_DATE_CREATE_DUPLICATE_DATE, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testExaminationDateDelete() {
    final ExaminationDate examinationDate1 = Factory.examinationDate(LocalDate.now());
    final ExaminationDate examinationDate2 = Factory.examinationDate(LocalDate.now().plusDays(1));

    entityManager.persist(examinationDate1);
    entityManager.persist(examinationDate2);

    final long id = examinationDate1.getId();
    examinationDateService.deleteExaminationDate(id);

    assertEquals(
      Set.of(examinationDate2.getId()),
      examinationDateRepository.findAll().stream().map(ExaminationDate::getId).collect(Collectors.toSet())
    );

    verify(auditService).logById(AkrOperation.DELETE_EXAMINATION_DATE, id);
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testExaminationDateDeleteFailsForExaminationDateWithAuthorisations() {
    final MeetingDate meetingDate = Factory.meetingDate();
    final Translator translator = Factory.translator();
    final ExaminationDate examinationDate = Factory.examinationDate();
    final Authorisation authorisation = Factory.autAuthorisation(translator, meetingDate, examinationDate);

    entityManager.persist(meetingDate);
    entityManager.persist(translator);
    entityManager.persist(examinationDate);
    entityManager.persist(authorisation);

    final APIException ex = assertThrows(
      APIException.class,
      () -> examinationDateService.deleteExaminationDate(examinationDate.getId())
    );

    assertEquals(APIExceptionType.EXAMINATION_DATE_DELETE_HAS_AUTHORISATIONS, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }
}
