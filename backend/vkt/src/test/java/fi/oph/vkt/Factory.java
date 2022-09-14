package fi.oph.vkt;

import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.exam.ExamLanguage;
import fi.oph.vkt.model.exam.ExamLevel;
import java.time.LocalDate;

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
}
