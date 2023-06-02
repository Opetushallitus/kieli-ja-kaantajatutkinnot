package fi.oph.vkt.service;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentSkill;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.model.type.PaymentStatus;
import fi.oph.vkt.payment.PaymentProvider;
import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.Item;
import fi.oph.vkt.payment.paytrail.PaytrailConfig;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
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

  private static final int COST_MAX = 45400;
  private static final int UNIT_PRICE = 22700;

  private final PaymentProvider paymentProvider;
  private final PaymentRepository paymentRepository;
  private final EnrollmentRepository enrollmentRepository;
  private final Environment environment;
  private final PublicEnrollmentEmailService publicEnrollmentEmailService;

  private Item getItem(final EnrollmentSkill enrollmentSkill, final boolean isFree) {
    return Item
      .builder()
      .units(1)
      .unitPrice(isFree ? 0 : UNIT_PRICE)
      .vatPercentage(PaytrailConfig.VAT)
      .productCode(enrollmentSkill.toString())
      .build();
  }

  private int getTotalAmount(final List<Item> itemList) {
    return Math.min(
      COST_MAX,
      itemList.stream().reduce(0, (subtotal, item) -> subtotal + item.units() * item.unitPrice(), Integer::sum)
    );
  }

  private List<Item> getItems(final Enrollment enrollment) {
    final List<Item> itemList = new ArrayList<>();

    if (enrollment.isOralSkill()) {
      itemList.add(getItem(EnrollmentSkill.ORAL, false));
    }
    if (enrollment.isTextualSkill()) {
      itemList.add(getItem(EnrollmentSkill.TEXTUAL, false));
    }
    if (enrollment.isUnderstandingSkill()) {
      final boolean isUnderstandingSkillFree =
        enrollment.getExamEvent().getLevel() == ExamLevel.EXCELLENT || itemList.size() >= 2;

      itemList.add(getItem(EnrollmentSkill.UNDERSTANDING, isUnderstandingSkillFree));
    }

    return itemList;
  }

  private void updateEnrollmentStatus(final Enrollment enrollment, final PaymentStatus paymentStatus) {
    switch (paymentStatus) {
      case NEW -> {
        if (enrollment.isCancelled() || enrollment.getStatus() == EnrollmentStatus.QUEUED) {
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

    enrollmentRepository.saveAndFlush(enrollment);
  }

  @Transactional
  public Payment finalizePayment(final Long paymentId, final Map<String, String> paymentParams)
    throws IOException, InterruptedException {
    final Payment payment = paymentRepository
      .findById(paymentId)
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

    final Enrollment enrollment = payment.getEnrollment();
    updateEnrollmentStatus(enrollment, newStatus);

    payment.setPaymentStatus(newStatus);
    paymentRepository.saveAndFlush(payment);

    if (newStatus == PaymentStatus.OK) {
      publicEnrollmentEmailService.sendEnrollmentConfirmationEmail(enrollment);
    }

    return payment;
  }

  public String getFinalizePaymentSuccessRedirectUrl(final Payment payment) {
    return getFinalizePaymentRedirectUrl(payment, "valmis");
  }

  public String getFinalizePaymentCancelRedirectUrl(final Payment payment) {
    return getFinalizePaymentRedirectUrl(payment, "peruutettu");
  }

  private String getFinalizePaymentRedirectUrl(final Payment payment, final String state) {
    final String baseUrl = environment.getRequiredProperty("app.base-url.public");
    final ExamEvent examEvent = payment.getEnrollment().getExamEvent();

    return String.format("%s/ilmoittaudu/%d/maksu/%s", baseUrl, examEvent.getId(), state);
  }

  @Transactional
  public String createPaymentForEnrollment(final Long enrollmentId, final Person person) {
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

    final int amount = getTotalAmount(itemList);

    final Payment payment = new Payment();
    payment.setEnrollment(enrollment);
    payment.setAmount(amount);
    paymentRepository.saveAndFlush(payment);

    final PaytrailResponseDTO response = paymentProvider.createPayment(itemList, payment.getId(), customer, amount);

    payment.setTransactionId(response.getTransactionId());
    payment.setReference(response.getReference());
    payment.setPaymentUrl(response.getHref());
    payment.setPaymentStatus(PaymentStatus.NEW);
    paymentRepository.saveAndFlush(payment);

    // Ensures the enrollment is in EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT state after payment creation.
    // Necessary for the case when a person enrolls again to the same exam event with an existing cancelled enrollment.
    updateEnrollmentStatus(enrollment, PaymentStatus.NEW);

    return payment.getPaymentUrl();
  }

  private String getCustomerField(final String content, final int maxLength) {
    return content.substring(0, Math.min(content.length(), maxLength));
  }
}
