package fi.oph.yki.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.model.EmailType;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.Registration;
import fi.oph.yki.service.email.EmailData;
import fi.oph.yki.service.email.EmailService;
import fi.oph.yki.util.EmailFormatUtil;
import fi.oph.yki.util.EmailSubjectUtil;
import fi.oph.yki.util.LocalisationUtil;
import fi.oph.yki.util.RegistrationSubtestUtil;
import fi.oph.yki.util.TemplateRenderer;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class RegistrationEmailService {

  private static final Logger LOG = LoggerFactory.getLogger(RegistrationEmailService.class);

  private final TemplateRenderer templateRenderer;
  private final EmailService emailService;
  private final Environment environment;

  public void sendCancelRegistrationEmail(final Registration registration) {
    if (!StringUtils.hasText(registration.getPerson().getEmail())) {
      LOG.warn(
        "Not sending cancel registration email for registration {}: person has no email address",
        registration.getId()
      );
      return;
    }

    final Locale locale = resolveLocale(registration);
    final boolean isFreeRegistration = registration.getFreeRegistration() != null;
    final EmailType emailType = isFreeRegistration ? EmailType.CANCEL_FREE_REGISTRATION : EmailType.CANCEL_REGISTRATION;
    final String templateName = isFreeRegistration ? "cancel-free-registration" : "cancel-registration";
    final String subjectKey = isFreeRegistration ? "cancel_free_registration" : "cancel_registration";

    final ExamSession examSession = registration.getExamSession();
    final ExamSessionLocation location = resolveLocation(examSession, locale);

    final String language = LocalisationUtil.translate(locale, "common.language." + examSession.getLanguage());
    final String level = LocalisationUtil.translate(locale, levelKey(examSession.getLevel()));
    final String examDate = EmailFormatUtil.formatDateWithDots(examSession.getExamDate().getExamDate());
    final List<String> subtests = RegistrationSubtestUtil
      .subtestKeys(examSession.getType(), registration.getPartialExamType())
      .stream()
      .map(key -> LocalisationUtil.translate(locale, key))
      .toList();
    final String testCentreName = location != null ? location.getName() : "";

    final Map<String, Object> params = new HashMap<>();
    params.put("language", language);
    params.put("level", level);
    params.put("subtests", subtests);
    params.put("exam_date", examDate);
    params.put("name", testCentreName);
    params.put("street_address", location != null ? location.getStreetAddress() : "");
    params.put("zip", location != null ? location.getZip() : "");
    params.put("post_office", location != null ? location.getPostOffice() : "");
    params.put("user_portal_link", environment.getRequiredProperty("app.base-url.public"));

    final String body = templateRenderer.render(templateName, params, locale);
    final String subject = EmailSubjectUtil.buildExamSubject(
      locale,
      subjectKey,
      language,
      level,
      testCentreName,
      examDate
    );

    final EmailData emailData = EmailData
      .builder()
      .recipientName(registration.getPerson().getFirstName() + " " + registration.getPerson().getLastName())
      .recipientAddress(registration.getPerson().getEmail())
      .subject(subject)
      .body(body)
      .attachments(List.of())
      .build();

    emailService.saveEmail(emailType, emailData);
  }

  private static Locale resolveLocale(final Registration registration) {
    final String lang = certificateLang(registration);
    if ("sv".equals(lang)) {
      return LocalisationUtil.LOCALE_SV;
    }
    if ("en".equals(lang)) {
      return LocalisationUtil.LOCALE_EN;
    }
    return LocalisationUtil.LOCALE_FI;
  }

  private static String certificateLang(final Registration registration) {
    final ObjectNode form = registration.getForm();
    if (form != null && form.hasNonNull("certificate_lang")) {
      return form.get("certificate_lang").asText();
    }
    return null;
  }

  private static ExamSessionLocation resolveLocation(final ExamSession examSession, final Locale locale) {
    final List<ExamSessionLocation> locations = examSession.getLocations();
    final String preferredLang = locale.getLanguage();

    return locations
      .stream()
      .filter(location -> preferredLang.equals(location.getLang()))
      .findFirst()
      .or(() -> locations.stream().filter(location -> "fi".equals(location.getLang())).findFirst())
      .or(() -> locations.stream().filter(location -> "en".equals(location.getLang())).findFirst())
      .or(() -> locations.stream().findFirst())
      .orElse(null);
  }

  private static String levelKey(final String levelCode) {
    return switch (levelCode) {
      case "PERUS" -> "common.level.basic";
      case "KESKI" -> "common.level.middle";
      case "YLIN" -> "common.level.high";
      default -> throw new IllegalArgumentException("Unknown level code: " + levelCode);
    };
  }
}
