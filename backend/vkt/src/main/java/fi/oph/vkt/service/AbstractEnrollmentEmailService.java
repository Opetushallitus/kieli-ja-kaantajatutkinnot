package fi.oph.vkt.service;

import static fi.oph.vkt.util.LocalisationUtil.localeFI;
import static fi.oph.vkt.util.LocalisationUtil.localeSV;

import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentCommon;
import fi.oph.vkt.model.ExamEventCommon;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.service.email.EmailAttachmentData;
import fi.oph.vkt.service.email.EmailData;
import fi.oph.vkt.service.email.EmailService;
import fi.oph.vkt.util.LocalisationUtil;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class AbstractEnrollmentEmailService {

  protected void createEmail(
    final EmailService emailService,
    final String recipientName,
    final String recipientAddress,
    final String subject,
    final String body,
    final List<EmailAttachmentData> attachments,
    final EmailType emailType
  ) {
    final EmailData emailData = EmailData
      .builder()
      .recipientName(recipientName)
      .recipientAddress(recipientAddress)
      .subject(subject)
      .body(body)
      .attachments(attachments)
      .build();

    emailService.saveEmail(emailType, emailData);
  }

  protected Map<String, Object> getEmailParams(final EnrollmentCommon enrollment, final ExamEventCommon examEvent) {
    final Map<String, Object> params = new HashMap<>(Map.of());

    if (examEvent.getLanguage() == ExamLanguage.FI) {
      params.put("examLanguageFI", LocalisationUtil.translate(localeFI, "lang.finnish"));
      params.put("examLanguageSV", LocalisationUtil.translate(localeSV, "lang.finnish"));
    } else {
      params.put("examLanguageFI", LocalisationUtil.translate(localeFI, "lang.swedish"));
      params.put("examLanguageSV", LocalisationUtil.translate(localeSV, "lang.swedish"));
    }

    params.put("skillsFI", getEmailParamSkills(enrollment, localeFI, params.get("examLanguageFI")));
    params.put("skillsSV", getEmailParamSkills(enrollment, localeSV, params.get("examLanguageSV")));

    params.put("partialExamsFI", getEmailParamPartialExams(enrollment, localeFI));
    params.put("partialExamsSV", getEmailParamPartialExams(enrollment, localeSV));

    params.put(
      "examLevelFI",
      LocalisationUtil.translate(
        localeFI,
        enrollment instanceof EnrollmentAppointment ? "examLevel.goodAndSatisfactory" : "examLevel.excellent"
      )
    );
    params.put(
      "examLevelSV",
      LocalisationUtil.translate(
        localeSV,
        enrollment instanceof EnrollmentAppointment ? "examLevel.goodAndSatisfactory" : "examLevel.excellent"
      )
    );

    params.put("examDate", examEvent.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));

    params.put("type", "enrollment");
    params.put("isFree", false);

    return params;
  }

  private String getEmailParamSkills(final EnrollmentCommon enrollment, final Locale locale, final Object... args) {
    return joinNonEmptyStrings(
      Stream.of(
        enrollment.isTextualSkill() ? LocalisationUtil.translate(locale, "skill.textual", args) : "",
        enrollment.isOralSkill() ? LocalisationUtil.translate(locale, "skill.oral", args) : "",
        enrollment.isUnderstandingSkill() ? LocalisationUtil.translate(locale, "skill.understanding", args) : ""
      )
    );
  }

  private String getEmailParamPartialExams(final EnrollmentCommon enrollment, final Locale locale) {
    return joinNonEmptyStrings(
      Stream.of(
        enrollment.isWritingPartialExam() ? LocalisationUtil.translate(locale, "partialExam.writing") : "",
        enrollment.isReadingComprehensionPartialExam()
          ? LocalisationUtil.translate(locale, "partialExam.readingComprehension")
          : "",
        enrollment.isSpeakingPartialExam() ? LocalisationUtil.translate(locale, "partialExam.speaking") : "",
        enrollment.isSpeechComprehensionPartialExam()
          ? LocalisationUtil.translate(locale, "partialExam.speechComprehension")
          : ""
      )
    );
  }

  private String joinNonEmptyStrings(final Stream<String> stream) {
    return stream.filter(s -> !s.isEmpty()).collect(Collectors.joining(", "));
  }
}
