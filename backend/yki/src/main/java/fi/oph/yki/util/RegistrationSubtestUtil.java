package fi.oph.yki.util;

import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

public class RegistrationSubtestUtil {

  private enum Subtest {
    LISTENING,
    SPEAKING,
    READING,
    WRITING,
  }

  private static final List<Subtest> CANONICAL_ORDER = List.of(
    Subtest.LISTENING,
    Subtest.SPEAKING,
    Subtest.READING,
    Subtest.WRITING
  );

  private static Set<Subtest> pool(final ExamSessionType examSessionType) {
    return switch (examSessionType) {
      case FULL -> EnumSet.allOf(Subtest.class);
      case READ_SPEAK -> EnumSet.of(Subtest.READING, Subtest.SPEAKING);
      case LISTEN_WRITE -> EnumSet.of(Subtest.LISTENING, Subtest.WRITING);
    };
  }

  private static Set<Subtest> picked(final PartialExamType partialExamType) {
    return switch (partialExamType) {
      case ALL_PARTS -> null;
      case LISTEN -> EnumSet.of(Subtest.LISTENING);
      case SPEAK -> EnumSet.of(Subtest.SPEAKING);
      case READ -> EnumSet.of(Subtest.READING);
      case WRITE -> EnumSet.of(Subtest.WRITING);
    };
  }

  private static String translationKey(final Subtest subtest) {
    return switch (subtest) {
      case LISTENING -> "registration.description.listen";
      case SPEAKING -> "registration.description.speak";
      case READING -> "registration.description.read";
      case WRITING -> "registration.description.write";
    };
  }

  public static List<String> subtestKeys(final ExamSessionType examSessionType, final PartialExamType partialExamType) {
    final Set<Subtest> pool = pool(examSessionType);
    final Set<Subtest> picked = picked(partialExamType);
    final Set<Subtest> active = picked != null ? intersection(pool, picked) : pool;

    return CANONICAL_ORDER.stream().filter(active::contains).map(RegistrationSubtestUtil::translationKey).toList();
  }

  private static Set<Subtest> intersection(final Set<Subtest> a, final Set<Subtest> b) {
    final Set<Subtest> result = EnumSet.copyOf(a);
    result.retainAll(b);
    return result;
  }
}
