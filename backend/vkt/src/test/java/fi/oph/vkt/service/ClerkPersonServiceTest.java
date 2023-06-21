package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.repository.PersonRepository;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
public class ClerkPersonServiceTest {

  @Resource
  private PersonRepository personRepository;

  @Resource
  private TestEntityManager entityManager;

  private ClerkPersonService clerkPersonService;

  @BeforeEach
  public void setup() {
    clerkPersonService = new ClerkPersonService(personRepository);
  }

  @Test
  public void testDeleteObsoletePersons() {
    final ExamEvent examEvent = Factory.examEvent();
    final LocalDateTime ttlPassed = LocalDateTime.now().minusDays(1).minusMinutes(1);

    final Person person1 = Factory.person();
    person1.setLatestIdentifiedAt(ttlPassed);
    final Enrollment enrollment1 = Factory.enrollment(examEvent, person1);

    final Person person2 = Factory.person();
    person2.setLatestIdentifiedAt(ttlPassed);
    final Reservation reservation2 = Factory.reservation(examEvent, person2);

    final Person person3 = Factory.person();
    person3.setLatestIdentifiedAt(ttlPassed.plusMinutes(5));

    final Person person4 = Factory.person();
    person4.setLatestIdentifiedAt(ttlPassed);

    entityManager.persist(examEvent);
    entityManager.persist(person1);
    entityManager.persist(enrollment1);
    entityManager.persist(person2);
    entityManager.persist(reservation2);
    entityManager.persist(person3);
    entityManager.persist(person4);

    clerkPersonService.deleteObsoletePersons();

    final List<Person> persons = personRepository.findAll();

    assertEquals(
      Set.of(person1.getId(), person2.getId(), person3.getId()),
      persons.stream().map(Person::getId).collect(Collectors.toSet())
    );
  }
}
