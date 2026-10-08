package fi.oph.yki.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import java.util.List;
import org.junit.jupiter.api.Test;

class RegistrationSubtestUtilTest {

  @Test
  public void testFullExamAllParts() {
    assertEquals(
      List.of(
        "registration.description.listen",
        "registration.description.speak",
        "registration.description.read",
        "registration.description.write"
      ),
      RegistrationSubtestUtil.subtestKeys(ExamSessionType.FULL, PartialExamType.ALL_PARTS)
    );
  }

  @Test
  public void testReadSpeakExam() {
    assertEquals(
      List.of("registration.description.speak", "registration.description.read"),
      RegistrationSubtestUtil.subtestKeys(ExamSessionType.READ_SPEAK, PartialExamType.ALL_PARTS)
    );
  }

  @Test
  public void testListenWriteExam() {
    assertEquals(
      List.of("registration.description.listen", "registration.description.write"),
      RegistrationSubtestUtil.subtestKeys(ExamSessionType.LISTEN_WRITE, PartialExamType.ALL_PARTS)
    );
  }

  @Test
  public void testPartialExamRestrictsFullExamPool() {
    assertEquals(
      List.of("registration.description.speak"),
      RegistrationSubtestUtil.subtestKeys(ExamSessionType.FULL, PartialExamType.SPEAK)
    );
  }

  @Test
  public void testPartialExamOutsideSessionTypePoolYieldsEmpty() {
    assertEquals(List.of(), RegistrationSubtestUtil.subtestKeys(ExamSessionType.LISTEN_WRITE, PartialExamType.SPEAK));
  }
}
