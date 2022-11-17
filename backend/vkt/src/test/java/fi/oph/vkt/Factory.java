package fi.oph.vkt;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class Factory {

  public static ExamEvent examEvent() {
    return examEvent(ExamLanguage.FI);
  }

  public static ExamEvent examEvent(final ExamLanguage language) {
    final ExamEvent examEvent = new ExamEvent();
    examEvent.setLanguage(language);
    examEvent.setLevel(ExamLevel.EXCELLENT);
    examEvent.setDate(LocalDate.now().plusDays(8));
    examEvent.setRegistrationCloses(LocalDate.now());
    examEvent.setVisible(true);
    examEvent.setMaxParticipants(10);

    return examEvent;
  }

  public static Person person() {
    final Person person = new Person();
    person.setIdentityNumber(UUID.randomUUID().toString());
    person.setLastName("Tester");
    person.setFirstName("Foo Bar");

    return person;
  }

  public static Enrollment enrollment(final ExamEvent examEvent, final Person person) {
    final Enrollment enrollment = new Enrollment();
    enrollment.setOralSkill(true);
    enrollment.setTextualSkill(false);
    enrollment.setUnderstandingSkill(true);
    enrollment.setSpeakingPartialExam(true);
    enrollment.setSpeechComprehensionPartialExam(true);
    enrollment.setWritingPartialExam(false);
    enrollment.setReadingComprehensionPartialExam(false);
    enrollment.setStatus(EnrollmentStatus.PAID);
    enrollment.setPreviousEnrollmentDate(LocalDate.now().minusYears(1));
    enrollment.setDigitalCertificateConsent(true);
    enrollment.setEmail("foo.tester@invalid");
    enrollment.setPhoneNumber("+10001234567");

    enrollment.setExamEvent(examEvent);
    enrollment.setPerson(person);
    examEvent.getEnrollments().add(enrollment);
    person.getEnrollments().add(enrollment);

    return enrollment;
  }

  public static Reservation reservation(final ExamEvent examEvent, final Person person) {
    final Reservation reservation = new Reservation();
    reservation.setExamEvent(examEvent);
    reservation.setPerson(person);
    reservation.setExpiresAt(LocalDateTime.now().plusMinutes(5));

    examEvent.getReservations().add(reservation);
    person.getReservations().add(reservation);
    return reservation;
  }
}
