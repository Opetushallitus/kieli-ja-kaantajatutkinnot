package fi.oph.yki.onr;

import fi.oph.yki.repository.ParticipantOnrCsvProjection;
import fi.oph.yki.repository.ParticipantOnrRepository;
import java.io.IOException;
import java.io.StringWriter;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OnrDebugService {

  private static final CSVFormat CSV_FORMAT = CSVFormat.DEFAULT
    .builder()
    .setDelimiter(';')
    .setRecordSeparator("\n")
    .get();

  private final ParticipantOnrRepository participantOnrRepository;

  @Value("${app.henkilo-ui.url}")
  private String henkiloUiUrl;

  @Transactional(readOnly = true)
  public String exportNotIndividualisedParticipantsCsv() {
    try (StringWriter writer = new StringWriter(); CSVPrinter printer = new CSVPrinter(writer, CSV_FORMAT)) {
      printer.printRecord(
        "oid",
        "onr_url",
        "participant_id",
        "is_individualized",
        "modified",
        "exam_date",
        "evaluation_state"
      );
      for (final ParticipantOnrCsvProjection row : participantOnrRepository.findNotIndividualised()) {
        printer.printRecord(
          row.getOid(),
          henkiloUiUrl + "/oppija/" + row.getOid() + "?permissionCheckService=YKI",
          row.getParticipantId(),
          row.getIndividualised(),
          row.getModified(),
          row.getExamDate(),
          row.getEvaluationState()
        );
      }
      printer.flush();
      return writer.toString();
    } catch (final IOException e) {
      throw new RuntimeException("Could not build participant ONR CSV", e);
    }
  }
}
