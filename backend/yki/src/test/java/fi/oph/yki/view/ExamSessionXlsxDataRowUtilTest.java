package fi.oph.yki.view;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public class ExamSessionXlsxDataRowUtilTest {

  private static final List<String> SHEET_NAMES = List.of(
    "Ilmoittautuneet",
    "Jonossa",
    "Maksanut ja peruttu",
    "Peruttu tai erääntynyt"
  );

  private final ExamSession examSession = Factory.examSession(Factory.examDate());

  private Registration createRegistration(
    final long id,
    final String lastName,
    final RegistrationState state,
    final RegistrationKind kind
  ) {
    final Person person = Factory.person();
    person.setOid("1.2.3.4." + id);
    person.setLastName(lastName);

    final Registration registration = Factory.registration(person);
    registration.setId(id);
    registration.setExamSession(examSession);
    registration.setState(state);
    registration.setKind(kind);
    registration.setCreatedAt(LocalDateTime.of(2026, 4, 1, 10, 0).plusMinutes(id));

    return registration;
  }

  private Registration createRegistration(final RegistrationState state, final RegistrationKind kind) {
    return createRegistration(1L, "Henkilö", state, kind);
  }

  private List<String> getLastNames(final ExamSessionXlsxData data, final String sheetName) {
    return data
      .sheets()
      .stream()
      .filter(s -> s.name().equals(sheetName))
      .findFirst()
      .orElseThrow()
      .rows()
      .stream()
      .map(ExamSessionXlsxDataRow::lastName)
      .toList();
  }

  @Test
  public void testGetSheet() {
    assertEquals(
      Optional.of(ExamSessionXlsxDataRowUtil.Sheet.REGISTERED),
      ExamSessionXlsxDataRowUtil.getSheet(createRegistration(RegistrationState.COMPLETED, RegistrationKind.ADMISSION))
    );
    assertEquals(
      Optional.of(ExamSessionXlsxDataRowUtil.Sheet.REGISTERED),
      ExamSessionXlsxDataRowUtil.getSheet(createRegistration(RegistrationState.SUBMITTED, RegistrationKind.ADMISSION))
    );
    assertEquals(
      Optional.of(ExamSessionXlsxDataRowUtil.Sheet.REGISTERED),
      ExamSessionXlsxDataRowUtil.getSheet(
        createRegistration(RegistrationState.COMPLETED, RegistrationKind.POST_ADMISSION)
      )
    );
    assertEquals(
      Optional.of(ExamSessionXlsxDataRowUtil.Sheet.QUEUED),
      ExamSessionXlsxDataRowUtil.getSheet(createRegistration(RegistrationState.SUBMITTED, RegistrationKind.QUEUE))
    );
    assertEquals(
      Optional.of(ExamSessionXlsxDataRowUtil.Sheet.PAID_AND_CANCELLED),
      ExamSessionXlsxDataRowUtil.getSheet(
        createRegistration(RegistrationState.PAID_AND_CANCELLED, RegistrationKind.QUEUE)
      )
    );
    assertEquals(
      Optional.of(ExamSessionXlsxDataRowUtil.Sheet.CANCELLED_OR_EXPIRED),
      ExamSessionXlsxDataRowUtil.getSheet(createRegistration(RegistrationState.CANCELLED, RegistrationKind.QUEUE))
    );
    assertEquals(
      Optional.of(ExamSessionXlsxDataRowUtil.Sheet.CANCELLED_OR_EXPIRED),
      ExamSessionXlsxDataRowUtil.getSheet(createRegistration(RegistrationState.EXPIRED, RegistrationKind.ADMISSION))
    );
    assertEquals(
      Optional.empty(),
      ExamSessionXlsxDataRowUtil.getSheet(createRegistration(RegistrationState.STARTED, RegistrationKind.ADMISSION))
    );
  }

  @Test
  public void testStateToText() {
    assertEquals(
      "Maksanut",
      ExamSessionXlsxDataRowUtil.stateToText(
        createRegistration(RegistrationState.COMPLETED, RegistrationKind.ADMISSION)
      )
    );
    assertEquals(
      "Ei maksanut",
      ExamSessionXlsxDataRowUtil.stateToText(
        createRegistration(RegistrationState.SUBMITTED, RegistrationKind.ADMISSION)
      )
    );
    assertEquals(
      "Jonossa",
      ExamSessionXlsxDataRowUtil.stateToText(createRegistration(RegistrationState.SUBMITTED, RegistrationKind.QUEUE))
    );
    assertEquals(
      "Peruttu",
      ExamSessionXlsxDataRowUtil.stateToText(
        createRegistration(RegistrationState.CANCELLED, RegistrationKind.ADMISSION)
      )
    );
    assertEquals(
      "Jonotus peruttu",
      ExamSessionXlsxDataRowUtil.stateToText(createRegistration(RegistrationState.CANCELLED, RegistrationKind.QUEUE))
    );
    assertEquals(
      "Erääntynyt",
      ExamSessionXlsxDataRowUtil.stateToText(createRegistration(RegistrationState.EXPIRED, RegistrationKind.QUEUE))
    );

    final Registration freeRegistration = createRegistration(RegistrationState.COMPLETED, RegistrationKind.ADMISSION);
    freeRegistration.setFreeRegistration(Factory.freeRegistration(freeRegistration));
    assertEquals("Maksuton", ExamSessionXlsxDataRowUtil.stateToText(freeRegistration));
  }

  @Test
  public void testPartialExamToText() {
    final Registration registration = createRegistration(RegistrationState.COMPLETED, RegistrationKind.ADMISSION);

    examSession.setType(ExamSessionType.FULL);
    assertEquals("Koko tutkinto", ExamSessionXlsxDataRowUtil.partialExamToText(registration));

    examSession.setType(ExamSessionType.READ_SPEAK);
    assertEquals("Tekstin ymmärtäminen ja puhuminen", ExamSessionXlsxDataRowUtil.partialExamToText(registration));

    examSession.setType(ExamSessionType.LISTEN_WRITE);
    assertEquals("Puheen ymmärtäminen ja kirjoittaminen", ExamSessionXlsxDataRowUtil.partialExamToText(registration));

    registration.setPartialExamType(PartialExamType.WRITE);
    assertEquals("Kirjoittaminen", ExamSessionXlsxDataRowUtil.partialExamToText(registration));

    examSession.setType(ExamSessionType.READ_SPEAK);
    registration.setPartialExamType(PartialExamType.READ);
    assertEquals("Tekstin ymmärtäminen", ExamSessionXlsxDataRowUtil.partialExamToText(registration));
  }

  @Test
  public void testCreateExcelDataCreatesAllSheets() {
    final ExamSessionXlsxData data = ExamSessionXlsxDataRowUtil.createExcelData(
      examSession,
      List.of(),
      Map.of(),
      Map.of()
    );

    assertEquals(SHEET_NAMES, data.sheets().stream().map(ExamSessionXlsxSheet::name).toList());
    assertTrue(data.sheets().stream().allMatch(s -> s.rows().isEmpty()));
  }

  @Test
  public void testCreateExcelDataSortsByName() {
    final List<Registration> registrations = List.of(
      createRegistration(1L, "Öhman", RegistrationState.COMPLETED, RegistrationKind.ADMISSION),
      createRegistration(2L, "Äyrämö", RegistrationState.COMPLETED, RegistrationKind.ADMISSION),
      createRegistration(3L, "Zetterberg", RegistrationState.COMPLETED, RegistrationKind.ADMISSION),
      createRegistration(5L, "Aalto", RegistrationState.COMPLETED, RegistrationKind.ADMISSION),
      createRegistration(4L, "Aalto", RegistrationState.COMPLETED, RegistrationKind.ADMISSION),
      createRegistration(6L, "Kivi", RegistrationState.EXPIRED, RegistrationKind.ADMISSION)
    );

    final ExamSessionXlsxData data = ExamSessionXlsxDataRowUtil.createExcelData(
      examSession,
      registrations,
      Map.of(),
      Map.of()
    );

    assertEquals(List.of("Aalto", "Aalto", "Zetterberg", "Äyrämö", "Öhman"), getLastNames(data, "Ilmoittautuneet"));
    assertEquals(
      "1.2.3.4.5",
      data.sheets().get(0).rows().get(1).oid(),
      "Equal names should be sorted by registration time"
    );
    assertEquals(List.of("Kivi"), getLastNames(data, "Peruttu tai erääntynyt"));
  }

  @Test
  public void testCreateExcelDataSortsQueueByQueuePosition() {
    examSession.setType(ExamSessionType.READ_SPEAK);

    final Registration speak2 = createRegistration(1L, "Puhuja B", RegistrationState.SUBMITTED, RegistrationKind.QUEUE);
    speak2.setPartialExamType(PartialExamType.SPEAK);
    final Registration read1 = createRegistration(2L, "Lukija A", RegistrationState.SUBMITTED, RegistrationKind.QUEUE);
    read1.setPartialExamType(PartialExamType.READ);
    final Registration speak1 = createRegistration(3L, "Puhuja A", RegistrationState.SUBMITTED, RegistrationKind.QUEUE);
    speak1.setPartialExamType(PartialExamType.SPEAK);
    final Registration read2 = createRegistration(4L, "Lukija B", RegistrationState.SUBMITTED, RegistrationKind.QUEUE);
    read2.setPartialExamType(PartialExamType.READ);

    final ExamSessionXlsxData data = ExamSessionXlsxDataRowUtil.createExcelData(
      examSession,
      List.of(speak2, read1, speak1, read2),
      Map.of(),
      Map.of(1L, 2L, 2L, 1L, 3L, 1L, 4L, 2L)
    );

    assertEquals(List.of("Lukija A", "Lukija B", "Puhuja A", "Puhuja B"), getLastNames(data, "Jonossa"));
  }
}
