package fi.oph.yki.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.type.RegistrationState;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
class PersonBirthdateSearchTest {

  @Resource
  private TestEntityManager entityManager;

  @Resource
  private PersonRepository personRepository;

  @Test
  void searchUsesLatestSubmittedNonemptyBirthdayAndKeepsCustomersWithoutOne() {
    final var examDate = entityManager.persist(Factory.examDate());
    final var session = entityManager.persist(Factory.examSession(examDate));
    final var person = entityManager.persist(Factory.person());
    final var withoutBirthday = Factory.person();
    withoutBirthday.setOid("1.2.3.4.6");
    entityManager.persist(withoutBirthday);

    addRegistration(person, session, 1, "1990-01-01", RegistrationState.COMPLETED);
    addRegistration(person, session, 2, "1991-02-03", RegistrationState.SUBMITTED);
    addRegistration(person, session, 3, "1992-03-04", RegistrationState.STARTED);
    addRegistration(person, session, 4, "", RegistrationState.SUBMITTED);
    addRegistration(person, session, 5, null, RegistrationState.SUBMITTED);
    entityManager.flush();
    entityManager.clear();

    assertEquals("1991-02-03", personRepository.findLatestSubmittedBirthdate(person.getOid()));
    assertNull(personRepository.findLatestSubmittedBirthdate(withoutBirthday.getOid()));

    final var results = personRepository.searchPersons(PageRequest.of(0, 10), null, null, null, null, null);
    assertEquals(
      "1991-02-03",
      results.stream().filter(p -> p.oid().equals(person.getOid())).findFirst().orElseThrow().birthdate()
    );
    assertNull(
      results.stream().filter(p -> p.oid().equals(withoutBirthday.getOid())).findFirst().orElseThrow().birthdate()
    );
  }

  private void addRegistration(
    final Person person,
    final ExamSession session,
    final int day,
    final String birthdate,
    final RegistrationState state
  ) {
    final var registration = Factory.registration(person);
    registration.setExamSession(session);
    registration.setState(state);
    registration.setCreatedAt(LocalDateTime.of(2026, 4, day, 10, 0));
    registration.setForm(new ObjectMapper().createObjectNode().put("birthdate", birthdate));
    entityManager.persist(registration);
  }
}
