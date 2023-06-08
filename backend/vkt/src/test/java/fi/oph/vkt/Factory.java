package fi.oph.vkt;

import fi.oph.vkt.model.Email;
import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.model.type.PaymentStatus;
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
    examEvent.setHidden(false);
    examEvent.setMaxParticipants(10);

    return examEvent;
  }

  public static Person person() {
    final Person person = new Person();
    person.setIdentityNumber(UUID.randomUUID().toString());
    person.setOid(UUID.randomUUID().toString());
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
    enrollment.setPreviousEnrollment("1.11.2022");
    enrollment.setDigitalCertificateConsent(true);
    enrollment.setEmail("foo.tester@invalid");
    enrollment.setPhoneNumber("+10001234567");

    enrollment.setExamEvent(examEvent);
    enrollment.setPerson(person);
    examEvent.getEnrollments().add(enrollment);
    person.getEnrollments().add(enrollment);

    return enrollment;
  }

  public static Payment payment(final Enrollment enrollment) {
    final Payment payment = new Payment();
    payment.setAmount(22700);
    payment.setTransactionId("t-123");
    payment.setReference("RF-test");
    payment.setPaymentUrl("url");
    payment.setPaymentStatus(PaymentStatus.OK);

    payment.setEnrollment(enrollment);
    enrollment.getPayments().add(payment);

    return payment;
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

  public static Email email() {
    final Email email = new Email();
    email.setEmailType(EmailType.ENROLLMENT_CONFIRMATION);
    email.setRecipientName("Ville Vastaanottaja");
    email.setRecipientAddress("ville.vastaanottaja@invalid");
    email.setSubject("Otsikko");
    email.setBody("Sisältö on tässä");

    return email;
  }
}
