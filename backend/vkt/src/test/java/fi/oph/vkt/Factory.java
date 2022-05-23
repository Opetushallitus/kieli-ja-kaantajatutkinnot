package fi.oph.vkt;

import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Link;
import fi.oph.vkt.model.Participant;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import java.time.LocalDate;

public class Factory {

  public static ExamEvent examEvent() {
    final ExamEvent examEvent = new ExamEvent();
    examEvent.setDate(LocalDate.now().plusDays(2));
    examEvent.setRegistrationOpens(LocalDate.now().minusDays(1));
    examEvent.setRegistrationCloses(LocalDate.now().plusDays(1));
    examEvent.setMaxParticipants(10);
    return examEvent;
  }

  public static Person person() {
    return new Person();
  }

  public static Participant participant(final ExamEvent examEvent, final Person person) {
    final Participant participant = new Participant();
    participant.setExamEvent(examEvent);
    participant.setPerson(person);
    participant.setWriting(true);
    participant.setSpeaking(true);
    participant.setReadingComprehension(true);
    participant.setSpeechComprehension(true);

    examEvent.getParticipants().add(participant);
    person.getParticipations().add(participant);
    return participant;
  }

  public static Payment payment(final Participant participant) {
    final Payment payment = new Payment();
    payment.setParticipant(participant);

    participant.getPayments().add(payment);
    return payment;
  }

  public static Link link(final Participant participant) {
    final Link link = new Link();
    link.setParticipant(participant);

    participant.getLinks().add(link);
    return link;
  }
}
