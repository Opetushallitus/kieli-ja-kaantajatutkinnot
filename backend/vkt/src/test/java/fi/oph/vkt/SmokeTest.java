package fi.oph.vkt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.vkt.model.*;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.repository.ParticipantRepository;
import java.util.List;
import javax.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class SmokeTest {

  @Resource
  private ParticipantRepository participantRepository;

  @Resource
  private TestEntityManager entityManager;

  @Test
  public void smoke() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Participant participant = Factory.participant(examEvent, person);
    final Payment payment = Factory.payment(participant);
    final Link link = Factory.link(participant);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(participant);
    entityManager.persist(payment);
    entityManager.persist(link);
    entityManager.flush();

    final List<Participant> participants = participantRepository.findAll();
    assertEquals(1, participants.size());
    final Participant p = participants.get(0);
    assertTrue(p.isWriting());
    assertTrue(p.isSpeaking());
    assertTrue(p.isReadingComprehension());
    assertTrue(p.isSpeechComprehension());
    assertEquals(examEvent, p.getExamEvent());
    assertEquals(person, p.getPerson());
    assertEquals(List.of(payment), p.getPayments());
    assertEquals(List.of(link), p.getLinks());
  }
}
