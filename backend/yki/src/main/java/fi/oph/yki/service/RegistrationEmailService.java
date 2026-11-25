package fi.oph.yki.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.model.EmailType;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Registration;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.email.EmailData;
import fi.oph.yki.service.email.EmailService;
import fi.oph.yki.util.EmailFormatUtil;
import fi.oph.yki.util.EmailSubjectUtil;
import fi.oph.yki.util.LocalisationUtil;
import fi.oph.yki.util.RegistrationSubtestUtil;
import fi.oph.yki.util.RegistrationUtil;
import fi.oph.yki.util.TemplateRenderer;
import java.time.LocalDate;
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
  private final LoginLinkService loginLinkService;
  private final PaymentLinkService paymentLinkService;
  private final ExamFeeService examFeeService;
  private final RegistrationRepository registrationRepository;

  /**
   * Tells a participant lifted from the queue that they have a place, and how to pay for it. The
   * payment link is created here, in the caller's transaction, so it is undone with the lift. The
   * payment link needs an identity, so registrations without one get no email.
   */
  public void sendLiftedFromQueueEmail(final Registration registration) {
    if (!hasEmailAddress(registration)) {
      LOG.error(
        "Not sending lifted-from-queue email for registration {}: person has no email address",
        registration.getId()
      );
      return;
    }
    if (registration.getIdentity() == null) {
      LOG.error(
        "Not sending lifted-from-queue email for registration {}: registration has no identity",
        registration.getId()
      );
      return;
    }

    final Locale locale = resolveUiLocale(registration);
    final Map<String, Object> params = paymentParams(
      registration,
      paymentLinkService.createPaymentLink(registration, registration.getIdentity()),
      locale
    );
    params.put(
      "expiration_date",
      EmailFormatUtil.formatDateWithDots(
        LocalDate.parse(registrationRepository.findQueueLiftPaymentDueDate(registration.getId()))
      )
    );
    final Participant participant = registration.getParticipant();
    params.put(
      "user_portal_link",
      !Boolean.TRUE.equals(registration.getStrongAuth())
        ? loginLinkService.createUserPortalLink(participant, registration)
        : staticUserPortalLink()
    );

    saveExamEmail(
      registration.getPerson().getFirstName() + " " + registration.getPerson().getLastName(),
      registration.getPerson().getEmail(),
      EmailType.PAYMENT_FROM_QUEUE,
      "payment-from-queue",
      "payment_from_queue",
      params,
      locale
    );
  }

  /**
   * Sends the payment link of a submitted registration. As in legacy, the email goes to the address
   * given in the registration form, and the expiration date shown is the last day to pay.
   */
  public void sendPaymentEmail(final Registration registration, final String paymentLinkCode, final String lang) {
    final ObjectNode form = registration.getForm();
    final String email = form.path("email").asText(null);
    if (!StringUtils.hasText(email)) {
      LOG.error("Not sending payment email for registration {}: form has no email address", registration.getId());
      return;
    }

    final Locale locale = localeOf(lang);
    final Map<String, Object> params = paymentParams(registration, paymentLinkCode, locale);
    params.put(
      "expiration_date",
      EmailFormatUtil.formatDateWithDots(registration.getExpiresAt().toLocalDate().minusDays(1))
    );
    params.put("user_portal_link", staticUserPortalLink());

    saveExamEmail(
      form.path("first_name").asText("") + " " + form.path("last_name").asText(""),
      email,
      EmailType.PAYMENT,
      "payment",
      "payment",
      params,
      locale
    );
  }

  /**
   * Confirms a registration submitted to the queue. As in legacy, the email goes to the address
   * given in the registration form.
   */
  public void sendEnrolledToQueueEmail(final Registration registration, final String lang) {
    final ObjectNode form = registration.getForm();
    final String email = form.path("email").asText(null);
    if (!StringUtils.hasText(email)) {
      LOG.error("Not sending queue email for registration {}: form has no email address", registration.getId());
      return;
    }

    final Locale locale = localeOf(lang);
    final ExamSession examSession = registration.getExamSession();
    final Map<String, Object> params = examParams(examSession, locale);
    params.put("subtests", subtests(registration, locale));
    params.put("user_portal_link", staticUserPortalLink());

    saveExamEmail(
      form.path("first_name").asText("") + " " + form.path("last_name").asText(""),
      email,
      EmailType.QUEUE,
      "queue",
      "queue",
      params,
      locale
    );
  }

  /**
   * Confirms a free registration, which is complete without payment. As in legacy, the email goes
   * to the address given in the registration form.
   */
  public void sendFreeRegistrationEmail(final Registration registration, final String lang) {
    final ObjectNode form = registration.getForm();
    final String email = form.path("email").asText(null);
    if (!StringUtils.hasText(email)) {
      LOG.error(
        "Not sending free registration email for registration {}: form has no email address",
        registration.getId()
      );
      return;
    }

    final Locale locale = localeOf(lang);
    final Map<String, Object> params = freeRegistrationParams(registration.getExamSession(), locale);

    saveExamEmail(
      form.path("first_name").asText("") + " " + form.path("last_name").asText(""),
      email,
      EmailType.FREE_REGISTRATION,
      "free-registration",
      "free_registration",
      params,
      locale
    );
  }

  private Map<String, Object> freeRegistrationParams(final ExamSession examSession, final Locale locale) {
    final Map<String, Object> params = examParams(examSession, locale);
    final ExamSessionLocation location = resolveLocation(examSession, locale);
    params.put("extra_information", location != null ? location.getExtraInformation() : null);
    params.put("contact_info", contactInfo(examSession));
    params.put("login_url", staticUserPortalLink());

    return params;
  }

  private static List<String> subtests(final Registration registration, final Locale locale) {
    return RegistrationSubtestUtil
      .subtestKeys(registration.getExamSession().getType(), registration.getPartialExamType())
      .stream()
      .map(key -> LocalisationUtil.translate(locale, key))
      .toList();
  }

  private Map<String, Object> paymentParams(
    final Registration registration,
    final String paymentLinkCode,
    final Locale locale
  ) {
    final ExamSession examSession = registration.getExamSession();
    final Map<String, Object> params = examParams(examSession, locale);

    params.put("subtests", subtests(registration, locale));
    params.put(
      "amount",
      EmailFormatUtil.formatPrice(
        examFeeService
          .examFee(examSession.getType(), examSession.getLevel(), registration.getPartialExamType())
          .doubleValue()
      )
    );
    params.put(
      "login_url",
      RegistrationUtil.createPaymentLinkUrl(
        environment.getRequiredProperty("app.base-url.public"),
        paymentLinkCode,
        locale.getLanguage()
      )
    );

    return params;
  }

  public void sendLiftedFromQueueForFreeEmail(final Registration registration) {
    if (!hasEmailAddress(registration)) {
      LOG.error(
        "Not sending lifted-from-queue for free email for registration {}: person has no email address",
        registration.getId()
      );
      return;
    }

    final Locale locale = resolveUiLocale(registration);
    final Map<String, Object> params = freeRegistrationParams(registration.getExamSession(), locale);

    saveExamEmail(
      registration.getPerson().getFirstName() + " " + registration.getPerson().getLastName(),
      registration.getPerson().getEmail(),
      EmailType.FREE_REGISTRATION_FROM_QUEUE,
      "free-registration-from-queue",
      "free_registration_from_queue",
      params,
      locale
    );
  }

  private static boolean hasEmailAddress(final Registration registration) {
    return registration.getPerson() != null && StringUtils.hasText(registration.getPerson().getEmail());
  }

  private Map<String, Object> examParams(final ExamSession examSession, final Locale locale) {
    final ExamSessionLocation location = resolveLocation(examSession, locale);

    final Map<String, Object> params = new HashMap<>();
    params.put("language", LocalisationUtil.translate(locale, "common.language." + examSession.getLanguage()));
    params.put("level", LocalisationUtil.translate(locale, levelKey(examSession.getLevel())));
    params.put("exam_date", EmailFormatUtil.formatDateWithDots(examSession.getExamDate().getExamDate()));
    params.put("name", location != null ? location.getName() : "");
    params.put("street_address", location != null ? location.getStreetAddress() : "");
    params.put("zip", location != null ? location.getZip() : "");
    params.put("post_office", location != null ? location.getPostOffice() : "");
    return params;
  }

  private void saveExamEmail(
    final String recipientName,
    final String recipientAddress,
    final EmailType emailType,
    final String templateName,
    final String subjectKey,
    final Map<String, Object> params,
    final Locale locale
  ) {
    final String body = templateRenderer.render(templateName, params, locale);
    final String subject = EmailSubjectUtil.buildExamSubject(
      locale,
      subjectKey,
      (String) params.get("language"),
      (String) params.get("level"),
      (String) params.get("name"),
      (String) params.get("exam_date")
    );

    final EmailData emailData = EmailData
      .builder()
      .recipientName(recipientName)
      .recipientAddress(recipientAddress)
      .subject(subject)
      .body(body)
      .attachments(List.of())
      .build();

    emailService.saveEmail(emailType, emailData);
  }

  private static Map<String, String> contactInfo(final ExamSession examSession) {
    final Map<String, String> contactInfo = new HashMap<>();
    putIfText(contactInfo, "name", examSession.getContactName());
    putIfText(contactInfo, "email", examSession.getContactEmail());
    putIfText(contactInfo, "phone_number", examSession.getContactPhoneNumber());
    return contactInfo.isEmpty() ? null : contactInfo;
  }

  private static void putIfText(final Map<String, String> map, final String key, final String value) {
    if (StringUtils.hasText(value)) {
      map.put(key, value);
    }
  }

  private String staticUserPortalLink() {
    return environment.getRequiredProperty("app.base-url.public") + "/auth/?toUserPortal=true";
  }

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
    final Participant participant = registration.getParticipant();
    params.put(
      "user_portal_link",
      !Boolean.TRUE.equals(registration.getStrongAuth())
        ? loginLinkService.createUserPortalLink(participant, registration)
        : environment.getRequiredProperty("app.base-url.public") + "/auth/?toUserPortal=true"
    );

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

  private static Locale resolveUiLocale(final Registration registration) {
    return localeOf(registration.getUiLanguage());
  }

  private static Locale resolveLocale(final Registration registration) {
    return localeOf(certificateLang(registration));
  }

  private static Locale localeOf(final String lang) {
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
