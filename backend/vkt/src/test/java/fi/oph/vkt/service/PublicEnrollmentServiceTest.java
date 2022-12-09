package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ReservationRepository;
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
public class PublicEnrollmentServiceTest {

  @Resource
  private EnrollmentRepository enrollmentRepository;

  @Resource
  private ReservationRepository reservationRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicEnrollmentService publicEnrollmentService;

  @BeforeEach
  public void setup() {
    publicEnrollmentService = new PublicEnrollmentService(enrollmentRepository, reservationRepository);
  }

  @Test
  public void testCreateEnrollmentWithDigitalCertificateConsent() {
    final Reservation reservation = createReservation();
    final PublicEnrollmentCreateDTO dto = createDTOBuilder().digitalCertificateConsent(true).build();

    publicEnrollmentService.createEnrollment(dto, reservation.getId());
    assertCreatedEnrollment(dto);

    assertEquals(0, reservationRepository.count());
  }

  @Test
  public void testCreateEnrollmentWithoutDigitalCertificateConsent() {
    final Reservation reservation = createReservation();
    final PublicEnrollmentCreateDTO dto = createDTOBuilder().digitalCertificateConsent(false).build();

    publicEnrollmentService.createEnrollment(dto, reservation.getId());
    assertCreatedEnrollment(dto);
  }

  private Reservation createReservation() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Reservation reservation = Factory.reservation(examEvent, person);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(reservation);

    return reservation;
  }

  private PublicEnrollmentCreateDTO.PublicEnrollmentCreateDTOBuilder createDTOBuilder() {
    return PublicEnrollmentCreateDTO
      .builder()
      .oralSkill(true)
      .textualSkill(false)
      .understandingSkill(true)
      .speakingPartialExam(true)
      .speechComprehensionPartialExam(true)
      .writingPartialExam(false)
      .readingComprehensionPartialExam(false)
      .previousEnrollmentDate(LocalDate.now().minusYears(1))
      .email("test@tester")
      .phoneNumber("+358000111")
      .street("Katu 1")
      .postalCode("00000")
      .town("Kaupunki")
      .country("Maa");
  }

  private void assertCreatedEnrollment(final PublicEnrollmentCreateDTO dto) {
    final List<Enrollment> enrollments = enrollmentRepository.findAll();
    assertEquals(1, enrollments.size());

    final Enrollment enrollment = enrollments.get(0);
    assertEquals(0L, enrollment.getVersion());
    assertEquals(dto.oralSkill(), enrollment.isOralSkill());
    assertEquals(dto.textualSkill(), enrollment.isTextualSkill());
    assertEquals(dto.understandingSkill(), enrollment.isUnderstandingSkill());
    assertEquals(dto.speakingPartialExam(), enrollment.isSpeakingPartialExam());
    assertEquals(dto.speechComprehensionPartialExam(), enrollment.isSpeechComprehensionPartialExam());
    assertEquals(dto.writingPartialExam(), enrollment.isWritingPartialExam());
    assertEquals(dto.readingComprehensionPartialExam(), enrollment.isReadingComprehensionPartialExam());
    assertEquals(dto.previousEnrollmentDate(), enrollment.getPreviousEnrollmentDate());
    assertEquals(dto.digitalCertificateConsent(), enrollment.isDigitalCertificateConsent());
    assertEquals(dto.email(), enrollment.getEmail());
    assertEquals(dto.phoneNumber(), enrollment.getPhoneNumber());

    if (dto.digitalCertificateConsent()) {
      assertNull(enrollment.getStreet());
      assertNull(enrollment.getPostalCode());
      assertNull(enrollment.getTown());
      assertNull(enrollment.getCountry());
    } else {
      assertEquals(dto.street(), enrollment.getStreet());
      assertEquals(dto.postalCode(), enrollment.getPostalCode());
      assertEquals(dto.town(), enrollment.getTown());
      assertEquals(dto.country(), enrollment.getCountry());
    }
  }
}
