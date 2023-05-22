package fi.oph.vkt.service.receipt;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.jhonnymertz.wkhtmltopdf.wrapper.Pdf;
import com.github.jhonnymertz.wkhtmltopdf.wrapper.configurations.WrapperConfig;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.util.EnrollmentUtil;
import fi.oph.vkt.util.TemplateRenderer;
import fi.oph.vkt.util.localisation.Language;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class ReceiptRenderer {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");
  public static final TypeReference<Map<String, Object>> TYPE_REF = new TypeReference<>() {};

  private final EnrollmentRepository enrollmentRepository;
  private final TemplateRenderer templateRenderer;

  @Transactional(readOnly = true)
  public ReceiptData getReceiptData(final long enrollmentId, final Language language) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(enrollmentId);
    final String personName = enrollment.getPerson().getLastName() + ", " + enrollment.getPerson().getFirstName();
    final String dateOfReceipt = DATE_FORMAT.format(LocalDate.now());
    // TODO Payment date should be taken from actual payment
    final String paymentDate = "24.12.1987";
    // TODO Paid amount should be taken from actual payment
    final String totalAmount = String.format("%d €", EnrollmentUtil.calculateExaminationPaymentSum(enrollment));

    final String receiptItemName = language == Language.FI
      ? "Valtionhallinnon kielitutkinnot (VKT), tutkintomaksu"
      : "Valtionhallinnon kielitutkinnot (VKT), examensavgift";

    final String additionalInfo1 = String.format(
      "%s, %s, %s",
      getLang(enrollment, language),
      getLevel(enrollment, language),
      DATE_FORMAT.format(enrollment.getExamEvent().getDate())
    );
    final String additionalInfo2 = language == Language.FI ? "Osallistuja: " + personName : "Deltagaren: " + personName;

    return ReceiptData
      .builder()
      .dateOfReceipt(dateOfReceipt)
      .payerName(personName)
      .paymentDate(paymentDate)
      .totalAmount(totalAmount)
      .item(
        ReceiptItem
          .builder()
          .name(receiptItemName)
          .value(totalAmount)
          .additionalInfos(List.of(additionalInfo1, additionalInfo2))
          .build()
      )
      .build();
  }

  private static String getLang(final Enrollment enrollment, final Language language) {
    final ExamLanguage examLanguage = enrollment.getExamEvent().getLanguage();

    if (examLanguage == ExamLanguage.FI && language == Language.FI) {
      return "Suomi";
    } else if (examLanguage == ExamLanguage.FI && language == Language.SV) {
      return "Finska";
    } else if (examLanguage == ExamLanguage.SV & language == Language.FI) {
      return "Ruotsi";
    } else if (examLanguage == ExamLanguage.SV && language == Language.SV) {
      return "Svenska";
    }

    return "-";
  }

  private static String getLevel(final Enrollment enrollment, final Language language) {
    final ExamLevel examLevel = enrollment.getExamEvent().getLevel();

    if (examLevel == ExamLevel.EXCELLENT && language == Language.FI) {
      return "erinomainen";
    } else if (examLevel == ExamLevel.EXCELLENT && language == Language.SV) {
      return "utmärkt";
    }

    return "-";
  }

  public byte[] getReceiptPdfBytes(final ReceiptData data) throws IOException, InterruptedException {
    final String html = getReceiptHtml(data);
    final Pdf pdf = new Pdf(new WrapperConfig("wkhtmltopdf"));
    pdf.addPageFromString(html);
    return pdf.getPDF();
  }

  protected String getReceiptHtml(final ReceiptData data) {
    final Map<String, Object> params = OBJECT_MAPPER.convertValue(data, TYPE_REF);
    return templateRenderer.renderReceipt(params);
  }
}
