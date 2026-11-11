package fi.oph.yki.view;

import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import java.text.Collator;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

public class ExamSessionXlsxDataRowUtil {

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

  // Sheets match the registration tabs of the clerk exam session view
  enum Sheet {
    REGISTERED("Ilmoittautuneet"),
    QUEUED("Jonossa"),
    PAID_AND_CANCELLED("Maksanut ja peruttu"),
    CANCELLED_OR_EXPIRED("Peruttu tai erääntynyt");

    private final String name;

    Sheet(final String name) {
      this.name = name;
    }
  }

  public static ExamSessionXlsxData createExcelData(
    final ExamSession examSession,
    final List<Registration> registrations,
    final Map<String, String> identityNumbersByOid,
    final Map<Long, Long> queuePositions
  ) {
    final List<ExamSessionXlsxSheet> sheets = Arrays
      .stream(Sheet.values())
      .map(sheet ->
        ExamSessionXlsxSheet
          .builder()
          .name(sheet.name)
          .rows(
            registrations
              .stream()
              .filter(r -> getSheet(r).filter(sheet::equals).isPresent())
              .sorted(getComparator(sheet, queuePositions))
              .map(r -> createDataRow(r, identityNumbersByOid))
              .toList()
          )
          .build()
      )
      .toList();

    return ExamSessionXlsxData
      .builder()
      .date(DATE_FORMAT.format(examSession.getExamDate().getExamDate()))
      .language(examSession.getLanguage())
      .sheets(sheets)
      .build();
  }

  static Optional<Sheet> getSheet(final Registration registration) {
    final RegistrationState state = registration.getState();

    if (state == null) {
      return Optional.empty();
    }

    // A queued registration stays on the queue sheet also after it is cancelled or the queue ends
    if (registration.getKind() == RegistrationKind.QUEUE) {
      return state == RegistrationState.STARTED ? Optional.empty() : Optional.of(Sheet.QUEUED);
    }

    return switch (state) {
      case COMPLETED, SUBMITTED -> Optional.of(Sheet.REGISTERED);
      case PAID_AND_CANCELLED -> Optional.of(Sheet.PAID_AND_CANCELLED);
      case CANCELLED, EXPIRED -> Optional.of(Sheet.CANCELLED_OR_EXPIRED);
      default -> Optional.empty();
    };
  }

  // Queue: registrations still in the queue first, by queue position, which counts separately for
  // each partial exam. Then cancelled and ended ones, by registration time.
  // Other sheets: by name
  // Equal values: by registration time
  static Comparator<Registration> getComparator(final Sheet sheet, final Map<Long, Long> queuePositions) {
    final Comparator<Registration> byCreated = Comparator
      .comparing(Registration::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
      .thenComparing(Registration::getId);

    if (sheet == Sheet.QUEUED) {
      return Comparator
        .comparing((Registration r) -> !isInQueue(r))
        .thenComparing(
          r -> isInQueue(r) ? r.getPartialExamType() : null,
          Comparator.nullsLast(Comparator.naturalOrder())
        )
        .thenComparing(r -> queuePositions.get(r.getId()), Comparator.nullsLast(Comparator.naturalOrder()))
        .thenComparing(byCreated);
    }

    final Collator collator = Collator.getInstance(Locale.of("fi", "FI"));

    return Comparator
      .comparing((Registration r) -> getPersonName(r, Person::getLastName), collator)
      .thenComparing(r -> getPersonName(r, Person::getFirstName), collator)
      .thenComparing(byCreated);
  }

  private static boolean isInQueue(final Registration registration) {
    return (
      registration.getState() == RegistrationState.SUBMITTED || registration.getState() == RegistrationState.COMPLETED
    );
  }

  private static String getPersonName(final Registration registration, final Function<Person, String> getName) {
    return Optional.ofNullable(registration.getPerson()).map(getName).orElse("");
  }

  private static ExamSessionXlsxDataRow createDataRow(
    final Registration registration,
    final Map<String, String> identityNumbersByOid
  ) {
    final var person = registration.getPerson();

    return ExamSessionXlsxDataRow
      .builder()
      .oid(person == null ? "" : person.getOid())
      .lastName(person == null ? "" : person.getLastName())
      .firstName(person == null ? "" : person.getFirstName())
      .state(stateToText(registration))
      .partialExam(partialExamToText(registration))
      .email(person == null ? null : person.getEmail())
      .phone(person == null ? null : person.getPhoneNumber())
      .gender(person == null ? null : person.getGender())
      .nationalityCode(person == null ? null : person.getNationalityCode())
      .streetAddress(person == null ? null : person.getSteetAddress())
      .zip(person == null ? null : person.getZip())
      .postOffice(person == null ? null : person.getPostOffice())
      .originalExamDate(
        registration.getOriginalExamSession() != null
          ? DATE_FORMAT.format(registration.getOriginalExamSession().getExamDate().getExamDate())
          : null
      )
      .examLang(getFormField(registration.getForm(), "exam_lang"))
      .certificateLang(getFormField(registration.getForm(), "certificate_lang"))
      .nationalityDesc(getFormField(registration.getForm(), "nationality_desc"))
      .identityNumber(person == null ? null : identityNumbersByOid.get(person.getOid()))
      .birthdate(getFormField(registration.getForm(), "birthdate"))
      .build();
  }

  static String partialExamToText(final Registration registration) {
    final ExamSessionType sessionType = registration.getExamSession().getType();

    if (sessionType == ExamSessionType.FULL) {
      return "Koko tutkinto";
    }

    final PartialExamType partialExamType = registration.getPartialExamType();
    if (partialExamType == null) {
      return null;
    }

    return switch (partialExamType) {
      case ALL_PARTS -> switch (sessionType) {
        case READ_SPEAK -> "Tekstin ymmärtäminen ja puhuminen";
        case LISTEN_WRITE -> "Puheen ymmärtäminen ja kirjoittaminen";
        default -> null;
      };
      case READ -> "Tekstin ymmärtäminen";
      case LISTEN -> "Puheen ymmärtäminen";
      case SPEAK -> "Puhuminen";
      case WRITE -> "Kirjoittaminen";
    };
  }

  private static String getFormField(final ObjectNode form, final String field) {
    if (form == null || !form.has(field) || form.get(field).isNull()) {
      return null;
    }
    return form.get(field).asText();
  }

  static String stateToText(final Registration registration) {
    final RegistrationState state = registration.getState();
    final boolean isFreeRegistration = registration.getFreeRegistration() != null;
    final boolean isQueue = registration.getKind() == RegistrationKind.QUEUE;

    if (state == null) {
      return "-";
    }

    return switch (state) {
      case COMPLETED -> isQueue ? "Jonossa" : isFreeRegistration ? "Maksuton" : "Maksanut";
      case PAID_AND_CANCELLED -> isFreeRegistration ? "Maksuton ja peruttu" : "Maksanut ja peruttu";
      case SUBMITTED -> isQueue ? "Jonossa" : "Ei maksanut";
      case CANCELLED -> isQueue ? "Jonotus peruttu" : "Peruttu";
      case EXPIRED -> isQueue ? "Peruttu, jonotus loppunut" : "Erääntynyt";
      default -> "-";
    };
  }
}
