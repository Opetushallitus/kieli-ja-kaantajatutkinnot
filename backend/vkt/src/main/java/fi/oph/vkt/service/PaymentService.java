package fi.oph.vkt.service;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.AppLocale;
import fi.oph.vkt.model.type.EnrollmentSkill;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.PaymentStatus;
import fi.oph.vkt.payment.PaymentProvider;
import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.Item;
import fi.oph.vkt.payment.paytrail.PaytrailConfig;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.EnrollmentUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private static final Logger LOG = LoggerFactory.getLogger(PaymentService.class);

  private final PaymentProvider paymentProvider;
  private final PaymentRepository paymentRepository;
  private final EnrollmentRepository enrollmentRepository;
  private final Environment environment;
  private final PublicEnrollmentEmailService publicEnrollmentEmailService;

  private Item getItem(final EnrollmentSkill enrollmentSkill, final int unitPrice) {
    return Item
      .builder()
      .units(1)
      .unitPrice(unitPrice)
      .vatPercentage(PaytrailConfig.VAT)
      .productCode(enrollmentSkill.toString())
      .build();
  }

  private List<Item> getItems(final Enrollment enrollment) {
    final List<Item> itemList = new ArrayList<>();

    if (enrollment.isTextualSkill()) {
      itemList.add(getItem(EnrollmentSkill.TEXTUAL, EnrollmentUtil.getTextualSkillFee(enrollment)));
    }
    if (enrollment.isOralSkill()) {
      itemList.add(getItem(EnrollmentSkill.ORAL, EnrollmentUtil.getOralSkillFee(enrollment)));
    }
    if (enrollment.isUnderstandingSkill()) {
      itemList.add(getItem(EnrollmentSkill.UNDERSTANDING, EnrollmentUtil.getUnderstandingSkillFee(enrollment)));
    }

    return itemList;
  }

  private void setEnrollmentStatus(final Enrollment enrollment, final PaymentStatus paymentStatus) {
    switch (paymentStatus) {
      case NEW -> {
        if (enrollment.isCancelled()) {
          enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT);
        }
      }
      case OK -> enrollment.setStatus(EnrollmentStatus.PAID);
      case FAIL -> {
        if (enrollment.getStatus() == EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT) {
          enrollment.setStatus(EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT);
        }
      }
      case PENDING, DELAYED -> {}
    }
  }

  @Transactional
  public Payment finalizePayment(final Long paymentId, final Map<String, String> paymentParams)
    throws IOException, InterruptedException {
    final Payment payment = paymentRepository
      .findWithLockingById(paymentId)
      .orElseThrow(() -> new NotFoundException("Payment not found"));
    final PaymentStatus currentStatus = payment.getPaymentStatus();
    final PaymentStatus newStatus = PaymentStatus.fromString(paymentParams.get("checkout-status"));

    if (!paymentProvider.validate(paymentParams)) {
      LOG.error("Payment ({}) validation failed for params {}", paymentId, paymentParams);
      throw new APIException(APIExceptionType.PAYMENT_VALIDATION_FAIL);
    }

    if (currentStatus == PaymentStatus.OK && newStatus != PaymentStatus.OK) {
      LOG.error("Cannot change payment status from OK to {} for payment {}", newStatus, paymentId);
      throw new APIException(APIExceptionType.PAYMENT_ALREADY_PAID);
    }

    // Already paid. Payment url may be called multiple times
    if (currentStatus == PaymentStatus.OK) {
      return payment;
    }

    final int amount = Integer.parseInt(paymentParams.get("checkout-amount"));
    if (amount != payment.getAmount()) {
      LOG.error("Payment ({}) amount ({}) does not match expected amount ({})", paymentId, amount, payment.getAmount());
      throw new APIException(APIExceptionType.PAYMENT_AMOUNT_MISMATCH);
    }

    final int checkoutId = Integer.parseInt(paymentParams.get("checkout-reference"));
    if (checkoutId != payment.getId()) {
      LOG.error("Checkout reference ({}) does not match expected payment id ({})", checkoutId, payment.getId());
      throw new APIException(APIExceptionType.PAYMENT_REFERENCE_MISMATCH);
    }

    final Enrollment enrollment = payment.getEnrollment();
    setEnrollmentStatus(enrollment, newStatus);

    payment.setPaymentStatus(newStatus);
    paymentRepository.saveAndFlush(payment);

    if (newStatus == PaymentStatus.OK) {
      publicEnrollmentEmailService.sendEnrollmentConfirmationEmail(enrollment);
    }

    return payment;
  }

  @Transactional(readOnly = true)
  public String getFinalizePaymentSuccessRedirectUrl(final Long paymentId) {
    return getFinalizePaymentRedirectUrl(paymentId, "valmis");
  }

  @Transactional(readOnly = true)
  public String getFinalizePaymentCancelRedirectUrl(final Long paymentId) {
    return getFinalizePaymentRedirectUrl(paymentId, "peruutettu");
  }

  private String getFinalizePaymentRedirectUrl(final Long paymentId, final String state) {
    final String baseUrl = environment.getRequiredProperty("app.base-url.public");
    final Payment payment = paymentRepository
      .findById(paymentId)
      .orElseThrow(() -> new NotFoundException("Payment not found"));
    final ExamEvent examEvent = payment.getEnrollment().getExamEvent();

    return String.format("%s/ilmoittaudu/%d/maksu/%s", baseUrl, examEvent.getId(), state);
  }

  @Transactional
  public String createPaymentForEnrollment(final Long enrollmentId, final Person person, final AppLocale appLocale) {
    final Enrollment enrollment = enrollmentRepository
      .findById(enrollmentId)
      .orElseThrow(() -> new NotFoundException("Enrollment not found"));

    if (enrollment.getPerson().getId() != person.getId()) {
      throw new APIException(APIExceptionType.PAYMENT_PERSON_SESSION_MISMATCH);
    }

    if (enrollment.getStatus() == EnrollmentStatus.PAID) {
      throw new APIException(APIExceptionType.ENROLLMENT_ALREADY_PAID);
    }

    final List<Item> itemList = getItems(enrollment);
    final Customer customer = Customer
      .builder()
      .email(getCustomerField(enrollment.getEmail(), Customer.EMAIL_MAX_LENGTH))
      .phone(getCustomerField(enrollment.getPhoneNumber(), Customer.PHONE_MAX_LENGTH))
      .firstName(getCustomerField(person.getFirstName(), Customer.FIRST_NAME_MAX_LENGTH))
      .lastName(getCustomerField(person.getLastName(), Customer.LAST_NAME_MAX_LENGTH))
      .build();

    final int amount = EnrollmentUtil.getTotalFee(enrollment);

    final Payment payment = new Payment();
    payment.setEnrollment(enrollment);
    payment.setAmount(amount);
    paymentRepository.saveAndFlush(payment);

    final PaytrailResponseDTO response = paymentProvider.createPayment(
      itemList,
      payment.getId(),
      customer,
      amount,
      appLocale
    );

    // Ensures the enrollment is in EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT state after payment creation.
    // Necessary for the case when a person enrolls again to the same exam event with an existing cancelled enrollment.
    setEnrollmentStatus(enrollment, PaymentStatus.NEW);

    // Ensures the enrollment is in EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT state after payment creation.
    // Necessary for the case when a person enrolls again to the same exam event with an existing cancelled enrollment.
    setEnrollmentStatus(enrollment, PaymentStatus.NEW);

    payment.setTransactionId(response.getTransactionId());
    payment.setReference(response.getReference());
    payment.setPaymentUrl(response.getHref());
    payment.setPaymentStatus(PaymentStatus.NEW);
    paymentRepository.saveAndFlush(payment);

    return payment.getPaymentUrl();
  }

  private String getCustomerField(final String content, final int maxLength) {
    return content.substring(0, Math.min(content.length(), maxLength));
  }
}
