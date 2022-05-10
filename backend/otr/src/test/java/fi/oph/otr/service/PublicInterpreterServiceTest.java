package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import fi.oph.otr.Factory;
import fi.oph.otr.api.dto.InterpreterDTO;
import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.LanguagePair;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.LanguagePairRepository;
import java.time.LocalDate;
import java.util.List;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class PublicInterpreterServiceTest {

  @Resource
  private InterpreterRepository interpreterRepository;

  @Resource
  private LanguagePairRepository languagePairRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicInterpreterService publicInterpreterService;

  @BeforeEach
  public void setup() {
    publicInterpreterService = new PublicInterpreterService(interpreterRepository, languagePairRepository);
  }

  @Test
  public void testOnlyPublishingPermittedAreReturned() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate nextWeek = tomorrow.plusDays(7);
    final LocalDate previousWeek = today.minusDays(7);
    final LocalDate yesterday = today.minusDays(1);

    final Interpreter interpreter1 = createInterpreter();
    final Interpreter interpreter2 = createInterpreter();
    final Interpreter interpreter3 = createInterpreter();
    final Interpreter interpreter4 = createInterpreter();
    final Interpreter interpreter5 = createInterpreterDeleted();
    final Interpreter interpreter6 = createInterpreter();

    final Qualification qualification1 = createQualification(interpreter1);
    final Qualification qualification2 = createQualification(interpreter2);
    final Qualification qualification3 = createQualification(interpreter3);
    final Qualification qualification4 = createQualification(interpreter4);
    final Qualification qualification5 = createQualification(interpreter5);
    final Qualification qualification6 = createQualificationDeleted(interpreter6);

    interpreter1.setPermissionToPublishEmail(false);
    interpreter1.setPermissionToPublishOtherContactInfo(true);
    interpreter1.setOtherContactInformation("oikeustulkki.company@invalid");
    interpreter2.setPermissionToPublishPhone(false);
    qualification3.setPermissionToPublish(false);

    final LanguagePair languagePair11 = createLanguagePair(qualification1, "FI", "EN", today, tomorrow);
    final LanguagePair languagePair12 = createLanguagePair(qualification1, "NO", "FI", yesterday, today);
    final LanguagePair languagePair21 = createLanguagePair(qualification2, "SE", "FI", yesterday, nextWeek);
    // Hidden, no publish permission
    createLanguagePair(qualification3, "FI", "RU", yesterday, nextWeek);
    // Hidden, in past
    createLanguagePair(qualification4, "FI", "IT", previousWeek, yesterday);
    // Hidden, in future
    createLanguagePair(qualification4, "FI", "DN", tomorrow, nextWeek);
    // Interpreter marked deleted
    createLanguagePair(qualification5, "DE", "FI", yesterday, nextWeek);
    // Legal interpreter marked deleted
    createLanguagePair(qualification6, "FR", "FI", yesterday, nextWeek);

    final List<InterpreterDTO> interpreters = publicInterpreterService.list();
    assertEquals(2, interpreters.size());

    final InterpreterDTO publishedInterpreter1 = interpreters.get(0);
    assertNull(publishedInterpreter1.email());
    assertNotNull(publishedInterpreter1.phoneNumber());
    assertEquals(interpreter1.getOtherContactInformation(), publishedInterpreter1.otherContactInfo());

    assertEquals(2, publishedInterpreter1.languages().size());
    assertLanguagePair(languagePair11, publishedInterpreter1.languages().get(0));
    assertLanguagePair(languagePair12, publishedInterpreter1.languages().get(1));

    final InterpreterDTO publishedInterpreter2 = interpreters.get(1);
    assertNotNull(publishedInterpreter2.email());
    assertNull(publishedInterpreter2.phoneNumber());
    assertNull(publishedInterpreter2.otherContactInfo());

    assertEquals(1, publishedInterpreter2.languages().size());
    assertLanguagePair(languagePair21, publishedInterpreter2.languages().get(0));
  }

  private void assertLanguagePair(final LanguagePair expected, final LanguagePairDTO languagePairDTO) {
    assertEquals(expected.getFromLang(), languagePairDTO.from());
    assertEquals(expected.getToLang(), languagePairDTO.to());
  }

  private Interpreter createInterpreter() {
    final Interpreter interpreter = Factory.interpreter();
    entityManager.persist(interpreter);
    return interpreter;
  }

  private Interpreter createInterpreterDeleted() {
    final Interpreter interpreter = Factory.interpreter();
    interpreter.markDeleted();
    entityManager.persist(interpreter);
    return interpreter;
  }

  private Qualification createQualification(final Interpreter interpreter) {
    final Qualification qualification = Factory.qualification(interpreter);
    entityManager.persist(qualification);
    return qualification;
  }

  private Qualification createQualificationDeleted(final Interpreter interpreter) {
    final Qualification qualification = Factory.qualification(interpreter);
    qualification.markDeleted();
    entityManager.persist(qualification);
    return qualification;
  }

  private LanguagePair createLanguagePair(
    final Qualification qualification,
    final String from,
    final String to,
    final LocalDate begin,
    final LocalDate end
  ) {
    final LanguagePair languagePair = Factory.languagePair(qualification, from, to, begin, end);
    entityManager.persist(languagePair);
    return languagePair;
  }
}
