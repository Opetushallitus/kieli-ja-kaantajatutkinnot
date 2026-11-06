package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.env.MockEnvironment;

class ExamFeeServiceTest {

  private ExamFeeService examFeeService;

  @BeforeEach
  void setup() {
    examFeeService = new ExamFeeService(fees());
  }

  private static MockEnvironment fees() {
    return new MockEnvironment()
      .withProperty("app.exam-fee.perus", "165")
      .withProperty("app.exam-fee.keski", "190")
      .withProperty("app.exam-fee.ylin", "216")
      .withProperty("app.exam-fee.keski-read", "43")
      .withProperty("app.exam-fee.keski-listen", "44.50")
      .withProperty("app.exam-fee.keski-write", "70")
      .withProperty("app.exam-fee.keski-speak", "84");
  }

  @ParameterizedTest
  @CsvSource(
    {
      "FULL, PERUS, ALL_PARTS, 165",
      "FULL, KESKI, ALL_PARTS, 190",
      "FULL, YLIN, ALL_PARTS, 216",
      "READ_SPEAK, KESKI, ALL_PARTS, 127",
      "READ_SPEAK, KESKI, READ, 43",
      "READ_SPEAK, KESKI, SPEAK, 84",
      "LISTEN_WRITE, KESKI, ALL_PARTS, 114.50",
      "LISTEN_WRITE, KESKI, LISTEN, 44.50",
      "LISTEN_WRITE, KESKI, WRITE, 70",
      // Partial exams are priced as KESKI whatever the level, as in legacy.
      "READ_SPEAK, PERUS, READ, 43",
      "LISTEN_WRITE, YLIN, WRITE, 70",
    }
  )
  void testExamFee(
    final ExamSessionType examSessionType,
    final String levelCode,
    final PartialExamType partialExamType,
    final BigDecimal expected
  ) {
    assertEquals(0, expected.compareTo(examFeeService.examFee(examSessionType, levelCode, partialExamType)));
  }

  @ParameterizedTest
  @CsvSource({ "READ_SPEAK, LISTEN", "READ_SPEAK, WRITE", "LISTEN_WRITE, READ", "LISTEN_WRITE, SPEAK" })
  void testSubtestOutsideTheSessionsPoolHasNoFee(
    final ExamSessionType examSessionType,
    final PartialExamType partialExamType
  ) {
    assertThrows(
      IllegalArgumentException.class,
      () -> examFeeService.examFee(examSessionType, "KESKI", partialExamType)
    );
  }

  @Test
  void testUnknownLevelHasNoFee() {
    assertThrows(
      IllegalArgumentException.class,
      () -> examFeeService.examFee(ExamSessionType.FULL, "MUU", PartialExamType.ALL_PARTS)
    );
  }

  @Test
  void testMissingFeeFailsAtConstruction() {
    final MockEnvironment onlyOneFee = new MockEnvironment().withProperty("app.exam-fee.perus", "165");

    assertThrows(IllegalStateException.class, () -> new ExamFeeService(onlyOneFee));
  }
}
