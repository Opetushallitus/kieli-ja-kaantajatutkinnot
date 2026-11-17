package fi.oph.yki.service;

import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import java.math.BigDecimal;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

/**
 * Exam fees from configuration, as the legacy backend's {@code payment-config :amount} computes
 * them. The fee is deliberately not read from {@code registration.exam_fee}: legacy writes that
 * column but never reads it, and Paytrail is charged the configured amount, so the emailed amount
 * has to come from the same place.
 */
@Service
public class ExamFeeService {

  private final BigDecimal perus;
  private final BigDecimal keski;
  private final BigDecimal ylin;
  private final BigDecimal keskiRead;
  private final BigDecimal keskiListen;
  private final BigDecimal keskiWrite;
  private final BigDecimal keskiSpeak;

  // Required rather than defaulted: a missing fee should stop the application from starting, not
  // quote a made-up price in an email.
  public ExamFeeService(final Environment environment) {
    perus = environment.getRequiredProperty("app.exam-fee.perus", BigDecimal.class);
    keski = environment.getRequiredProperty("app.exam-fee.keski", BigDecimal.class);
    ylin = environment.getRequiredProperty("app.exam-fee.ylin", BigDecimal.class);
    keskiRead = environment.getRequiredProperty("app.exam-fee.keski-read", BigDecimal.class);
    keskiListen = environment.getRequiredProperty("app.exam-fee.keski-listen", BigDecimal.class);
    keskiWrite = environment.getRequiredProperty("app.exam-fee.keski-write", BigDecimal.class);
    keskiSpeak = environment.getRequiredProperty("app.exam-fee.keski-speak", BigDecimal.class);
  }

  /**
   * Partial exams are priced with the KESKI subtest fees whatever the session's level, as in legacy.
   * A subtest outside the session type's pool has no price, and legacy fails on it too.
   */
  public BigDecimal examFee(
    final ExamSessionType examSessionType,
    final String levelCode,
    final PartialExamType partialExamType
  ) {
    return switch (examSessionType) {
      case FULL -> fullExamFee(levelCode);
      case READ_SPEAK -> switch (partialExamType) {
        case ALL_PARTS -> keskiRead.add(keskiSpeak);
        case READ -> keskiRead;
        case SPEAK -> keskiSpeak;
        default -> throw unpriced(examSessionType, partialExamType);
      };
      case LISTEN_WRITE -> switch (partialExamType) {
        case ALL_PARTS -> keskiListen.add(keskiWrite);
        case LISTEN -> keskiListen;
        case WRITE -> keskiWrite;
        default -> throw unpriced(examSessionType, partialExamType);
      };
    };
  }

  private BigDecimal fullExamFee(final String levelCode) {
    return switch (levelCode) {
      case "PERUS" -> perus;
      case "KESKI" -> keski;
      case "YLIN" -> ylin;
      default -> throw new IllegalArgumentException("Unknown level code: " + levelCode);
    };
  }

  private static IllegalArgumentException unpriced(
    final ExamSessionType examSessionType,
    final PartialExamType partialExamType
  ) {
    return new IllegalArgumentException(
      "No exam fee for partial exam type " + partialExamType + " in a " + examSessionType + " session"
    );
  }
}
