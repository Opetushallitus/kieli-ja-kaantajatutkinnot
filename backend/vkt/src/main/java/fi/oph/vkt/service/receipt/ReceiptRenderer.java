package fi.oph.vkt.service.receipt;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.jhonnymertz.wkhtmltopdf.wrapper.Pdf;
import com.github.jhonnymertz.wkhtmltopdf.wrapper.configurations.WrapperConfig;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.util.EnrollmentUtil;
import fi.oph.vkt.util.TemplateRenderer;
import fi.oph.vkt.util.localisation.Language;
import fi.oph.vkt.util.localisation.LocalisationUtil;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class ReceiptRenderer {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");
  public static final TypeReference<Map<String, Object>> TYPE_REF = new TypeReference<>() {};

  private final EnrollmentRepository enrollmentRepository;
  private final TemplateRenderer templateRenderer;

  @Transactional(readOnly = true)
  public ReceiptData getReceiptData(final long enrollmentId, final Language receiptLanguage) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(enrollmentId);
    final ExamEvent examEvent = enrollment.getExamEvent();
    final Person person = enrollment.getPerson();
    final Payment payment = enrollment.getPayments().get(0);

    final ExamLanguage examLanguage = examEvent.getLanguage();

    final String date = DATE_FORMAT.format(LocalDate.now());
    final String paymentDate = DATE_FORMAT.format(payment.getModifiedAt());
    final String paymentReference = payment.getReference();

    final String exam = String.format(
      "%s, %s, %s",
      getLang(examLanguage, receiptLanguage),
      getLevelDescription(examEvent, receiptLanguage),
      DATE_FORMAT.format(examEvent.getDate())
    );
    final String participant = String.format("%s, %s", person.getLastName(), person.getFirstName());
    final String totalAmount = String.format("%s €", payment.getAmount() / 100);

    final List<ReceiptItem> items = getReceiptItems(enrollment, examLanguage, receiptLanguage);

    return ReceiptData
      .builder()
      .date(date)
      .paymentDate(paymentDate)
      .paymentReference(paymentReference)
      .exam(exam)
      .participant(participant)
      .totalAmount(totalAmount)
      .items(items)
      .build();
  }

  private static String getLang(final ExamLanguage examLanguage, final Language receiptLanguage) {
    final String key = examLanguage == ExamLanguage.FI ? "lang.finnish" : "lang.swedish";

    return StringUtils.capitalize(LocalisationUtil.translate(receiptLanguage, key));
  }

  private static String getLevelDescription(final ExamEvent examEvent, final Language receiptLanguage) {
    final String key = examEvent.getLevel() == ExamLevel.EXCELLENT ? "examLevel.excellent" : "-";

    return LocalisationUtil.translate(receiptLanguage, key);
  }

  private static List<ReceiptItem> getReceiptItems(
    final Enrollment enrollment,
    final ExamLanguage examLanguage,
    final Language receiptLanguage
  ) {
    final String examLanguageKey = examLanguage == ExamLanguage.FI ? "lang.finnish" : "lang.swedish";
    final String examLanguageName = LocalisationUtil.translate(receiptLanguage, examLanguageKey);

    return Stream
      .of(
        Optional.ofNullable(
          enrollment.isTextualSkill()
            ? ReceiptItem
              .builder()
              .name(
                StringUtils.capitalize(LocalisationUtil.translate(receiptLanguage, "skill.textual", examLanguageName))
              )
              .amount(String.format("%s €", EnrollmentUtil.getTextualSkillFee(enrollment) / 100))
              .build()
            : null
        ),
        Optional.ofNullable(
          enrollment.isOralSkill()
            ? ReceiptItem
              .builder()
              .name(StringUtils.capitalize(LocalisationUtil.translate(receiptLanguage, "skill.oral", examLanguageName)))
              .amount(String.format("%s €", EnrollmentUtil.getOralSkillFee(enrollment) / 100))
              .build()
            : null
        ),
        Optional.ofNullable(
          enrollment.isUnderstandingSkill()
            ? ReceiptItem
              .builder()
              .name(
                StringUtils.capitalize(
                  LocalisationUtil.translate(receiptLanguage, "skill.understanding", examLanguageName)
                )
              )
              .amount(String.format("%s €", EnrollmentUtil.getUnderstandingSkillFee(enrollment) / 100))
              .build()
            : null
        )
      )
      .filter(Optional::isPresent)
      .map(Optional::get)
      .toList();
  }

  public byte[] getReceiptPdfBytes(final ReceiptData data, final Language language)
    throws IOException, InterruptedException {
    final String html = getReceiptHtml(language, data);
    final Pdf pdf = new Pdf(new WrapperConfig("wkhtmltopdf"));
    pdf.addPageFromString(html);
    return pdf.getPDF();
  }

  protected String getReceiptHtml(final Language language, final ReceiptData data) {
    final Map<String, Object> params = OBJECT_MAPPER.convertValue(data, TYPE_REF);
    return templateRenderer.renderReceipt(language, params);
  }
}
