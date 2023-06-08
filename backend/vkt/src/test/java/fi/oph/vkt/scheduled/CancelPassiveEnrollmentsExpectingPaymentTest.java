package fi.oph.vkt.scheduled;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
public class CancelPassiveEnrollmentsExpectingPaymentTest {

  @Resource
  private EnrollmentRepository enrollmentRepository;

  @Resource
  private TestEntityManager entityManager;

  private CancelPassiveEnrollmentsExpectingPayment canceler;

  @BeforeEach
  public void setup() {
    canceler = new CancelPassiveEnrollmentsExpectingPayment(enrollmentRepository);
  }

  @Test
  public void testActionCancelsOnlyPassivePaymentExpectingEnrollments() {
    final LocalDateTime previousDay = LocalDateTime.now().minusDays(1);
    final LocalDateTime threeHoursAgo = LocalDateTime.now().minusHours(3);

    final ExamEvent examEvent = Factory.examEvent();
    entityManager.persist(examEvent);

    createEnrollment(examEvent, EnrollmentStatus.PAID, Optional.of(previousDay));
    final long expected1 = createEnrollment(
      examEvent,
      EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT,
      Optional.of(previousDay)
    );
    final long expected2 = createEnrollment(
      examEvent,
      EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT,
      Optional.of(threeHoursAgo.minusMinutes(1))
    );
    createEnrollment(
      examEvent,
      EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT,
      Optional.of(threeHoursAgo.plusMinutes(1))
    );
    createEnrollment(examEvent, EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT, Optional.empty());

    canceler.action();

    final List<Enrollment> enrollments = enrollmentRepository.findAll();
    assertEquals(5, enrollments.size());

    assertEquals(1, enrollments.stream().filter(e -> e.getStatus() == EnrollmentStatus.PAID).count());
    assertEquals(
      2,
      enrollments
        .stream()
        .filter(e -> e.getStatus() == EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT)
        .count()
    );

    final List<Enrollment> canceledEnrollments = enrollments
      .stream()
      .filter(e -> e.getStatus() == EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT)
      .toList();
    assertEquals(2, canceledEnrollments.size());
    assertEquals(
      canceledEnrollments.stream().map(Enrollment::getId).collect(Collectors.toSet()),
      Set.of(expected1, expected2)
    );
  }

  private long createEnrollment(
    final ExamEvent examEvent,
    final EnrollmentStatus enrollmentStatus,
    final Optional<LocalDateTime> optionalModifiedAt
  ) {
    final Person person = Factory.person();
    entityManager.persist(person);

    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setStatus(enrollmentStatus);
    entityManager.persist(enrollment);

    optionalModifiedAt.ifPresent(modifiedAt -> {
      enrollment.setModifiedAt(modifiedAt);
      entityManager.merge(enrollment);
    });

    return enrollment.getId();
  }
}
